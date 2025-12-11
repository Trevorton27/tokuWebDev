import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/auth';
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/users - List all users with filters (fetches from Clerk)
export async function GET(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    const { searchParams } = new URL(request.url);
    const roleFilter = searchParams.get('role');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    // Fetch users from Clerk
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({
      limit,
      offset,
    });

    // Get all Clerk IDs upfront
    const clerkIds = clerkUsers.data.map(u => u.id);

    // Batch fetch all database users in ONE query
    const dbUsers = await prisma.user.findMany({
      where: { clerkId: { in: clerkIds } },
      select: {
        id: true,
        clerkId: true,
        adminNotes: true,
        role: true,
        _count: {
          select: {
            enrollments: true,
            attempts: true,
            coursesCreated: true,
          },
        },
      },
    });
    const dbUserMap = new Map(dbUsers.map(u => [u.clerkId, u]));

    // Get all DB user IDs for batch queries
    const dbUserIds = dbUsers.map(u => u.id);
    const instructorIds = dbUsers.filter(u => u.role === 'INSTRUCTOR').map(u => u.id);
    const studentIds = dbUsers.filter(u => u.role === 'STUDENT').map(u => u.id);

    // Batch fetch instructor enrollment counts in ONE query
    const instructorEnrollments = await prisma.enrollment.findMany({
      where: {
        course: {
          instructorId: { in: instructorIds },
        },
      },
      select: {
        userId: true,
        course: {
          select: {
            instructorId: true,
          },
        },
      },
    });

    // Group by instructor and count unique students
    const instructorStudentSets = new Map<string, Set<string>>();
    instructorEnrollments.forEach(enrollment => {
      const instructorId = enrollment.course.instructorId;
      if (!instructorStudentSets.has(instructorId)) {
        instructorStudentSets.set(instructorId, new Set());
      }
      instructorStudentSets.get(instructorId)!.add(enrollment.userId);
    });
    const instructorStudentCounts = new Map<string, number>();
    instructorStudentSets.forEach((students, instructorId) => {
      instructorStudentCounts.set(instructorId, students.size);
    });

    // Batch fetch student enrollments in ONE query
    const studentEnrollments = await prisma.enrollment.findMany({
      where: { userId: { in: studentIds } },
      orderBy: { enrolledAt: 'desc' },
      include: {
        course: {
          select: {
            title: true,
          },
        },
      },
    });

    // Map to get most recent enrollment per student
    const studentEnrollmentMap = new Map();
    studentEnrollments.forEach(enrollment => {
      if (!studentEnrollmentMap.has(enrollment.userId)) {
        studentEnrollmentMap.set(enrollment.userId, enrollment);
      }
    });

    // Batch fetch student attempt stats in ONE query
    const attemptStats = await prisma.attempt.groupBy({
      by: ['userId'],
      where: { userId: { in: studentIds } },
      _avg: { score: true },
      _count: { id: true },
    });
    const attemptStatsMap = new Map(attemptStats.map(s => [s.userId, s]));

    // Filter and transform Clerk users
    let users = clerkUsers.data.map((clerkUser) => {
      const userRole = clerkUser.publicMetadata?.role as string || 'STUDENT';

      // Filter by role if specified
      if (roleFilter && userRole !== roleFilter) {
        return null;
      }

      // Filter by search if specified
      if (search) {
        const searchLower = search.toLowerCase();
        const email = clerkUser.emailAddresses[0]?.emailAddress || '';
        const name = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim();

        if (!email.toLowerCase().includes(searchLower) &&
            !name.toLowerCase().includes(searchLower)) {
          return null;
        }
      }

      const dbUser = dbUserMap.get(clerkUser.id);

      // For instructors, get enrolled student count
      let enrolledStudents = 0;
      if (userRole === 'INSTRUCTOR' && dbUser) {
        enrolledStudents = instructorStudentCounts.get(dbUser.id) || 0;
      }

      // For students, get their current enrollment and assessment data
      let currentEnrollment = null;
      let assessmentLevel = 'Beginner';
      if (userRole === 'STUDENT' && dbUser) {
        const enrollment = studentEnrollmentMap.get(dbUser.id);

        if (enrollment) {
          currentEnrollment = {
            id: enrollment.id,
            courseTitle: enrollment.course.title,
            startDate: enrollment.enrolledAt.toISOString(),
            finishDate: enrollment.completedAt?.toISOString() || null,
            progress: enrollment.progress,
          };
        }

        // Calculate assessment level
        const stats = attemptStatsMap.get(dbUser.id);
        if (stats && stats._count.id > 0) {
          const avgScore = stats._avg.score || 0;
          if (avgScore >= 80) assessmentLevel = 'Advanced';
          else if (avgScore >= 60) assessmentLevel = 'Intermediate';
          else assessmentLevel = 'Beginner';
        }
      }

      // Construct name with fallbacks
      const firstName = clerkUser.firstName || '';
      const lastName = clerkUser.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      const email = clerkUser.emailAddresses[0]?.emailAddress || '';
      const username = clerkUser.username;

      // Use full name, or username, or email prefix as fallback
      let displayName = fullName || username || email.split('@')[0] || null;

      return {
        id: clerkUser.id,
        email,
        name: displayName,
        role: userRole,
        avatarUrl: clerkUser.imageUrl,
        adminNotes: dbUser?.adminNotes || null,
        createdAt: new Date(clerkUser.createdAt).toISOString(),
        updatedAt: new Date(clerkUser.updatedAt).toISOString(),
        _count: dbUser?._count || {
          enrollments: 0,
          attempts: 0,
          coursesCreated: 0,
        },
        enrolledStudents,
        currentEnrollment,
        assessmentLevel,
      };
    });

    // Remove null entries (filtered out users)
    users = users.filter(user => user !== null);

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total: clerkUsers.totalCount,
          totalPages: Math.ceil(clerkUsers.totalCount / limit),
        },
      },
    });
  } catch (error: any) {
    console.error('Error fetching users from Clerk:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch users' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

// POST /api/admin/users - Create new user
// NOTE: User creation is handled by Clerk
// Users should be created through Clerk's dashboard or API
// This endpoint is disabled for Clerk-based authentication
export async function POST(request: NextRequest) {
  try {
    await requireRole(['ADMIN']);

    return NextResponse.json(
      {
        success: false,
        error: 'User creation is managed through Clerk. Please use Clerk Dashboard or Clerk API to create users.',
        clerkDashboard: 'https://dashboard.clerk.com'
      },
      { status: 501 } // Not Implemented
    );
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: error.message?.includes('Unauthorized') ? 401 : 500 }
    );
  }
}

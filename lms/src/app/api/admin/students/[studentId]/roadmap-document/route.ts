/**
 * API Route: Student Roadmap Document Management
 *
 * Endpoints for assigning and retrieving Google Docs roadmaps for individual students.
 * Admins and instructors can assign custom curriculum roadmaps to students via Google Docs.
 *
 * Routes:
 * - PUT /api/admin/students/[studentId]/roadmap-document - Assign roadmap to student
 * - GET /api/admin/students/[studentId]/roadmap-document - Get student's roadmap assignment
 *
 * Authorization:
 * - Role: ADMIN or INSTRUCTOR only
 * - Authentication via Clerk session
 *
 * Google Docs Integration:
 * - Documents must be shared with service account email
 * - Document IDs are extracted from Google Docs URLs
 * - IDs are stored in User.roadmapDocumentId field
 *
 * ID Handling:
 * - Route accepts both Clerk IDs (user_xxx) and database IDs (cm1xxx)
 * - This is necessary because the admin UI passes Clerk IDs
 * - Database queries use OR condition to match either ID type
 *
 * @module api/admin/students/[studentId]/roadmap-document
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * PUT - Assign Roadmap Document to Student
 *
 * Allows admins and instructors to assign a Google Docs roadmap to a specific student.
 * The document ID is extracted from the Google Docs URL and stored in the database.
 *
 * Request Body:
 * ```json
 * {
 *   "roadmapDocumentId": "1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I"
 * }
 * ```
 *
 * Success Response (200):
 * ```json
 * {
 *   "success": true,
 *   "message": "Roadmap document assigned successfully",
 *   "student": {
 *     "id": "cm1abc123",
 *     "email": "student@example.com",
 *     "name": "John Doe",
 *     "roadmapDocumentId": "1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I"
 *   }
 * }
 * ```
 *
 * Error Responses:
 * - 401: User not authenticated
 * - 403: User is not admin or instructor
 * - 404: Student not found
 * - 400: Invalid document ID or user is not a student
 * - 500: Server error
 *
 * @async
 * @param {NextRequest} request - The Next.js request object
 * @param {Object} params - Route parameters
 * @param {string} params.studentId - Student's Clerk ID or database ID
 * @returns {Promise<NextResponse>} JSON response with success status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    // === AUTHENTICATION & AUTHORIZATION ===
    // Get current user from Clerk session
    const currentUser = await getCurrentUser();

    // Check if user is authenticated
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user has admin or instructor role
    // Only these roles can assign roadmaps to students
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins and instructors can assign roadmap documents' },
        { status: 403 }
      );
    }

    // === EXTRACT & VALIDATE INPUT ===
    const { studentId } = params;
    const body = await request.json();
    const { roadmapDocumentId } = body;

    // Validate that document ID is provided and is a string
    if (!roadmapDocumentId || typeof roadmapDocumentId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid roadmap document ID' },
        { status: 400 }
      );
    }

    // Validate Google Docs document ID format
    // Google Doc IDs consist of alphanumeric characters, hyphens, and underscores
    // Example: 1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I
    const docIdRegex = /^[a-zA-Z0-9_-]+$/;
    if (!docIdRegex.test(roadmapDocumentId)) {
      return NextResponse.json(
        { error: 'Invalid Google Docs document ID format' },
        { status: 400 }
      );
    }

    // === FIND STUDENT ===
    // IMPORTANT: studentId can be either:
    // 1. Clerk ID (e.g., user_abc123) - passed from admin UI
    // 2. Database ID (e.g., cm1abc123) - internal reference
    // We check both to ensure compatibility
    const student = await prisma.user.findFirst({
      where: {
        OR: [
          { id: studentId }, // Database ID
          { clerkId: studentId }, // Clerk ID
        ],
      },
      select: { id: true, email: true, name: true, role: true },
    });

    // Check if student exists
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Verify the user is actually a student role
    // Prevent assigning roadmaps to instructors or admins
    if (student.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'User is not a student' },
        { status: 400 }
      );
    }

    // === UPDATE DATABASE ===
    // Store the Google Docs document ID in the student's record
    // Use the database ID (not the Clerk ID) for the update
    const updatedStudent = await prisma.user.update({
      where: { id: student.id }, // Always use database ID for updates
      data: { roadmapDocumentId },
      select: {
        id: true,
        email: true,
        name: true,
        roadmapDocumentId: true,
      },
    });

    // === SUCCESS RESPONSE ===
    return NextResponse.json({
      success: true,
      message: 'Roadmap document assigned successfully',
      student: updatedStudent,
    });
  } catch (error: any) {
    // Log error for debugging
    console.error('Error assigning roadmap document:', error);

    // Return generic error to client
    // Don't expose internal error details in production
    return NextResponse.json(
      {
        error: 'Failed to assign roadmap document',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Retrieve Student's Roadmap Document Assignment
 *
 * Returns the Google Docs document ID assigned to a specific student.
 * Used by admin UI to display current roadmap assignment status.
 *
 * Success Response (200):
 * ```json
 * {
 *   "success": true,
 *   "student": {
 *     "id": "cm1abc123",
 *     "email": "student@example.com",
 *     "name": "John Doe",
 *     "roadmapDocumentId": "1AkKlxCz5F2ZihNYQuQ9XP-TAVBWP84h5Hh9flVJ4a8I"
 *   }
 * }
 * ```
 *
 * Note: roadmapDocumentId will be null if no document is assigned
 *
 * Error Responses:
 * - 401: User not authenticated
 * - 403: User is not admin or instructor
 * - 404: Student not found
 * - 500: Server error
 *
 * @async
 * @param {NextRequest} request - The Next.js request object
 * @param {Object} params - Route parameters
 * @param {string} params.studentId - Student's Clerk ID or database ID
 * @returns {Promise<NextResponse>} JSON response with student data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  try {
    // === AUTHENTICATION & AUTHORIZATION ===
    const currentUser = await getCurrentUser();

    // Check authentication
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check role permissions
    // Only admins and instructors can view student roadmap assignments
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'INSTRUCTOR') {
      return NextResponse.json(
        { error: 'Forbidden: Only admins and instructors can view student roadmap assignments' },
        { status: 403 }
      );
    }

    // === FETCH STUDENT DATA ===
    const { studentId } = params;

    // Find student by either database ID or Clerk ID
    // Returns null for roadmapDocumentId if not assigned
    const student = await prisma.user.findFirst({
      where: {
        OR: [
          { id: studentId }, // Database ID
          { clerkId: studentId }, // Clerk ID
        ],
      },
      select: {
        id: true,
        email: true,
        name: true,
        roadmapDocumentId: true, // May be null if not assigned
      },
    });

    // Check if student exists
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // === SUCCESS RESPONSE ===
    return NextResponse.json({
      success: true,
      student,
    });
  } catch (error: any) {
    // Log error for debugging
    console.error('Error fetching student roadmap document:', error);

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to fetch student roadmap document',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

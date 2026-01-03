import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/server/auth/requireAuth";
import { Role } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Only admins and instructors can fetch user lists
    if (user.role === Role.STUDENT) {
      return NextResponse.json(
        { error: "Unauthorized to fetch users" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const roleFilter = searchParams.get("role");

    // Build the where clause
    const where: any = {};

    if (roleFilter && (roleFilter === "STUDENT" || roleFilter === "INSTRUCTOR")) {
      where.role = roleFilter;
    }

    // Fetch users with relevant fields
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
      },
      orderBy: [
        { name: "asc" },
        { email: "asc" },
      ],
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

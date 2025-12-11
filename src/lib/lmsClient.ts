/**
 * Client-side wrappers for LMS API endpoints
 */

import axios from 'axios';
import type { Course, Enrollment, ApiResponse } from './types';

const api = axios.create({
  baseURL: '/api/lms',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// COURSES
// ============================================

export async function getCourses(): Promise<Course[]> {
  const response = await api.get<ApiResponse<Course[]>>('/courses');
  return response.data.data || [];
}

export async function getCourseById(courseId: string): Promise<Course | null> {
  const response = await api.get<ApiResponse<Course>>(`/courses/${courseId}`);
  return response.data.data || null;
}

// ============================================
// ENROLLMENTS
// ============================================

export async function getMyEnrollments(): Promise<Enrollment[]> {
  const response = await api.get<ApiResponse<Enrollment[]>>('/enrollments');
  return response.data.data || [];
}

export async function enrollInCourse(courseId: string): Promise<Enrollment> {
  const response = await api.post<ApiResponse<Enrollment>>('/enrollments', { courseId });
  if (!response.data.success) {
    throw new Error(response.data.error || 'Enrollment failed');
  }
  return response.data.data!;
}

export async function unenrollFromCourse(enrollmentId: string): Promise<void> {
  await api.delete(`/enrollments/${enrollmentId}`);
}

export default {
  getCourses,
  getCourseById,
  getMyEnrollments,
  enrollInCourse,
  unenrollFromCourse,
};

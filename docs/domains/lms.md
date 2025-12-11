# LMS Domain

## Overview
The LMS (Learning Management System) domain handles core course management functionality including courses, lessons, and student enrollments.

## Data Models

### Course
```typescript
{
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  instructorId: string
  published: boolean
  createdAt: Date
  updatedAt: Date
  lessons: Lesson[]
  enrollments: Enrollment[]
}
```

### Lesson
```typescript
{
  id: string
  courseId: string
  title: string
  content: string  // Rich text/markdown
  order: number
  videoUrl?: string
  duration?: number  // minutes
  createdAt: Date
  updatedAt: Date
}
```

### Enrollment
```typescript
{
  id: string
  userId: string
  courseId: string
  enrolledAt: Date
  completedAt?: Date
  progress: number  // 0-100
}
```

## Services

### courseService.ts
- `listCourses(filters?)`: Get all published courses
- `getCourseById(id)`: Get course details with lessons
- `createCourse(data)`: Create new course (admin/instructor)
- `updateCourse(id, data)`: Update course
- `publishCourse(id)`: Mark course as published

### lessonService.ts
- `getLessonById(id)`: Get lesson details
- `getLessonsByCourse(courseId)`: Get all lessons for a course
- `createLesson(courseId, data)`: Add lesson to course
- `updateLesson(id, data)`: Update lesson content
- `reorderLessons(courseId, lessonIds)`: Change lesson order

### enrollmentService.ts
- `enrollUser(userId, courseId)`: Create enrollment
- `getEnrollments(userId)`: Get user's enrolled courses
- `updateProgress(enrollmentId, progress)`: Update completion %
- `markCourseComplete(enrollmentId)`: Mark as 100% complete
- `unenroll(enrollmentId)`: Remove enrollment

## API Endpoints

### Courses
- `GET /api/lms/courses`: List all published courses
- `GET /api/lms/courses/[courseId]`: Get course + lessons
- `POST /api/lms/courses`: Create course (auth required)
- `PUT /api/lms/courses/[courseId]`: Update course (auth required)

### Enrollments
- `GET /api/lms/enrollments`: Get current user's enrollments
- `POST /api/lms/enrollments`: Enroll in course
- `DELETE /api/lms/enrollments/[id]`: Unenroll

## UI Components

### CourseList.tsx
- Displays grid of available courses
- Filter by category, instructor, difficulty
- Shows course thumbnail, title, description
- "Enroll" or "Continue" button

### CourseDetail.tsx
- Course overview and metadata
- Instructor information
- Syllabus (list of lessons)
- Enrollment status and progress
- "Start Course" or "Continue" CTA

### LessonView.tsx
- Lesson content (markdown rendered)
- Video player (if applicable)
- Navigation: Previous/Next lesson
- Progress tracking
- "Practice with AI" button → links to assessment

## Integration Points

### With Assessment Domain
- Lessons link to related coding challenges
- "Practice Now" button passes lesson context to assessment page
- Recommended challenges based on current lesson

### With Knowledge RAG
- Lesson content ingested into knowledge base
- AI tutor can reference lesson materials
- Search functionality across all lesson content

## Future Enhancements
- Discussion forums per lesson
- Peer review and assignments
- Certificates on course completion
- Learning paths (multi-course sequences)
- Quiz/assessment integration within lessons

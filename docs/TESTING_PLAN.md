# LMS Comprehensive Testing Plan

## Overview
This document outlines the complete testing plan for the Signal Works LMS, covering all admin dashboard functionality, data flows, and user interactions.

---

## 1. Gap Fixes Implemented

### ✅ **Gap Fix #1: Student Notes Persistence**

**What was implemented:**
- Added `adminNotes` field to User model in database
- Created API endpoint for updating student notes: `PUT /api/admin/users/[userId]`
- Updated student management UI to load and save notes with onBlur autosave

**How to test:**
1. Navigate to `/admin` and log in as ADMIN
2. Click "Student Management" card
3. Find any student in the table
4. Type notes in the "Notes" column input field
5. Click outside the input (onBlur triggers save)
6. Refresh the page
7. ✅ **Expected:** Notes should persist and reload

**Database verification:**
```sql
SELECT id, name, email, "adminNotes" FROM "User" WHERE role = 'STUDENT';
```

---

### ✅ **Gap Fix #2: Instructor Course Assignment**

**What was implemented:**
- Created `AssignCourseModal` component
- Added "Assign Course" button to instructor management
- Uses existing `PUT /api/admin/courses/[courseId]` endpoint to update `instructorId`

**How to test:**
1. Navigate to `/admin/instructors`
2. Click "Assign Course" button for any instructor
3. Select a course from the dropdown
4. Click "Assign Course"
5. ✅ **Expected:** Course is reassigned to the selected instructor
6. Verify by checking `/admin/courses` - instructor name should update

**API verification:**
```bash
curl -X PUT http://localhost:3000/api/admin/courses/[courseId] \
  -H "Content-Type: application/json" \
  -d '{"instructorId": "[newInstructorId]"}'
```

---

## 2. Enhanced Features Recommendations

### 🚀 **Enhancement #1: Quick Action Modals**

**Current state:** Quick action buttons navigate to pages with `?action=create` query param

**Recommended implementation:**
1. Create reusable modal components:
   - `CreateStudentModal` - Quick student enrollment (links to Clerk)
   - `CreateInstructorModal` - Quick instructor creation (links to Clerk)
   - `CreateCourseModal` - Inline course creation
   - `CreateRoadmapModal` - Quick roadmap setup

2. Update admin dashboard to open modals instead of navigating
3. Provide success feedback and auto-refresh stats

**Benefits:**
- Faster workflows (no page navigation)
- Better UX with instant feedback
- Reduced context switching

**Implementation priority:** Medium (nice-to-have for productivity)

---

### 🚀 **Enhancement #2: Bulk Actions**

**Recommended implementation:**

#### **Student Management Bulk Actions:**
1. Add checkboxes to student table rows
2. Add "Select All" checkbox in header
3. Add bulk action dropdown:
   - Bulk Enroll in Course
   - Bulk Unenroll
   - Bulk Delete
   - Export Selected (CSV)

#### **Course Management Bulk Actions:**
1. Add checkboxes to course table rows
2. Add bulk action dropdown:
   - Bulk Publish
   - Bulk Unpublish
   - Bulk Delete
   - Bulk Assign to Instructor

**Benefits:**
- Save time on repetitive actions
- Easier management of large datasets
- Better for onboarding multiple students

**Implementation priority:** High (significant productivity gain)

---

### 🚀 **Enhancement #3: Real-time Updates**

**Current state:** Stats update on page refresh only

**Recommended implementation:**
1. Add WebSocket connection or Server-Sent Events (SSE)
2. Subscribe to database events (enrollments, completions, etc.)
3. Update dashboard stats in real-time
4. Add live notification badges for new activity

**Alternative (simpler):**
- Use SWR or React Query with automatic polling (every 30 seconds)
- Add manual "Refresh" button with loading state

**Benefits:**
- Always up-to-date information
- No need for manual refresh
- Better collaboration awareness

**Implementation priority:** Low (polish feature)

---

## 3. End-to-End Testing Plan

### **Test Suite 1: Admin Dashboard Overview**

#### Test 1.1: Dashboard Stats Display
**Objective:** Verify all stats load correctly

**Steps:**
1. Log in as ADMIN role
2. Navigate to `/admin`
3. Wait for loading to complete

**Expected Results:**
- ✅ Total Users card shows correct count
- ✅ Total Courses card shows published/draft breakdown
- ✅ Active Enrollments card shows active and completed counts
- ✅ Avg Progress card shows percentage and total attempts
- ✅ All numbers match database queries

**Database queries for verification:**
```sql
-- Total Users
SELECT role, COUNT(*) FROM "User" GROUP BY role;

-- Total Courses
SELECT published, COUNT(*) FROM "Course" GROUP BY published;

-- Active Enrollments
SELECT status, COUNT(*) FROM "Enrollment" GROUP BY status;

-- Avg Progress
SELECT AVG(progress) FROM "Enrollment" WHERE status = 'ACTIVE';
```

---

#### Test 1.2: Management Cards Navigation
**Objective:** Verify all management cards link correctly

**Steps:**
1. From admin dashboard, click each management card
2. Verify correct page loads

**Expected Results:**
- ✅ Student Management → `/admin/students`
- ✅ Instructor Management → `/admin/instructors`
- ✅ Course Management → `/admin/courses`
- ✅ Lesson Management → `/admin/lessons`
- ✅ Student Engagement → `/admin/engagement`
- ✅ Student Roadmaps → `/admin/roadmaps`

---

#### Test 1.3: Quick Actions
**Objective:** Verify quick action buttons work

**Steps:**
1. Click each quick action button
2. Verify correct navigation with query params

**Expected Results:**
- ✅ "+ Add Student" → `/admin/students?action=create`
- ✅ "+ Add Instructor" → `/admin/instructors?action=create`
- ✅ "+ Create Course" → `/admin/courses?action=create`
- ✅ "+ Create Roadmap" → `/admin/roadmaps?action=create`

---

### **Test Suite 2: Student Management**

#### Test 2.1: Student List Display
**Steps:**
1. Navigate to `/admin/students`
2. Verify table displays all students

**Expected Results:**
- ✅ All STUDENT role users displayed
- ✅ Columns show: Username, Email, Enrolled Course, Start Date, Finish Date, Assessment Level, Roadmap link, Notes, Actions
- ✅ Search functionality filters by name/email
- ✅ Empty state message if no students

---

#### Test 2.2: Student Search
**Steps:**
1. Type student name or email in search box
2. Verify real-time filtering

**Expected Results:**
- ✅ Table filters as you type
- ✅ Shows only matching students
- ✅ Case-insensitive search
- ✅ Clears when search is empty

---

#### Test 2.3: Edit Enrollment Dates
**Steps:**
1. Find student with enrollment
2. Click "Edit Dates" button
3. Change start/finish dates
4. Click "Save Changes"

**Expected Results:**
- ✅ Modal opens with current dates
- ✅ Dates save successfully
- ✅ Modal closes
- ✅ Table refreshes with new dates
- ✅ Toast/alert shows success message

**API verification:**
```bash
curl -X PUT http://localhost:3000/api/admin/enrollments/[enrollmentId] \
  -H "Content-Type: application/json" \
  -d '{"enrolledAt": "2025-01-01", "completedAt": "2025-03-01"}'
```

---

#### Test 2.4: Student Notes (NEW)
**Steps:**
1. Type notes in the Notes column
2. Click outside the input field
3. Refresh the page

**Expected Results:**
- ✅ Notes save on blur
- ✅ Notes persist after refresh
- ✅ No error messages
- ✅ API call to `PUT /api/admin/users/[userId]` succeeds

---

#### Test 2.5: View Student Roadmap
**Steps:**
1. Click "View" button in Roadmap column
2. Verify navigation to roadmap page

**Expected Results:**
- ✅ Navigates to `/admin/students/[studentId]/roadmap`
- ✅ Shows student's personalized learning path
- ✅ Can add/remove courses from roadmap

---

###Test Suite 3: Instructor Management**

#### Test 3.1: Instructor List Display
**Steps:**
1. Navigate to `/admin/instructors`
2. Verify table displays all instructors

**Expected Results:**
- ✅ All INSTRUCTOR role users displayed
- ✅ Columns show: Instructor, Email, Courses Created, Students, Actions
- ✅ Course count matches database
- ✅ Student count shows unique students across all courses

---

#### Test 3.2: Assign Course to Instructor (NEW)
**Steps:**
1. Click "Assign Course" button for an instructor
2. Select a course from dropdown
3. Click "Assign Course"
4. Verify success

**Expected Results:**
- ✅ Modal opens with course list
- ✅ Dropdown shows all courses
- ✅ Shows current instructor for each course
- ✅ Assignment succeeds
- ✅ Table refreshes with updated course count
- ✅ Course shows new instructor in `/admin/courses`

**Database verification:**
```sql
SELECT id, title, "instructorId"
FROM "Course"
WHERE id = '[courseId]';
```

---

#### Test 3.3: Instructor Search
**Steps:**
1. Type instructor name or email in search box
2. Verify filtering works

**Expected Results:**
- ✅ Real-time search filtering
- ✅ Shows only matching instructors
- ✅ Case-insensitive

---

### **Test Suite 4: Course Management**

#### Test 4.1: Course List Display
**Steps:**
1. Navigate to `/admin/courses`
2. Verify all courses display

**Expected Results:**
- ✅ Shows all courses
- ✅ Columns: Title, Description, Instructor, Lessons, Enrollments, Status, Actions
- ✅ Published status badge shows correctly
- ✅ Enrollment count matches database

---

#### Test 4.2: Publish/Unpublish Course
**Steps:**
1. Find a draft course
2. Click "Publish" button
3. Verify status changes
4. Click "Unpublish"
5. Verify reverts to draft

**Expected Results:**
- ✅ Status toggles between Published/Draft
- ✅ Badge color changes (green for published, gray for draft)
- ✅ Dashboard stats update immediately
- ✅ Students can only see published courses

---

#### Test 4.3: Edit Course
**Steps:**
1. Click "Edit" button for a course
2. Update title, description, or thumbnail
3. Save changes

**Expected Results:**
- ✅ Edit modal/form opens
- ✅ Current values pre-filled
- ✅ Changes save successfully
- ✅ Table refreshes with new data

---

#### Test 4.4: Delete Course
**Steps:**
1. Click "Delete" button
2. Confirm deletion
3. Verify course removed

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ Course deleted from database
- ✅ Associated enrollments handled (cascade delete or set to inactive)
- ✅ Dashboard stats update

---

#### Test 4.5: Filter Courses
**Steps:**
1. Use published/draft filter dropdown
2. Verify filtering works

**Expected Results:**
- ✅ "All" shows everything
- ✅ "Published" shows only published courses
- ✅ "Draft" shows only draft courses

---

### **Test Suite 5: Course Enrollment Flow**

#### Test 5.1: Student Enrollment
**Steps (as STUDENT role):**
1. Log in as student
2. Navigate to `/student/courses`
3. Click "View Details" on a course
4. Click "Enroll" button

**Expected Results:**
- ✅ Enrollment creates successfully
- ✅ Button changes to "Unenroll"
- ✅ "Enrolled" badge appears on course card
- ✅ Course appears in "My Courses" on student dashboard
- ✅ Admin dashboard enrollment count increases

**Database verification:**
```sql
SELECT * FROM "Enrollment"
WHERE "userId" = '[studentId]' AND "courseId" = '[courseId]';
```

---

#### Test 5.2: Course Capacity Check
**Steps:**
1. Create a course with maxStudents = 2
2. Enroll 2 students
3. Try to enroll a 3rd student

**Expected Results:**
- ✅ First 2 enrollments succeed
- ✅ 3rd enrollment fails with "Course is full" error
- ✅ "Full" badge appears on course card
- ✅ "Enroll" button is disabled
- ✅ Available slots shows "0/2 spots left"

---

#### Test 5.3: Re-enrollment After Dropping
**Steps:**
1. Enroll in a course
2. Unenroll (status changes to DROPPED)
3. Re-enroll in same course

**Expected Results:**
- ✅ Unenroll changes status to DROPPED (doesn't delete record)
- ✅ Re-enroll reactivates enrollment (status → ACTIVE)
- ✅ enrolledAt date updates to current time
- ✅ Progress resets or preserves (based on business logic)

---

### **Test Suite 6: Authentication & Authorization**

#### Test 6.1: Clerk User Sync
**Steps:**
1. Create new user in Clerk Dashboard
2. Set role in public metadata: `{"role": "STUDENT"}`
3. Log in as that user
4. Check database for user record

**Expected Results:**
- ✅ User record created in database on first login
- ✅ clerkId matches Clerk user ID
- ✅ Role synced from Clerk metadata
- ✅ Email and name populated from Clerk
- ✅ `getCurrentUser()` returns database user ID (not Clerk ID)

**Database verification:**
```sql
SELECT id, "clerkId", email, name, role
FROM "User"
WHERE "clerkId" = '[clerkUserId]';
```

---

#### Test 6.2: Role-Based Access Control
**Steps:**
1. Try accessing admin routes as STUDENT
2. Try accessing student routes as ADMIN
3. Try accessing instructor routes as STUDENT

**Expected Results:**
- ✅ `/admin/*` only accessible by ADMIN
- ✅ `/instructor/*` only accessible by INSTRUCTOR or ADMIN
- ✅ `/student/*` only accessible by STUDENT or ADMIN
- ✅ Unauthorized access redirects to home or shows 403

---

#### Test 6.3: Enrollment Permission Check
**Steps (as STUDENT):**
1. Try to enroll another user via API
2. Try to access another user's enrollment details

**Expected Results:**
- ✅ Can only enroll self
- ✅ Can only see own enrollments
- ✅ API returns 403 for unauthorized actions

---

### **Test Suite 7: Data Integrity & Edge Cases**

#### Test 7.1: Empty States
**Steps:**
1. Visit pages with no data (new instance)

**Expected Results:**
- ✅ `/admin` shows zeros for all stats
- ✅ `/admin/students` shows "No students found" message
- ✅ `/student/courses` shows "No courses available" when none published
- ✅ No JavaScript errors in console

---

#### Test 7.2: Large Dataset Performance
**Steps:**
1. Seed database with 100+ students, 50+ courses
2. Navigate to admin pages
3. Check load times and responsiveness

**Expected Results:**
- ✅ Pages load in < 2 seconds
- ✅ Search/filter remains responsive
- ✅ Pagination works correctly if implemented
- ✅ No memory leaks or UI freezing

---

#### Test 7.3: Concurrent Enrollment
**Steps:**
1. Set course maxStudents = 1
2. Have 2 students try to enroll simultaneously
3. Verify only one succeeds

**Expected Results:**
- ✅ One enrollment succeeds
- ✅ Second enrollment fails with "Course is full"
- ✅ No race condition allows over-enrollment
- ✅ Database constraint prevents duplicates

---

#### Test 7.4: Invalid Data Handling
**Steps:**
1. Submit forms with missing required fields
2. Enter invalid email formats
3. Try negative numbers for maxStudents

**Expected Results:**
- ✅ Client-side validation prevents submission
- ✅ Server-side validation returns errors
- ✅ Error messages are user-friendly
- ✅ No crashes or 500 errors

---

## 4. API Endpoint Testing

### **Core Endpoints**

#### Admin Users API
```bash
# List all users
GET /api/admin/users?role=STUDENT&search=john&page=1&limit=50

# Get specific user
GET /api/admin/users/[userId]

# Update user (including notes)
PUT /api/admin/users/[userId]
Body: { "adminNotes": "Excellent student", "role": "STUDENT" }

# Delete user
DELETE /api/admin/users/[userId]
```

#### Admin Courses API
```bash
# List courses
GET /api/admin/courses?published=true&search=react

# Get specific course
GET /api/lms/courses/[courseId]

# Create course
POST /api/admin/courses
Body: { "title": "...", "description": "...", "instructorId": "..." }

# Update course (including instructor assignment)
PUT /api/admin/courses/[courseId]
Body: { "published": true, "instructorId": "[newInstructorId]" }

# Delete course
DELETE /api/admin/courses/[courseId]
```

#### Enrollment API
```bash
# Enroll in course (as student)
POST /api/lms/enrollments
Body: { "courseId": "[courseId]" }

# Unenroll from course
POST /api/lms/enrollments/unenroll
Body: { "courseId": "[courseId]" }

# Update enrollment (admin only)
PUT /api/admin/enrollments/[enrollmentId]
Body: { "enrolledAt": "2025-01-01", "completedAt": "2025-03-01" }

# Get student's enrollments
GET /api/lms/enrollments
```

#### Engagement API
```bash
# Get engagement metrics (admin only)
GET /api/admin/engagement

# Expected response:
{
  "success": true,
  "data": {
    "summary": {
      "enrollments": {
        "inProgress": 15,
        "completed": 8,
        "avgProgress": 67.5
      },
      "assessments": {
        "totalAttempts": 120,
        "avgScore": 78.3
      }
    }
  }
}
```

---

## 5. Testing Checklist

### **Pre-Deployment Checklist**

- [ ] All admin dashboard stats load correctly
- [ ] Student management CRUD operations work
- [ ] Student notes save and persist
- [ ] Instructor course assignment works
- [ ] Course publish/unpublish works
- [ ] Enrollment flow works end-to-end
- [ ] Course capacity limits enforced
- [ ] Role-based access control enforced
- [ ] Clerk user sync works on first login
- [ ] Database user ID used for enrollments (not Clerk ID)
- [ ] All API endpoints return correct data
- [ ] Error states display user-friendly messages
- [ ] Loading states shown during async operations
- [ ] Mobile responsiveness verified
- [ ] No console errors or warnings
- [ ] Database migrations applied
- [ ] Prisma client regenerated

### **Regression Testing Checklist**

Run these tests after any code changes:

- [ ] User authentication still works
- [ ] Enrollment creation doesn't break
- [ ] Admin stats still calculate correctly
- [ ] Course capacity still enforced
- [ ] Notes persistence still works
- [ ] Instructor assignments still work

---

## 6. Performance Benchmarks

### **Target Metrics**

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| Admin Dashboard Load | < 1.5s | 3s |
| Student List Load (100 students) | < 2s | 4s |
| Course Enrollment API | < 500ms | 1s |
| Search Filter Response | < 200ms | 500ms |
| Modal Open Time | < 100ms | 300ms |

### **How to Measure**

Use browser DevTools Network tab:
1. Open Network tab
2. Reload page
3. Check "Load" time at bottom
4. Check individual API request times

---

## 7. Known Issues & Limitations

### **Current Limitations**

1. **TypeScript errors in some files** - Prisma types may not regenerate until dev server restarts
2. **No pagination** - Large datasets (>100 records) may load slowly
3. **No real-time updates** - Dashboard stats require manual refresh
4. **No bulk actions** - Managing multiple records is tedious
5. **bcryptjs missing** - Password hashing for legacy users may fail (Clerk users don't need passwords)

### **Workarounds**

1. **TypeScript errors:** Restart dev server after schema changes
2. **Large datasets:** Implement pagination or virtual scrolling
3. **Real-time updates:** Add manual refresh button or polling
4. **Bulk actions:** Implement as enhancement (see section 2)
5. **bcryptjs:** Install if needed: `npm install bcryptjs @types/bcryptjs`

---

## 8. Testing Tools

### **Recommended Tools**

1. **Postman/Insomnia** - API endpoint testing
2. **Prisma Studio** - Database inspection (`npx prisma studio`)
3. **React DevTools** - Component state inspection
4. **Chrome DevTools** - Network, performance, console debugging
5. **Clerk Dashboard** - User management, role assignment

### **Database Inspection**

```bash
# Open Prisma Studio
npx prisma studio

# Connect to database directly
npx prisma db execute --stdin < query.sql
```

---

## 9. Bug Reporting Template

When reporting issues, include:

```
**Bug Title:** [Clear, concise description]

**Steps to Reproduce:**
1. Navigate to...
2. Click on...
3. Enter...
4. Observe...

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Environment:**
- Browser: [Chrome 120, Firefox 115, etc.]
- User Role: [ADMIN, INSTRUCTOR, STUDENT]
- Database State: [Empty, seeded, production data]

**Console Errors:**
[Paste any errors from browser console]

**Screenshots:**
[Attach if relevant]

**Database Query Results:**
[If applicable, show relevant DB query results]
```

---

## 10. Success Criteria

The LMS is considered **fully functional** when:

✅ All admin dashboard elements display correct data
✅ All management pages load and function without errors
✅ Student enrollment flow works end-to-end
✅ Course capacity limits are enforced
✅ Role-based access control prevents unauthorized access
✅ Clerk users sync to database on first login
✅ Database user IDs used throughout (not Clerk IDs)
✅ Student notes persist across sessions
✅ Instructor course assignments work via modal
✅ No critical console errors
✅ Mobile layout is usable (responsive design)
✅ Page load times meet performance benchmarks
✅ All API endpoints return expected responses
✅ Error messages are user-friendly and actionable

---

## Summary

This testing plan covers:
- ✅ **2 Gap fixes implemented** (Student notes, Instructor assignments)
- 🚀 **3 Enhancement recommendations** (Quick modals, Bulk actions, Real-time updates)
- 📋 **7 Test suites** covering all major functionality
- 🔌 **API endpoint documentation** for all core routes
- ✅ **Pre-deployment checklist** to verify readiness
- 📊 **Performance benchmarks** to maintain quality
- 🐛 **Bug reporting template** for clear communication

**Next Steps:**
1. Run through Test Suite 5 (Course Enrollment Flow) to verify the Clerk user sync fix
2. Test student notes persistence (Test 2.4)
3. Test instructor course assignment (Test 3.2)
4. Verify all API endpoints return correct data
5. Check dashboard stats accuracy
6. Deploy to staging/production when all tests pass

**Maintenance:**
- Re-run regression tests after each deployment
- Monitor performance metrics
- Update test plan as new features are added
- Keep bug tracking template up to date

# UI Endpoints Reference

Complete reference of all user interface routes in the Signal Works LMS, organized by user role with detailed descriptions of features and functionality available on each page.

---

## Table of Contents

1. [Public Routes](#public-routes)
2. [Student Routes](#student-routes)
3. [Instructor Routes](#instructor-routes)
4. [Admin Routes](#admin-routes)
5. [Testing Routes](#testing-routes)
6. [Route Hierarchy](#route-hierarchy)

---

## Public Routes

Routes accessible without authentication or available to all users.

### `/` - Landing Page
**File:** `src/app/page.tsx`
**Access:** Public (no authentication required)

**Purpose:** Marketing and informational landing page for prospective students.

**Features:**
- Hero section with call-to-action
- Program features overview
- Curriculum information and highlights
- Student testimonials
- Frequently asked questions (FAQ)
- Contact form
- Footer with navigation links
- Responsive design with dark mode support

**User Actions:**
- Browse program information
- View curriculum overview
- Read student testimonials
- Submit contact form
- Navigate to sign-up/sign-in

---

### `/sign-in` - Authentication
**File:** `src/app/sign-in/[[...sign-in]]/page.tsx`
**Access:** Public

**Purpose:** User authentication interface powered by Clerk.

**Features:**
- Email/password login
- Social authentication (Google, GitHub, etc.)
- Remember me functionality
- Forgot password flow
- Redirect to sign-up
- Multi-factor authentication (if enabled)

**User Actions:**
- Log in with email/password
- Log in with social providers
- Reset forgotten password
- Navigate to sign-up page

---

### `/sign-up` - Registration
**File:** `src/app/sign-up/[[...sign-up]]/page.tsx`
**Access:** Public

**Purpose:** New user registration powered by Clerk.

**Features:**
- Email/password registration
- Social sign-up (Google, GitHub, etc.)
- Email verification
- Terms of service acceptance
- Automatic role assignment
- Redirect to appropriate dashboard after signup

**User Actions:**
- Create new account
- Sign up with social providers
- Verify email address
- Accept terms and conditions

---

### `/assessment` - Skill Assessment
**File:** `src/app/assessment/page.tsx`
**Access:** Public or authenticated (accessible to all)

**Purpose:** Multi-step skill assessment wizard to evaluate student proficiency across multiple dimensions.

**Features:**
- **7+ Assessment Step Types:**
  - **Questionnaire**: Background information and learning goals
  - **Multiple Choice (MCQ)**: Conceptual knowledge questions
  - **Code Challenges**: Live coding exercises with test cases
  - **Design Comparison**: Compare and evaluate design alternatives
  - **Design Critique**: Identify UI/UX issues in mockups
  - **Bug Fix**: Debug and fix broken code
  - **Summary**: Results overview with skill breakdown

- **Progress Tracking:**
  - Step counter (e.g., "Step 3 of 27")
  - Progress bar visualization
  - Estimated time remaining
  - Percentage completion

- **Navigation:**
  - Back button (to previous steps)
  - Forward/Next button
  - Can't skip required steps
  - Session persistence (resume if interrupted)

- **Real-time Feedback:**
  - Immediate grading for some step types
  - Confidence scores
  - Skill updates after each step

- **Session Management:**
  - Auto-save progress
  - Resume incomplete sessions
  - Session timeout handling

**User Actions:**
- Start new assessment session
- Resume in-progress assessment
- Navigate between steps
- Submit answers for each step
- View summary and skill profile
- Restart assessment if needed

**Post-Assessment:**
- Goals and interests automatically extracted and saved
- Skill mastery scores calculated
- Profile populated for project recommendations

---

### `/roadmap` - Learning Roadmap
**File:** `src/app/roadmap/page.tsx`
**Access:** Public or authenticated

**Purpose:** View personalized learning roadmap from Google Docs.

**Features:**
- Displays roadmap content fetched from Google Docs API
- Rendered HTML with proper formatting
- Supports headings, lists, tables, links, bold/italic text
- Responsive layout with dark mode
- Error handling for missing/inaccessible documents

**User Actions:**
- View assigned roadmap
- Navigate back to dashboard
- Retry if error occurs

**Requirements:**
- Roadmap document must be assigned by admin
- Document must be shared with service account

---

### `/(public)/login` - Legacy Login
**File:** `src/app/(public)/login/page.tsx`
**Access:** Public

**Purpose:** Placeholder for potential custom authentication implementation (currently not in use; Clerk is primary auth).

---

## Student Routes

Routes accessible to users with the `STUDENT` role. All student routes require authentication and role verification.

### `/student` - Student Dashboard
**File:** `src/app/student/page.tsx`
**Access:** Authenticated students only
**Role Check:** `user.role === 'STUDENT'`
**Tracking:** Session tracking enabled, onboarding check wrapper

**Purpose:** Central hub for student activity, progress, and quick navigation.

**Features:**

- **Welcome Header:**
  - Personalized greeting with student's first name
  - Current date and time
  - Motivational message

- **Current Project Summary:**
  - Active project name and description
  - Progress percentage
  - Next milestone/deadline
  - Quick link to project details

- **Upcoming Calendar Events:**
  - Next 3-5 scheduled events
  - Office hours, deadlines, workshops
  - Date, time, and type indicators

- **Weekly Activity Overview:**
  - Activity chart (last 7 days)
  - GitHub commits, lesson completions, time spent
  - Activity streak visualization

- **GitHub Activity Tracking:**
  - Recent commits and pull requests
  - Repository links
  - Contribution graph
  - Integration status indicator

- **Course Roadmap Progress:**
  - Overall progress percentage
  - Current phase/module
  - Completed vs. total items
  - Link to full roadmap

- **Recommended Learning Resources:**
  - Personalized resource suggestions
  - Based on skill gaps and interests
  - Links to documentation, tutorials, videos

- **Study Streak Counter:**
  - Current streak (consecutive days)
  - Longest streak
  - Encouragement to maintain streak

- **Notifications Panel:**
  - Unread notifications badge
  - Assignment due dates
  - Instructor feedback
  - System announcements

- **Quick Navigation Links:**
  - Start Assessment
  - View Skills
  - Browse Courses
  - View Roadmap
  - GitHub Integration
  - View Curriculum

- **Motivational Footer:**
  - Inspirational quote
  - Progress encouragement

**User Actions:**
- View overall progress at a glance
- Navigate to different sections
- Check upcoming events
- Review recent activity
- Access GitHub integration
- View notifications
- Start or resume assessment

---

### `/student/courses` - Course Catalog
**File:** `src/app/student/courses/page.tsx`
**Access:** Authenticated students only

**Purpose:** Browse available courses, view enrolled courses, and manage enrollments.

**Features:**

- **Tabbed Interface:**
  - **All Courses**: Every course in the catalog
  - **Available**: Courses with open enrollment
  - **Enrolled**: Courses the student is currently taking

- **Course Cards Display:**
  - Course thumbnail image
  - Course title and description
  - Instructor name and avatar
  - Lesson count
  - Total duration
  - Enrollment status badge
  - Availability indicator

- **Real-time Enrollment:**
  - Enroll button for available courses
  - Loading state during enrollment
  - Success/error notifications
  - Instant card updates

- **Search and Filtering:**
  - Search by course title
  - Filter by instructor
  - Sort by newest, popular, duration

**User Actions:**
- Browse all courses
- Filter by enrollment status
- Search for specific courses
- Enroll in available courses
- View enrolled courses
- Click card to view course details

---

### `/student/courses/[courseId]` - Course Details
**File:** `src/app/student/courses/[courseId]/page.tsx`
**Access:** Authenticated students only

**Purpose:** View detailed information about a specific course.

**Features:**

- **Course Hero Section:**
  - Large course thumbnail
  - Course title and subtitle
  - Instructor information:
    - Instructor name
    - Instructor avatar
    - Instructor email (optional)
  - Course stats:
    - Total lessons
    - Total duration
    - Difficulty level
  - Enrollment status

- **Curriculum Listing:**
  - All lessons in order
  - Lesson titles
  - Lesson duration (minutes)
  - Lesson type (video, reading, exercise, quiz)
  - Completion status (if enrolled)
  - Locked/unlocked indicators

- **Course Description:**
  - Full course description
  - Learning objectives
  - Prerequisites
  - What you'll build

- **Enrollment Section:**
  - Enroll button (if not enrolled and available)
  - "Continue Course" button (if enrolled)
  - Availability status
  - Capacity information

**User Actions:**
- Read full course description
- View complete curriculum
- Enroll in course
- Start or continue course
- View instructor profile
- Navigate to specific lessons (if enrolled)

---

### `/student/courses/[courseId]/lessons/[lessonId]` - Lesson View
**File:** `src/app/student/courses/[courseId]/lessons/[lessonId]/page.tsx`
**Access:** Enrolled students only

**Purpose:** View and complete individual lesson content.

**Features:**
- Lesson content (video, text, code examples)
- Lesson navigation (previous/next)
- Completion tracking
- Related resources
- Notes section

**User Actions:**
- Watch lesson videos
- Read lesson content
- Practice with code examples
- Mark lesson as complete
- Take notes
- Navigate between lessons

---

### `/student/skills` - Skill Profile
**File:** `src/app/student/skills/page.tsx`
**Access:** Authenticated students only

**Purpose:** Visualize and track skill proficiency across multiple dimensions.

**Features:**

- **Radar Chart Visualization:**
  - 8 skill dimensions (Programming, Web, JavaScript, Backend, Dev Practices, System Thinking, Design, Meta)
  - Interactive radar chart
  - Color-coded proficiency levels
  - Responsive to window resize

- **Overall Mastery Level:**
  - Classification: Novice, Beginner, Intermediate, Advanced, Expert
  - Based on average mastery across all skills
  - Visual badge/icon

- **Confidence Percentage:**
  - Indicates how confident the system is in the assessment
  - Based on number of attempts and consistency

- **Skills Assessed:**
  - Count of assessed skills vs. total available
  - Percentage of skill coverage

- **Strong Areas Highlight:**
  - Top 3-5 strongest skills
  - Mastery scores for each
  - Encouragement messages

- **Focus Areas (Improvement Needed):**
  - Skills with mastery < 0.6
  - Prioritized by gap size
  - Suggested resources for improvement

- **Retake Assessment Link:**
  - Option to retake assessment to update scores
  - Explanation of when to retake

**User Actions:**
- View skill radar chart
- Identify strong areas
- See areas needing improvement
- Retake assessment
- Track progress over time

---

### `/student/roadmap` - Interactive Learning Roadmap
**File:** `src/app/student/roadmap/page.tsx`
**Access:** Authenticated students only

**Purpose:** Navigate through a personalized, interactive learning path.

**Features:**

- **3-Phase Learning Structure:**
  1. **Phase 1: Foundations**
     - HTML, CSS, JavaScript basics
     - Git and version control
     - Basic programming concepts
  2. **Phase 2: Dynamic Web Development**
     - React fundamentals
     - State management
     - API integration
     - Responsive design
  3. **Phase 3: Full-Stack Development**
     - Backend with Node.js
     - Databases (SQL, NoSQL)
     - Authentication and security
     - Deployment

- **Overall Progress:**
  - Total completion percentage
  - Items completed / total items
  - Progress bar visualization

- **Phase Breakdown:**
  - Individual phase progress
  - Expandable/collapsible phases
  - Phase status indicators

- **Roadmap Items:**
  - Item title and description
  - Type icons:
    - 📖 Reading
    - 💻 Exercise
    - 🚀 Project
    - ⭐ Milestone
    - 🎥 Video
    - ❓ Quiz
  - Estimated hours
  - Difficulty rating (1-5 stars)
  - Status badge:
    - 🔴 NOT_STARTED
    - 🟡 IN_PROGRESS
    - 🟢 COMPLETED
    - 🔵 BLOCKED

- **Status Management:**
  - Update status buttons
  - Visual feedback on status change
  - Automatic progress recalculation

**User Actions:**
- Expand/collapse phases
- View item details
- Update item status (start, complete, block)
- Track overall progress
- Navigate to linked resources

---

### `/student/curriculum` - Personalized Curriculum
**File:** `src/app/student/curriculum/page.tsx`
**Access:** Authenticated students only

**Purpose:** View personalized curriculum document created by instructors/admins using Google Docs.

**Features:**

- **Google Docs Integration:**
  - Fetches document from Google Docs API
  - Converts to HTML for display
  - Preserves formatting (headings, lists, tables, links)

- **Document Display:**
  - Responsive layout
  - Dark mode compatible
  - Print-friendly
  - Scroll-to-top button

- **Document Info:**
  - Document title
  - Last modified timestamp
  - Edit link (admins only)

- **No Document Assigned State:**
  - Placeholder message
  - Contact instructor instructions
  - Link to general roadmap

**User Actions:**
- Read curriculum document
- Print curriculum
- Navigate sections (if document has headings)
- Contact instructor if no document assigned

---

### `/student/github` - GitHub Integration
**File:** `src/app/student/github/page.tsx`
**Access:** Authenticated students only

**Purpose:** Connect GitHub account, configure webhooks, and track coding activity.

**Features:**

- **Tabbed Interface:**
  1. **Profile Tab:**
     - GitHub username input
     - GitHub email input
     - Personal repository URL
     - Save/update button
     - Connection status indicator

  2. **Webhook Tab:**
     - Webhook token display (masked)
     - Generate new token button
     - Webhook URL (for GitHub settings)
     - Setup instructions
     - Test webhook button

  3. **Repositories Tab:**
     - Connected repositories list
     - Repository selector/search
     - Add repository button
     - Remove repository button
     - Repository status (active/inactive)

  4. **Activity Tab:**
     - Activity graph (commits over time)
     - Recent commits list with:
       - Commit message
       - Repository name
       - Branch name
       - Timestamp
       - Additions/deletions count
     - Filter by repository
     - Filter by date range

- **GitHub Statistics:**
  - Total commits (last 30 days)
  - Active repositories
  - Most active repository
  - Contribution streak

**User Actions:**
- Configure GitHub profile
- Generate webhook token
- Add/remove repositories
- View activity graph
- Browse commit history
- Test webhook connection

**Integration Benefits:**
- Automatic activity tracking
- Portfolio building
- Progress validation
- Engagement monitoring

---

## Instructor Routes

Routes accessible to users with the `INSTRUCTOR` role. All instructor routes require authentication and role verification.

### `/instructor` - Instructor Dashboard
**File:** `src/app/instructor/page.tsx`
**Access:** Authenticated instructors only
**Role Check:** `user.role === 'INSTRUCTOR'`

**Purpose:** Monitor student progress, manage courses, and access teaching tools.

**Features:**

- **Cohort Health Statistics:**
  - Total students count
  - Active students (logged in last 7 days)
  - Inactive students (no activity > 7 days)
  - At-risk students (behind schedule, low scores)
  - Visual health indicators (green/yellow/red)

- **Real-time Student Activity Table:**
  - Last 10 student activities
  - Activity type (login, lesson complete, commit, etc.)
  - Student name
  - Timestamp
  - Live updates (polling or WebSocket)

- **At-Risk Student Alerts:**
  - List of students needing attention
  - Risk factors:
    - Low assessment scores
    - Behind on roadmap
    - Inactive for > 3 days
    - Failing challenges
  - Contact buttons
  - Intervention recommendations

- **Student List with Progress:**
  - Searchable student table
  - Columns:
    - Student name and email
    - Current course
    - Overall progress %
    - Last active timestamp
    - Assessment scores
    - Quick actions (message, view profile)

- **Recent Activity Feed:**
  - Student submissions
  - Completed lessons
  - GitHub commits
  - Assessment completions
  - Filter by activity type

- **Review/Grading Queue:**
  - Pending student submissions
  - Code reviews needed
  - Project evaluations
  - Assignment grading
  - Priority sorting

- **Project Overview:**
  - Active student projects
  - Project status
  - Submission deadlines
  - Review status

- **GitHub Overview:**
  - Student commit activity
  - Repository health
  - Code quality metrics

- **Challenge Analytics:**
  - Most failed challenges
  - Average attempts per challenge
  - Time spent per challenge
  - Success rates

- **Module Distribution:**
  - Students per module/phase
  - Completion rates
  - Time-to-completion averages

- **Student Q&A Support Center:**
  - Open questions
  - Pending answers
  - Response time metrics
  - Knowledge base contributions

- **Schedule & Upcoming Sessions:**
  - Office hours calendar
  - Scheduled workshops
  - One-on-one meetings
  - Availability management

- **Announcements:**
  - Create announcement
  - Broadcast to all students
  - Scheduled announcements
  - Announcement history

- **AI Insights for Instructors:**
  - Struggling topics (most common challenges)
  - At-risk student identification
  - Content improvement suggestions
  - Personalized intervention recommendations

**User Actions:**
- Monitor cohort health
- Review student activity
- Identify at-risk students
- Grade submissions
- Answer student questions
- Create announcements
- Schedule office hours
- View analytics
- Access AI insights

---

### `/instructor/courses/new` - Create Course
**File:** `src/app/instructor/courses/new/page.tsx`
**Access:** Authenticated instructors only

**Purpose:** Create a new course.

**Features:**
- Course creation form
- Title, description, thumbnail upload
- Lesson planning
- Publishing controls

**User Actions:**
- Enter course details
- Upload course thumbnail
- Create initial lessons
- Save as draft or publish

---

### `/instructor/courses/[courseId]/edit` - Edit Course
**File:** `src/app/instructor/courses/[courseId]/edit/page.tsx`
**Access:** Authenticated instructors only (course owner)

**Purpose:** Edit existing course and manage lessons.

**Features:**
- Course details editor
- Lesson management (add, edit, delete, reorder)
- Content editing
- Publish/unpublish controls

**User Actions:**
- Update course information
- Add/remove lessons
- Reorder lessons
- Edit lesson content
- Update course status

---

## Admin Routes

Routes accessible to users with the `ADMIN` role. All admin routes require authentication and admin role verification.

### `/admin` - Admin Dashboard
**File:** `src/app/admin/page.tsx`
**Access:** Authenticated admins only
**Role Check:** `user.role === 'ADMIN'` via `/api/auth/me`

**Purpose:** Platform-wide management and oversight dashboard.

**Features:**

- **Platform Overview Statistics:**
  - **Users:**
    - Total users
    - Students count
    - Instructors count
    - Admins count
  - **Courses:**
    - Total courses
    - Published courses
    - Draft courses
  - **Enrollments:**
    - Active enrollments
    - Completion rate
    - Average progress
  - **Assessments:**
    - Total attempts
    - Average score
    - Completion rate

- **Management Cards (Quick Links):**
  1. **Student Management**
     - Total students
     - Link to `/admin/students`
  2. **Instructor Management**
     - Total instructors
     - Link to `/admin/instructors`
  3. **Course Management**
     - Total courses
     - Link to `/admin/courses`
  4. **Lesson Management**
     - Total lessons
     - Link to `/admin/lessons`
  5. **Student Engagement**
     - Tracking dashboard
     - Link to `/admin/engagement`
  6. **Student Roadmaps**
     - Roadmap management
     - Link to `/admin/roadmaps`

- **Quick Actions:**
  - Add Student button
  - Add Instructor button
  - Create Course button
  - Create Roadmap button

**User Actions:**
- View platform statistics
- Navigate to management sections
- Quick add students/instructors
- Quick create courses/roadmaps
- Monitor system health

---

### `/admin/students` - Student Management
**File:** `src/app/admin/students/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Comprehensive student account and progress management.

**Features:**

- **Search Functionality:**
  - Search by name
  - Search by email
  - Real-time filtering

- **Student Table Columns:**
  1. **Username**: Student's display name
  2. **Email**: Contact email
  3. **Enrolled Course**: Current course name
  4. **Start Date**: Enrollment start date
  5. **Finish Date**: Expected completion date
  6. **Assessment Level**: Current proficiency (Beginner, Intermediate, etc.)
  7. **Assessment Results**: View detailed scores
  8. **Roadmap Document**: Google Docs document ID
  9. **Admin Notes**: Private notes about student
  10. **Actions**: Edit, delete, view profile

- **Assessment Results Viewer:**
  - Modal or expandable section
  - Skill breakdown by dimension
  - Mastery scores
  - Confidence levels
  - Assessment history

- **Roadmap Document Assignment:**
  - Input field for Google Docs URL or ID
  - Automatic ID extraction from URL
  - Google Docs preview integration
  - Save button
  - Validation and error handling

- **Admin Notes:**
  - Text area for notes
  - Auto-save or manual save
  - Timestamp of last update
  - Markdown support

- **Edit Enrollment Dates Modal:**
  - Start date picker
  - Finish date picker
  - Save changes
  - Validation (finish > start)

**User Actions:**
- Search for students
- View student list
- View assessment results
- Assign roadmap documents (Google Docs)
- Edit enrollment dates
- Add/edit admin notes
- Edit student profiles
- Delete students (with confirmation)

**Integration:**
- Google Docs API for roadmap document preview
- Real-time updates on save

---

### `/admin/students/[studentId]/roadmap` - Student Roadmap View
**File:** `src/app/admin/students/[studentId]/roadmap/page.tsx`
**Access:** Authenticated admins only

**Purpose:** View individual student's roadmap progress.

**Features:**
- Student's roadmap visualization
- Progress tracking
- Item completion status
- Edit roadmap items (admin override)

**User Actions:**
- View student roadmap
- Monitor progress
- Override item status
- Add custom roadmap items

---

### `/admin/[username]/roadmap` - Alternative Roadmap View
**File:** `src/app/admin/[username]/roadmap/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Access student roadmap by username instead of ID.

**Features:**
- Same as `/admin/students/[studentId]/roadmap`
- Username-based routing for easier access

---

### `/admin/[username]/assessments` - Assessment Results Summary
**File:** `src/app/admin/[username]/assessments/page.tsx`
**Access:** Authenticated admins only

**Purpose:** View all assessment results for a specific student.

**Features:**
- List of all assessments taken
- Assessment dates
- Overall scores
- Completion status
- Link to detailed results

**User Actions:**
- Browse student's assessment history
- View summary scores
- Navigate to detailed results

---

### `/admin/[username]/assessments/[assessmentNumber]` - Detailed Assessment
**File:** `src/app/admin/[username]/assessments/[assessmentNumber]/page.tsx`
**Access:** Authenticated admins only

**Purpose:** View detailed results of a specific assessment.

**Features:**
- Step-by-step breakdown
- Individual question/challenge results
- Time spent per step
- Skill scores per step
- Overall assessment metrics

**User Actions:**
- Review detailed assessment
- Analyze student performance
- Identify strengths/weaknesses

---

### `/admin/courses` - Course Management
**File:** `src/app/admin/courses/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Manage all courses in the platform.

**Features:**

- **Search Functionality:**
  - Search by title
  - Search by description
  - Real-time filtering

- **Status Filter:**
  - All courses
  - Published courses only
  - Draft courses only
  - Toggle filter buttons

- **Course Table Columns:**
  1. **Course**: Thumbnail, title, description
  2. **Instructor**: Name and email
  3. **Lessons**: Count of lessons
  4. **Students**: Enrollment count
  5. **Created**: Creation date
  6. **Status**: Published/Draft toggle
  7. **Actions**: Edit, Manage Lessons, Delete

- **Create Course Modal:**
  - Select instructor (dropdown)
  - Course title input
  - Course description textarea
  - Thumbnail URL input
  - Create button

- **Edit Course Modal:**
  - Update title
  - Update description
  - Change instructor
  - Update thumbnail
  - Save changes

- **Publish/Draft Toggle:**
  - Toggle course visibility
  - Immediate update
  - Visual feedback

- **Manage Lessons Button:**
  - Navigate to lesson management
  - Filter lessons by course

- **Delete Course:**
  - Confirmation dialog
  - Warning about enrolled students
  - Cascade delete (lessons, enrollments)

**User Actions:**
- Search courses
- Filter by status
- Create new course
- Edit course details
- Publish/unpublish courses
- Manage course lessons
- Delete courses
- View course statistics

---

### `/admin/instructors` - Instructor Management
**File:** `src/app/admin/instructors/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Manage instructor accounts and course assignments.

**Features:**

- **Search Functionality:**
  - Search by name
  - Search by email

- **Instructor Table Columns:**
  1. **Instructor**: Name and avatar
  2. **Email**: Contact email
  3. **Courses Created**: Count
  4. **Total Students**: Across all courses
  5. **Actions**: Assign Course, View Activity

- **Assign Course Modal:**
  - Select instructor
  - Select course (dropdown)
  - Assign button
  - Validation (course not already assigned)

- **View Activity:**
  - Navigate to instructor activity page
  - Course creation history
  - Student interactions

**User Actions:**
- Search instructors
- View instructor list
- Assign courses to instructors
- View instructor activity
- Add new instructors
- Edit instructor profiles

---

### `/admin/lessons` - Lesson Management
**File:** `src/app/admin/lessons/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Create and manage lessons across all courses.

**Features:**
- Lesson creation form
- Rich text editor for content
- Video URL integration
- Lesson ordering
- Course assignment

**User Actions:**
- Create new lessons
- Edit existing lessons
- Assign lessons to courses
- Reorder lessons
- Delete lessons

---

### `/admin/engagement` - Student Engagement Tracking
**File:** `src/app/admin/engagement/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Monitor and analyze student engagement across the platform.

**Features:**

- **Enrollment Statistics:**
  - Total enrollments
  - Active enrollments
  - Completion rate
  - Average completion time

- **Assessment Analytics:**
  - Total attempts
  - Average score
  - Completion rate
  - Retry rate

- **Mastery Event Tracking:**
  - Skill mastery updates over time
  - Most improved skills
  - Struggling skill areas

- **Student Progress Over Time:**
  - Time-series chart
  - Weekly/monthly cohorts
  - Completion trends
  - Drop-off points

- **API Reference:**
  - Query endpoints
  - Data export options
  - Integration documentation

**User Actions:**
- View engagement metrics
- Filter by date range
- Export data
- Query specific metrics
- Generate reports

---

### `/admin/analytics` - Platform Analytics
**File:** `src/app/admin/analytics/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Comprehensive platform analytics and reporting.

**Features:**
- User growth charts
- Course popularity
- Revenue metrics (if applicable)
- Resource utilization
- Performance metrics

**User Actions:**
- View analytics dashboards
- Generate custom reports
- Export data
- Set up alerts

---

### `/admin/roadmaps` - Roadmap Management
**File:** `src/app/admin/roadmaps/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Create and manage learning roadmaps.

**Features:**
- Roadmap template creation
- Phase definition
- Item creation (exercises, projects, milestones)
- Difficulty assignment
- Estimated hours

**User Actions:**
- Create new roadmaps
- Edit existing roadmaps
- Define roadmap phases
- Add/remove roadmap items
- Set difficulty and duration

---

### `/admin/roadmap-assignments` - Assign Roadmaps
**File:** `src/app/admin/roadmap-assignments/page.tsx`
**Access:** Authenticated admins only

**Purpose:** Assign roadmaps to individual students or cohorts.

**Features:**
- Student selector
- Roadmap selector
- Bulk assignment
- Assignment history

**User Actions:**
- Assign roadmap to student
- Bulk assign to cohort
- View assignment history
- Unassign roadmaps

---

## Testing Routes

Routes for development and testing purposes.

### `/test-endpoints` - API Endpoint Testing
**File:** `src/app/test-endpoints/page.tsx`
**Access:** Development only (should be restricted in production)

**Purpose:** Test API endpoints directly from the browser.

**Features:**
- API endpoint selector
- Request parameter inputs
- Send request button
- Response viewer (JSON)
- Status code display

**User Actions:**
- Select API endpoint
- Input parameters
- Send test requests
- View responses

---

## Route Hierarchy

Visual representation of the route structure:

```
PUBLIC ROUTES (No Authentication Required)
├── /                                    Landing page
├── /sign-in                            Clerk authentication
├── /sign-up                            Clerk registration
├── /(public)/login                     Legacy login (placeholder)
├── /assessment                         Skill assessment wizard
└── /roadmap                            General roadmap view

STUDENT ROUTES (/student) [Requires STUDENT role]
├── /student                            Dashboard
├── /student/courses                    Course catalog
│   └── /student/courses/[courseId]                Course details
│       └── /student/courses/[courseId]/lessons/[lessonId]  Lesson view
├── /student/skills                     Skill profile visualization
├── /student/roadmap                    Interactive learning roadmap
├── /student/curriculum                 Personalized curriculum (Google Docs)
└── /student/github                     GitHub integration

INSTRUCTOR ROUTES (/instructor) [Requires INSTRUCTOR role]
├── /instructor                         Dashboard
├── /instructor/courses/new             Create new course
└── /instructor/courses/[courseId]/edit Edit course and lessons

ADMIN ROUTES (/admin) [Requires ADMIN role]
├── /admin                              Platform dashboard
├── /admin/students                     Student management
│   └── /admin/students/[studentId]/roadmap  Student roadmap view
├── /admin/[username]/roadmap           Alt student roadmap (by username)
├── /admin/[username]/assessments       Assessment results summary
│   └── /admin/[username]/assessments/[assessmentNumber]  Detailed results
├── /admin/courses                      Course management
├── /admin/instructors                  Instructor management
├── /admin/lessons                      Lesson management
├── /admin/engagement                   Engagement tracking
├── /admin/analytics                    Platform analytics
├── /admin/roadmaps                     Roadmap management
└── /admin/roadmap-assignments          Roadmap assignment

TESTING ROUTES
└── /test-endpoints                     API endpoint tester
```

---

## Access Control Summary

| Route Prefix   | Required Role | Authentication | Additional Checks         |
|----------------|---------------|----------------|---------------------------|
| `/`            | None          | Optional       | -                         |
| `/sign-in`     | None          | No             | -                         |
| `/sign-up`     | None          | No             | -                         |
| `/assessment`  | None          | Optional       | -                         |
| `/roadmap`     | None          | Optional       | Document must be assigned |
| `/student/*`   | STUDENT       | Required       | Session tracking          |
| `/instructor/*`| INSTRUCTOR    | Required       | Course ownership (edit)   |
| `/admin/*`     | ADMIN         | Required       | Full platform access      |

---

## Navigation Patterns

### Header Navigation (Global)
- Logo (links to role-appropriate dashboard)
- Role-based menu items
- User profile dropdown
- Notifications icon
- Search (context-aware)
- Sign out

### Student Navigation Menu
- Dashboard
- Courses
- Skills
- Roadmap
- Curriculum
- GitHub
- Assessment

### Instructor Navigation Menu
- Dashboard
- My Courses
- Students
- Create Course
- Analytics

### Admin Navigation Menu
- Dashboard
- Students
- Instructors
- Courses
- Lessons
- Roadmaps
- Analytics
- Engagement
- Settings

---

## Feature Availability Matrix

| Feature                        | Student | Instructor | Admin |
|--------------------------------|---------|------------|-------|
| View Dashboard                 | ✅      | ✅         | ✅    |
| Take Assessment                | ✅      | ❌         | ❌    |
| View Skill Profile             | ✅      | ❌         | ✅*   |
| Browse Courses                 | ✅      | ✅         | ✅    |
| Enroll in Courses              | ✅      | ❌         | ❌    |
| Create Courses                 | ❌      | ✅         | ✅    |
| Edit Courses                   | ❌      | ✅†        | ✅    |
| View Roadmap                   | ✅      | ❌         | ✅*   |
| Update Roadmap Status          | ✅      | ❌         | ✅*   |
| Connect GitHub                 | ✅      | ❌         | ❌    |
| View Student Progress          | ❌      | ✅         | ✅    |
| Assign Roadmap Documents       | ❌      | ❌         | ✅    |
| Manage Users                   | ❌      | ❌         | ✅    |
| View Analytics                 | ❌      | ✅‡        | ✅    |
| Create Announcements           | ❌      | ✅         | ✅    |

*For specific students
†Only for own courses
‡Limited to own students

---

## Notes

- All routes use **Clerk** for authentication
- Role-based access is verified via the `/api/auth/me` endpoint
- **Session tracking** is enabled for student routes to monitor engagement
- **OnboardingCheck** wrapper ensures students complete initial setup
- Google Docs integration requires service account configuration
- GitHub integration uses webhooks for real-time activity tracking
- Routes support **dark mode** throughout
- Mobile-responsive design on all routes

---

## API Endpoints Used by UI

For backend API documentation, see [API_ENDPOINTS.md](API_ENDPOINTS.md).

Key API endpoints called by UI routes:

### Authentication
- `GET /api/auth/me` - Get current user info and role

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/[id]` - Get course details
- `POST /api/courses` - Create course (instructor/admin)
- `PUT /api/courses/[id]` - Update course (instructor/admin)
- `DELETE /api/courses/[id]` - Delete course (admin)

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/user/[userId]` - Get user enrollments

### Assessment
- `POST /api/assessment/intake/start` - Start assessment
- `POST /api/assessment/intake/submit` - Submit step answer
- `GET /api/assessment/intake/summary` - Get results
- `POST /api/assessment/projects/recommend` - Get project recommendations

### Students (Admin)
- `GET /api/admin/students` - List students
- `PUT /api/admin/students/[id]/roadmap-document` - Assign roadmap doc
- `GET /api/admin/students/[id]/assessment-results` - Get results

### Roadmap
- `GET /api/roadmap/document` - Get assigned roadmap (Google Docs)
- `GET /api/roadmap/items` - Get roadmap items
- `PUT /api/roadmap/items/[id]` - Update item status

### GitHub
- `PUT /api/github/profile` - Update GitHub profile
- `POST /api/github/webhook-token` - Generate webhook token
- `GET /api/github/activity` - Get GitHub activity

---

## Support and Documentation

- **Full API Documentation**: [API_ENDPOINTS.md](API_ENDPOINTS.md)
- **Architecture Overview**: [ARCHITECTURE.md](../ARCHITECTURE.md)
- **Project Recommendations**: [PROJECT_RECOMMENDATIONS.md](PROJECT_RECOMMENDATIONS.md)
- **Development Guide**: [DEVELOPMENT.md](DEVELOPMENT.md)

For questions or issues, contact the development team or file a GitHub issue.

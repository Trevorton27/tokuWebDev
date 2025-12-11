# Admin Dashboard Layout Guide

## Overview

The Admin Dashboard provides a comprehensive interface for managing all aspects of the Signal Works LMS platform. Below is the visual layout and feature breakdown.

---

## Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HEADER SECTION                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Admin Dashboard                              [Back to Home] │  │
│  │  Manage your learning platform                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        PLATFORM OVERVIEW                                 │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│  │ 👥 USERS   │  │ 📚 COURSES │  │ 🎓 ACTIVE  │  │ 📊 AVG     │       │
│  │            │  │            │  │ENROLLMENTS │  │ PROGRESS   │       │
│  │   1,247    │  │     48     │  │   2,134    │  │    67%     │       │
│  │ 985 students│  │ 42 publish │  │ 567 done   │  │ 8,456 tries│       │
│  │ 12 teachers│  │ 6 drafts   │  │            │  │            │       │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                           MANAGEMENT                                     │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ 👨‍🎓 STUDENT MGMT │  │ 👨‍🏫 INSTRUCTOR   │  │ 📚 COURSE MGMT   │     │
│  │                  │  │    MANAGEMENT    │  │                  │     │
│  │ View, create,    │  │ Manage instructor│  │ Manage courses,  │     │
│  │ edit & manage    │  │ accounts & course│  │ publish/unpublish│     │
│  │ student accounts │  │ assignments      │  │ view enrollments │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
│                                                                          │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐     │
│  │ 📝 LESSON MGMT   │  │ 📊 ENGAGEMENT    │  │ 🗺️ ROADMAPS     │     │
│  │                  │  │    TRACKING      │  │                  │     │
│  │ Create, edit &   │  │ Track progress,  │  │ Create & manage  │     │
│  │ organize lessons │  │ completion rates │  │ personalized     │     │
│  │ across courses   │  │ & performance    │  │ learning paths   │     │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘     │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         QUICK ACTIONS                                    │
│                                                                          │
│  [+ Add Student]  [+ Add Instructor]  [+ Create Course]  [+ Roadmap]   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Component Breakdown

### 1. Header Section
- **Dashboard Title**: "Admin Dashboard"
- **Subtitle**: Brief description of purpose
- **Navigation**: Back to Home button

### 2. Platform Overview Cards (4 Cards)

#### Card 1: Total Users 👥
- **Border**: Blue left border
- **Main Metric**: Total user count (1,247)
- **Breakdown**: Students and instructors count
- **Color Scheme**: Blue (#3b82f6)

#### Card 2: Total Courses 📚
- **Border**: Green left border
- **Main Metric**: Total course count (48)
- **Breakdown**: Published vs draft courses
- **Color Scheme**: Green (#10b981)

#### Card 3: Active Enrollments 🎓
- **Border**: Purple left border
- **Main Metric**: Active enrollment count (2,134)
- **Breakdown**: Completed count
- **Color Scheme**: Purple (#8b5cf6)

#### Card 4: Average Progress 📊
- **Border**: Orange left border
- **Main Metric**: Average completion percentage (67%)
- **Breakdown**: Total assessment attempts
- **Color Scheme**: Orange (#f59e0b)

### 3. Management Cards (6 Cards in 3x2 Grid)

#### Student Management 👨‍🎓
- **Border**: Blue top border
- **Route**: `/admin/students`
- **Features**:
  - View all students with pagination
  - Search by name/email
  - Create new student accounts
  - Edit student details
  - Delete students
  - View enrollment history

#### Instructor Management 👨‍🏫
- **Border**: Indigo top border
- **Route**: `/admin/instructors`
- **Features**:
  - View all instructors
  - Manage instructor accounts
  - View courses created by instructor
  - Assign/unassign courses

#### Course Management 📚
- **Border**: Green top border
- **Route**: `/admin/courses`
- **Features**:
  - View all courses
  - Filter by published status
  - Publish/unpublish courses
  - Edit course details
  - Delete courses
  - View enrollment statistics

#### Lesson Management 📝
- **Border**: Yellow top border
- **Route**: `/admin/lessons`
- **Features**:
  - View all lessons
  - Create new lessons
  - Edit lesson content
  - Reorder lessons
  - Delete lessons
  - Filter by course

#### Student Engagement 📊
- **Border**: Purple top border
- **Route**: `/admin/engagement`
- **Features**:
  - Track enrollment progress
  - View completion rates
  - Monitor assessment performance
  - Analyze mastery events
  - Filter by date range, user, or course

#### Student Roadmaps 🗺️
- **Border**: Pink top border
- **Route**: `/admin/roadmaps`
- **Features**:
  - Create learning paths
  - Assign courses/skills/projects
  - Set milestones
  - Track roadmap progress
  - Manage roadmap items

### 4. Quick Actions Bar
- **Add Student**: Quick create student modal
- **Add Instructor**: Quick create instructor modal
- **Create Course**: Navigate to course creation
- **Create Roadmap**: Quick roadmap creation

---

## Color Palette

| Element | Color | Hex Code |
|---------|-------|----------|
| Primary (Blue) | ![#3b82f6](https://via.placeholder.com/15/3b82f6/000000?text=+) | #3b82f6 |
| Success (Green) | ![#10b981](https://via.placeholder.com/15/10b981/000000?text=+) | #10b981 |
| Warning (Orange) | ![#f59e0b](https://via.placeholder.com/15/f59e0b/000000?text=+) | #f59e0b |
| Info (Purple) | ![#8b5cf6](https://via.placeholder.com/15/8b5cf6/000000?text=+) | #8b5cf6 |
| Accent (Indigo) | ![#6366f1](https://via.placeholder.com/15/6366f1/000000?text=+) | #6366f1 |
| Pink | ![#ec4899](https://via.placeholder.com/15/ec4899/000000?text=+) | #ec4899 |
| Yellow | ![#f59e0b](https://via.placeholder.com/15/f59e0b/000000?text=+) | #f59e0b |
| Background | ![#f9fafb](https://via.placeholder.com/15/f9fafb/000000?text=+) | #f9fafb |
| Text Dark | ![#111827](https://via.placeholder.com/15/111827/000000?text=+) | #111827 |
| Text Light | ![#6b7280](https://via.placeholder.com/15/6b7280/000000?text=+) | #6b7280 |

---

## Responsive Design

### Desktop (>1024px)
- Statistics: 4 columns
- Management: 3 columns
- Full sidebar navigation

### Tablet (768px - 1024px)
- Statistics: 2 columns
- Management: 2 columns
- Collapsed sidebar

### Mobile (<768px)
- Statistics: 1 column (stacked)
- Management: 1 column (stacked)
- Hamburger menu

---

## Interactive Elements

### Hover States
- **Cards**: Slight elevation (shadow increase) + 2px upward translate
- **Buttons**: Darker shade + shadow
- **Table Rows**: Light gray background (#f9fafb)

### Loading States
- Skeleton loaders for cards
- Spinner for table data
- Progress bars for actions

### Error States
- Red border for form validation
- Toast notifications for API errors
- Inline error messages

---

## Student Management Page Detail

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Student Management                               [Back to Dashboard]   │
│  Manage student accounts and enrollments                                │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  [Search: _________________________]              [+ Add Student]        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│  STUDENT  │ EMAIL           │ ENROLLMENTS │ ATTEMPTS │ JOINED  │ ACTIONS│
│───────────┼─────────────────┼─────────────┼──────────┼─────────┼────────│
│ John Doe  │ john@ex.com     │     5       │    20    │ Jan 2025│View│Del│
│ Jane Smith│ jane@ex.com     │     3       │    15    │ Jan 2025│View│Del│
│ ...       │ ...             │    ...      │   ...    │  ...    │... │...│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## API Integration Points

Each management section integrates with corresponding API endpoints:

- **Student Management** → `/api/admin/users` (role=STUDENT)
- **Instructor Management** → `/api/admin/users` (role=INSTRUCTOR)
- **Course Management** → `/api/admin/courses`
- **Lesson Management** → `/api/admin/lessons`
- **Engagement Tracking** → `/api/admin/engagement`
- **Roadmap Management** → `/api/admin/roadmaps`

Refer to [ADMIN_API.md](./ADMIN_API.md) for complete API documentation.

---

## Viewing the Mockup

Open `/docs/admin-dashboard-mockup.html` in your browser to see an interactive HTML mockup of the dashboard layout with exact styling and colors.

```bash
# From project root
open docs/admin-dashboard-mockup.html
# or
google-chrome docs/admin-dashboard-mockup.html
# or
firefox docs/admin-dashboard-mockup.html
```

---

## Implementation Status

- ✅ Database Schema (StudentRoadmap model added)
- ✅ API Endpoints (All CRUD operations)
- ✅ Admin Dashboard UI (Main page)
- ✅ Student Management (Full CRUD with modal)
- ✅ Placeholder pages for other sections
- ✅ Authentication guards (requireRole(['ADMIN']))
- ✅ API Documentation
- ✅ Visual Mockup (HTML)

---

## Next Steps for Full Implementation

1. Complete remaining management pages (following student pattern)
2. Add real-time statistics using WebSocket/polling
3. Implement data visualization charts (Chart.js/Recharts)
4. Add export functionality (CSV/Excel)
5. Implement bulk actions
6. Add activity logs/audit trail
7. Integrate real authentication (NextAuth.js/Clerk)
8. Add role-based permissions (fine-grained)
9. Implement notifications system
10. Add search with debouncing

---

## Screenshots Location

- HTML Mockup: `docs/admin-dashboard-mockup.html`
- Layout Guide: `docs/ADMIN_DASHBOARD_LAYOUT.md` (this file)
- API Documentation: `docs/ADMIN_API.md`

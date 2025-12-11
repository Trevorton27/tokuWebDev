import LayoutShell from '@/modules/common/LayoutShell';
import CourseList from '@/modules/lms/ui/CourseList';

export default function CoursesPage() {
  return (
    <LayoutShell
      title="Courses"
      description="Browse our comprehensive collection of programming courses"
    >
      <CourseList />
    </LayoutShell>
  );
}

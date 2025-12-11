import LayoutShell from '@/modules/common/LayoutShell';
import CourseDetail from '@/modules/lms/ui/CourseDetail';

interface CoursePageProps {
  params: {
    courseId: string;
  };
}

export default function CoursePage({ params }: CoursePageProps) {
  return (
    <LayoutShell>
      <CourseDetail courseId={params.courseId} />
    </LayoutShell>
  );
}

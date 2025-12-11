import LayoutShell from '@/modules/common/LayoutShell';
import CourseEditor from '@/modules/lms/ui/CourseEditor';

interface CourseEditPageProps {
  params: {
    courseId: string;
  };
}

export default function CourseEditPage({ params }: CourseEditPageProps) {
  return (
    <LayoutShell>
      <CourseEditor courseId={params.courseId} />
    </LayoutShell>
  );
}

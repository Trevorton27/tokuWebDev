import LayoutShell from '@/modules/common/LayoutShell';
import LessonView from '@/modules/lms/ui/LessonView';

interface LessonPageProps {
  params: {
    courseId: string;
    lessonId: string;
  };
}

export default function LessonPage({ params }: LessonPageProps) {
  return (
    <LayoutShell>
      <LessonView courseId={params.courseId} lessonId={params.lessonId} />
    </LayoutShell>
  );
}

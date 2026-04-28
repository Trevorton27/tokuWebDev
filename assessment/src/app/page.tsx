import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import IntakeAssessmentWizard from '@/modules/assessment/ui/intake/IntakeAssessmentWizard';

export default async function Home() {
  const user = await currentUser();
  if (user?.publicMetadata?.role === 'ADMIN') {
    redirect('/admin');
  }
  return <IntakeAssessmentWizard />;
}

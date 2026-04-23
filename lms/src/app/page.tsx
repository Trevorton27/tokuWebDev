import { redirect } from 'next/navigation';
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function Home() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');
  redirect('/student');
}

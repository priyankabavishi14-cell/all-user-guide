import { redirect } from 'next/navigation';
import { activeProject } from '@/lib/mock-data';

export default function RootPage() {
  redirect(`/admin/${activeProject.slug}`);
}

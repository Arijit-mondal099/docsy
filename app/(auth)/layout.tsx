import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';
import type { ReactNode } from 'react';

export default async function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect('/dashboard');
  }
  return (
    <div className="flex min-h-screen items-center justify-center">
      {children}
    </div>
  );
}
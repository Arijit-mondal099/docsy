import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { getUsage } from '@/lib/db/usage';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = await getUsage(session.user.id);
  return NextResponse.json(stats);
}

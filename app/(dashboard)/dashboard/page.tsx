import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { auth } from '@/lib/auth/config';
import { headers } from 'next/headers';

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome{session?.user.name ? `, ${session.user.name}` : ''}!
        </h1>
        <p className="text-muted-foreground">
          Upload your first PDF and start asking questions.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Upload a PDF</CardTitle>
            <CardDescription>
              Drag and drop or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/documents">
              <Button className="w-full">Upload Document</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your recently uploaded PDFs</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No documents yet. Upload your first PDF to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Your usage this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Documents</span>
                <span className="font-medium">0 / 3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages</span>
                <span className="font-medium">0 / 50</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
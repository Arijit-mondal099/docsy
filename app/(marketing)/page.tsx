import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="container flex flex-col items-center">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-24 text-center md:py-32">
        <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
          AI-powered document conversations
        </div>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Chat with your{' '}
          <span className="text-primary">PDFs</span> using AI
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Upload a PDF and start asking questions. Get instant answers from
          your documents powered by GPT-4o and Gemini.
        </p>
        <div className="flex gap-4">
          <Link href="/register">
            <Button size="lg" className="text-base">
              Get Started Free
            </Button>
          </Link>
          <Link href="/features">
            <Button variant="outline" size="lg" className="text-base">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            Everything you need to understand your documents
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Upload PDFs</h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop any PDF. We&apos;ll parse, chunk, and index it
                  automatically.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Ask Questions</h3>
                <p className="text-sm text-muted-foreground">
                  Have a conversation with your document. Get accurate answers
                  with citations.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="rounded-full bg-primary/10 p-3">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">
                  Your documents are encrypted. We never share your data with
                  third parties.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-20">
        <div className="mx-auto max-w-3xl rounded-lg border bg-muted/50 p-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Upload your first PDF for free. No credit card required.
          </p>
          <Link href="/register">
            <Button size="lg" className="mt-8 text-base">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
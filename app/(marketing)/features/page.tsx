import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'PDF Upload',
    description:
      'Drag and drop any PDF up to 10MB. We support a wide range of document types.',
    icon: '📄',
  },
  {
    title: 'AI-Powered Q&A',
    description:
      'Ask questions about your document and get accurate answers powered by GPT-4o.',
    icon: '🤖',
  },
  {
    title: 'Smart Citations',
    description:
      'Answers include references to the exact pages and sections in your document.',
    icon: '📑',
  },
  {
    title: 'Multi-Document Support',
    description:
      'Upload multiple PDFs and switch between them seamlessly.',
    icon: '📚',
  },
  {
    title: 'Conversation History',
    description:
      'All your chats are saved. Pick up where you left off anytime.',
    icon: '💬',
  },
  {
    title: 'Enterprise Security',
    description:
      'End-to-end encryption. Your data never leaves our secure infrastructure.',
    icon: '🔒',
  },
];

export default function FeaturesPage() {
  return (
    <div className="container py-24">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight">Features</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Everything you need to extract knowledge from your PDFs with AI.
        </p>
      </div>
      <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <span className="text-3xl">{feature.icon}</span>
              <CardTitle className="mt-4">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
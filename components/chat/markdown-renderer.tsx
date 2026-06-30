'use client';

import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';

const components: Components = {
  pre({ children, ...props }) {
    return (
      <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm" {...props}>
        {children}
      </pre>
    );
  },
  code({ className, children, ...props }) {
    const isInline = !className;
    if (isInline) {
      return (
        <code
          className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  ul({ children, ...props }) {
    return (
      <ul className="my-2 list-disc pl-6 space-y-1" {...props}>
        {children}
      </ul>
    );
  },
  ol({ children, ...props }) {
    return (
      <ol className="my-2 list-decimal pl-6 space-y-1" {...props}>
        {children}
      </ol>
    );
  },
  table({ children, ...props }) {
    return (
      <div className="my-2 overflow-x-auto">
        <table className="min-w-full border-collapse text-sm" {...props}>
          {children}
        </table>
      </div>
    );
  },
  th({ children, ...props }) {
    return (
      <th className="border border-border bg-muted px-3 py-2 text-left font-medium" {...props}>
        {children}
      </th>
    );
  },
  td({ children, ...props }) {
    return (
      <td className="border border-border px-3 py-2" {...props}>
        {children}
      </td>
    );
  },
  blockquote({ children, ...props }) {
    return (
      <blockquote
        className="my-2 border-l-4 border-accent pl-4 italic text-muted-foreground"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  a({ children, href, ...props }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-accent underline underline-offset-2 hover:text-accent/80"
        {...props}
      >
        {children}
      </a>
    );
  },
  p({ children, ...props }) {
    return (
      <p className="my-2 leading-relaxed" {...props}>
        {children}
      </p>
    );
  },
  h1({ children, ...props }) {
    return (
      <h1 className="my-3 text-lg font-bold" {...props}>
        {children}
      </h1>
    );
  },
  h2({ children, ...props }) {
    return (
      <h2 className="my-2.5 text-base font-bold" {...props}>
        {children}
      </h2>
    );
  },
  h3({ children, ...props }) {
    return (
      <h3 className="my-2 text-sm font-semibold" {...props}>
        {children}
      </h3>
    );
  },
  hr(props) {
    return <hr className="my-4 border-border" {...props} />;
  },
};

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <ReactMarkdown
      components={components}
      rehypePlugins={[rehypeHighlight]}
      remarkPlugins={[remarkGfm]}
    >
      {content}
    </ReactMarkdown>
  );
}

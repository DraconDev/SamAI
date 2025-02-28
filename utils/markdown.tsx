import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              language={match[1]}
              PreTag="div"
              className="my-3 rounded-md"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={`${className} px-1 py-0.5 bg-[#2E2F3E] rounded text-sm`} {...props}>
              {children}
            </code>
          );
        },
        a: ({ node, ...props }) => (
          <a
            className="text-[#818cf8] hover:text-[#4f46e5] underline"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
        ul: ({ node, ...props }) => (
          <ul className="pl-6 my-2 list-disc" {...props} />
        ),
        ol: ({ node, ...props }) => (
          <ol className="pl-6 my-2 list-decimal" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="my-1" {...props} />
        ),
        h1: ({ node, ...props }) => (
          <h1 className="my-3 text-xl font-bold" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="my-3 text-lg font-bold" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="my-2 text-base font-bold" {...props} />
        ),
        p: ({ node, ...props }) => (
          <p className="my-2" {...props} />
        ),
        blockquote: ({ node, ...props }) => (
          <blockquote className="border-l-4 border-[#2E2F3E] pl-4 my-2 italic" {...props} />
        ),
        table: ({ node, ...props }) => (
          <div className="my-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-[#2E2F3E]" {...props} />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-[#2E2F3E]" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th className="px-3 py-2 text-sm font-semibold text-left" {...props} />
        ),
        tbody: ({ node, ...props }) => (
          <tbody className="divide-y divide-[#2E2F3E]" {...props} />
        ),
        tr: ({ node, ...props }) => (
          <tr className="hover:bg-[#1E1F2E]" {...props} />
        ),
        td: ({ node, ...props }) => (
          <td className="px-3 py-2 text-sm" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

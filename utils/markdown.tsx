import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
}) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        code({ className, children, ...props }: any) {
          const match = /language-(\w+)/.exec(className || "");
          const inline = !match;
          return !inline ? (
            <SyntaxHighlighter
              style={vscDarkPlus}
              customStyle={{
                background: '#1a1b2e',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid rgba(46, 47, 62, 0.5)',
              }}
              language={match[1]}
              PreTag="div"
              className="my-4 rounded-xl"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className={`${className} px-1.5 py-0.5 bg-[#1a1b2e] border border-[#2E2F3E]/50 rounded text-sm`}
              {...props}
            >
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
        li: ({ node, ...props }) => <li className="my-1" {...props} />,
        h1: ({ node, ...props }) => (
          <h1 className="my-3 text-xl font-bold" {...props} />
        ),
        h2: ({ node, ...props }) => (
          <h2 className="my-3 text-lg font-bold" {...props} />
        ),
        h3: ({ node, ...props }) => (
          <h3 className="my-2 text-base font-bold" {...props} />
        ),
        p: ({ node, ...props }) => <p className="my-2" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-[#2E2F3E] pl-4 my-2 italic"
            {...props}
          />
        ),
        table: ({ node, ...props }) => (
          <div className="my-4 overflow-x-auto">
            <table
              className="min-w-full divide-y divide-[#2E2F3E]"
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-[#2E2F3E]" {...props} />
        ),
        th: ({ node, ...props }) => (
          <th
            className="px-3 py-2 text-sm font-semibold text-left"
            {...props}
          />
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

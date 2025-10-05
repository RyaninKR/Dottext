import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from './ui/scroll-area';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export function MarkdownPreview({ content, className = '' }: MarkdownPreviewProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-stone-200/50 ${className}`}>
      <div className="p-4 bg-stone-50/50 border-b border-stone-200/50 rounded-t-lg">
        <h3 className="text-sm font-medium text-stone-700">미리보기</h3>
      </div>
      
      <ScrollArea className="h-[600px]">
        <div className="p-8 prose prose-stone max-w-none">
          {content.trim() ? (
            <ReactMarkdown
              className="text-stone-800 leading-8"
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl font-bold text-stone-900 mb-6 mt-8 first:mt-0 border-b border-stone-200 pb-2">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl font-semibold text-stone-900 mb-4 mt-6 first:mt-0">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-medium text-stone-900 mb-3 mt-5 first:mt-0">
                    {children}
                  </h3>
                ),
                h4: ({ children }) => (
                  <h4 className="text-lg font-medium text-stone-900 mb-2 mt-4 first:mt-0">
                    {children}
                  </h4>
                ),
                p: ({ children }) => (
                  <p className="mb-4 text-stone-700 leading-relaxed">
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-stone-900">
                    {children}
                  </strong>
                ),
                em: ({ children }) => (
                  <em className="italic text-stone-800">
                    {children}
                  </em>
                ),
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-400 pl-4 py-2 my-4 bg-amber-50/30 text-stone-700 italic">
                    {children}
                  </blockquote>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc list-inside mb-4 space-y-1 text-stone-700">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal list-inside mb-4 space-y-1 text-stone-700">
                    {children}
                  </ol>
                ),
                li: ({ children }) => (
                  <li className="text-stone-700">
                    {children}
                  </li>
                ),
                code: ({ children, className }) => {
                  const isInline = !className;
                  
                  if (isInline) {
                    return (
                      <code className="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded text-sm font-mono">
                        {children}
                      </code>
                    );
                  }
                  
                  return (
                    <div className="my-4">
                      <pre className="bg-stone-100 p-4 rounded-lg overflow-x-auto">
                        <code className="text-stone-800 text-sm font-mono">
                          {children}
                        </code>
                      </pre>
                    </div>
                  );
                },
                a: ({ children, href }) => (
                  <a 
                    href={href} 
                    className="text-amber-700 hover:text-amber-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {children}
                  </a>
                ),
                hr: () => (
                  <hr className="my-8 border-stone-200" />
                ),
                del: ({ children }) => (
                  <del className="text-stone-500 line-through">
                    {children}
                  </del>
                )
              }}
            >
              {content}
            </ReactMarkdown>
          ) : (
            <div className="text-stone-400 text-center py-12">
              <p>여기에 마크다운 미리보기가 표시됩니다</p>
              <p className="text-sm mt-2">왼쪽 에디터에서 마크다운 문법을 사용해보세요</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
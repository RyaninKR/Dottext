import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Hash, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from './ui/utils';

interface HeadingItem {
  id: string;
  text: string;
  level: number;
  element?: HTMLElement;
}

interface TableOfContentsProps {
  content: string;
  className?: string;
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [activeHeading, setActiveHeading] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 헤딩 추출 함수
  const extractHeadings = useCallback((text: string): HeadingItem[] => {
    const lines = text.split('\n');
    const headingRegex = /^(#{1,6})\s+(.+)$/;
    const headings: HeadingItem[] = [];

    lines.forEach((line, index) => {
      const match = line.match(headingRegex);
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        
        headings.push({
          id,
          text,
          level,
        });
      }
    });

    return headings;
  }, []);

  // DOM에서 실제 헤딩 요소들을 찾아서 연결
  const linkHeadingsToDOM = useCallback(() => {
    const updatedHeadings = headings.map(heading => {
      // 실제 DOM에서 헤딩 찾기 (텍스트 내용으로)
      const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const element = Array.from(elements).find(el => 
        el.textContent?.trim() === heading.text
      ) as HTMLElement;

      if (element && !element.id) {
        element.id = heading.id;
      }

      return {
        ...heading,
        element: element || undefined
      };
    });

    setHeadings(updatedHeadings);
  }, [headings]);

  // 스크롤 위치에 따른 활성 헤딩 감지
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 100; // 오프셋 추가
    
    let currentActiveHeading = '';
    
    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i];
      if (heading.element) {
        const elementTop = heading.element.offsetTop;
        if (scrollPosition >= elementTop) {
          currentActiveHeading = heading.id;
          break;
        }
      }
    }
    
    setActiveHeading(currentActiveHeading);
  }, [headings]);

  // 헤딩 클릭 시 해당 위치로 스크롤
  const scrollToHeading = (headingId: string) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // content 변경 시 헤딩 추출
  useEffect(() => {
    const newHeadings = extractHeadings(content);
    setHeadings(newHeadings);
  }, [content, extractHeadings]);

  // DOM 링크 및 스크롤 이벤트 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      linkHeadingsToDOM();
    }, 100); // DOM 업데이트를 기다림

    return () => clearTimeout(timer);
  }, [linkHeadingsToDOM]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 초기 설정
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  if (headings.length === 0) {
    return (
      <Card className={cn("p-4 bg-white/60 backdrop-blur-sm border-stone-200/50", className)}>
        <div className="text-center text-stone-500 text-sm">
          <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>문서에 헤딩이 없습니다</p>
          <p className="text-xs mt-1">
            # ## ### 를 사용해<br />헤딩을 추가하세요
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("bg-white/60 backdrop-blur-sm border-stone-200/50", className)}>
      <div className="p-4 border-b border-stone-200/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full justify-between h-auto p-2"
        >
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4" />
            <span className="font-medium">목차</span>
            <Badge variant="secondary" className="text-xs">
              {headings.length}
            </Badge>
          </div>
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {!isCollapsed && (
        <ScrollArea className="max-h-96">
          <div className="p-2">
            {headings.map((heading, index) => (
              <Button
                key={heading.id}
                variant="ghost"
                size="sm"
                onClick={() => scrollToHeading(heading.id)}
                className={cn(
                  "w-full justify-start h-auto p-2 mb-1 text-left transition-all",
                  "hover:bg-stone-100/80",
                  activeHeading === heading.id && "bg-amber-50 text-amber-800 border-l-2 border-amber-400",
                  heading.level === 1 && "font-semibold",
                  heading.level === 2 && "font-medium ml-2",
                  heading.level === 3 && "ml-4",
                  heading.level >= 4 && "ml-6 text-sm opacity-80"
                )}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className={cn(
                    "flex-shrink-0 mt-1",
                    heading.level === 1 && "w-2 h-2 bg-amber-500 rounded-full",
                    heading.level === 2 && "w-1.5 h-1.5 bg-amber-400 rounded-full",
                    heading.level >= 3 && "w-1 h-1 bg-stone-400 rounded-full"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm leading-5">
                      {heading.text}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      H{heading.level}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}
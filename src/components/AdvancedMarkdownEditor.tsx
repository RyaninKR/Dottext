import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';
import { 
  Calculator,
  Workflow,
  Brain,
  BarChart3,
  GitBranch,
  Clock,
  Plus,
  Eye,
  Code,
  FileText,
  Zap,
  Palette,
  Target,
  TrendingUp
} from 'lucide-react';

interface AdvancedMarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  className?: string;
}

interface PluginComponent {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  category: 'math' | 'diagram' | 'chart' | 'interactive';
  template: string;
  preview?: string;
}

export function AdvancedMarkdownEditor({ content, onChange, className }: AdvancedMarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedPlugin, setSelectedPlugin] = useState<PluginComponent | null>(null);
  const [pluginDialogOpen, setPluginDialogOpen] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const plugins: PluginComponent[] = [
    {
      id: 'latex',
      name: 'LaTeX 수식',
      icon: Calculator,
      description: '수학 공식과 수식을 렌더링합니다',
      category: 'math',
      template: '$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$',
      preview: '∫_{-∞}^{∞} e^{-x²} dx = √π'
    },
    {
      id: 'mermaid',
      name: 'Mermaid 다이어그램',
      icon: Workflow,
      description: '플로우차트, 시퀀스 다이어그램 등을 생성합니다',
      category: 'diagram',
      template: '```mermaid\ngraph TD\n    A[시작] --> B{조건}\n    B -->|예| C[실행]\n    B -->|아니오| D[종료]\n    C --> D\n```'
    },
    {
      id: 'mindmap',
      name: '마인드맵',
      icon: Brain,
      description: '아이디어를 시각적으로 구조화합니다',
      category: 'diagram',
      template: '```mindmap\n마인드맵\n  주제 1\n    세부사항 1\n    세부사항 2\n  주제 2\n    세부사항 3\n    세부사항 4\n```'
    },
    {
      id: 'chart',
      name: '차트',
      icon: BarChart3,
      description: '데이터 시각화를 위한 차트를 생성합니다',
      category: 'chart',
      template: '```chart\ntype: bar\ndata:\n  labels: [1월, 2월, 3월, 4월]\n  values: [10, 20, 15, 25]\ntitle: 월별 판매량\n```'
    },
    {
      id: 'timeline',
      name: '타임라인',
      icon: Clock,
      description: '시간순 이벤트를 시각화합니다',
      category: 'diagram',
      template: '```timeline\n2024-01-01: 프로젝트 시작\n2024-02-15: 첫 번째 마일스톤\n2024-03-30: 베타 릴리즈\n2024-04-15: 정식 출시\n```'
    },
    {
      id: 'gantt',
      name: '간트 차트',
      icon: TrendingUp,
      description: '프로젝트 일정을 관리합니다',
      category: 'chart',
      template: '```gantt\ntitle 프로젝트 일정\nsection 기획\n설계: 2024-01-01, 2024-01-15\n리뷰: 2024-01-16, 2024-01-20\nsection 개발\n개발: 2024-01-21, 2024-03-15\n테스트: 2024-03-16, 2024-03-30\n```'
    },
    {
      id: 'sequence',
      name: '시퀀스 다이어그램',
      icon: GitBranch,
      description: '시스템 간 상호작용을 보여줍니다',
      category: 'diagram',
      template: '```sequence\nparticipant 사용자\nparticipant 서버\nparticipant 데이터베이스\n\n사용자->>서버: 로그인 요청\n서버->>데이터베이스: 사용자 정보 조회\n데이터베이스-->>서버: 사용자 정보 반환\n서버-->>사용자: 로그인 성공\n```'
    },
    {
      id: 'interactive',
      name: '인터랙티브 요소',
      icon: Zap,
      description: '클릭 가능한 버튼, 입력 필드 등을 추가합니다',
      category: 'interactive',
      template: '```interactive\ntype: button\ntext: 클릭하세요\naction: alert("안녕하세요!")\n```'
    }
  ];

  // HTML을 순수 텍스트로 변환하는 함수
  const htmlToPlainText = useCallback((html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }, []);

  // 커서 위치 저장 및 복원
  const saveCaretPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current) return null;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(editorRef.current);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    
    return preCaretRange.toString().length;
  }, []);

  const restoreCaretPosition = useCallback((position: number) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    let currentPosition = 0;
    for (const textNode of textNodes) {
      const nodeLength = textNode.textContent?.length || 0;
      if (currentPosition + nodeLength >= position) {
        const range = document.createRange();
        range.setStart(textNode, position - currentPosition);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        break;
      }
      currentPosition += nodeLength;
    }
  }, []);

  // 고급 마크다운을 HTML로 변환하는 함수
  const parseAdvancedMarkdown = useCallback((text: string): string => {
    if (!text) return '';

    return text
      // 코드 블록 (먼저 처리)
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<div class="my-4"><pre class="bg-stone-100 p-4 rounded-lg overflow-x-auto border"><code class="text-stone-800 text-sm font-mono language-${lang || 'text'}">${code.trim()}</code></pre></div>`;
      })
      
      // LaTeX 수식 처리
      .replace(/\$\$([^$]+)\$\$/g, (match, latex) => {
        return `<div class="math-block p-4 my-4 bg-slate-50 rounded-lg border border-slate-200">
          <div class="text-center text-lg font-mono text-slate-800">
            ${latex.trim()}
          </div>
          <div class="text-xs text-slate-500 mt-2 text-center">LaTeX 수식</div>
        </div>`;
      })
      .replace(/\$([^$]+)\$/g, (match, latex) => {
        return `<span class="math-inline px-2 py-1 bg-slate-100 rounded font-mono text-slate-800">${latex.trim()}</span>`;
      })

      // Mermaid 다이어그램 처리
      .replace(/```mermaid\n([\s\S]*?)```/g, (match, code) => {
        return `<div class="mermaid-diagram p-4 my-4 bg-blue-50 rounded-lg border border-blue-200">
          <div class="text-center">
            <div class="inline-block p-4 bg-white rounded border border-blue-300">
              <pre class="text-sm text-blue-800 font-mono whitespace-pre-wrap">${code.trim()}</pre>
            </div>
          </div>
          <div class="text-xs text-blue-600 mt-2 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V7L12 2z"/>
            </svg>
            Mermaid 다이어그램
          </div>
        </div>`;
      })

      // 마인드맵 처리
      .replace(/```mindmap\n([\s\S]*?)```/g, (match, code) => {
        return `<div class="mindmap-diagram p-4 my-4 bg-green-50 rounded-lg border border-green-200">
          <div class="text-center">
            <div class="inline-block p-4 bg-white rounded border border-green-300">
              <pre class="text-sm text-green-800 font-mono whitespace-pre-wrap">${code.trim()}</pre>
            </div>
          </div>
          <div class="text-xs text-green-600 mt-2 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            마인드맵
          </div>
        </div>`;
      })

      // 차트 처리
      .replace(/```chart\n([\s\S]*?)```/g, (match, code) => {
        return `<div class="chart-diagram p-4 my-4 bg-purple-50 rounded-lg border border-purple-200">
          <div class="text-center">
            <div class="inline-block p-4 bg-white rounded border border-purple-300">
              <pre class="text-sm text-purple-800 font-mono whitespace-pre-wrap">${code.trim()}</pre>
            </div>
          </div>
          <div class="text-xs text-purple-600 mt-2 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            차트
          </div>
        </div>`;
      })

      // 타임라인 처리
      .replace(/```timeline\n([\s\S]*?)```/g, (match, code) => {
        const events = code.trim().split('\n').map(line => {
          const [date, event] = line.split(': ');
          return `<div class="flex items-center gap-3 mb-2">
            <div class="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <div class="text-sm">
              <span class="font-medium text-indigo-600">${date}</span>
              <span class="text-gray-700 ml-2">${event}</span>
            </div>
          </div>`;
        }).join('');
        
        return `<div class="timeline-diagram p-4 my-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div class="border-l-2 border-indigo-300 pl-4">
            ${events}
          </div>
          <div class="text-xs text-indigo-600 mt-2 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            타임라인
          </div>
        </div>`;
      })

      // 간트 차트 처리
      .replace(/```gantt\n([\s\S]*?)```/g, (match, code) => {
        return `<div class="gantt-diagram p-4 my-4 bg-orange-50 rounded-lg border border-orange-200">
          <div class="text-center">
            <div class="inline-block p-4 bg-white rounded border border-orange-300">
              <pre class="text-sm text-orange-800 font-mono whitespace-pre-wrap">${code.trim()}</pre>
            </div>
          </div>
          <div class="text-xs text-orange-600 mt-2 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
            </svg>
            간트 차트
          </div>
        </div>`;
      })

      // 시퀀스 다이어그램 처리
      .replace(/```sequence\n([\s\S]*?)```/g, (match, code) => {
        return `<div class="sequence-diagram p-4 my-4 bg-teal-50 rounded-lg border border-teal-200">
          <div class="text-center">
            <div class="inline-block p-4 bg-white rounded border border-teal-300">
              <pre class="text-sm text-teal-800 font-mono whitespace-pre-wrap">${code.trim()}</pre>
            </div>
          </div>
          <div class="text-xs text-teal-600 mt-2 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            시퀀스 다이어그램
          </div>
        </div>`;
      })

      // 인터랙티브 요소 처리
      .replace(/```interactive\n([\s\S]*?)```/g, (match, code) => {
        return `<div class="interactive-element p-4 my-4 bg-pink-50 rounded-lg border border-pink-200">
          <div class="text-center">
            <div class="inline-block p-4 bg-white rounded border border-pink-300">
              <pre class="text-sm text-pink-800 font-mono whitespace-pre-wrap">${code.trim()}</pre>
            </div>
          </div>
          <div class="text-xs text-pink-600 mt-2 text-center flex items-center justify-center gap-1">
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
            인터랙티브 요소
          </div>
        </div>`;
      })

      // 표 처리
      .replace(/\|(.+)\|\n\|[-\s\|]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
        const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
        const rowsArray = rows.trim().split('\n').map(row => 
          row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );
        
        let tableHtml = '<div class="my-4 overflow-x-auto"><table class="min-w-full border border-stone-200 rounded-lg">';
        tableHtml += '<thead class="bg-stone-50"><tr>';
        headerCells.forEach(cell => {
          tableHtml += `<th class="px-4 py-2 border-b border-stone-200 text-left font-medium text-stone-900">${cell}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        
        rowsArray.forEach((row, index) => {
          tableHtml += `<tr class="${index % 2 === 0 ? 'bg-white' : 'bg-stone-25'}">`;
          row.forEach(cell => {
            tableHtml += `<td class="px-4 py-2 border-b border-stone-100 text-stone-700">${cell}</td>`;
          });
          tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table></div>';
        return tableHtml;
      })
      
      // 체크리스트
      .replace(/^- \[ \] (.*)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" class="rounded border-stone-300" disabled> <span class="text-stone-700">$1</span></div>')
      .replace(/^- \[x\] (.*)$/gm, '<div class="flex items-center gap-2 my-1"><input type="checkbox" class="rounded border-stone-300" checked disabled> <span class="text-stone-700 line-through">$1</span></div>')
      
      // 헤딩 (줄의 시작에서만)
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-stone-900 mb-3 mt-5">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-stone-900 mb-4 mt-6">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-stone-900 mb-6 mt-8 border-b border-stone-200 pb-2">$1</h1>')
      
      // 굵은 글씨
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-stone-900">$1</strong>')
      
      // 기울임
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-stone-800">$1</em>')
      
      // 취소선
      .replace(/~~(.*?)~~/g, '<del class="text-stone-500 line-through">$1</del>')
      
      // 하이라이트
      .replace(/==(.*?)==/g, '<mark class="bg-yellow-200 px-1">$1</mark>')
      
      // 인라인 코드
      .replace(/`([^`]+)`/g, '<code class="bg-stone-100 text-stone-800 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')
      
      // 링크
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-700 hover:text-amber-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // 이미지
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-sm border border-stone-200" /></div>')
      
      // 순서 없는 리스트 (줄의 시작에서만, 체크리스트가 아닌 것)
      .replace(/^- (?!\[[ x]\]) (.*)$/gm, '<li class="text-stone-700 list-disc list-inside">$1</li>')
      
      // 순서 있는 리스트 (줄의 시작에서만)
      .replace(/^\d+\. (.*)$/gm, '<li class="text-stone-700 list-decimal list-inside">$1</li>')
      
      // 인용문 (줄의 시작에서만)
      .replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-amber-400 pl-4 py-2 my-4 bg-amber-50/30 text-stone-700 italic">$1</blockquote>')
      
      // 수평선
      .replace(/^---$/gm, '<hr class="my-8 border-stone-200" />')
      
      // 각주
      .replace(/\[\^(\w+)\]/g, '<sup class="text-amber-600"><a href="#fn-$1">$1</a></sup>')
      
      // 줄바꿈을 <br>로 변환 (단락 구분을 위해)
      .replace(/\n\n/g, '</p><p class="mb-4">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p class="mb-4">')
      .replace(/$/, '</p>')
      
      // 빈 문단 정리
      .replace(/<p class="mb-4"><\/p>/g, '');
  }, []);

  // 스마트 변환 체크
  const checkSmartConversion = useCallback((text: string, cursorPos: number): boolean => {
    const beforeCursor = text.substring(0, cursorPos);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    // 스페이스로 끝나는 패턴들 체크
    const patterns = [
      /^(#{1,6}) $/,         // 헤딩
      /^- $/,                // 리스트
      /^\d+\. $/,            // 순서 리스트
      /^> $/,                // 인용문
      /^- \[ \] $/,          // 체크리스트
      /^- \[x\] $/,          // 완료된 체크리스트
      /^\*\* $/,             // 굵은 글씨
      /^\* $/,               // 기울임
      /^== $/,               // 하이라이트
      /^~~ $/,               // 취소선
      /^` $/,                // 인라인 코드
    ];

    return patterns.some(pattern => pattern.test(currentLine));
  }, []);

  // 입력 처리
  const handleInput = useCallback(() => {
    if (!editorRef.current || isComposing) return;

    const caretPosition = saveCaretPosition();
    const plainText = htmlToPlainText(editorRef.current.innerHTML);
    
    // 마크다운 파싱된 HTML 생성
    const parsedHtml = parseAdvancedMarkdown(plainText);
    
    // 변경사항이 있을 때만 업데이트
    if (editorRef.current.innerHTML !== parsedHtml) {
      editorRef.current.innerHTML = parsedHtml;
      
      // 커서 위치 복원
      if (caretPosition !== null) {
        setTimeout(() => restoreCaretPosition(caretPosition), 0);
      }
    }

    onChange(plainText);
  }, [isComposing, htmlToPlainText, parseAdvancedMarkdown, saveCaretPosition, restoreCaretPosition, onChange]);

  // 키보드 이벤트 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 기본 단축키
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          document.execCommand('insertText', false, '**굵은 텍스트**');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('insertText', false, '*기울임 텍스트*');
          break;
        case 'k':
          e.preventDefault();
          document.execCommand('insertText', false, '[링크 텍스트](url)');
          break;
        default:
          break;
      }
      return;
    }

    // 스페이스 키로 스마트 변환
    if (e.key === ' ') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && editorRef.current) {
        const caretPosition = saveCaretPosition();
        const plainText = htmlToPlainText(editorRef.current.innerHTML);
        
        if (checkSmartConversion(plainText, caretPosition || 0)) {
          // 스마트 변환이 감지되면 변환 진행
          setTimeout(handleInput, 0);
        }
      }
    }

    // Enter 키로 리스트 자동 계속
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const caretPosition = saveCaretPosition();
        const plainText = htmlToPlainText(editorRef.current?.innerHTML || '');
        const lines = plainText.substring(0, caretPosition).split('\n');
        const currentLine = lines[lines.length - 1];
        
        if (currentLine.match(/^- $/)) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n');
        } else if (currentLine.match(/^- /)) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n- ');
        } else if (currentLine.match(/^- \[ \] $/)) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n');
        } else if (currentLine.match(/^- \[ \] /)) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n- [ ] ');
        } else if (currentLine.match(/^\d+\. $/)) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n');
        } else if (currentLine.match(/^(\d+)\. /)) {
          e.preventDefault();
          const match = currentLine.match(/^(\d+)\. /);
          if (match) {
            const nextNumber = parseInt(match[1]) + 1;
            document.execCommand('insertText', false, `\n${nextNumber}. `);
          }
        } else if (currentLine.match(/^> $/)) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n');
        } else if (currentLine.match(/^> /)) {
          e.preventDefault();
          document.execCommand('insertText', false, '\n> ');
        }
      }
    }

    // Tab 키로 들여쓰기
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  }, [saveCaretPosition, htmlToPlainText, checkSmartConversion, handleInput]);

  // 드래그 앤 드롭 처리
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageUrl = event.target?.result as string;
          const imageMarkdown = `![${file.name}](${imageUrl})`;
          document.execCommand('insertText', false, imageMarkdown);
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  const handleInsertPlugin = (plugin: PluginComponent) => {
    const template = customCode || plugin.template;
    document.execCommand('insertText', false, `\n${template}\n`);
    setSelectedPlugin(null);
    setPluginDialogOpen(false);
    setCustomCode('');
  };

  // 초기 내용 설정
  useEffect(() => {
    if (editorRef.current && content !== htmlToPlainText(editorRef.current.innerHTML)) {
      const parsedHtml = parseAdvancedMarkdown(content);
      editorRef.current.innerHTML = parsedHtml;
    }
  }, [content, parseAdvancedMarkdown, htmlToPlainText]);

  const pluginsByCategory = {
    math: plugins.filter(p => p.category === 'math'),
    diagram: plugins.filter(p => p.category === 'diagram'),
    chart: plugins.filter(p => p.category === 'chart'),
    interactive: plugins.filter(p => p.category === 'interactive'),
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 플러그인 툴바 */}
      <Card className="p-4 bg-white/60 backdrop-blur-sm border-stone-200/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-stone-800">고급 에디터 플러그인</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {plugins.length}개 플러그인
          </Badge>
        </div>

        <Tabs defaultValue="diagram" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="math">수식</TabsTrigger>
            <TabsTrigger value="diagram">다이어그램</TabsTrigger>
            <TabsTrigger value="chart">차트</TabsTrigger>
            <TabsTrigger value="interactive">인터랙티브</TabsTrigger>
          </TabsList>

          {Object.entries(pluginsByCategory).map(([category, categoryPlugins]) => (
            <TabsContent key={category} value={category} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {categoryPlugins.map((plugin) => {
                  const Icon = plugin.icon;
                  return (
                    <Dialog key={plugin.id} open={pluginDialogOpen && selectedPlugin?.id === plugin.id} onOpenChange={setPluginDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-auto p-3 flex flex-col items-start gap-1"
                          onClick={() => setSelectedPlugin(plugin)}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Icon className="h-4 w-4 text-stone-600" />
                            <span className="text-sm font-medium">{plugin.name}</span>
                          </div>
                          <p className="text-xs text-stone-500 text-left">
                            {plugin.description}
                          </p>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Icon className="h-5 w-5" />
                            {plugin.name}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-sm text-stone-600">{plugin.description}</p>
                          
                          {plugin.preview && (
                            <div className="p-3 bg-stone-50 rounded-lg border">
                              <div className="text-xs text-stone-500 mb-2">미리보기:</div>
                              <div className="text-lg font-mono text-center">{plugin.preview}</div>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <div className="text-sm font-medium">템플릿:</div>
                            <Textarea
                              value={customCode || plugin.template}
                              onChange={(e) => setCustomCode(e.target.value)}
                              className="min-h-[120px] font-mono text-sm"
                              placeholder="커스텀 코드를 입력하거나 템플릿을 수정하세요..."
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setPluginDialogOpen(false);
                                setCustomCode('');
                              }}
                            >
                              취소
                            </Button>
                            <Button onClick={() => handleInsertPlugin(plugin)}>
                              <Plus className="h-4 w-4 mr-2" />
                              삽입
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  );
                })}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </Card>

      {/* 고급 에디터 */}
      <Card className="bg-white/80 backdrop-blur-sm border-stone-200/50">
        <div className="p-8 relative">
          {/* Paper texture overlay */}
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,_rgb(0,0,0)_1px,_transparent_0)] bg-[length:20px_20px] rounded-lg"></div>
          
          {/* Drag overlay */}
          {dragOver && (
            <div className="absolute inset-0 bg-amber-100/50 border-2 border-dashed border-amber-400 rounded-lg flex items-center justify-center z-10">
              <div className="text-amber-700 text-center">
                <div className="text-2xl mb-2">📁</div>
                <div>이미지를 여기에 드롭하세요</div>
              </div>
            </div>
          )}
          
          <div
            ref={editorRef}
            contentEditable
            className={cn(
              "min-h-[400px] w-full resize-none border-0 bg-transparent text-stone-800 focus:ring-0 focus:outline-none text-lg leading-8 font-serif overflow-y-auto",
              "prose prose-stone max-w-none",
              "[&>*]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
              "[&_table]:table-auto [&_th]:font-medium [&_td]:align-top",
              "[&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:accent-amber-600"
            )}
            style={{
              lineHeight: '2rem',
              fontFamily: '"Noto Serif KR", "Times New Roman", serif',
            }}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => {
              setIsComposing(false);
              setTimeout(handleInput, 0);
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            suppressContentEditableWarning
          />
          
          {/* Placeholder */}
          {!content && (
            <div className="absolute inset-8 pointer-events-none text-stone-400 text-lg leading-8 font-serif">
              <div>여기서 고급 마크다운 문서를 시작하세요...</div>
              <div className="mt-8 text-base space-y-2">
                <div>🔥 고급 기능:</div>
                <div>$$수식$$ - LaTeX 수식</div>
                <div>```mermaid - 다이어그램</div>
                <div>```chart - 차트</div>
                <div>```timeline - 타임라인</div>
                <div></div>
                <div>📝 기본 마크다운:</div>
                <div># 제목, **굵게**, *기울임*</div>
                <div>- 리스트, - [ ] 체크박스</div>
                <div>&gt; 인용문, `코드`</div>
                <div></div>
                <div>💡 스페이스를 누르면 즉시 변환!</div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
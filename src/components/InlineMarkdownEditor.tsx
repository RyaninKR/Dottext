import React, { useRef, useEffect, useState, useCallback } from 'react';
import { cn } from './ui/utils';
import { useEditorHistory } from './hooks/useEditorHistory';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface InlineMarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function InlineMarkdownEditor({ 
  content, 
  onChange, 
  placeholder = "여기서 당신의 이야기를 시작하세요...",
  className = "",
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false
}: InlineMarkdownEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { saveToHistory, undo, redo } = useEditorHistory(content);

  // 확장된 마크다운을 HTML로 변환하는 함수 (개선된 버전)
  const parseMarkdownToHtml = useCallback((text: string): string => {
    if (!text) return '';

    return text
      // 코드 블록 (먼저 처리, 더 나은 스타일링)
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<div class="my-6 group relative">
          <div class="bg-gradient-to-r from-stone-900 to-slate-800 text-white px-4 py-2 rounded-t-lg text-xs font-mono flex items-center justify-between">
            <span class="text-stone-300">${lang || 'code'}</span>
            <span class="text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">코드 블록</span>
          </div>
          <pre class="bg-stone-100 p-4 rounded-b-lg overflow-x-auto border border-t-0 border-stone-200">
            <code class="text-stone-800 text-sm font-mono language-${lang || 'text'}">${code.trim()}</code>
          </pre>
        </div>`;
      })
      
      // 표 (개선된 스타일링)
      .replace(/\|(.+)\|\n\|[-\s\|]+\|\n((?:\|.+\|\n?)*)/g, (match, header, rows) => {
        const headerCells = header.split('|').map(cell => cell.trim()).filter(cell => cell);
        const rowsArray = rows.trim().split('\n').map(row => 
          row.split('|').map(cell => cell.trim()).filter(cell => cell)
        );
        
        let tableHtml = '<div class="my-6 overflow-x-auto rounded-lg border border-stone-200 shadow-sm">';
        tableHtml += '<table class="min-w-full bg-white">';
        tableHtml += '<thead class="bg-gradient-to-r from-stone-50 to-stone-100"><tr>';
        headerCells.forEach(cell => {
          tableHtml += `<th class="px-6 py-3 border-b border-stone-200 text-left font-semibold text-stone-900">${cell}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
        
        rowsArray.forEach((row, index) => {
          tableHtml += `<tr class="${index % 2 === 0 ? 'bg-white hover:bg-stone-25' : 'bg-stone-25 hover:bg-stone-50'} transition-colors">`;
          row.forEach(cell => {
            tableHtml += `<td class="px-6 py-3 border-b border-stone-100 text-stone-700">${cell}</td>`;
          });
          tableHtml += '</tr>';
        });
        
        tableHtml += '</tbody></table></div>';
        return tableHtml;
      })
      
      // 체크리스트 (향상된 스타일링)
      .replace(/^- \[ \] (.*)$/gm, '<div class="flex items-center gap-3 my-2 p-2 hover:bg-stone-50 rounded transition-colors"><input type="checkbox" class="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500" disabled> <span class="text-stone-700 select-none">$1</span></div>')
      .replace(/^- \[x\] (.*)$/gm, '<div class="flex items-center gap-3 my-2 p-2 hover:bg-stone-50 rounded transition-colors"><input type="checkbox" class="w-4 h-4 rounded border-stone-300 text-amber-600 focus:ring-amber-500" checked disabled> <span class="text-stone-500 line-through select-none">$1</span></div>')
      
      // 헤딩 (향상된 스타일링과 앵커 추가)
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium text-stone-900 mb-4 mt-8 pb-2 border-b border-stone-100 group relative"><span class="group-hover:text-amber-700 transition-colors">$1</span></h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold text-stone-900 mb-4 mt-8 pb-3 border-b border-stone-200 group relative"><span class="group-hover:text-amber-700 transition-colors">$1</span></h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold text-stone-900 mb-6 mt-10 pb-4 border-b-2 border-stone-300 group relative"><span class="group-hover:text-amber-700 transition-colors">$1</span></h1>')
      
      // 굵은 글씨 (더 강한 스타일링)
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-stone-900 bg-stone-50 px-1 rounded">$1</strong>')
      
      // 기울임 (더 우아한 스타일링)
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em class="italic text-stone-800 border-b border-dotted border-stone-300">$1</em>')
      
      // 취소선
      .replace(/~~(.*?)~~/g, '<del class="text-stone-500 line-through opacity-75">$1</del>')
      
      // 하이라이트 (더 생동감 있는 색상)
      .replace(/==(.*?)==/g, '<mark class="bg-gradient-to-r from-yellow-200 to-amber-200 px-1.5 py-0.5 rounded font-medium">$1</mark>')
      
      // 인라인 코드 (더 구분되는 스타일링)
      .replace(/`([^`]+)`/g, '<code class="bg-stone-800 text-amber-100 px-2 py-1 rounded text-sm font-mono border border-stone-600 shadow-sm">$1</code>')
      
      // 링크 (더 상호작용적인 스타일링)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-amber-700 hover:text-amber-800 underline decoration-2 underline-offset-2 hover:decoration-amber-600 transition-all font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
      
      // 이미지 (더 우아한 프레임)
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<div class="my-6 text-center"><div class="inline-block p-1 bg-white rounded-lg shadow-lg border border-stone-200"><img src="$2" alt="$1" class="max-w-full h-auto rounded-md" /><div class="text-xs text-stone-500 mt-2 px-2 pb-1">$1</div></div></div>')
      
      // 순서 없는 리스트 (더 시각적인 스타일링)
      .replace(/^- (?![\[\]]) (.*)$/gm, '<li class="text-stone-700 list-none relative pl-6 my-1 before:content-[\'●\'] before:absolute before:left-0 before:text-amber-600 before:font-bold hover:before:scale-110 before:transition-transform">$1</li>')
      
      // 순서 있는 리스트 (더 세련된 번호 스타일링)
      .replace(/^(\d+)\. (.*)$/gm, '<li class="text-stone-700 list-none relative pl-8 my-1"><span class="absolute left-0 top-0 bg-amber-100 text-amber-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">$1</span>$2</li>')
      
      // 인용문 (더 눈에 띄는 스타일링)
      .replace(/^> (.*)$/gm, '<blockquote class="border-l-4 border-gradient-to-b from-amber-400 to-orange-400 pl-6 py-3 my-6 bg-gradient-to-r from-amber-50/50 to-orange-50/30 text-stone-700 italic rounded-r-lg shadow-sm relative before:content-[\'""\'] before:text-4xl before:text-amber-400 before:absolute before:-top-2 before:left-2 before:font-serif">$1</blockquote>')
      
      // 수평선 (더 장식적인 스타일링)
      .replace(/^---$/gm, '<hr class="my-12 border-0 h-px bg-gradient-to-r from-transparent via-stone-300 to-transparent" />')
      
      // 각주 (더 우아한 스타일링)
      .replace(/\[\^(\w+)\]/g, '<sup class="text-amber-600 hover:text-amber-800 transition-colors font-medium"><a href="#fn-$1" class="no-underline">[$1]</a></sup>')
      
      // 단락 처리 (더 나은 간격)
      .replace(/\n\n+/g, '</p><div class="h-4"></div><p class="leading-relaxed">')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p class="leading-relaxed">')
      .replace(/$/, '</p>')
      
      // 빈 문단 정리
      .replace(/<p class="leading-relaxed"><\/p>/g, '')
      .replace(/<div class="h-4"><\/div>(<div class="h-4"><\/div>)+/g, '<div class="h-6"></div>');
  }, []);

  // HTML을 순수 텍스트로 변환하는 함수
  const htmlToPlainText = useCallback((html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }, []);

  // 커서 위치 저장 및 복원 (개선된 버전)
  const saveCaretPosition = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !editorRef.current || selection.rangeCount === 0) return null;

    try {
      const range = selection.getRangeAt(0);
      const preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(editorRef.current);
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      
      return preCaretRange.toString().length;
    } catch (e) {
      console.warn('커서 위치 저장 실패:', e);
      return null;
    }
  }, []);

  const restoreCaretPosition = useCallback((position: number) => {
    if (!editorRef.current) return;

    const selection = window.getSelection();
    if (!selection) return;

    try {
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
          const offset = Math.min(position - currentPosition, nodeLength);
          range.setStart(textNode, offset);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
          break;
        }
        currentPosition += nodeLength;
      }
    } catch (e) {
      console.warn('커서 위치 복원 실패:', e);
    }
  }, []);

  // 스마트 변환 체크 (개선된 패턴 매칭)
  const checkSmartConversion = useCallback((text: string, cursorPos: number): string | null => {
    const beforeCursor = text.substring(0, cursorPos);
    const lines = beforeCursor.split('\n');
    const currentLine = lines[lines.length - 1];
    
    // 스페이스로 끝나는 패턴들 체크
    const patterns = [
      { pattern: /^(#{1,6}) $/, replacement: '$1 ' },
      { pattern: /^- $/, replacement: '- ' },
      { pattern: /^(\d+)\. $/, replacement: '$1. ' },
      { pattern: /^> $/, replacement: '> ' },
      { pattern: /^- \[ \] $/, replacement: '- [ ] ' },
      { pattern: /^- \[x\] $/, replacement: '- [x] ' },
      { pattern: /^\*\* $/, replacement: '**|**' }, // 커서 위치 표시
      { pattern: /^== $/, replacement: '==|==' },
      { pattern: /^~~ $/, replacement: '~~|~~' },
      { pattern: /^` $/, replacement: '`|`' },
    ];

    for (const { pattern, replacement } of patterns) {
      if (pattern.test(currentLine)) {
        return currentLine.replace(pattern, replacement);
      }
    }

    return null;
  }, []);

  // 입력 처리 (성능 최적화)
  const handleInput = useCallback(() => {
    if (!editorRef.current || isComposing) return;

    setIsTyping(true);
    
    const caretPosition = saveCaretPosition();
    const plainText = htmlToPlainText(editorRef.current.innerHTML);
    
    // 히스토리에 저장 (디바운스 적용)
    const saveTimeout = setTimeout(() => {
      saveToHistory(plainText, caretPosition || 0);
    }, 500);
    
    // 마크다운 파싱된 HTML 생성
    const parsedHtml = parseMarkdownToHtml(plainText);
    
    // 변경사항이 있을 때만 업데이트
    if (editorRef.current.innerHTML !== parsedHtml) {
      editorRef.current.innerHTML = parsedHtml;
      
      // 커서 위치 복원
      if (caretPosition !== null) {
        setTimeout(() => {
          restoreCaretPosition(caretPosition);
          setIsTyping(false);
        }, 0);
      } else {
        setIsTyping(false);
      }
    } else {
      setIsTyping(false);
    }

    onChange(plainText);

    return () => clearTimeout(saveTimeout);
  }, [isComposing, htmlToPlainText, parseMarkdownToHtml, saveCaretPosition, restoreCaretPosition, onChange, saveToHistory]);

  // 키보드 단축키 및 스마트 변환 처리 (개선된 버전)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // 실행 취소/다시 실행
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      const state = undo();
      if (state && editorRef.current) {
        const parsedHtml = parseMarkdownToHtml(state.content);
        editorRef.current.innerHTML = parsedHtml;
        onChange(state.content);
        setTimeout(() => restoreCaretPosition(state.cursorPosition), 0);
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      const state = redo();
      if (state && editorRef.current) {
        const parsedHtml = parseMarkdownToHtml(state.content);
        editorRef.current.innerHTML = parsedHtml;
        onChange(state.content);
        setTimeout(() => restoreCaretPosition(state.cursorPosition), 0);
      }
      return;
    }

    // 기본 단축키 (향상된 피드백)
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
        const converted = checkSmartConversion(plainText, caretPosition || 0);
        
        if (converted) {
          e.preventDefault();
          // 변환 피드백을 위한 시각적 효과
          editorRef.current.style.transform = 'scale(1.002)';
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.style.transform = 'scale(1)';
            }
          }, 100);
          setTimeout(handleInput, 0);
          return;
        }
      }
    }

    // Enter 키로 리스트 자동 계속 (개선된 버전)
    if (e.key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const caretPosition = saveCaretPosition();
        const plainText = htmlToPlainText(editorRef.current?.innerHTML || '');
        const lines = plainText.substring(0, caretPosition).split('\n');
        const currentLine = lines[lines.length - 1];
        
        // 빈 리스트 항목에서 리스트 종료
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
  }, [undo, redo, parseMarkdownToHtml, onChange, restoreCaretPosition, saveCaretPosition, htmlToPlainText, checkSmartConversion, handleInput]);

  // 드래그 앤 드롭 처리 (개선된 버전)
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // 실제로 에디터 영역을 벗어났는지 확인
    const rect = editorRef.current?.getBoundingClientRect();
    if (rect && (
      e.clientX < rect.left || 
      e.clientX > rect.right || 
      e.clientY < rect.top || 
      e.clientY > rect.bottom
    )) {
      setDragOver(false);
    }
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
          // 이미지 삽입 피드백
          if (editorRef.current) {
            editorRef.current.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
            setTimeout(() => {
              if (editorRef.current) {
                editorRef.current.style.boxShadow = '';
              }
            }, 500);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  }, []);

  // 초기 내용 설정
  useEffect(() => {
    if (editorRef.current && content !== htmlToPlainText(editorRef.current.innerHTML)) {
      const parsedHtml = parseMarkdownToHtml(content);
      editorRef.current.innerHTML = parsedHtml;
    }
  }, [content, parseMarkdownToHtml, htmlToPlainText]);

  return (
    <div className="relative h-full">
      {/* Paper texture overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(circle_at_1px_1px,_rgb(0,0,0)_1px,_transparent_0)] bg-[length:24px_24px] rounded-lg"></div>
      
      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute top-4 right-4 bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse z-10">
          렌더링 중...
        </div>
      )}
      
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100/80 to-orange-100/60 border-2 border-dashed border-amber-400 rounded-lg flex items-center justify-center z-20 backdrop-blur-sm">
          <div className="text-amber-700 text-center">
            <div className="text-4xl mb-4 animate-bounce">📁</div>
            <div className="text-xl font-medium mb-2">이미지를 여기에 드롭하세요</div>
            <div className="text-sm opacity-75">PNG, JPG, GIF 파일을 지원합니다</div>
          </div>
        </div>
      )}
      
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "h-full w-full resize-none border-0 bg-transparent text-stone-800 focus:ring-0 focus:outline-none text-lg leading-8 font-serif overflow-y-auto p-0 transition-all duration-200",
          "prose prose-stone max-w-none",
          "[&>*]:my-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
          "[&_table]:table-auto [&_th]:font-medium [&_td]:align-top",
          "[&_input[type=checkbox]]:mr-2 [&_input[type=checkbox]]:accent-amber-600",
          "focus:shadow-sm",
          className
        )}
        style={{
          lineHeight: '2rem',
          fontFamily: '"Noto Serif KR", "Times New Roman", serif',
          minHeight: '100%'
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
        data-placeholder={placeholder}
      />
      
      {/* Enhanced Placeholder */}
      {!content && (
        <div className="absolute inset-0 pointer-events-none text-stone-400 text-lg leading-8 font-serif">
          <div className="space-y-6">
            <div className="text-xl text-stone-500">{placeholder}</div>
            
            <div className="text-base space-y-4 bg-gradient-to-r from-stone-50 to-amber-50 p-6 rounded-lg border border-stone-200">
              <div className="text-stone-600 font-medium flex items-center gap-2">
                <span className="text-amber-600">✨</span>
                마크다운 문법 가이드
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-stone-600">텍스트 서식</div>
                  <div className="space-y-1 text-stone-500">
                    <div>**굵은 글씨**, *기울임*</div>
                    <div>~~취소선~~, ==하이라이트==</div>
                    <div>`인라인 코드`</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-stone-600">구조 요소</div>
                  <div className="space-y-1 text-stone-500">
                    <div># 제목, ## 부제목</div>
                    <div>- 목록, 1. 번호 목록</div>
                    <div>- [ ] 체크박스</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-stone-600">고급 기능</div>
                  <div className="space-y-1 text-stone-500">
                    <div>```코드 블록```</div>
                    <div>| 표 | 만들기 |</div>
                    <div>&gt; 인용문</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="font-medium text-stone-600">미디어</div>
                  <div className="space-y-1 text-stone-500">
                    <div>![이미지](url)</div>
                    <div>[링크](url)</div>
                    <div>드래그 & 드롭 이미지</div>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-stone-200 pt-4 space-y-2">
                <div className="text-amber-700 font-medium flex items-center gap-2">
                  <span>⚡</span>
                  실시간 렌더링 팁
                </div>
                <div className="text-sm text-stone-600 space-y-1">
                  <div>• 스페이스를 누르면 즉시 마크다운이 변환됩니다</div>
                  <div>• Ctrl+B (굵게), Ctrl+I (기울임), Ctrl+Z (실행취소)</div>
                  <div>• Enter로 리스트를 자동으로 계속할 수 있습니다</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
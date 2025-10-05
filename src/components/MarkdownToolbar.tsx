import React, { useState } from 'react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Bold, 
  Italic, 
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Link,
  Table,
  CheckSquare,
  Image,
  Highlighter
} from 'lucide-react';

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [showLinkPopover, setShowLinkPopover] = useState(false);

  const formatButtons = [
    { icon: Bold, label: '굵게 (⌘B)', before: '**', after: '**', placeholder: '굵은 텍스트' },
    { icon: Italic, label: '기울임 (⌘I)', before: '*', after: '*', placeholder: '기울임 텍스트' },
    { icon: Strikethrough, label: '취소선', before: '~~', after: '~~', placeholder: '취소선' },
    { icon: Highlighter, label: '하이라이트', before: '==', after: '==', placeholder: '하이라이트' },
  ];

  const structureButtons = [
    { icon: Heading1, label: '제목 1', before: '# ', placeholder: '제목 1' },
    { icon: Heading2, label: '제목 2', before: '## ', placeholder: '제목 2' },
    { icon: List, label: '목록', before: '- ', placeholder: '목록 항목' },
    { icon: ListOrdered, label: '번호 목록', before: '1. ', placeholder: '번호 목록' },
    { icon: CheckSquare, label: '체크리스트', before: '- [ ] ', placeholder: '할 일' },
    { icon: Quote, label: '인용문', before: '> ', placeholder: '인용문' },
  ];

  const handleInsert = (before: string, after?: string, placeholder?: string) => {
    onInsert(before, after, placeholder);
  };

  const handleLinkInsert = () => {
    if (linkText && linkUrl) {
      onInsert(`[${linkText}](${linkUrl})`);
      setLinkText('');
      setLinkUrl('');
      setShowLinkPopover(false);
    }
  };

  const handleImageInsert = () => {
    onInsert('![이미지 설명](', ')', '이미지 URL');
  };

  const handleCodeInsert = () => {
    onInsert('`', '`', '코드');
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          {formatButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Tooltip key={button.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handleInsert(button.before, button.after, button.placeholder)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Structure */}
        <div className="flex items-center gap-1">
          {structureButtons.map((button) => {
            const Icon = button.icon;
            return (
              <Tooltip key={button.label}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => handleInsert(button.before, button.after, button.placeholder)}
                  >
                    <Icon className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{button.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" />

        {/* Special Elements */}
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={handleCodeInsert}
              >
                <Code className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>인라인 코드</p>
            </TooltipContent>
          </Tooltip>

          <Popover open={showLinkPopover} onOpenChange={setShowLinkPopover}>
            <PopoverTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>링크 (⌘K)</p>
                </TooltipContent>
              </Tooltip>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h4 className="font-medium">링크 추가</h4>
                <div className="space-y-2">
                  <div>
                    <Label htmlFor="linkText">텍스트</Label>
                    <Input
                      id="linkText"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      placeholder="링크 텍스트"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="linkUrl">URL</Label>
                    <Input
                      id="linkUrl"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="mt-1"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleLinkInsert} 
                  className="w-full" 
                  disabled={!linkText || !linkUrl}
                >
                  링크 추가
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={handleImageInsert}
              >
                <Image className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>이미지</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}
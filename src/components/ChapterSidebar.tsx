import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  FileText, 
  Plus, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  Check,
  X
} from 'lucide-react';
import { cn } from './ui/utils';

interface Chapter {
  id: string;
  title: string;
  content: string;
  wordCount: number;
  lastModified: Date;
}

interface ChapterSidebarProps {
  chapters: Chapter[];
  currentChapterId: string;
  onChapterSelect: (chapterId: string) => void;
  onAddChapter: () => void;
  onDeleteChapter: (chapterId: string) => void;
  onRenameChapter: (chapterId: string, newTitle: string) => void;
}

export function ChapterSidebar({
  chapters,
  currentChapterId,
  onChapterSelect,
  onAddChapter,
  onDeleteChapter,
  onRenameChapter
}: ChapterSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (chapter: Chapter) => {
    setEditingId(chapter.id);
    setEditTitle(chapter.title);
  };

  const handleSaveEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameChapter(editingId, editTitle.trim());
    }
    setEditingId(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-semibold text-sm">문서</h2>
        <Button
          onClick={onAddChapter}
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0"
          title="새 장 추가"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Chapter List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-1">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={cn(
                "group relative rounded-lg border border-transparent transition-all",
                "hover:bg-accent/50 hover:border-border",
                currentChapterId === chapter.id && "bg-primary/10 border-primary/20"
              )}
            >
              {editingId === chapter.id ? (
                // Edit Mode
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <Button
                      onClick={handleSaveEdit}
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="ghost"
                      size="sm"
                      className="w-6 h-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                // Normal Mode
                <div
                  onClick={() => onChapterSelect(chapter.id)}
                  className="p-3 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <h3 className="font-medium text-sm truncate">{chapter.title}</h3>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{chapter.wordCount.toLocaleString()} 단어</span>
                          <span>{formatDate(chapter.lastModified)}</span>
                        </div>
                        
                        {chapter.content && (
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {chapter.content.replace(/[#*>`-]/g, '').substring(0, 100)}...
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit(chapter);
                        }}
                        variant="ghost"
                        size="sm"
                        className="w-6 h-6 p-0"
                        title="이름 변경"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      
                      {chapters.length > 1 && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('이 장을 삭제하시겠습니까?')) {
                              onDeleteChapter(chapter.id);
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          className="w-6 h-6 p-0 text-destructive hover:text-destructive"
                          title="삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between items-center">
            <span>총 {chapters.length}개 문서</span>
            <span>{chapters.reduce((sum, c) => sum + c.wordCount, 0).toLocaleString()} 단어</span>
          </div>
        </div>
      </div>
    </div>
  );
}
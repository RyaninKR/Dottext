import React, { useState, useEffect } from 'react';
import { MarkdownToolbar } from './MarkdownToolbar';
import { InlineMarkdownEditor } from './InlineMarkdownEditor';
import { useEditorHistory } from './hooks/useEditorHistory';
import { Button } from './ui/button';
import { 
  Type, 
  Undo, 
  Redo,
  MoreHorizontal,
  Eye,
  EyeOff
} from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  currentChapter: string;
}

export function Editor({ content, onChange, currentChapter }: EditorProps) {
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [showStats, setShowStats] = useState(true);
  
  const { 
    saveToHistory, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    resetHistory 
  } = useEditorHistory(content);

  useEffect(() => {
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const chars = content.length;
    setWordCount(words);
    setCharCount(chars);
  }, [content]);

  useEffect(() => {
    resetHistory(content);
  }, [currentChapter, resetHistory]);

  const handleMarkdownInsert = (before: string, after?: string, placeholder?: string) => {
    const selection = window.getSelection();
    if (!selection) return;

    let newText;
    const selectedText = selection.toString();

    if (selectedText) {
      if (after) {
        newText = before + selectedText + after;
      } else {
        newText = before + selectedText;
      }
    } else {
      const textToInsert = placeholder || '';
      if (after) {
        newText = before + textToInsert + after;
      } else {
        newText = before + textToInsert;
      }
    }

    if (selectedText) {
      document.execCommand('insertText', false, newText);
    } else {
      document.execCommand('insertText', false, newText);
      if (placeholder && !selectedText) {
        setTimeout(() => {
          const newSelection = window.getSelection();
          if (newSelection && newSelection.rangeCount > 0) {
            const range = newSelection.getRangeAt(0);
            range.setStart(range.startContainer, range.startOffset - (placeholder.length + (after ? after.length : 0)));
            range.setEnd(range.endContainer, range.endOffset - (after ? after.length : 0));
            newSelection.removeAllRanges();
            newSelection.addRange(range);
          }
        }, 0);
      }
    }
  };

  const handleUndo = () => {
    const state = undo();
    if (state) {
      onChange(state.content);
    }
  };

  const handleRedo = () => {
    const state = redo();
    if (state) {
      onChange(state.content);
    }
  };

  const handleContentChange = (newContent: string) => {
    onChange(newContent);
    saveToHistory(newContent);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Claude-style Toolbar */}
      <div className="border-b border-border bg-card px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="w-8 h-8 p-0"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="w-8 h-8 p-0"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            {/* Markdown Formatting */}
            <MarkdownToolbar 
              onInsert={handleMarkdownInsert}
              canUndo={canUndo}
              canRedo={canRedo}
              onUndo={handleUndo}
              onRedo={handleRedo}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* Stats Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStats(!showStats)}
              className="w-8 h-8 p-0"
              title="Toggle Statistics"
            >
              {showStats ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>

            {/* Word Count */}
            {showStats && (
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  <span>{wordCount.toLocaleString()} words</span>
                </div>
                <span>{charCount.toLocaleString()} characters</span>
              </div>
            )}

            {/* More Options */}
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <InlineMarkdownEditor
          content={content}
          onChange={handleContentChange}
          placeholder={`Start writing your story in ${currentChapter}...

Create beautiful documents with real-time markdown rendering.

Use **bold text**, *italics*, [links](url), and many more features!`}
          className="claude-editor"
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={handleUndo}
          onRedo={handleRedo}
        />
      </div>

      {/* Status Bar */}
      <div className="border-t border-border bg-muted/30 px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>Last saved: Just now</span>
            <span>Markdown supported</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Line {content.split('\n').length}</span>
            <span>Live rendering</span>
          </div>
        </div>
      </div>
    </div>
  );
}
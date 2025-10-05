import { useState, useCallback, useRef } from 'react';

interface HistoryState {
  content: string;
  cursorPosition: number;
}

export function useEditorHistory(initialContent: string = '') {
  const [history, setHistory] = useState<HistoryState[]>([{ content: initialContent, cursorPosition: 0 }]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const lastSaveTime = useRef(Date.now());

  const saveToHistory = useCallback((content: string, cursorPosition: number = 0) => {
    const now = Date.now();
    // 500ms 이내의 연속 입력은 하나로 묶음
    if (now - lastSaveTime.current < 500) {
      return;
    }
    
    lastSaveTime.current = now;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push({ content, cursorPosition });
      
      // 히스토리 최대 50개로 제한
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setCurrentIndex(prev => Math.min(prev + 1, 49));
  }, [currentIndex]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
    return null;
  }, [currentIndex, history]);

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
    return null;
  }, [currentIndex, history]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const getCurrentState = useCallback(() => {
    return history[currentIndex];
  }, [history, currentIndex]);

  const resetHistory = useCallback((content: string) => {
    setHistory([{ content, cursorPosition: 0 }]);
    setCurrentIndex(0);
    lastSaveTime.current = Date.now();
  }, []);

  return {
    saveToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentState,
    resetHistory
  };
}
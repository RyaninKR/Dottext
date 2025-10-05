import { useState, useEffect, useCallback, useRef } from 'react';

export interface CollaboratorCursor {
  id: string;
  name: string;
  color: string;
  position: number;
  selection?: { start: number; end: number };
}

export interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface CollaborationState {
  collaborators: Collaborator[];
  cursors: CollaboratorCursor[];
  isConnected: boolean;
  currentUser: Collaborator;
}

// 모의 웹소켓 클래스
class MockWebSocket {
  private listeners: { [key: string]: Function[] } = {};
  private isConnected = false;
  private reconnectTimer?: NodeJS.Timeout;

  constructor(private url: string) {
    this.connect();
  }

  connect() {
    setTimeout(() => {
      this.isConnected = true;
      this.emit('open');
    }, 1000);
  }

  on(event: string, callback: Function) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data?: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  send(data: any) {
    if (!this.isConnected) return;
    
    // 모의 네트워크 지연
    setTimeout(() => {
      this.handleMessage(data);
    }, Math.random() * 100 + 50);
  }

  private handleMessage(data: any) {
    const message = JSON.parse(data);
    
    // 모의 서버 응답 시뮬레이션
    switch (message.type) {
      case 'cursor_update':
        this.emit('cursor_update', {
          ...message,
          timestamp: Date.now()
        });
        break;
      case 'content_change':
        this.emit('content_change', {
          ...message,
          timestamp: Date.now()
        });
        break;
      case 'user_join':
        this.emit('user_join', {
          user: this.generateMockUser(),
          timestamp: Date.now()
        });
        break;
    }
  }

  private generateMockUser(): Collaborator {
    const names = ['김민수', '이영희', '박철수', '정미나', '최은지'];
    const colors = ['#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      name: names[Math.floor(Math.random() * names.length)],
      avatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${Math.random()}`,
      color: colors[Math.floor(Math.random() * colors.length)],
      isOnline: true,
      lastSeen: new Date()
    };
  }

  disconnect() {
    this.isConnected = false;
    this.emit('close');
  }
}

export function useCollaboration(documentId: string) {
  const [state, setState] = useState<CollaborationState>({
    collaborators: [],
    cursors: [],
    isConnected: false,
    currentUser: {
      id: 'current-user',
      name: '나',
      avatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=current',
      color: '#06b6d4',
      isOnline: true,
      lastSeen: new Date()
    }
  });

  const wsRef = useRef<MockWebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout>();

  // 웹소켓 연결 초기화
  useEffect(() => {
    const ws = new MockWebSocket(`ws://localhost:3001/collaborate/${documentId}`);
    wsRef.current = ws;

    ws.on('open', () => {
      setState(prev => ({ ...prev, isConnected: true }));
      
      // 주기적으로 모의 사용자 추가
      heartbeatRef.current = setInterval(() => {
        if (Math.random() < 0.3) { // 30% 확률로 새 사용자 추가
          ws.emit('user_join');
        }
      }, 10000);
    });

    ws.on('close', () => {
      setState(prev => ({ ...prev, isConnected: false }));
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    });

    ws.on('user_join', (data: { user: Collaborator }) => {
      setState(prev => ({
        ...prev,
        collaborators: [...prev.collaborators.filter(c => c.id !== data.user.id), data.user]
      }));
    });

    ws.on('cursor_update', (data: { userId: string; position: number; selection?: any }) => {
      setState(prev => {
        const collaborator = prev.collaborators.find(c => c.id === data.userId);
        if (!collaborator) return prev;

        const newCursor: CollaboratorCursor = {
          id: data.userId,
          name: collaborator.name,
          color: collaborator.color,
          position: data.position,
          selection: data.selection
        };

        return {
          ...prev,
          cursors: [...prev.cursors.filter(c => c.id !== data.userId), newCursor]
        };
      });
    });

    return () => {
      ws.disconnect();
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [documentId]);

  // 커서 위치 업데이트
  const updateCursor = useCallback((position: number, selection?: { start: number; end: number }) => {
    if (!wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'cursor_update',
      userId: state.currentUser.id,
      position,
      selection
    }));
  }, [state.currentUser.id]);

  // 콘텐츠 변경 브로드캐스트
  const broadcastChange = useCallback((content: string, operation: any) => {
    if (!wsRef.current) return;

    wsRef.current.send(JSON.stringify({
      type: 'content_change',
      userId: state.currentUser.id,
      content,
      operation
    }));
  }, [state.currentUser.id]);

  // 사용자 상태 업데이트
  const updateUserStatus = useCallback((status: Partial<Collaborator>) => {
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, ...status }
    }));
  }, []);

  return {
    ...state,
    updateCursor,
    broadcastChange,
    updateUserStatus
  };
}
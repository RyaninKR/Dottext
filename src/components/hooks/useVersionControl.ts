import { useState, useCallback, useEffect } from 'react';

export interface DocumentVersion {
  id: string;
  timestamp: Date;
  message: string;
  author: string;
  authorAvatar: string;
  content: string;
  branch: string;
  parentId?: string;
  changes: {
    added: number;
    removed: number;
    modified: number;
  };
  tags: string[];
}

export interface Branch {
  id: string;
  name: string;
  isActive: boolean;
  lastCommit: string;
  createdAt: Date;
  createdBy: string;
}

export interface VersionDiff {
  type: 'added' | 'removed' | 'modified';
  oldLine?: number;
  newLine?: number;
  oldText?: string;
  newText?: string;
}

interface VersionControlState {
  versions: DocumentVersion[];
  branches: Branch[];
  currentBranch: string;
  currentVersion: string;
  uncommittedChanges: boolean;
}

export function useVersionControl(documentId: string, initialContent: string = '') {
  const [state, setState] = useState<VersionControlState>(() => {
    const saved = localStorage.getItem(`version-control-${documentId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        versions: parsed.versions.map((v: any) => ({
          ...v,
          timestamp: new Date(v.timestamp),
        })),
        branches: parsed.branches.map((b: any) => ({
          ...b,
          createdAt: new Date(b.createdAt),
        })),
      };
    }

    // 초기 커밋 생성
    const initialCommit: DocumentVersion = {
      id: 'initial-commit',
      timestamp: new Date(),
      message: '초기 문서 생성',
      author: '사용자',
      authorAvatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=user',
      content: initialContent,
      branch: 'main',
      changes: { added: initialContent.length, removed: 0, modified: 0 },
      tags: ['v1.0.0'],
    };

    const mainBranch: Branch = {
      id: 'main',
      name: 'main',
      isActive: true,
      lastCommit: 'initial-commit',
      createdAt: new Date(),
      createdBy: '사용자',
    };

    return {
      versions: [initialCommit],
      branches: [mainBranch],
      currentBranch: 'main',
      currentVersion: 'initial-commit',
      uncommittedChanges: false,
    };
  });

  const [currentContent, setCurrentContent] = useState(initialContent);

  // 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(`version-control-${documentId}`, JSON.stringify(state));
  }, [state, documentId]);

  // 변경사항 감지
  useEffect(() => {
    const currentVersion = state.versions.find(v => v.id === state.currentVersion);
    if (currentVersion) {
      setState(prev => ({
        ...prev,
        uncommittedChanges: currentContent !== currentVersion.content
      }));
    }
  }, [currentContent, state.currentVersion, state.versions]);

  // 새 커밋 생성
  const commit = useCallback((message: string, author: string = '사용자') => {
    const currentVersion = state.versions.find(v => v.id === state.currentVersion);
    if (!currentVersion) return;

    const diff = calculateDiff(currentVersion.content, currentContent);
    const newVersion: DocumentVersion = {
      id: generateId(),
      timestamp: new Date(),
      message,
      author,
      authorAvatar: `https://api.dicebear.com/7.x/avatars/svg?seed=${author}`,
      content: currentContent,
      branch: state.currentBranch,
      parentId: state.currentVersion,
      changes: {
        added: diff.filter(d => d.type === 'added').length,
        removed: diff.filter(d => d.type === 'removed').length,
        modified: diff.filter(d => d.type === 'modified').length,
      },
      tags: [],
    };

    setState(prev => ({
      ...prev,
      versions: [...prev.versions, newVersion],
      currentVersion: newVersion.id,
      uncommittedChanges: false,
      branches: prev.branches.map(b => 
        b.id === prev.currentBranch 
          ? { ...b, lastCommit: newVersion.id }
          : b
      ),
    }));

    return newVersion.id;
  }, [state, currentContent]);

  // 버전 체크아웃
  const checkout = useCallback((versionId: string) => {
    const version = state.versions.find(v => v.id === versionId);
    if (!version) return false;

    setCurrentContent(version.content);
    setState(prev => ({
      ...prev,
      currentVersion: versionId,
      uncommittedChanges: false,
    }));

    return true;
  }, [state.versions]);

  // 브랜치 생성
  const createBranch = useCallback((name: string, fromVersion?: string) => {
    const branchExists = state.branches.some(b => b.name === name);
    if (branchExists) return false;

    const baseVersion = fromVersion || state.currentVersion;
    const newBranch: Branch = {
      id: generateId(),
      name,
      isActive: false,
      lastCommit: baseVersion,
      createdAt: new Date(),
      createdBy: '사용자',
    };

    setState(prev => ({
      ...prev,
      branches: [...prev.branches, newBranch],
    }));

    return newBranch.id;
  }, [state]);

  // 브랜치 전환
  const switchBranch = useCallback((branchId: string) => {
    const branch = state.branches.find(b => b.id === branchId);
    if (!branch) return false;

    const lastCommit = state.versions.find(v => v.id === branch.lastCommit);
    if (!lastCommit) return false;

    setCurrentContent(lastCommit.content);
    setState(prev => ({
      ...prev,
      currentBranch: branchId,
      currentVersion: branch.lastCommit,
      uncommittedChanges: false,
      branches: prev.branches.map(b => ({ ...b, isActive: b.id === branchId })),
    }));

    return true;
  }, [state]);

  // 태그 추가
  const addTag = useCallback((versionId: string, tag: string) => {
    setState(prev => ({
      ...prev,
      versions: prev.versions.map(v => 
        v.id === versionId 
          ? { ...v, tags: [...v.tags, tag] }
          : v
      ),
    }));
  }, []);

  // 브랜치 병합
  const mergeBranch = useCallback((sourceBranchId: string, targetBranchId: string, message: string) => {
    const sourceBranch = state.branches.find(b => b.id === sourceBranchId);
    const targetBranch = state.branches.find(b => b.id === targetBranchId);
    
    if (!sourceBranch || !targetBranch) return false;

    const sourceVersion = state.versions.find(v => v.id === sourceBranch.lastCommit);
    const targetVersion = state.versions.find(v => v.id === targetBranch.lastCommit);
    
    if (!sourceVersion || !targetVersion) return false;

    // 간단한 병합 (실제로는 충돌 해결이 필요할 수 있음)
    const mergedContent = mergeContent(targetVersion.content, sourceVersion.content);
    
    const mergeCommit: DocumentVersion = {
      id: generateId(),
      timestamp: new Date(),
      message: `${message} (Merge ${sourceBranch.name} into ${targetBranch.name})`,
      author: '사용자',
      authorAvatar: 'https://api.dicebear.com/7.x/avatars/svg?seed=user',
      content: mergedContent,
      branch: targetBranchId,
      parentId: targetVersion.id,
      changes: {
        added: 0,
        removed: 0,
        modified: 1,
      },
      tags: [],
    };

    setState(prev => ({
      ...prev,
      versions: [...prev.versions, mergeCommit],
      branches: prev.branches.map(b => 
        b.id === targetBranchId 
          ? { ...b, lastCommit: mergeCommit.id }
          : b
      ),
    }));

    return mergeCommit.id;
  }, [state]);

  // 버전 비교
  const compareVersions = useCallback((version1Id: string, version2Id: string): VersionDiff[] => {
    const v1 = state.versions.find(v => v.id === version1Id);
    const v2 = state.versions.find(v => v.id === version2Id);
    
    if (!v1 || !v2) return [];
    
    return calculateDiff(v1.content, v2.content);
  }, [state.versions]);

  // 현재 브랜치 가져오기
  const getCurrentBranch = useCallback(() => {
    return state.branches.find(b => b.id === state.currentBranch);
  }, [state.branches, state.currentBranch]);

  // 현재 버전 가져오기
  const getCurrentVersion = useCallback(() => {
    return state.versions.find(v => v.id === state.currentVersion);
  }, [state.versions, state.currentVersion]);

  return {
    ...state,
    currentContent,
    setCurrentContent,
    commit,
    checkout,
    createBranch,
    switchBranch,
    addTag,
    mergeBranch,
    compareVersions,
    getCurrentBranch,
    getCurrentVersion,
  };
}

// 유틸리티 함수들
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

function calculateDiff(oldContent: string, newContent: string): VersionDiff[] {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');
  const diffs: VersionDiff[] = [];

  // 간단한 라인 기반 diff 알고리즘
  let oldIndex = 0;
  let newIndex = 0;

  while (oldIndex < oldLines.length || newIndex < newLines.length) {
    if (oldIndex >= oldLines.length) {
      // 새 라인 추가
      diffs.push({
        type: 'added',
        newLine: newIndex + 1,
        newText: newLines[newIndex],
      });
      newIndex++;
    } else if (newIndex >= newLines.length) {
      // 라인 삭제
      diffs.push({
        type: 'removed',
        oldLine: oldIndex + 1,
        oldText: oldLines[oldIndex],
      });
      oldIndex++;
    } else if (oldLines[oldIndex] === newLines[newIndex]) {
      // 라인 동일
      oldIndex++;
      newIndex++;
    } else {
      // 라인 수정
      diffs.push({
        type: 'modified',
        oldLine: oldIndex + 1,
        newLine: newIndex + 1,
        oldText: oldLines[oldIndex],
        newText: newLines[newIndex],
      });
      oldIndex++;
      newIndex++;
    }
  }

  return diffs;
}

function mergeContent(base: string, incoming: string): string {
  // 간단한 병합 로직 (실제로는 더 복잡한 3-way merge가 필요)
  const baseLines = base.split('\n');
  const incomingLines = incoming.split('\n');
  
  // 여기서는 단순히 incoming을 우선으로 함
  return incomingLines.length > baseLines.length ? incoming : base;
}
import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useVersionControl, DocumentVersion, Branch, VersionDiff } from './hooks/useVersionControl';
import { cn } from './ui/utils';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  Clock,
  Tag,
  Plus,
  Archive,
  ArrowLeft,
  ArrowRight,
  FileText,
  Users,
  Calendar,
  Hash,
  Activity,
  Save,
  RotateCcw,
  Eye,
  GitFork,
  Zap
} from 'lucide-react';

interface VersionControlProps {
  documentId: string;
  content: string;
  onContentChange: (content: string) => void;
  className?: string;
}

export function VersionControl({ documentId, content, onContentChange, className }: VersionControlProps) {
  const versionControl = useVersionControl(documentId, content);
  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [selectedMergeBranch, setSelectedMergeBranch] = useState('');

  // 현재 컨텐츠와 버전 관리 동기화
  React.useEffect(() => {
    if (versionControl.currentContent !== content) {
      versionControl.setCurrentContent(content);
    }
  }, [content, versionControl]);

  React.useEffect(() => {
    if (versionControl.currentContent !== content) {
      onContentChange(versionControl.currentContent);
    }
  }, [versionControl.currentContent, onContentChange]);

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    
    const commitId = versionControl.commit(commitMessage);
    if (commitId) {
      setCommitMessage('');
    }
  };

  const handleCreateBranch = () => {
    if (!newBranchName.trim()) return;
    
    const branchId = versionControl.createBranch(newBranchName);
    if (branchId) {
      setNewBranchName('');
    }
  };

  const handleAddTag = (versionId: string) => {
    if (!newTagName.trim()) return;
    
    versionControl.addTag(versionId, newTagName);
    setNewTagName('');
  };

  const handleMergeBranch = () => {
    if (!selectedMergeBranch) return;
    
    const result = versionControl.mergeBranch(
      selectedMergeBranch,
      versionControl.currentBranch,
      `Merge ${selectedMergeBranch} into ${versionControl.getCurrentBranch()?.name}`
    );
    
    if (result) {
      setMergeDialogOpen(false);
      setSelectedMergeBranch('');
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}일 전`;
    if (hours > 0) return `${hours}시간 전`;
    if (minutes > 0) return `${minutes}분 전`;
    return '방금 전';
  };

  const getDiffStats = (version: DocumentVersion) => {
    const { added, removed, modified } = version.changes;
    return `+${added} -${removed} ~${modified}`;
  };

  const renderDiff = (diff: VersionDiff[]) => {
    return (
      <div className="space-y-1 font-mono text-sm">
        {diff.map((item, index) => (
          <div
            key={index}
            className={cn(
              'px-2 py-1 rounded',
              item.type === 'added' && 'bg-green-50 text-green-800 border-l-2 border-green-400',
              item.type === 'removed' && 'bg-red-50 text-red-800 border-l-2 border-red-400',
              item.type === 'modified' && 'bg-yellow-50 text-yellow-800 border-l-2 border-yellow-400'
            )}
          >
            <div className="flex items-center gap-2">
              {item.type === 'added' && <Plus className="h-3 w-3" />}
              {item.type === 'removed' && <ArrowLeft className="h-3 w-3" />}
              {item.type === 'modified' && <ArrowRight className="h-3 w-3" />}
              <span className="text-xs opacity-60">
                {item.oldLine && `L${item.oldLine}`}
                {item.newLine && `L${item.newLine}`}
              </span>
            </div>
            {item.oldText && (
              <div className="text-red-600 line-through">- {item.oldText}</div>
            )}
            {item.newText && (
              <div className="text-green-600">+ {item.newText}</div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Card className={cn("bg-white/60 backdrop-blur-sm border-stone-200/50", className)}>
        <div className="p-4 border-b border-stone-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="h-4 w-4" />
              <span className="font-medium">버전 관리</span>
              {versionControl.uncommittedChanges && (
                <Badge variant="destructive" className="text-xs">
                  변경사항 있음
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {versionControl.getCurrentBranch()?.name || 'main'}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {versionControl.versions.length} 커밋
              </Badge>
            </div>
          </div>
        </div>

        <div className="p-4">
          <Tabs defaultValue="history" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="history">히스토리</TabsTrigger>
              <TabsTrigger value="branches">브랜치</TabsTrigger>
              <TabsTrigger value="tools">도구</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              {/* 커밋 생성 */}
              {versionControl.uncommittedChanges && (
                <div className="space-y-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium text-amber-800">커밋되지 않은 변경사항</span>
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="커밋 메시지를 입력하세요..."
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="min-h-[60px] resize-none"
                    />
                    <Button
                      onClick={handleCommit}
                      disabled={!commitMessage.trim()}
                      size="sm"
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      커밋
                    </Button>
                  </div>
                </div>
              )}

              {/* 버전 히스토리 */}
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {versionControl.versions
                    .filter(v => v.branch === versionControl.currentBranch)
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .map((version) => (
                      <div
                        key={version.id}
                        className={cn(
                          "p-3 rounded-lg border transition-all cursor-pointer",
                          version.id === versionControl.currentVersion
                            ? "bg-amber-50 border-amber-200"
                            : "bg-white/50 border-stone-200 hover:bg-stone-50"
                        )}
                        onClick={() => {
                          if (selectedVersions.includes(version.id)) {
                            setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                          } else if (selectedVersions.length < 2) {
                            setSelectedVersions([...selectedVersions, version.id]);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className={cn(
                              "w-3 h-3 rounded-full border-2",
                              version.id === versionControl.currentVersion
                                ? "bg-amber-500 border-amber-500"
                                : "bg-white border-stone-300"
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Hash className="h-3 w-3 text-stone-400" />
                              <span className="text-xs text-stone-500 font-mono">
                                {version.id.slice(0, 8)}
                              </span>
                              {version.id === versionControl.currentVersion && (
                                <Badge variant="outline" className="text-xs">현재</Badge>
                              )}
                            </div>
                            
                            <div className="font-medium text-sm mb-1">
                              {version.message}
                            </div>
                            
                            <div className="flex items-center gap-3 text-xs text-stone-500 mb-2">
                              <div className="flex items-center gap-1">
                                <Avatar className="h-4 w-4">
                                  <AvatarImage src={version.authorAvatar} alt={version.author} />
                                  <AvatarFallback>{version.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span>{version.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(version.timestamp)}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {getDiffStats(version)}
                                </Badge>
                                {version.tags.map(tag => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    <Tag className="h-2 w-2 mr-1" />
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        versionControl.checkout(version.id);
                                      }}
                                      className="h-6 w-6 p-0"
                                    >
                                      <RotateCcw className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>이 버전으로 돌아가기</p>
                                  </TooltipContent>
                                </Tooltip>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Tag className="h-3 w-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>태그 추가</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label htmlFor="tag-name">태그 이름</Label>
                                        <Input
                                          id="tag-name"
                                          value={newTagName}
                                          onChange={(e) => setNewTagName(e.target.value)}
                                          placeholder="v1.0.0"
                                        />
                                      </div>
                                      <Button
                                        onClick={() => handleAddTag(version.id)}
                                        disabled={!newTagName.trim()}
                                        className="w-full"
                                      >
                                        태그 추가
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </ScrollArea>

              {/* 버전 비교 */}
              {selectedVersions.length === 2 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      선택된 버전 비교
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDiff(!showDiff)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {showDiff ? '비교 숨기기' : '비교 보기'}
                    </Button>
                  </div>
                  
                  {showDiff && (
                    <div className="mt-3 p-3 bg-white rounded border max-h-[200px] overflow-y-auto">
                      {renderDiff(versionControl.compareVersions(selectedVersions[0], selectedVersions[1]))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="branches" className="space-y-4">
              {/* 브랜치 생성 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="브랜치 이름"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateBranch}
                    disabled={!newBranchName.trim()}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    생성
                  </Button>
                </div>
              </div>

              {/* 브랜치 목록 */}
              <div className="space-y-2">
                {versionControl.branches.map((branch) => (
                  <div
                    key={branch.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all",
                      branch.isActive
                        ? "bg-amber-50 border-amber-200"
                        : "bg-white/50 border-stone-200 hover:bg-stone-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-stone-600" />
                        <span className="font-medium">{branch.name}</span>
                        {branch.isActive && (
                          <Badge variant="outline" className="text-xs">활성</Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!branch.isActive && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => versionControl.switchBranch(branch.id)}
                          >
                            전환
                          </Button>
                        )}
                        
                        {!branch.isActive && (
                          <Dialog open={mergeDialogOpen} onOpenChange={setMergeDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedMergeBranch(branch.id)}
                              >
                                <GitMerge className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>브랜치 병합</DialogTitle>
                                <DialogDescription>
                                  {branch.name} 브랜치를 현재 브랜치로 병합하시겠습니까?
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setMergeDialogOpen(false)}
                                >
                                  취소
                                </Button>
                                <Button onClick={handleMergeBranch}>
                                  병합
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-stone-500">
                      마지막 커밋: {branch.lastCommit.slice(0, 8)} • {formatTimeAgo(branch.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tools" className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Archive className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium text-blue-900">백업 & 복원</h3>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    전체 문서와 버전 히스토리를 백업하거나 복원할 수 있습니다.
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      백업 생성
                    </Button>
                    <Button variant="outline" size="sm">
                      백업 복원
                    </Button>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <GitFork className="h-5 w-5 text-green-600" />
                    <h3 className="font-medium text-green-900">프로젝트 분기</h3>
                  </div>
                  <p className="text-sm text-green-700 mb-3">
                    현재 프로젝트를 기반으로 새로운 독립적인 프로젝트를 시작합니다.
                  </p>
                  <Button variant="outline" size="sm">
                    프로젝트 분기
                  </Button>
                </div>

                <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-purple-600" />
                    <h3 className="font-medium text-purple-900">자동 백업</h3>
                  </div>
                  <p className="text-sm text-purple-700 mb-3">
                    설정된 시간 간격으로 자동으로 백업을 생성합니다.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      자동 백업 설정
                    </Button>
                    <Badge variant="secondary" className="text-xs">
                      매 30분
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </TooltipProvider>
  );
}
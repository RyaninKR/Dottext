import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Users, Wifi, WifiOff, Clock } from 'lucide-react';
import { useCollaboration, Collaborator } from './hooks/useCollaboration';
import { cn } from './ui/utils';

interface CollaboratorsListProps {
  documentId: string;
  className?: string;
}

export function CollaboratorsList({ documentId, className }: CollaboratorsListProps) {
  const { collaborators, isConnected, currentUser } = useCollaboration(documentId);

  const formatLastSeen = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}시간 전`;
    return `${Math.floor(minutes / 1440)}일 전`;
  };

  const onlineCollaborators = collaborators.filter(c => c.isOnline);
  const offlineCollaborators = collaborators.filter(c => !c.isOnline);

  return (
    <TooltipProvider>
      <Card className={cn("bg-white/60 backdrop-blur-sm border-stone-200/50", className)}>
        <div className="p-4 border-b border-stone-200/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">협업자</span>
              <Badge variant="secondary" className="text-xs">
                {onlineCollaborators.length + 1}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}
              <span className={cn(
                "text-xs",
                isConnected ? "text-green-600" : "text-red-600"
              )}>
                {isConnected ? '연결됨' : '연결 끊김'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* 현재 사용자 */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-stone-600 uppercase tracking-wide">나</h4>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback style={{ backgroundColor: currentUser.color }}>
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentUser.name}</span>
                  <Badge variant="outline" size="sm">호스트</Badge>
                </div>
                <div className="text-xs text-stone-500">온라인</div>
              </div>
            </div>
          </div>

          {/* 온라인 협업자들 */}
          {onlineCollaborators.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-stone-600 uppercase tracking-wide">
                온라인 ({onlineCollaborators.length})
              </h4>
              <div className="space-y-2">
                {onlineCollaborators.map((collaborator) => (
                  <Tooltip key={collaborator.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50/50 transition-colors">
                        <div className="relative">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                            <AvatarFallback style={{ backgroundColor: collaborator.color }}>
                              {collaborator.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{collaborator.name}</div>
                          <div className="text-xs text-stone-500">온라인</div>
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: collaborator.color }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{collaborator.name}님이 실시간으로 편집 중입니다</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {/* 오프라인 협업자들 */}
          {offlineCollaborators.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-stone-600 uppercase tracking-wide">
                최근 참여 ({offlineCollaborators.length})
              </h4>
              <div className="space-y-1">
                {offlineCollaborators.slice(0, 3).map((collaborator) => (
                  <Tooltip key={collaborator.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-3 p-2 rounded-lg opacity-60">
                        <div className="relative">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={collaborator.avatar} alt={collaborator.name} />
                            <AvatarFallback style={{ backgroundColor: collaborator.color }}>
                              {collaborator.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium">{collaborator.name}</div>
                          <div className="text-xs text-stone-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatLastSeen(collaborator.lastSeen)}
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{collaborator.name}님이 {formatLastSeen(collaborator.lastSeen)} 마지막 활동</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
                {offlineCollaborators.length > 3 && (
                  <div className="text-xs text-stone-500 pl-2">
                    그 외 {offlineCollaborators.length - 3}명
                  </div>
                )}
              </div>
            </div>
          )}

          {collaborators.length === 0 && (
            <div className="text-center py-6">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-stone-500">아직 협업자가 없습니다</p>
              <p className="text-xs text-stone-400 mt-1">
                문서를 공유하여 함께 편집하세요
              </p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-stone-200/50">
          <Button variant="outline" size="sm" className="w-full">
            <Users className="h-4 w-4 mr-2" />
            협업자 초대
          </Button>
        </div>
      </Card>
    </TooltipProvider>
  );
}
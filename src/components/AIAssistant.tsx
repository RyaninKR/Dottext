import React, { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Sparkles, Send, Lightbulb, Users, MapPin, Clock } from 'lucide-react';

interface Suggestion {
  id: string;
  type: 'plot' | 'character' | 'setting' | 'dialogue';
  title: string;
  content: string;
}

interface AIAssistantProps {
  isOpen: boolean;
  selectedText: string;
}

export function AIAssistant({ isOpen, selectedText }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    {
      id: '1',
      type: 'plot',
      title: '갈등 강화하기',
      content: '주인공과 조력자 사이에 가치관의 차이로 인한 내적 갈등을 추가해보세요. 이는 캐릭터의 성장을 더욱 명확하게 보여줄 수 있습니다.'
    },
    {
      id: '2',
      type: 'character',
      title: '캐릭터 배경 발전',
      content: '등장인물의 과거 트라우마나 숨겨진 동기를 암시하는 작은 디테일을 추가해보세요. 독자들이 캐릭터에 더 깊이 몰입할 수 있습니다.'
    },
    {
      id: '3',
      type: 'setting',
      title: '분위기 조성',
      content: '현재 장면의 날씨나 시간대를 활용해 감정적 분위기를 강화해보세요. 예를 들어, 갈등 상황에서 비나 어둠을 활용할 수 있습니다.'
    },
    {
      id: '4',
      type: 'dialogue',
      title: '마크다운 서식 활용',
      content: '**굵은 글씨**로 강조하거나 *기울임*으로 생각을 표현해보세요. > 인용문을 사용해 회상 장면을 구분하고, ## 제목으로 챕터나 섹션을 나누어 가독성을 높일 수 있습니다.'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    // Mock AI response - 실제로는 AI API를 호출
    setTimeout(() => {
      const newSuggestion: Suggestion = {
        id: Date.now().toString(),
        type: 'dialogue',
        title: 'AI 제안',
        content: `"${input}"에 대한 제안: 캐릭터의 감정을 더 생생하게 표현하기 위해 몸짓이나 표정 묘사를 추가해보세요. 또한 대화 중 침묵의 순간을 활용하면 긴장감을 높일 수 있습니다.`
      };
      setSuggestions([newSuggestion, ...suggestions]);
      setInput('');
      setIsLoading(false);
    }, 1500);
  };

  const typeIcons = {
    plot: Clock,
    character: Users,
    setting: MapPin,
    dialogue: Lightbulb
  };

  const typeLabels = {
    plot: '플롯',
    character: '캐릭터',
    setting: '배경',
    dialogue: '대화'
  };

  const typeColors = {
    plot: 'bg-blue-100 text-blue-800',
    character: 'bg-green-100 text-green-800',
    setting: 'bg-purple-100 text-purple-800',
    dialogue: 'bg-orange-100 text-orange-800'
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 bg-stone-50/50 backdrop-blur-sm border-l border-stone-200/50 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 bg-white/40 backdrop-blur-sm border-b border-stone-200/50">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-stone-800">AI 창작 도우미</h2>
        </div>
        <p className="text-sm text-stone-600 mt-2">
          창작에 도움이 되는 제안을 받아보세요
        </p>
      </div>

      {/* Selected Text */}
      {selectedText && (
        <div className="p-4 bg-amber-50/50 border-b border-stone-200/50">
          <div className="text-xs font-medium text-stone-700 mb-1">선택된 텍스트</div>
          <div className="text-sm text-stone-600 bg-white/60 p-2 rounded text-ellipsis overflow-hidden">
            "{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-b border-stone-200/50">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="질문하거나 도움이 필요한 부분을 알려주세요..."
          className="min-h-[80px] mb-3 text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSendMessage();
            }
          }}
        />
        <Button 
          onClick={handleSendMessage} 
          disabled={isLoading || !input.trim()}
          className="w-full gap-2"
          size="sm"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              생각 중...
            </>
          ) : (
            <>
              <Send className="h-3 w-3" />
              전송 (Ctrl+Enter)
            </>
          )}
        </Button>
      </div>

      {/* Suggestions */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          <div className="text-sm font-medium text-stone-700 mb-3">창작 제안</div>
          
          {suggestions.map((suggestion) => {
            const Icon = typeIcons[suggestion.type];
            return (
              <Card key={suggestion.id} className="p-4 bg-white/60 border-stone-200/50">
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 text-stone-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium text-stone-800 text-sm truncate">
                        {suggestion.title}
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${typeColors[suggestion.type]}`}
                      >
                        {typeLabels[suggestion.type]}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {suggestion.content}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
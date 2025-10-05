import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTheme, ThemeMode, FontFamily, ColorTheme, EditorLayout } from './hooks/useTheme';
import {
  Palette,
  Type,
  Layout,
  Sun,
  Moon,
  Coffee,
  Monitor,
  RotateCcw,
  Eye,
  LineChart,
  Hash,
  AlignCenter,
  Focus
} from 'lucide-react';

interface ThemeCustomizerProps {
  className?: string;
}

export function ThemeCustomizer({ className }: ThemeCustomizerProps) {
  const { settings, updateSettings, resetSettings } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const themeOptions = [
    { value: 'light' as ThemeMode, label: '라이트', icon: Sun, description: '밝은 테마' },
    { value: 'dark' as ThemeMode, label: '다크', icon: Moon, description: '어두운 테마' },
    { value: 'sepia' as ThemeMode, label: '세피아', icon: Coffee, description: '따뜻한 세피아' },
  ];

  const fontOptions = [
    { value: 'serif' as FontFamily, label: '세리프', example: 'The quick brown fox' },
    { value: 'sans' as FontFamily, label: '산세리프', example: 'The quick brown fox' },
    { value: 'mono' as FontFamily, label: '모노스페이스', example: 'The quick brown fox' },
  ];

  const colorOptions = [
    { value: 'amber' as ColorTheme, label: '앰버', color: '#f59e0b' },
    { value: 'blue' as ColorTheme, label: '블루', color: '#3b82f6' },
    { value: 'green' as ColorTheme, label: '그린', color: '#10b981' },
    { value: 'purple' as ColorTheme, label: '퍼플', color: '#8b5cf6' },
    { value: 'rose' as ColorTheme, label: '로즈', color: '#f43f5e' },
  ];

  const layoutOptions = [
    { value: 'normal' as EditorLayout, label: '일반', icon: Monitor, description: '표준 레이아웃' },
    { value: 'zen' as EditorLayout, label: '젠 모드', icon: Eye, description: '집중 모드' },
    { value: 'typewriter' as EditorLayout, label: '타자기', icon: AlignCenter, description: '중앙 고정' },
  ];

  return (
    <Card className={`bg-white/60 backdrop-blur-sm border-stone-200/50 ${className}`}>
      <div className="p-4 border-b border-stone-200/50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full justify-between h-auto p-2"
        >
          <div className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="font-medium">테마 설정</span>
            <Badge variant="secondary" className="text-xs">
              {settings.mode}
            </Badge>
          </div>
        </Button>
      </div>

      {isExpanded && (
        <div className="p-4">
          <Tabs defaultValue="appearance" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance">외형</TabsTrigger>
              <TabsTrigger value="editor">편집기</TabsTrigger>
              <TabsTrigger value="advanced">고급</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6">
              {/* 테마 모드 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">테마 모드</Label>
                <RadioGroup
                  value={settings.mode}
                  onValueChange={(value) => updateSettings({ mode: value as ThemeMode })}
                >
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Label
                          htmlFor={option.value}
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                          <span className="text-xs text-stone-500">{option.description}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* 색상 테마 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">색상 테마</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={settings.colorTheme === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSettings({ colorTheme: option.value })}
                      className="h-12 flex flex-col gap-1"
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: option.color }}
                      />
                      <span className="text-xs">{option.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* 폰트 패밀리 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">폰트</Label>
                <Select 
                  value={settings.fontFamily} 
                  onValueChange={(value) => updateSettings({ fontFamily: value as FontFamily })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col">
                          <span>{option.label}</span>
                          <span className="text-xs text-stone-500 font-mono">
                            {option.example}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              {/* 편집기 레이아웃 */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">편집기 레이아웃</Label>
                <RadioGroup
                  value={settings.editorLayout}
                  onValueChange={(value) => updateSettings({ editorLayout: value as EditorLayout })}
                >
                  {layoutOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`layout-${option.value}`} />
                        <Label
                          htmlFor={`layout-${option.value}`}
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{option.label}</span>
                          <span className="text-xs text-stone-500">{option.description}</span>
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              {/* 폰트 크기 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">폰트 크기</Label>
                  <Badge variant="outline">{settings.fontSize}px</Badge>
                </div>
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSettings({ fontSize: value })}
                  min={12}
                  max={24}
                  step={1}
                />
              </div>

              {/* 줄 높이 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">줄 높이</Label>
                  <Badge variant="outline">{settings.lineHeight}</Badge>
                </div>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSettings({ lineHeight: value })}
                  min={1.2}
                  max={2.5}
                  step={0.1}
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              {/* 줄 번호 표시 */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">줄 번호 표시</Label>
                  <p className="text-xs text-stone-500">편집기에서 줄 번호를 표시합니다</p>
                </div>
                <Switch
                  checked={settings.showLineNumbers}
                  onCheckedChange={(checked) => updateSettings({ showLineNumbers: checked })}
                />
              </div>

              <Separator />

              {/* 집중 모드 */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium">집중 모드</Label>
                  <p className="text-xs text-stone-500">현재 문단만 강조하여 표시합니다</p>
                </div>
                <Switch
                  checked={settings.focusMode}
                  onCheckedChange={(checked) => updateSettings({ focusMode: checked })}
                />
              </div>

              <Separator />

              {/* 설정 초기화 */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  설정 초기화
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
}
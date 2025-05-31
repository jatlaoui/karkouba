import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Sparkles, Settings, Brain, BookOpen, PenTool, Edit3, Download, Target } from 'lucide-react';
import { useAIWritingJourney } from '../context/AIWritingJourneyContext';
import { toast } from '../hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { aiModels } from './sharedModels'; // Import shared aiModels

const stageNames: Record<number, string> = {
  1: 'تحليل الرواية المصدر',
  2: 'معمل الأفكار المحسن',
  3: 'باني المخطط الذكي',
  4: 'مولد الفصول الموجه',
  5: 'المحرر التفاعلي المتقدم',
  6: 'التنقيح والتصدير النهائي',
};

const stageIcons: Record<number, React.ElementType> = {
  1: Brain,
  2: Target,
  3: BookOpen, // Changed from FileText for better icon variety
  4: PenTool,
  5: Edit3,
  6: Download,
};

const AIModelConfigurator: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [localSelections, setLocalSelections] = useState<Record<number, string>>({});
  const [localApiKeys, setLocalApiKeys] = useState<Record<string, string>>({});
  const [localPromptTemplates, setLocalPromptTemplates] = useState<Record<string, string>>({});
 
  // Mapping stage IDs to prompt task IDs
  const stageToPromptTaskId: Record<number, string> = {
    1: 'analyze_source',
    2: 'generate_idea',
    3: 'build_blueprint',
    4: 'generate_chapter',
    5: 'enhance_text',
    6: 'check_consistency',
  };
 
  useEffect(() => {
    setLocalSelections(state.selectedAIModels);
    setLocalApiKeys(state.apiKeys);
    setLocalPromptTemplates(state.promptTemplates);
  }, [state.selectedAIModels, state.apiKeys, state.promptTemplates]);
 
  const handleSelectModel = (stageId: number, modelId: string) => {
    setLocalSelections(prev => ({ ...prev, [stageId]: modelId }));
  };
 
  const handlePromptChange = (stageId: number, newPrompt: string) => {
    const taskId = stageToPromptTaskId[stageId];
    if (taskId) {
      setLocalPromptTemplates(prev => ({ ...prev, [taskId]: newPrompt }));
    }
  };
 
  const handleSave = () => {
    Object.keys(localSelections).forEach(stageIdStr => {
      const stageId = parseInt(stageIdStr);
      dispatch({ type: 'SET_AI_MODEL_FOR_STAGE', payload: { stageId, modelId: localSelections[stageId] } });
    });
    Object.keys(localApiKeys).forEach(modelId => {
        dispatch({ type: 'SET_API_KEY_FOR_MODEL', payload: { modelId, key: localApiKeys[modelId] } });
    });
    Object.keys(localPromptTemplates).forEach(taskId => {
      dispatch({ type: 'SET_PROMPT_TEMPLATE', payload: { taskId, template: localPromptTemplates[taskId] } });
    });
 
    toast({
      title: 'تم حفظ إعدادات النماذج',
      description: 'تم تحديث نماذج الذكاء الاصطناعي ومفاتيح الـ API والقوالب لكل مرحلة.',
    });
  };
 
  const handleApplyToAll = (modelId: string) => {
    const newSelections: Record<number, string> = {};
    for (let i = 1; i <= 6; i++) {
      newSelections[i] = modelId;
    }
    setLocalSelections(newSelections);
    const model = aiModels.find(m => m.id === modelId);
    if (model?.supportsApiKey) {
        setLocalApiKeys(prev => ({ ...prev, [modelId]: prev[modelId] || '' }));
    }
  };
 
  const currentOverallQuality = state.generatedChapters.length > 0
    ? Math.round(state.generatedChapters.reduce((total, ch) => total + ch.quality.overall, 0) / state.generatedChapters.length)
    : 0;
 
  return (
    <main className="container mx-auto py-8 px-6" dir="rtl">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-600" />
            إعدادات نماذج الذكاء الاصطناعي
          </CardTitle>
          <CardDescription>
            اختر نموذج الذكاء الاصطناعي المفضل لكل مرحلة من رحلة الكتابة الذكية.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-4 space-y-6">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-blue-900 mb-3">تطبيق نموذج واحد على جميع المراحل:</h3>
              <div className="flex flex-wrap items-center gap-4">
                <Select
                  onValueChange={handleApplyToAll}
                  value={''}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="اختر نموذجاً لتطبيقه على الكل" />
                  </SelectTrigger>
                  <SelectContent>
                    {aiModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-blue-700">
                    سيتم تطبيق النموذج المحدد على جميع المراحل، ولكن يجب إدخال مفتاح الـ API يدوياً إذا كان مطلوباً.
                </span>
              </div>
            </CardContent>
          </Card>
          
          <h3 className="font-semibold text-gray-800 mb-4">اختيار نموذج لكل مرحلة:</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((stageId) => {
              const StageIcon = stageIcons[stageId];
              const selectedModel = aiModels.find(m => m.id === localSelections[stageId]);
              
 
              return (
                <div key={stageId} className="flex flex-col gap-3 p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <StageIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <Label className="font-semibold text-gray-900">المرحلة {stageId}: {stageNames[stageId]}</Label>
                            <p className="text-sm text-gray-600">
                                النموذج المحدد: <span className="font-medium text-blue-800">{selectedModel?.name || 'لم يحدد'}</span>
                            </p>
                        </div>
                        <Select
                            value={localSelections[stageId] || ''}
                            onValueChange={(value) => handleSelectModel(stageId, value)}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="اختر نموذجاً" />
                            </SelectTrigger>
                            <SelectContent>
                                {aiModels.map(model => (
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedModel?.supportsApiKey && (
                        <div className="w-full space-y-2 pr-14">
                            <Label htmlFor={`api-key-${selectedModel.id}-${stageId}`} className="text-sm">مفتاح API خاص بك لهذا النموذج:</Label>
                            <Input
                                id={`api-key-${selectedModel.id}-${stageId}`}
                                type="password"
                                placeholder={selectedModel.apiKeyPlaceholder}
                                value={localApiKeys[selectedModel.id] || ''}
                                onChange={(e) => setLocalApiKeys(prev => ({ ...prev, [selectedModel.id]: e.target.value }))}
                                className="text-left"
                            />
                            <p className="text-xs text-gray-500">
                                هذا المفتاح لن يتم حفظه بشكل دائم إلا إذا كان الخادم الخلفي يدعم ذلك.
                            </p>
                        </div>
                    )}
                    <div className="w-full space-y-2 pr-14">
                        <Label htmlFor={`prompt-template-${stageId}`} className="text-sm">قالب البرومبت لهذه المرحلة:</Label>
                        <Textarea
                            id={`prompt-template-${stageId}`}
                            value={localPromptTemplates[stageToPromptTaskId[stageId]] || ''}
                            onChange={(e) => handlePromptChange(stageId, e.target.value)}
                            className="text-left min-h-[100px]"
                            dir="ltr" // Ensure LTR for prompt editing
                        />
                        <p className="text-xs text-gray-500">
                            يمكنك تخصيص البرومبت الذي سيتم إرساله لنموذج الذكاء الاصطناعي في هذه المرحلة.
                        </p>
                    </div>
                </div>
              );
            })}
          </div>
        </CardContent>
 
        <div className="flex justify-between items-center mt-6 p-6 border-t"> {/* Added p-6 and border-t for styling */}
          <div className="text-sm text-gray-600 flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="font-medium">
              الجودة الكلية: {currentOverallQuality}%
            </span>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave}>
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
};

export default AIModelConfigurator;
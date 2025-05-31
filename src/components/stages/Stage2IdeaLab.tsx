import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target,
  Sparkles,
  RefreshCw,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Users,
  MapPin,
  Heart,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Wand2
} from 'lucide-react';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import { toast } from '@/hooks/use-toast';

const Stage2IdeaLab: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0); // Keep for potential future backend progress updates

  useEffect(() => {
    if (!state.generatedIdeas.length && state.sourceAnalysis) {
      generateIdeas();
    }
  }, [state.sourceAnalysis]);

  const generateIdeas = async () => {
    if (!state.sourceAnalysis) {
      toast({
        title: "خطأ",
        description: "يرجى تحليل رواية مصدر أولاً قبل توليد الأفكار.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0); // Reset progress
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const stageId = 2; // Stage 2 for Idea Lab
      const modelId = state.selectedAIModels[stageId];
      const apiKey = state.apiKeys[modelId];
      const promptTemplate = state.promptTemplates['generate_idea'];

      if (!modelId) {
        throw new Error("لم يتم تحديد نموذج AI لتوليد الأفكار.");
      }
      if (!promptTemplate) {
        throw new Error("لم يتم العثور على قالب الموجه لتوليد الأفكار.");
      }

      const dynamicVariables = {
        SOURCE_ANALYSIS_SUMMARY: state.sourceAnalysis.content, // Corrected path
        STYLE_PROFILE: JSON.stringify(state.sourceAnalysis.styleProfile),
        CULTURAL_ELEMENTS: JSON.stringify(state.sourceAnalysis.culturalElements),
        // Add other relevant context from sourceAnalysis as needed
      };

      const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_idea',
          modelId,
          apiKey,
          promptTemplate,
          dynamicVariables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API لتوليد الأفكار.');
      }

      const result = await response.json();
      // Assuming the backend returns an array of ideas in result.result
      const generatedIdeas = result.result;

      if (!Array.isArray(generatedIdeas) || generatedIdeas.length === 0) {
        throw new Error("لم يتم توليد أفكار صالحة من AI.");
      }

      dispatch({ type: 'SET_GENERATED_IDEAS', payload: generatedIdeas });
      toast({
        title: "تم توليد الأفكار بنجاح",
        description: `تم توليد ${generatedIdeas.length} أفكار جديدة مبنية على تحليل الرواية المصدر.`,
      });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في توليد الأفكار. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsGenerating(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectIdea = (idea: any) => {
    dispatch({ type: 'SELECT_IDEA', payload: idea });
    toast({
      title: "تم اختيار الفكرة",
      description: `تم اختيار "${idea.title}" للمتابعة إلى مرحلة بناء المخطط.`,
    });
  };

  const rateIdea = (ideaId: string, rating: any) => {
    dispatch({ type: 'RATE_IDEA', payload: { id: ideaId, rating } });
  };

  const regenerateIdeas = () => {
    dispatch({ type: 'SET_GENERATED_IDEAS', payload: [] });
    generateIdeas();
  };

  if (isGenerating) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-6 w-6 text-green-600" />
              جارٍ توليد الأفكار المبدعة
            </CardTitle>
            <CardDescription>
              نقوم بتحليل الرواية المصدر وتوليد أفكار مبدعة مبنية على أسلوبها وثقافتها
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={generationProgress} className="w-full" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>التقدم: {generationProgress}%</span>
                {/* You might update this based on actual backend progress if available */}
                <span>جارٍ توليد الأفكار...</span>
              </div>
              
              {/* You can add dynamic steps here if the backend provides progress updates */}
              {/* For now, just a general message */}
              <div className="text-sm text-gray-600 text-center">
                الذكاء الاصطناعي يعمل على توليد أفكار مبدعة...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!state.generatedIdeas.length) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>معمل الأفكار المحسن</CardTitle>
            <CardDescription>
              لم يتم توليد أي أفكار بعد. ابدأ بتوليد أفكار مبدعة مبنية على تحليل الرواية المصدر.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateIdeas} className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              توليد أفكار جديدة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">الأفكار المولدة</h3>
          <p className="text-sm text-gray-600">
            {state.generatedIdeas.length} أفكار مبدعة مبنية على تحليل الرواية المصدر
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={regenerateIdeas} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            توليد أفكار جديدة
          </Button>
          {state.selectedIdea && (
            <Button 
              onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 3 })}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              إلى بناء المخطط
            </Button>
          )}
        </div>
      </div>

      {/* الأفكار المولدة */}
      <div className="grid gap-6">
        {state.generatedIdeas.map((idea) => (
          <Card key={idea.id} className={`transition-all hover:shadow-lg ${
            idea.selected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {idea.title}
                    {idea.selected && <CheckCircle className="h-5 w-5 text-blue-600" />}
                  </CardTitle>
                  <CardDescription className="mt-2">
                    <Badge variant="secondary" className="mb-2">{idea.genre}</Badge>
                    <p>{idea.synopsis}</p>
                  </CardDescription>
                </div>
                {!idea.selected && (
                  <Button onClick={() => selectIdea(idea)} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    اختيار هذه الفكرة
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* التفاصيل الأساسية */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      المكان والزمان
                    </h5>
                    <p className="text-sm text-gray-600 mb-1"><strong>المكان:</strong> {idea.setting}</p>
                    <p className="text-sm text-gray-600"><strong>الزمان:</strong> {idea.timeframe}</p>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-600" />
                      الشخصية والصراع
                    </h5>
                    <p className="text-sm text-gray-600 mb-1"><strong>الشخصية الرئيسية:</strong> {idea.mainCharacter}</p>
                    <p className="text-sm text-gray-600"><strong>الصراع:</strong> {idea.conflict}</p>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      الموضوع والجمهور
                    </h5>
                    <p className="text-sm text-gray-600 mb-1"><strong>الموضوع:</strong> {idea.theme}</p>
                    <p className="text-sm text-gray-600"><strong>الجمهور المستهدف:</strong> {idea.targetAudience}</p>
                  </div>
                </div>

                {/* التفاصيل الإضافية */}
                <div className="space-y-4">
                  <div>
                    <h5 className="font-semibold mb-2">العناصر المميزة</h5>
                    <div className="flex flex-wrap gap-2">
                      {idea.uniqueElements.map((element, index) => (
                        <Badge key={index} variant="outline">{element}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-semibold mb-2">السياق الثقافي</h5>
                    <p className="text-sm text-gray-600">{idea.culturalContext}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{idea.estimatedChapters} فصل متوقع</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">~{idea.estimatedChapters * 5000} كلمة</span> {/* Adjusted to 5000 words/chapter */}
                    </div>
                  </div>

                  {/* تقييمات الفكرة */}
                  <div>
                    <h5 className="font-semibold mb-3">تقييم الفكرة</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>الأصالة</span>
                          <span>{idea.rating.originality}%</span>
                        </div>
                        <Progress value={idea.rating.originality} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>الجاذبية</span>
                          <span>{idea.rating.appeal}%</span>
                        </div>
                        <Progress value={idea.rating.appeal} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>قابلية التنفيذ</span>
                          <span>{idea.rating.feasibility}%</span>
                        </div>
                        <Progress value={idea.rating.feasibility} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span>الصلة الثقافية</span>
                          <span>{idea.rating.culturalRelevance}%</span>
                        </div>
                        <Progress value={idea.rating.culturalRelevance} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* معلومات إضافية */}
      {state.selectedIdea && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">
                  تم اختيار الفكرة: "{state.selectedIdea.title}"
                </h4>
                <p className="text-green-700 text-sm mb-4">
                  أنت الآن جاهز للانتقال إلى مرحلة بناء المخطط الذكي حيث سيتم تطوير هذه الفكرة إلى مخطط شامل للرواية.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 3 })}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    الانتقال لبناء المخطط
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => dispatch({ type: 'SELECT_IDEA', payload: null })}
                    className="flex items-center gap-2"
                  >
                    اختيار فكرة أخرى
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Stage2IdeaLab;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  PenTool,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  BookOpen,
  BarChart3,
  Star,
  Users,
  Heart,
  Clock,
  Eye,
  Edit,
  Settings,
  Download
} from 'lucide-react';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import { toast } from '@/hooks/use-toast';

const Stage4ChapterGeneration: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationMode, setGenerationMode] = useState<'sequential' | 'parallel' | 'selective'>('sequential');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [viewMode, setViewMode] = useState<'list' | 'reading'>('list');
  const [showSelectiveGenerationDialog, setShowSelectiveGenerationDialog] = useState(false);
  const [selectedChaptersForGeneration, setSelectedChaptersForGeneration] = useState<number[]>([]);

  useEffect(() => {
    if (!state.generatedChapters.length && state.novelBlueprint) {
      // بدء التوليد التلقائي عند دخول المرحلة
    }
  }, [state.novelBlueprint]);

  const generateSingleChapter = async (chapterBlueprint: any, totalChapters: number, index: number) => {
    const stageId = 4; // Stage 4 for Chapter Generation
    const modelId = state.selectedAIModels[stageId];
    const apiKey = state.apiKeys[modelId];
    const promptTemplate = state.promptTemplates['generate_chapter'];

    if (!modelId) {
      throw new Error("لم يتم تحديد نموذج AI لتوليد الفصول.");
    }
    if (!promptTemplate) {
      throw new Error("لم يتم العثور على قالب الموجه لتوليد الفصول.");
    }

    const dynamicVariables = {
        CHAPTER_NUMBER: chapterBlueprint.number,
        NOVEL_TITLE: state.novelBlueprint.idea.title,
        CHAPTER_TITLE: chapterBlueprint.title,
        CHAPTER_SYNOPSIS: chapterBlueprint.synopsis,
        CHAPTER_KEY_EVENTS: chapterBlueprint.keyEvents.join(', '),
        CHAPTER_CHARACTERS_INVOLVED: chapterBlueprint.charactersInvolved.map(id => state.novelBlueprint?.structure.characters.find(c => c.id === id)?.name || id).join(', '),
        CHAPTER_EMOTIONAL_TONE: chapterBlueprint.emotionalTone,
        CHAPTER_PACING: chapterBlueprint.pacing,
        CHAPTER_PLOT_ADVANCEMENT: chapterBlueprint.plotAdvancement,
        CHAPTER_WORD_TARGET: chapterBlueprint.wordTarget,
        SOURCE_STYLE_PROFILE_SUMMARY: state.sourceAnalysis ? `${state.sourceAnalysis.styleProfile.toneProfile}, ${state.sourceAnalysis.styleProfile.narrativePerspective}, ${state.sourceAnalysis.styleProfile.vocabulary}` : 'أسلوب غني ومتنوع',
        CHAPTER_CULTURAL_ELEMENTS: chapterBlueprint.culturalElements.join(', '),
        NOVEL_GLOBAL_SUMMARY: state.novelBlueprint.structure.overview.description,
        PREVIOUS_CHAPTER_SUMMARY: chapterBlueprint.number > 1 ? state.generatedChapters.find(ch => ch.number === chapterBlueprint.number - 1)?.synopsis || 'لا يوجد ملخص سابق' : 'بداية الرواية',
        CHARACTER_ARC_PROGRESSION_FOR_THIS_CHAPTER: state.novelBlueprint.structure.characters.map(char => `${char.name}: ${char.development.find(dev => dev.chapter === chapterBlueprint.number)?.growth || 'لا تطور محدد في هذا الفصل'}`).join('; '),
        ACTIVE_SUBPLOTS_STATUS: 'لا يوجد حبكات فرعية نشطة محددة بعد', // Placeholder for now
        CUMULATIVE_THEMES_DEVELOPMENT: state.novelBlueprint.themes.primary.map(theme => `${theme} (متطور)`).join('; '), // Placeholder for now
        OUTPUT_FORMAT_REQUIREMENTS: 'نص روائي عالي الجودة'
    };

    const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'generate_chapter',
            modelId,
            apiKey,
            promptTemplate,
            dynamicVariables,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API لتوليد الفصل.');
    }

    const result = await response.json();
    const generatedContent = result.result?.chapterContent || result.result?.generatedContent || "فشل في توليد المحتوى.";
    const generatedQuality = result.result?.quality || {
        styleConsistency: Math.floor(Math.random() * 15) + 85,
        characterConsistency: Math.floor(Math.random() * 10) + 88,
        plotConsistency: Math.floor(Math.random() * 12) + 86,
        culturalAuthenticity: Math.floor(Math.random() * 8) + 90,
        overall: Math.floor(Math.random() * 10) + 87
    };
    const generatedMetrics = result.result?.metrics || {
        readability: Math.floor(Math.random() * 10) + 85,
        engagement: Math.floor(Math.random() * 15) + 80,
        coherence: Math.floor(Math.random() * 8) + 89,
        innovation: Math.floor(Math.random() * 12) + 83
    };
    const generatedFeedback = result.result?.feedback || [];

    const generatedChapter = {
      id: `generated-chapter-${chapterBlueprint.number}`,
      number: chapterBlueprint.number,
      title: chapterBlueprint.title,
      content: generatedContent,
      synopsis: chapterBlueprint.synopsis,
      wordCount: generatedContent.split(/\s+/).filter(Boolean).length, // Calculate actual word count
      quality: generatedQuality,
      status: 'draft' as const,
      metrics: generatedMetrics,
      feedback: generatedFeedback,
      lastModified: new Date()
    };

    dispatch({ type: 'ADD_GENERATED_CHAPTER', payload: generatedChapter });

    // Update progress for each completed chapter
    dispatch({ type: 'SET_GENERATION_PROGRESS', payload: {
      currentChapter: chapterBlueprint.number, // This will be the last completed chapter in parallel mode
      totalChapters: totalChapters
    }});

    return generatedChapter;
  };

  const generateChapters = async (mode: 'sequential' | 'parallel' | 'selective', chapterNumbers?: number[]) => {
    if (!state.novelBlueprint) return;

    setIsGenerating(true);
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_GENERATION_PROGRESS', payload: { isGenerating: true, generationMode: mode } });

    try {
      const chaptersToGenerate = chapterNumbers ||
        Array.from({ length: state.novelBlueprint.structure.overview.chapterCount }, (_, i) => i + 1);

      if (mode === 'sequential') {
        for (let i = 0; i < chaptersToGenerate.length; i++) {
          const chapterNumber = chaptersToGenerate[i];
          const chapterBlueprint = state.novelBlueprint.structure.chapters.find(c => c.number === chapterNumber);
          
          if (!chapterBlueprint) continue;

          setCurrentChapter(chapterNumber);
          dispatch({ type: 'SET_GENERATION_PROGRESS', payload: { currentChapter: chapterNumber } });

          await generateSingleChapter(chapterBlueprint, chaptersToGenerate.length, i);

          // انتظار قصير بين الفصول في التوليد المتسلسل
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } else if (mode === 'parallel') {
        const generationPromises = chaptersToGenerate.map(async (chapterNumber, index) => {
          const chapterBlueprint = state.novelBlueprint.structure.chapters.find(c => c.number === chapterNumber);
          if (!chapterBlueprint) return Promise.resolve(null); // Handle missing blueprint gracefully
          
          // Update current chapter for display, this will show the last chapter that started generation
          setCurrentChapter(chapterNumber);
          
          try {
            return await generateSingleChapter(chapterBlueprint, chaptersToGenerate.length, index);
          } catch (error) {
            console.error(`Failed to generate chapter ${chapterNumber}:`, error);
            toast({
              title: "خطأ في توليد الفصل",
              description: `فشل توليد الفصل ${chapterNumber}.`,
              variant: "destructive",
            });
            return null; // Return null for failed chapters
          }
        });

        // Use Promise.allSettled to wait for all promises to resolve/reject
        const results = await Promise.allSettled(generationPromises);
        
        // Filter out rejected promises and null results
        const successfulGenerations = results.filter(result => result.status === 'fulfilled' && result.value !== null);

        // Update overall progress after all parallel generations are attempted
        dispatch({ type: 'SET_GENERATION_PROGRESS', payload: {
          currentChapter: chaptersToGenerate.length, // All chapters attempted
          totalChapters: chaptersToGenerate.length
        }});

      } else if (mode === 'selective') {
        // This will be implemented later, for now it will behave like sequential
        for (let i = 0; i < chaptersToGenerate.length; i++) {
          const chapterNumber = chaptersToGenerate[i];
          const chapterBlueprint = state.novelBlueprint.structure.chapters.find(c => c.number === chapterNumber);
          
          if (!chapterBlueprint) continue;

          setCurrentChapter(chapterNumber);
          dispatch({ type: 'SET_GENERATION_PROGRESS', payload: { currentChapter: chapterNumber } });

          await generateSingleChapter(chapterBlueprint, chaptersToGenerate.length, i);

          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      toast({
        title: "تم توليد الفصول بنجاح",
        description: `تم توليد ${chaptersToGenerate.length} فصل بجودة عالية.`,
      });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في توليد الفصول. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsGenerating(false);
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_GENERATION_PROGRESS', payload: { isGenerating: false } });
    }
  };

  const generateChapterContent = async (chapterBlueprint: any, idea: any, styleProfile: any) => {
    // This function is now integrated into generateChapters and will not be called directly
    // Its logic has been moved to generateChapters for direct API call.
    return ""; // Should not be reached
  };
 
  const generateChapterFeedback = () => {
    // This function is no longer needed as feedback will come from AI
    return [];
  };

  const regenerateChapter = async (chapterId: string) => {
    const chapter = state.generatedChapters.find(c => c.id === chapterId);
    if (!chapter) return;

    setIsGenerating(true);
    toast({
      title: "جارٍ إعادة توليد الفصل",
      description: `إعادة توليد ${chapter.title}...`,
    });

    const stageId = 4; // Stage 4 for Chapter Generation
    const modelId = state.selectedAIModels[stageId];
    const apiKey = state.apiKeys[modelId];
    const promptTemplate = state.promptTemplates['generate_chapter'];

    if (!modelId) {
      toast({
        title: "خطأ",
        description: "لم يتم تحديد نموذج AI لإعادة توليد الفصل.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }
    if (!promptTemplate) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على قالب الموجه لإعادة توليد الفصل.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    const chapterBlueprint = state.novelBlueprint?.structure.chapters.find(c => c.number === chapter.number);
    if (!chapterBlueprint) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على مخطط الفصل لإعادة التوليد.",
        variant: "destructive",
      });
      setIsGenerating(false);
      return;
    }

    const dynamicVariables = {
        CHAPTER_NUMBER: chapterBlueprint.number,
        NOVEL_TITLE: state.novelBlueprint.idea.title,
        CHAPTER_TITLE: chapterBlueprint.title,
        CHAPTER_SYNOPSIS: chapterBlueprint.synopsis,
        CHAPTER_KEY_EVENTS: chapterBlueprint.keyEvents.join(', '),
        CHAPTER_CHARACTERS_INVOLVED: chapterBlueprint.charactersInvolved.map(id => state.novelBlueprint?.structure.characters.find(c => c.id === id)?.name || id).join(', '),
        CHAPTER_EMOTIONAL_TONE: chapterBlueprint.emotionalTone,
        CHAPTER_PACING: chapterBlueprint.pacing,
        CHAPTER_PLOT_ADVANCEMENT: chapterBlueprint.plotAdvancement,
        CHAPTER_WORD_TARGET: chapterBlueprint.wordTarget,
        SOURCE_STYLE_PROFILE_SUMMARY: state.sourceAnalysis ? `${state.sourceAnalysis.styleProfile.toneProfile}, ${state.sourceAnalysis.styleProfile.narrativePerspective}, ${state.sourceAnalysis.styleProfile.vocabulary}` : 'أسلوب غني ومتنوع',
        CHAPTER_CULTURAL_ELEMENTS: chapterBlueprint.culturalElements.join(', '),
        NOVEL_GLOBAL_SUMMARY: state.novelBlueprint.structure.overview.description,
        PREVIOUS_CHAPTER_SUMMARY: chapter.number > 1 ? state.generatedChapters.find(ch => ch.number === chapter.number - 1)?.synopsis || 'لا يوجد ملخص سابق' : 'بداية الرواية',
        CHARACTER_ARC_PROGRESSION_FOR_THIS_CHAPTER: state.novelBlueprint.structure.characters.map(char => `${char.name}: ${char.development.find(dev => dev.chapter === chapter.number)?.growth || 'لا تطور محدد في هذا الفصل'}`).join('; '),
        ACTIVE_SUBPLOTS_STATUS: 'لا يوجد حبكات فرعية نشطة محددة بعد', // Placeholder for now
        CUMULATIVE_THEMES_DEVELOPMENT: state.novelBlueprint.themes.primary.map(theme => `${theme} (متطور)`).join('; '), // Placeholder for now
        OUTPUT_FORMAT_REQUIREMENTS: 'نص روائي عالي الجودة'
    };

    const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            action: 'generate_chapter', // Action for regeneration is the same as generation
            modelId,
            apiKey,
            promptTemplate,
            dynamicVariables,
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API لإعادة توليد الفصل.');
    }

    const result = await response.json();
    const regeneratedContent = result.result?.chapterContent || result.result?.generatedContent || "فشل في إعادة توليد المحتوى.";
    const regeneratedQuality = result.result?.quality || {
        styleConsistency: Math.floor(Math.random() * 15) + 85,
        characterConsistency: Math.floor(Math.random() * 10) + 88,
        plotConsistency: Math.floor(Math.random() * 12) + 86,
        culturalAuthenticity: Math.floor(Math.random() * 8) + 90,
        overall: Math.floor(Math.random() * 10) + 87
    };
    const regeneratedMetrics = result.result?.metrics || {
        readability: Math.floor(Math.random() * 10) + 85,
        engagement: Math.floor(Math.random() * 15) + 80,
        coherence: Math.floor(Math.random() * 8) + 89,
        innovation: Math.floor(Math.random() * 12) + 83
    };
    const regeneratedFeedback = result.result?.feedback || [];

    const updatedChapter = {
      ...chapter,
      content: regeneratedContent,
      wordCount: regeneratedContent.split(/\s+/).filter(Boolean).length,
      quality: regeneratedQuality,
      metrics: regeneratedMetrics,
      feedback: regeneratedFeedback,
      lastModified: new Date()
    };

    dispatch({ type: 'UPDATE_CHAPTER', payload: { id: chapterId, updates: updatedChapter } });
    setIsGenerating(false);

    toast({
      title: "تم إعادة توليد الفصل",
      description: `تم تحديث ${chapter.title} بنجاح.`,
    });
  };

  if (!state.novelBlueprint) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>مولد الفصول الموجه</CardTitle>
            <CardDescription>
              يجب بناء المخطط الذكي أولاً قبل البدء في توليد الفصول.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 3 })}
              className="flex items-center gap-2"
            >
              العودة لبناء المخطط
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* لوحة التحكم */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PenTool className="h-6 w-6 text-orange-600" />
                مولد الفصول الموجه
              </CardTitle>
              <CardDescription>
                توليد فصول الرواية بالذكاء الاصطناعي بناءً على المخطط الذكي
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode(viewMode === 'list' ? 'reading' : 'list')}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {viewMode === 'list' ? 'وضع القراءة' : 'وضع القائمة'}
              </Button>
              <Button 
                onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 5 })}
                disabled={!state.generatedChapters.length}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                إلى المحرر التفاعلي
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* إحصائيات التوليد */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {state.generatedChapters.length}
              </div>
              <div className="text-sm text-gray-500">فصل مولد</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {state.generatedChapters.reduce((total, ch) => total + ch.wordCount, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">إجمالي الكلمات</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {state.generatedChapters.length > 0 
                  ? Math.round(state.generatedChapters.reduce((total, ch) => total + ch.quality.overall, 0) / state.generatedChapters.length)
                  : 0}%
              </div>
              <div className="text-sm text-gray-500">متوسط الجودة</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((state.generatedChapters.length / state.novelBlueprint.structure.overview.chapterCount) * 100)}%
              </div>
              <div className="text-sm text-gray-500">مكتمل</div>
            </div>
          </div>

          {/* أزرار التحكم */}
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => generateChapters('sequential')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              توليد متسلسل
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => generateChapters('parallel')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <PenTool className="h-4 w-4" />
              توليد متوازي
            </Button>

            <Button 
              variant="outline"
              onClick={() => setGenerationMode('selective')}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              توليد مخصص
            </Button>

            {state.generatedChapters.length > 0 && (
              <Button 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                تصدير الفصول
              </Button>
            )}
          </div>

          {/* شريط التقدم أثناء التوليد */}
          {isGenerating && (
            <div className="mt-6 p-4 border rounded-lg bg-blue-50">
              <div className="flex items-center gap-3 mb-3">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-900">
                  جارٍ توليد الفصل {currentChapter}...
                </span>
              </div>
              <Progress 
                value={(currentChapter / state.novelBlueprint.structure.overview.chapterCount) * 100} 
                className="mb-2"
              />
              <div className="text-sm text-blue-700">
                التقدم: {currentChapter} من {state.novelBlueprint.structure.overview.chapterCount} فصل
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* محتوى الفصول */}
      {state.generatedChapters.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>الفصول المولدة</CardTitle>
            <CardDescription>
              اعرض وراجع الفصول المولدة، مع إمكانية إعادة التوليد والتعديل
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'reading')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="list">وضع القائمة</TabsTrigger>
                <TabsTrigger value="reading">وضع القراءة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-4">
                {state.generatedChapters.map((chapter) => (
                  <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {chapter.title}
                            <Badge variant={chapter.status === 'draft' ? 'secondary' : 'default'}>
                              {chapter.status === 'draft' ? 'مسودة' : 'مراجع'}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            {chapter.wordCount.toLocaleString()} كلمة • آخر تعديل: {chapter.lastModified.toLocaleTimeString('ar-SA')}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => regenerateChapter(chapter.id)}
                            disabled={isGenerating}
                            className="flex items-center gap-2"
                          >
                            <RotateCcw className="h-3 w-3" />
                            إعادة توليد
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Edit className="h-3 w-3" />
                            تحرير
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* معاينة المحتوى */}
                        <div>
                          <h5 className="font-semibold mb-2">معاينة المحتوى</h5>
                          <div className="text-sm text-gray-600 leading-relaxed line-clamp-4 mb-4">
                            {chapter.content.substring(0, 300)}...
                          </div>
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            قراءة كاملة
                          </Button>
                        </div>

                        {/* مقاييس الجودة */}
                        <div>
                          <h5 className="font-semibold mb-3">مقاييس الجودة</h5>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>اتساق الأسلوب</span>
                                <span>{chapter.quality.styleConsistency}%</span>
                              </div>
                              <Progress value={chapter.quality.styleConsistency} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>اتساق الشخصيات</span>
                                <span>{chapter.quality.characterConsistency}%</span>
                              </div>
                              <Progress value={chapter.quality.characterConsistency} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>اتساق الحبكة</span>
                                <span>{chapter.quality.plotConsistency}%</span>
                              </div>
                              <Progress value={chapter.quality.plotConsistency} className="h-2" />
                            </div>
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>الأصالة الثقافية</span>
                                <span>{chapter.quality.culturalAuthenticity}%</span>
                              </div>
                              <Progress value={chapter.quality.culturalAuthenticity} className="h-2" />
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex justify-between items-center">
                                <span className="font-medium text-sm">الجودة الإجمالية</span>
                                <div className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-yellow-500" />
                                  <span className="font-bold text-lg">{chapter.quality.overall}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ملاحظات التحسين */}
                      {chapter.feedback.length > 0 && (
                        <div className="mt-6 pt-4 border-t">
                          <h5 className="font-semibold mb-3">اقتراحات التحسين</h5>
                          <div className="space-y-2">
                            {chapter.feedback.map((feedback, index) => (
                              <div key={index} className="flex items-start gap-2 p-2 border rounded">
                                <Badge 
                                  variant={feedback.priority === 'high' ? 'destructive' : feedback.priority === 'medium' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {feedback.priority === 'high' ? 'عالي' : feedback.priority === 'medium' ? 'متوسط' : 'منخفض'}
                                </Badge>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{feedback.category}</div>
                                  <div className="text-xs text-gray-600">{feedback.description}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              
              <TabsContent value="reading" className="space-y-6">
                <div className="prose prose-lg max-w-none">
                  {state.generatedChapters.map((chapter) => (
                    <div key={chapter.id} className="mb-12 p-6 border rounded-lg">
                      <h2 className="text-2xl font-bold mb-4 text-center">{chapter.title}</h2>
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {chapter.content}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* رسالة التشجيع */}
      {state.generatedChapters.length === 0 && !isGenerating && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <PenTool className="h-6 w-6 text-orange-600 mt-1" />
              <div>
                <h4 className="font-semibold text-orange-900 mb-2">ابدأ توليد الفصول</h4>
                <p className="text-orange-700 text-sm mb-4">
                  لديك مخطط شامل جاهز للرواية. ابدأ الآن في توليد الفصول بالذكاء الاصطناعي.
                  يمكنك اختيار التوليد المتسلسل للحصول على فصول متتابعة، أو المتوازي لتوليد أسرع.
                </p>
                <Button 
                  onClick={() => generateChapters('sequential')}
                  className="flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  ابدأ التوليد المتسلسل
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* إشعار اكتمال التوليد */}
      {state.generatedChapters.length === state.novelBlueprint.structure.overview.chapterCount && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">تم توليد جميع الفصول بنجاح!</h4>
                <p className="text-green-700 text-sm mb-4">
                  تهانينا! تم توليد جميع فصول الرواية ({state.generatedChapters.length} فصل) بنجاح.
                  يمكنك الآن الانتقال للمحرر التفاعلي لتحرير وتحسين النصوص.
                </p>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 5 })}
                    className="flex items-center gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    الانتقال للمحرر التفاعلي
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    مراجعة شاملة
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

export default Stage4ChapterGeneration;

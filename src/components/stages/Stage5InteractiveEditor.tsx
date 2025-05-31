import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import {
  Edit3,
  Save,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Users,
  Palette,
  Wand2,
  MessageSquare,
  BarChart3,
  Settings,
  Eye,
  ArrowLeft,
  ArrowUp,
  Lightbulb,
  AlertTriangle,
  Star
} from 'lucide-react';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import { toast } from '@/hooks/use-toast';
import type Quill from 'quill'; // Import Quill type for reference

const Stage5InteractiveEditor: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [editingContent, setEditingContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCheckingGrammar, setIsCheckingGrammar] = useState(false);
  const [sidebarView, setSidebarView] = useState<'suggestions' | 'characters' | 'consistency'>('suggestions');
  const quillRef = useRef<ReactQuill>(null); // Ref for ReactQuill

  const currentChapter = state.generatedChapters[currentChapterIndex];

  useEffect(() => {
    if (currentChapter) {
      setEditingContent(currentChapter.content);
      dispatch({ type: 'SET_CURRENT_EDITING_CHAPTER', payload: currentChapter.number });
    }
  }, [currentChapter, dispatch]);

  const saveChapter = async () => {
    if (!currentChapter) return;

    const updatedChapter = {
      ...currentChapter,
      content: editingContent,
      status: 'edited' as const,
      lastModified: new Date(),
      wordCount: editingContent.split(/\s+/).length
    };

    dispatch({ type: 'UPDATE_CHAPTER', payload: { id: currentChapter.id, updates: updatedChapter } });
    
    toast({
      title: "تم حفظ الفصل",
      description: `تم حفظ ${currentChapter.title} بنجاح.`,
    });
  };

  const analyzeText = async () => {
    if (!currentChapter || !state.novelBlueprint || !state.sourceAnalysis) {
      toast({ title: "خطأ", description: "بيانات غير مكتملة للتحليل.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    try {
      const stageId = 5; // Stage 5 for Interactive Editor (enhance_text, enhance_dialogue, analyze_text)
      const modelId = state.selectedAIModels[stageId];
      const apiKey = state.apiKeys[modelId];
      const promptTemplate = state.promptTemplates['analyze_text'];

      if (!modelId || !promptTemplate) {
        throw new Error("لم يتم تحديد نموذج AI أو قالب موجه للتحليل.");
      }

      const dynamicVariables = {
        CURRENT_CHAPTER_CONTENT: editingContent,
        NOVEL_GLOBAL_SUMMARY: state.novelBlueprint.structure.overview.description,
        NOVEL_BLUEPRINT: JSON.stringify(state.novelBlueprint.structure.plotStructure),
        CHARACTER_PROFILES: JSON.stringify(state.novelBlueprint.structure.characters),
        PREVIOUS_CHAPTER_SUMMARY: currentChapter.number > 1 ? state.generatedChapters.find(ch => ch.number === currentChapter.number - 1)?.synopsis || 'لا يوجد ملخص سابق' : 'بداية الرواية',
        CURRENT_CHAPTER_SYNOPSIS: currentChapter.synopsis,
        SOURCE_STYLE_PROFILE_SUMMARY: state.sourceAnalysis ? `${state.sourceAnalysis.styleProfile.toneProfile}, ${state.sourceAnalysis.styleProfile.narrativePerspective}, ${state.sourceAnalysis.styleProfile.vocabulary}` : 'أسلوب غني ومتنوع',
      };

      const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze_text',
          modelId,
          apiKey,
          promptTemplate,
          dynamicVariables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API للتحليل.');
      }

      const result = await response.json();
      const newSuggestions = result.result?.suggestions || []; // Assuming backend returns { suggestions: [...] }

      if (currentChapter) {
        dispatch({
          type: 'UPDATE_CHAPTER',
          payload: {
            id: currentChapter.id,
            updates: {
              feedback: [...currentChapter.feedback, ...newSuggestions]
            }
          }
        });
      }
      toast({ title: "تم تحليل النص", description: "تم إضافة اقتراحات جديدة للتحسين." });
    } catch (error: any) {
      toast({ title: "خطأ في التحليل", description: error.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSelectedTextFromQuill = (): string => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const selection = editor.getSelection();
      if (selection && selection.length > 0) {
        return editor.getText(selection.index, selection.length);
      }
    }
    return '';
  };

  const expandText = async () => {
    const selectedText = getSelectedTextFromQuill();
    if (!selectedText.trim() || !currentChapter || !state.novelBlueprint) {
      toast({ title: "خطأ", description: "يرجى تحديد النص المراد توسيعه وتوفر بيانات الفصل والمخطط.", variant: "destructive" });
      return;
    }
    try {
      const stageId = 5; // Stage 5 for Interactive Editor
      const modelId = state.selectedAIModels[stageId];
      const apiKey = state.apiKeys[modelId];
      const promptTemplate = state.promptTemplates['enhance_text'];

      if (!modelId || !promptTemplate) {
        throw new Error("لم يتم تحديد نموذج AI أو قالب موجه لتوسيع النص.");
      }

      const dynamicVariables = {
        SELECTED_TEXT_TO_ENHANCE: selectedText,
        CURRENT_CHAPTER_CONTENT: editingContent,
        NOVEL_GLOBAL_SUMMARY: state.novelBlueprint.structure.overview.description,
        CURRENT_CHAPTER_SYNOPSIS: currentChapter.synopsis,
        // Add more context as needed for better expansion
      };

      const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance_text',
          modelId,
          apiKey,
          promptTemplate,
          dynamicVariables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API لتوسيع النص.');
      }

      const result = await response.json();
      const enhancedText = result.result?.enhancedContent || result.result?.generatedContent || selectedText; // Assuming backend returns { enhancedContent: "..." }

      const newContent = editingContent.replace(selectedText, enhancedText);
      setEditingContent(newContent);
      toast({ title: "تم توسيع النص", description: "تم إضافة المزيد من التفاصيل للنص المحدد." });
    } catch (error: any) {
      toast({ title: "خطأ في توسيع النص", description: error.message, variant: "destructive" });
    }
  };

  const checkConsistency = async () => {
    if (!currentChapter || !state.novelBlueprint || !state.sourceAnalysis) {
      toast({ title: "خطأ", description: "بيانات غير مكتملة لفحص الاتساق.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    try {
      const stageId = 6; // Stage 6 for Final Review (check_consistency)
      const modelId = state.selectedAIModels[stageId];
      const apiKey = state.apiKeys[modelId];
      const promptTemplate = state.promptTemplates['check_consistency'];

      if (!modelId || !promptTemplate) {
        throw new Error("لم يتم تحديد نموذج AI أو قالب موجه لفحص الاتساق.");
      }

      const dynamicVariables = {
        CURRENT_CHAPTER_CONTENT: editingContent,
        NOVEL_GLOBAL_SUMMARY: state.novelBlueprint.structure.overview.description,
        NOVEL_BLUEPRINT: JSON.stringify(state.novelBlueprint.structure.plotStructure),
        CHARACTER_PROFILES: JSON.stringify(state.novelBlueprint.structure.characters),
        ALL_GENERATED_CHAPTERS_SUMMARIES: JSON.stringify(state.generatedChapters.map(ch => ({ number: ch.number, synopsis: ch.synopsis }))),
        SOURCE_STYLE_PROFILE_SUMMARY: state.sourceAnalysis ? `${state.sourceAnalysis.styleProfile.toneProfile}, ${state.sourceAnalysis.styleProfile.narrativePerspective}, ${state.sourceAnalysis.styleProfile.vocabulary}` : 'أسلوب غني ومتنوع',
      };

      const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'check_consistency',
          modelId,
          apiKey,
          promptTemplate,
          dynamicVariables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API لفحص الاتساق.');
      }

      const result = await response.json();
      const consistencyReport = result.result?.consistencyReport || {
        styleConsistency: 'متسق',
        characterConsistency: 'متسق',
        plotConsistency: 'متسق',
        issues: []
      }; // Assuming backend returns { consistencyReport: {...} }

      // You might want to store this report in state or display it directly
      toast({
        title: "تم فحص الاتساق",
        description: consistencyReport.issues.length > 0 ? `تم العثور على ${consistencyReport.issues.length} مشكلة اتساق.` : "لم يتم العثور على تناقضات.",
      });
    } catch (error: any) {
      toast({ title: "خطأ في فحص الاتساق", description: error.message, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const enhanceDialogue = async () => {
    if (!currentChapter || !state.novelBlueprint) {
      toast({ title: "خطأ", description: "بيانات غير مكتملة لتحسين الحوار.", variant: "destructive" });
      return;
    }
    try {
      const stageId = 5; // Stage 5 for Interactive Editor
      const modelId = state.selectedAIModels[stageId];
      const apiKey = state.apiKeys[modelId];
      const promptTemplate = state.promptTemplates['enhance_dialogue'];

      if (!modelId || !promptTemplate) {
        throw new Error("لم يتم تحديد نموذج AI أو قالب موجه لتحسين الحوار.");
      }

      const dynamicVariables = {
        CURRENT_CHAPTER_CONTENT: editingContent,
        NOVEL_GLOBAL_SUMMARY: state.novelBlueprint.structure.overview.description,
        CHARACTER_PROFILES: JSON.stringify(state.novelBlueprint.structure.characters),
        // Add more context as needed for better dialogue enhancement
      };

      const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance_dialogue',
          modelId,
          apiKey,
          promptTemplate,
          dynamicVariables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API لتحسين الحوار.');
      }

      const result = await response.json();
      const enhancedContent = result.result?.enhancedContent || result.result?.generatedContent || editingContent; // Assuming backend returns { enhancedContent: "..." }

      setEditingContent(enhancedContent);
      toast({ title: "تم تحسين الحوار", description: "تم إضافة تفاصيل وصفية للحوارات." });
    } catch (error: any) {
      toast({ title: "خطأ في تحسين الحوار", description: error.message, variant: "destructive" });
    }
  };
 
  const checkGrammarAndStyle = async () => {
    if (!currentChapter || !state.novelBlueprint) {
      toast({ title: "خطأ", description: "بيانات غير مكتملة للتدقيق اللغوي والأسلوبي.", variant: "destructive" });
      return;
    }
    setIsCheckingGrammar(true);
    try {
      const stageId = 5; // Stage 5 for Interactive Editor
      const modelId = state.selectedAIModels[stageId];
      const apiKey = state.apiKeys[modelId];
      const promptTemplate = state.promptTemplates['grammar_style_check']; // Assuming a new prompt template for this
 
      if (!modelId || !promptTemplate) {
        throw new Error("لم يتم تحديد نموذج AI أو قالب موجه للتدقيق اللغوي والأسلوبي.");
      }
 
      const dynamicVariables = {
        CURRENT_CHAPTER_CONTENT: editingContent,
        NOVEL_GLOBAL_SUMMARY: state.novelBlueprint.structure.overview.description,
        SOURCE_STYLE_PROFILE_SUMMARY: state.sourceAnalysis ? `${state.sourceAnalysis.styleProfile.toneProfile}, ${state.sourceAnalysis.styleProfile.narrativePerspective}, ${state.sourceAnalysis.styleProfile.vocabulary}` : 'أسلوب غني ومتنوع',
      };
 
      const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grammar_style_check',
          modelId,
          apiKey,
          promptTemplate,
          dynamicVariables,
        }),
      });
 
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API للتدقيق اللغوي والأسلوبي.');
      }
 
      const result = await response.json();
      const grammarStyleFeedback = result.result?.feedback || []; // Assuming backend returns { feedback: [...] }
 
      if (currentChapter) {
        dispatch({
          type: 'UPDATE_CHAPTER',
          payload: {
            id: currentChapter.id,
            updates: {
              feedback: [...currentChapter.feedback, ...grammarStyleFeedback]
            }
          }
        });
      }
      toast({ title: "تم التدقيق اللغوي والأسلوبي", description: "تم إضافة اقتراحات للتحسين اللغوي والأسلوبي." });
    } catch (error: any) {
      toast({ title: "خطأ في التدقيق اللغوي والأسلوبي", description: error.message, variant: "destructive" });
    } finally {
      setIsCheckingGrammar(false);
    }
  };
 
   const navigateChapter = (direction: 'prev' | 'next') => {
     if (direction === 'prev' && currentChapterIndex > 0) {
       setCurrentChapterIndex(currentChapterIndex - 1);
     } else if (direction === 'next' && currentChapterIndex < state.generatedChapters.length - 1) {
       setCurrentChapterIndex(currentChapterIndex + 1);
     }
   };

  if (!state.generatedChapters.length) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>المحرر التفاعلي المتقدم</CardTitle>
            <CardDescription>
              لا توجد فصول مولدة للتحرير. يجب توليد الفصول أولاً من المرحلة السابقة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 4 })}
              className="flex items-center gap-2"
            >
              العودة لتوليد الفصول
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* شريط التنقل العلوي */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-indigo-600" />
                المحرر التفاعلي المتقدم
              </CardTitle>
              <CardDescription>
                تحرير وتحسين الفصول بأدوات ذكية متقدمة
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={saveChapter}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                حفظ
              </Button>
              <Button 
                onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 6 })}
                disabled={!state.generatedChapters.some(ch => ch.status === 'edited')}
                className="flex items-center gap-2"
              >
                <ArrowRight className="h-4 w-4" />
                إلى المراجعة النهائية
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* تنقل الفصول */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateChapter('prev')}
              disabled={currentChapterIndex === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              الفصل السابق
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold">{currentChapter?.title}</h3>
              <p className="text-sm text-gray-600">
                الفصل {currentChapterIndex + 1} من {state.generatedChapters.length}
              </p>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigateChapter('next')}
              disabled={currentChapterIndex === state.generatedChapters.length - 1}
              className="flex items-center gap-2"
            >
              الفصل التالي
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded">
              <div className="text-lg font-bold text-blue-600">
                {editingContent.split(/\s+/).length}
              </div>
              <div className="text-xs text-gray-500">كلمة</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-lg font-bold text-green-600">
                {currentChapter?.quality.overall || 0}%
              </div>
              <div className="text-xs text-gray-500">جودة</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-lg font-bold text-purple-600">
                {currentChapter?.feedback.length || 0}
              </div>
              <div className="text-xs text-gray-500">اقتراح</div>
            </div>
            <div className="text-center p-3 border rounded">
              <div className="text-lg font-bold text-orange-600">
                {currentChapter?.status === 'edited' ? '✓' : '○'}
              </div>
              <div className="text-xs text-gray-500">
                {currentChapter?.status === 'edited' ? 'محرر' : 'مسودة'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* منطقة التحرير الرئيسية */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* المحرر */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">محرر النصوص</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={analyzeText}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <BarChart3 className="h-3 w-3" />
                    )}
                    تحليل النص
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={checkConsistency}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-3 w-3" />
                    فحص الاتساق
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* أدوات التحرير السريع */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={enhanceDialogue}
                    className="flex items-center gap-2"
                  >
                    <MessageSquare className="h-3 w-3" />
                    تحسين الحوار
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={expandText} // Call with no arguments, function will get selected text
                    className="flex items-center gap-2"
                  >
                    <Wand2 className="h-3 w-3" />
                    توسيع النص
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkGrammarAndStyle} // Keep this one for style/grammar check
                    disabled={isCheckingGrammar}
                    className="flex items-center gap-2"
                  >
                    {isCheckingGrammar ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Palette className="h-3 w-3" />
                    )}
                    فحص الأسلوب
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={analyzeText} // Use analyzeText for more general text analysis/suggestions
                    disabled={isCheckingGrammar}
                    className="flex items-center gap-2"
                  >
                    {isCheckingGrammar ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Lightbulb className="h-3 w-3" />
                    )}
                    تدقيق لغوي
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Users className="h-3 w-3" />
                    تطوير الشخصيات
                  </Button>
                </div>

                {/* منطقة التحرير */}
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editingContent}
                  onChange={setEditingContent}
                  className="min-h-[500px] font-arabic text-lg leading-relaxed"
                  placeholder="ابدأ الكتابة هنا أو قم بتوليد الفصول..."
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      [{ 'indent': '-1' }, { 'indent': '+1' }],
                      ['link', 'image'],
                      ['clean']
                    ],
                  }}
                />

                {/* إحصائيات التحرير */}
                <div className="flex justify-between text-sm text-gray-600 p-3 bg-gray-50 rounded">
                  <span>الكلمات: {editingContent.split(/\s+/).length}</span>
                  <span>الأحرف: {editingContent.length}</span>
                  <span>الفقرات: {editingContent.split('\n\n').length}</span>
                  <span>
                    آخر حفظ: {currentChapter?.lastModified.toLocaleTimeString('ar-SA') || 'لم يتم الحفظ'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* اللوحة الجانبية */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">مساعدة التحرير</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={sidebarView} onValueChange={(value) => setSidebarView(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="suggestions" className="text-xs">اقتراحات</TabsTrigger>
                  <TabsTrigger value="characters" className="text-xs">شخصيات</TabsTrigger>
                  <TabsTrigger value="consistency" className="text-xs">اتساق</TabsTrigger>
                </TabsList>
                
                <TabsContent value="suggestions" className="space-y-3">
                  <h5 className="font-semibold text-sm mb-3">اقتراحات التحسين</h5>
                  {currentChapter?.feedback.map((feedback, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        {feedback.type === 'suggestion' ? (
                          <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                        ) : feedback.type === 'improvement' ? (
                          <ArrowUp className="h-4 w-4 text-blue-600 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{feedback.category}</span>
                            <Badge 
                              variant={feedback.priority === 'high' ? 'destructive' : feedback.priority === 'medium' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {feedback.priority === 'high' ? 'عالي' : feedback.priority === 'medium' ? 'متوسط' : 'منخفض'}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600">{feedback.description}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs">
                        تطبيق الاقتراح
                      </Button>
                    </div>
                  ))}
                  
                  {(!currentChapter?.feedback.length) && (
                    <div className="text-center py-6 text-gray-500">
                      <Lightbulb className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">لا توجد اقتراحات حالياً</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={analyzeText}
                        className="mt-2"
                      >
                        تحليل النص
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="characters" className="space-y-3">
                  <h5 className="font-semibold text-sm mb-3">دليل الشخصيات</h5>
                  {state.novelBlueprint?.structure.characters.map((character) => (
                    <div key={character.id} className="p-3 border rounded-lg">
                      <h6 className="font-medium text-sm mb-1">{character.name}</h6>
                      <p className="text-xs text-gray-600 mb-2">{character.role}</p>
                      <div className="space-y-1">
                        <div className="text-xs">
                          <span className="font-medium">الصوت:</span> {character.voice}
                        </div>
                        <div className="text-xs">
                          <span className="font-medium">الحوار:</span> {character.dialogue_style}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {character.personality.slice(0, 3).map((trait, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="consistency" className="space-y-3">
                  <h5 className="font-semibold text-sm mb-3">فحص الاتساق</h5>
                  
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">اتساق الأسلوب</span>
                        <span className="text-sm text-green-600">✓</span>
                      </div>
                      <p className="text-xs text-gray-600">الأسلوب متسق مع الرواية المصدر</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">اتساق الشخصيات</span>
                        <span className="text-sm text-green-600">✓</span>
                      </div>
                      <p className="text-xs text-gray-600">الشخصيات تتصرف بشكل متسق</p>
                    </div>
                    
                    <div className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">اتساق الحبكة</span>
                        <span className="text-sm text-yellow-600">⚠</span>
                      </div>
                      <p className="text-xs text-gray-600">تحتاج مراجعة طفيفة في الترابط</p>
                      <Button variant="outline" size="sm" className="w-full mt-2 text-xs">
                        عرض التفاصيل
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={checkConsistency}
                    disabled={isAnalyzing}
                    className="w-full"
                  >
                    {isAnalyzing ? (
                      <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                    ) : (
                      <CheckCircle className="h-3 w-3 mr-2" />
                    )}
                    فحص شامل
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* تقدم التحرير */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">تقدم التحرير</CardTitle>
          <CardDescription>
            حالة تحرير الفصول ومؤشرات الجودة الإجمالية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold mb-3">حالة الفصول</h5>
              <div className="space-y-2">
                {state.generatedChapters.map((chapter, index) => (
                  <div 
                    key={chapter.id} 
                    className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                      index === currentChapterIndex ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setCurrentChapterIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        chapter.status === 'edited' ? 'bg-green-500' : 'bg-gray-300'
                      }`} />
                      <span className="text-sm font-medium">{chapter.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={chapter.status === 'edited' ? 'default' : 'secondary'} className="text-xs">
                        {chapter.status === 'edited' ? 'محرر' : 'مسودة'}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span className="text-xs">{chapter.quality.overall}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-semibold mb-3">إحصائيات الجودة</h5>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>الفصول المحررة</span>
                    <span>{state.generatedChapters.filter(ch => ch.status === 'edited').length} / {state.generatedChapters.length}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ 
                        width: `${(state.generatedChapters.filter(ch => ch.status === 'edited').length / state.generatedChapters.length) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>متوسط الجودة</span>
                    <span>
                      {Math.round(
                        state.generatedChapters.reduce((total, ch) => total + ch.quality.overall, 0) / 
                        state.generatedChapters.length
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.round(
                          state.generatedChapters.reduce((total, ch) => total + ch.quality.overall, 0) / 
                          state.generatedChapters.length
                        )}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>إجمالي الكلمات</span>
                    <span>{state.generatedChapters.reduce((total, ch) => total + ch.wordCount, 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* إشعار إكمال التحرير */}
      {state.generatedChapters.every(ch => ch.status === 'edited') && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
              <div>
                <h4 className="font-semibold text-green-900 mb-2">تم الانتهاء من تحرير جميع الفصول!</h4>
                <p className="text-green-700 text-sm mb-4">
                  تهانينا! تم تحرير ومراجعة جميع فصول الرواية بنجاح. 
                  يمكنك الآن الانتقال للمرحلة النهائية للمراجعة الشاملة والتصدير.
                </p>
                <Button 
                  onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 6 })}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  الانتقال للمراجعة النهائية
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Stage5InteractiveEditor;

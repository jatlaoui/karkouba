import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload,
  Brain,
  Target,
  FileText,
  PenTool,
  Edit3,
  Download,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  BookOpen,
  Users,
  Palette,
  BarChart3,
  AlertTriangle,
  Star,
  Settings,
  Eye,
  Copy,
  Save,
  Share,
  Home,
  X, // Import X for DialogClose
  ChevronLeft,
  SlidersHorizontal // New import
} from 'lucide-react';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import StartingChoices from './StartingChoices';
import AIModelConfigurator from './AIModelConfigurator'; // New import
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'; // Import Dialog components
import { aiModels } from './sharedModels'; // Import shared aiModels
import Stage1SourceAnalysis from './stages/Stage1SourceAnalysis';
import Stage2IdeaLab from './stages/Stage2IdeaLab';
import Stage3BlueprintBuilder from './stages/Stage3BlueprintBuilder';
import Stage4ChapterGeneration from './stages/Stage4ChapterGeneration';
import Stage5InteractiveEditor from './stages/Stage5InteractiveEditor';
import Stage6FinalReview from './stages/Stage6FinalReview';

type JourneyMode = 'start' | 'analyze' | 'new' | 'continue';

const AIWritingJourneyWorkflow: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [activeStage, setActiveStage] = useState(state.currentStage);
  const [journeyMode, setJourneyMode] = useState<JourneyMode>('start');
  const [showAIModelConfigurator, setShowAIModelConfigurator] = useState(false); // New state

  // معالجة اختيار المستخدم
  const handleStartingChoice = (choice: 'analyze' | 'new' | 'continue') => {
    setJourneyMode(choice);
    
    switch (choice) {
      case 'analyze':
        // بدء من المرحلة الأولى (تحليل المصدر)
        dispatch({ type: 'SET_CURRENT_STAGE', payload: 1 });
        setActiveStage(1);
        break;
      case 'new':
        // بدء من المرحلة الثانية (معمل الأفكار)
        dispatch({ type: 'SET_CURRENT_STAGE', payload: 2 });
        setActiveStage(2);
        break;
      case 'continue':
        // عرض المشاريع المحفوظة (سيتم تطويره لاحقاً)
        // حالياً ننتقل للمرحلة الحالية
        setActiveStage(state.currentStage);
        break;
    }
  };

  // العودة للشاشة الرئيسية
  const handleBackToStart = () => {
    setJourneyMode('start');
  };

  // تحديد المراحل المتاحة بناءً على الاختيار
  const getAvailableStages = () => {
    switch (journeyMode) {
      case 'analyze':
        return [1, 2, 3, 4, 5, 6]; // جميع المراحل
      case 'new':
        return [2, 3, 4, 5, 6]; // بدء من معمل الأفكار
      case 'continue':
        return [1, 2, 3, 4, 5, 6]; // جميع المراحل
      default:
        return [];
    }
  };

  const stages = [
    {
      id: 1,
      title: 'تحليل الرواية المصدر',
      description: 'تحليل عميق للأسلوب والبنية والشخصيات',
      icon: Brain,
      color: 'bg-blue-500',
      completed: !!state.sourceAnalysis,
      component: Stage1SourceAnalysis
    },
    {
      id: 2,
      title: 'معمل الأفكار المحسن',
      description: 'توليد أفكار مبدعة مبنية على التحليل',
      icon: Target,
      color: 'bg-green-500',
      completed: !!state.selectedIdea,
      component: Stage2IdeaLab
    },
    {
      id: 3,
      title: 'باني المخطط الذكي',
      description: 'بناء مخطط شامل للرواية الجديدة',
      icon: FileText,
      color: 'bg-purple-500',
      completed: !!state.novelBlueprint,
      component: Stage3BlueprintBuilder
    },
    {
      id: 4,
      title: 'مولد الفصول الموجه',
      description: 'توليد الفصول بالذكاء الاصطناعي',
      icon: PenTool,
      color: 'bg-orange-500',
      completed: state.generatedChapters.length > 0,
      component: Stage4ChapterGeneration
    },
    {
      id: 5,
      title: 'المحرر التفاعلي المتقدم',
      description: 'تحرير وتحسين الفصول بأدوات ذكية',
      icon: Edit3,
      color: 'bg-indigo-500',
      completed: state.generatedChapters.some(ch => ch.status === 'edited'),
      component: Stage5InteractiveEditor
    },
    {
      id: 6,
      title: 'التنقيح والتصدير النهائي',
      description: 'مراجعة نهائية وتصدير المشروع',
      icon: Download,
      color: 'bg-pink-500',
      completed: !!state.finalProject,
      component: Stage6FinalReview
    }
  ];

  const currentStageData = stages.find(stage => stage.id === activeStage);
  const ActiveStageComponent = currentStageData?.component;

  const calculateOverallProgress = () => {
    const availableStageIds = getAvailableStages();
    const availableStages = stages.filter(stage => availableStageIds.includes(stage.id));
    const completedStages = availableStages.filter(stage => stage.completed).length;
    return Math.round((completedStages / availableStages.length) * 100);
  };

  const goToStage = (stageId: number) => {
    setActiveStage(stageId);
    dispatch({ type: 'SET_CURRENT_STAGE', payload: stageId });
  };

  const goToNextStage = () => {
    const availableStageIds = getAvailableStages();
    const currentIndex = availableStageIds.indexOf(activeStage);
    if (currentIndex >= 0 && currentIndex < availableStageIds.length - 1) {
      const nextStageId = availableStageIds[currentIndex + 1];
      goToStage(nextStageId);
    }
  };

  const goToPreviousStage = () => {
    const availableStageIds = getAvailableStages();
    const currentIndex = availableStageIds.indexOf(activeStage);
    if (currentIndex > 0) {
      const previousStageId = availableStageIds[currentIndex - 1];
      goToStage(previousStageId);
    }
  };

  // إذا كان المستخدم في المرحلة الأولى، عرض الخيارات
  if (journeyMode === 'start') {
    return <StartingChoices onChoice={handleStartingChoice} />;
  }

  // تصفية المراحل المتاحة
  const availableStageIds = getAvailableStages();
  const availableStages = stages.filter(stage => availableStageIds.includes(stage.id));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* زر العودة للرئيسية */}
      <div className="mb-6 flex justify-between items-center"> {/* Add flex and justify-between here */}
        <Button
          variant="outline"
          onClick={handleBackToStart}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
          العودة للخيارات الرئيسية
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAIModelConfigurator(true)} // Button to open configurator
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <SlidersHorizontal className="h-4 w-4" />
          إعدادات نماذج الذكاء الاصطناعي
        </Button>
      </div>

      {/* AI Model Configurator Dialog */}
      {showAIModelConfigurator && (
        <Dialog open={showAIModelConfigurator} onOpenChange={setShowAIModelConfigurator}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col"> {/* Adjust max-width and height as needed */}
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-6 w-6" />
                إعدادات نماذج الذكاء الاصطناعي
              </DialogTitle>
              <DialogDescription>
                قم بتخصيص النماذج ومفاتيح الـ API والقوالب لكل مرحلة.
              </DialogDescription>
              <Button variant="ghost" size="sm" className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" onClick={() => setShowAIModelConfigurator(false)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <AIModelConfigurator />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* شريط التقدم العام */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                  رحلة الكتابة الذكية
                </CardTitle>
                <CardDescription>
                  تقدمك في المراحل الست للكتابة الذكية
                </CardDescription>
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-purple-600">
                  {calculateOverallProgress()}%
                </div>
                <div className="text-sm text-gray-500">مكتمل</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={calculateOverallProgress()} className="mb-4" />
            <div className={`grid gap-2 ${availableStages.length <= 3 ? 'grid-cols-3' : availableStages.length <= 4 ? 'grid-cols-4' : availableStages.length <= 5 ? 'grid-cols-5' : 'grid-cols-6'}`}>
              {availableStages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <button
                    key={stage.id}
                    onClick={() => goToStage(stage.id)}
                    className={`relative p-3 rounded-lg border transition-all ${
                      activeStage === stage.id
                        ? 'border-purple-500 bg-purple-50'
                        : stage.completed
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activeStage === stage.id
                          ? 'bg-purple-500 text-white'
                          : stage.completed
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {stage.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                      </div>
                      <div className="text-xs font-medium text-center">
                        {stage.title}
                      </div>
                      {activeStage === stage.id && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-purple-500 rounded-full" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* المرحلة النشطة */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {currentStageData && (
                  <>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${currentStageData.color} text-white`}>
                      <currentStageData.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle>
                        المرحلة {activeStage}: {currentStageData.title}
                      </CardTitle>
                      <CardDescription>
                        {currentStageData.description}
                      </CardDescription>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {state.selectedAIModels[activeStage] && ( // Conditionally render based on selection
                  <Badge variant="outline" className="text-xs flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    {/* Find the model name from the aiModels array (assuming it's available here or passed down) */}
                    {aiModels.find(m => m.id === state.selectedAIModels[activeStage])?.name || 'نموذج افتراضي'}
                  </Badge>
                )}
                <Badge variant={currentStageData?.completed ? 'default' : 'secondary'}>
                  {currentStageData?.completed ? 'مكتملة' : 'جارية'}
                </Badge>
                {state.isLoading && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">جارٍ المعالجة...</span>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {ActiveStageComponent && <ActiveStageComponent />}
          </CardContent>
        </Card>
      </div>

      {/* أزرار التنقل */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goToPreviousStage}
          disabled={availableStages.findIndex(s => s.id === activeStage) === 0}
          className="flex items-center gap-2"
        >
          المرحلة السابقة
        </Button>

        <div className="flex items-center gap-4">
          {state.lastSaved && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Save className="h-4 w-4" />
              آخر حفظ: {state.lastSaved.toLocaleTimeString('ar-SA')}
            </div>
          )}
          
          <Button
            onClick={() => dispatch({ type: 'SAVE_PROJECT' })}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            حفظ
          </Button>
        </div>

        <Button
          onClick={goToNextStage}
          disabled={availableStages.findIndex(s => s.id === activeStage) === availableStages.length - 1 || !currentStageData?.completed}
          className="flex items-center gap-2"
        >
          المرحلة التالية
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* ملاحظات وتعليمات */}
      {activeStage === 1 && !state.sourceAnalysis && (
        <div className="mt-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Brain className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">ابدأ بتحليل رواية مصدر</h4>
                  <p className="text-blue-700 text-sm mb-4">
                    ارفع ملف نصي لرواية عربية ليقوم النظام بتحليل أسلوبها وبنيتها. 
                    هذا التحليل سيكون الأساس لتوليد الرواية الجديدة.
                  </p>
                  <ul className="text-blue-600 text-sm space-y-1">
                    <li>• اختر رواية غنية بالأسلوب والعمق الثقافي</li>
                    <li>• تأكد من جودة النص وخلوه من الأخطاء</li>
                    <li>• يفضل أن تكون الرواية أكثر من 30,000 كلمة</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {state.error && (
        <div className="mt-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-600 mt-1" />
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">حدث خطأ</h4>
                  <p className="text-red-700 text-sm">{state.error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AIWritingJourneyWorkflow;

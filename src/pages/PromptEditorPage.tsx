import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { BookOpen, Sparkles, Save, RotateCcw, Variable, Lightbulb, CheckCircle } from 'lucide-react';
import { useAIWritingJourney } from '../context/AIWritingJourneyContext';
import { toast } from '../hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';

// Define the AI tasks and their available variables
const aiTasks = [
  {
    id: 'analyze_source',
    name: 'تحليل الرواية المصدر',
    description: 'تخصيص الموجه لتحليل الروايات المرفوعة. يمكن أن يؤثر على عمق وجودة التحليل.',
    variables: ['SOURCE_CONTENT_PREVIEW'],
    defaultTemplate: `حلل الرواية المصدر التالية وقدم تقريراً مفصلاً عن أسلوبها السردي، بنية الجمل، نبرة الصوت، الشخصيات الرئيسية، الحبكة، المواضيع، والعناصر الثقافية. يرجى إرجاع النتائج بتنسيق JSON.
النص:
[SOURCE_CONTENT_PREVIEW]`
  },
  {
    id: 'generate_idea',
    name: 'توليد الأفكار',
    description: 'تخصيص الموجه لتوليد أفكار روايات جديدة. تحكم في إبداع واتساع الأفكار المقترحة.',
    variables: ['SOURCE_STYLE_SUMMARY', 'SOURCE_CULTURAL_ELEMENTS'],
    defaultTemplate: `بناءً على تحليل الأسلوب والثقافة من الرواية المصدر، ولد 5 أفكار لروايات عربية جديدة. كل فكرة يجب أن تتضمن: عنوان، نوع، مكان وزمان، شخصية رئيسية، صراع، ثيمة، ملخص، عناصر فريدة، سياق ثقافي، وعدد فصول مقدر (بين 10 و 15 فصل). قدم الأفكار بتنسيق JSON.
تحليل الأسلوب: [SOURCE_STYLE_SUMMARY]
العناصر الثقافية: [SOURCE_CULTURAL_ELEMENTS]`
  },
  {
    id: 'build_blueprint',
    name: 'بناء المخطط',
    description: 'تخصيص الموجه لبناء مخطط تفصيلي للرواية. يمكن أن يؤثر على عمق وتفصيل المخطط.',
    variables: ['SELECTED_IDEA_DETAILS'],
    defaultTemplate: `قم ببناء مخطط تفصيلي لرواية جديدة بناءً على الفكرة المختارة. يجب أن يشمل المخطط: نظرة عامة (العنوان، النوع، الطول المستهدف، الفصول المقدرة، الثيمات، النبرة، المكان والزمان)، هيكل الحبكة (بنية الأفعال، النقاط المحورية، الإيقاع، الذروة، الحل)، قائمة بالشخصيات الرئيسية (الاسم، الدور، العمر، الوصف، الخلفية، السمات، الدوافع، التطور، الصوت، أسلوب الحوار)، ومخططات موجزة لكل فصل (العنوان، الملخص، الأحداث الرئيسية، الشخصيات المشاركة، النبرة العاطفية، الإيقاع، العناصر الثقافية، الثيمات، تقدم الحبكة، الهدف الكلمات). قدم المخطط بتنسيق JSON.
الفكرة المختارة: [SELECTED_IDEA_DETAILS]`
  },
  {
    id: 'generate_chapter',
    name: 'توليد الفصول',
    description: 'تخصيص الموجه لتوليد محتوى الفصول. مهم جداً للتحكم في طول وجودة النص.',
    variables: [
      'CHAPTER_NUMBER', 'NOVEL_TITLE', 'CHAPTER_TITLE', 'CHAPTER_SYNOPSIS',
      'CHAPTER_KEY_EVENTS', 'CHAPTER_CHARACTERS_INVOLVED', 'CHAPTER_EMOTIONAL_TONE',
      'CHAPTER_PACING', 'CHAPTER_PLOT_ADVANCEMENT', 'CHAPTER_WORD_TARGET',
      'SOURCE_STYLE_PROFILE_SUMMARY', 'CHAPTER_CULTURAL_ELEMENTS',
      'NOVEL_GLOBAL_SUMMARY', 'PREVIOUS_CHAPTER_SUMMARY', 'CHARACTER_ARC_PROGRESSION_FOR_THIS_CHAPTER',
      'ACTIVE_SUBPLOTS_STATUS', 'CUMULATIVE_THEMES_DEVELOPMENT', 'OUTPUT_FORMAT_REQUIREMENTS'
    ],
    defaultTemplate: `اكتب محتوى الفصل رقم [CHAPTER_NUMBER] من الرواية.
عنوان الرواية: [NOVEL_TITLE]
عنوان هذا الفصل: [CHAPTER_TITLE]
ملخص هذا الفصل: [CHAPTER_SYNOPSIS]

الأحداث الرئيسية التي يجب أن يتضمنها هذا الفصل: [CHAPTER_KEY_EVENTS]
الشخصيات المشاركة في هذا الفصل: [CHAPTER_CHARACTERS_INVOLVED] (ادمج هذه الشخصيات بشكل فعال).
النبرة العاطفية المطلوبة: [CHAPTER_EMOTIONAL_TONE]
إيقاع الفصل: [CHAPTER_PACING] (مثل: بطيء، متسارع، متوسط).

هذا الفصل يجب أن يساهم في: [CHAPTER_PLOT_ADVANCEMENT] (تطور الحبكة).
العناصر الثقافية الرئيسية التي يجب دمجها: [CHAPTER_CULTURAL_ELEMENTS]

الهدف التقريبي لعدد الكلمات: [CHAPTER_WORD_TARGET] كلمة. **تأكد أن عدد الكلمات في هذا الفصل لا يقل عن 5000 كلمة.**
حافظ على الأسلوب السردي للرواية المصدر: [SOURCE_STYLE_PROFILE_SUMMARY] (استخدم المفردات المعقدة، بنية الجمل المتنوعة، والنبرة الشاعرية).

ملخص الرواية حتى الآن (لمساعدتك في الحفاظ على الاتساق): [NOVEL_GLOBAL_SUMMARY]
ملخص الفصل السابق: [PREVIOUS_CHAPTER_SUMMARY]

الناتج يجب أن يكون نصاً روائياً عربياً عالي الجودة.
[OUTPUT_FORMAT_REQUIREMENTS]`
  },
  {
    id: 'enhance_text',
    name: 'تحسين النصوص',
    description: 'تخصيص الموجه لتحسين أجزاء محددة من النص (مثال: تعميق الوصف، جعل الحوارات طبيعية).',
    variables: ['SELECTED_TEXT_TO_ENHANCE', 'SOURCE_STYLE_PROFILE_SUMMARY', 'NOVEL_BLUEPRINT_SUMMARY', 'NOVEL_CHARACTERS_SUMMARY'],
    defaultTemplate: `قم بتحسين النص المحدد. يمكن أن يشمل التحسين: تعميق الوصف، جعل الحوارات أكثر طبيعية، تحسين تدفق الجمل، أو إضافة تفاصيل حسية.
النص للتحسين:
[SELECTED_TEXT_TO_ENHANCE]
`
  },
  {
    id: 'check_consistency',
    name: 'فحص الاتساق',
    description: 'تخصيص الموجه لفحص اتساق الحبكة والشخصيات والأسلوب عبر الرواية.',
    variables: ['CHAPTER_CONTENT', 'NOVEL_BLUEPRINT_SUMMARY', 'NOVEL_CHARACTERS_SUMMARY', 'SOURCE_STYLE_PROFILE_SUMMARY'],
    defaultTemplate: `فحص الاتساق في الفصل التالي. ابحث عن أي تناقضات في الحبكة، تطور الشخصيات، أو الأسلوب مقارنةً بالمخطط العام وتحليل المصدر. قدم تقريراً عن أي تناقضات مقترحات للحل بتنسيق JSON.
الفصل: [CHAPTER_CONTENT]
المخطط العام: [NOVEL_BLUEPRINT_SUMMARY]
الشخصيات: [NOVEL_CHARACTERS_SUMMARY]
الأسلوب المصدر: [SOURCE_STYLE_PROFILE_SUMMARY]`
  },
];

const PromptEditorPage: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [activeTask, setActiveTask] = useState(aiTasks[0].id);
  const [currentPromptTemplate, setCurrentPromptTemplate] = useState('');

  useEffect(() => {
    // Load the current template from context when activeTask changes
    const savedTemplate = state.promptTemplates[activeTask];
    const defaultTemplate = aiTasks.find(task => task.id === activeTask)?.defaultTemplate || '';
    setCurrentPromptTemplate(savedTemplate || defaultTemplate);
  }, [activeTask, state.promptTemplates]);

  const handleSave = () => {
    dispatch({ type: 'SET_PROMPT_TEMPLATE', payload: { taskId: activeTask, template: currentPromptTemplate } });
    toast({
      title: "تم حفظ القالب",
      description: `تم حفظ قالب الموجه لـ "${aiTasks.find(t => t.id === activeTask)?.name}".`,
    });
  };

  const handleReset = () => {
    const defaultTemplate = aiTasks.find(task => task.id === activeTask)?.defaultTemplate || '';
    setCurrentPromptTemplate(defaultTemplate);
    dispatch({ type: 'SET_PROMPT_TEMPLATE', payload: { taskId: activeTask, template: defaultTemplate } });
    toast({
      title: "تم استعادة القالب الافتراضي",
      description: `تم استعادة قالب الموجه الافتراضي لـ "${aiTasks.find(t => t.id === activeTask)?.name}".`,
      variant: "destructive"
    });
  };

  const insertVariable = (variable: string) => {
    setCurrentPromptTemplate(prev => prev + ` [${variable}] `);
  };

  const currentTask = aiTasks.find(task => task.id === activeTask);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <CardTitle className="text-xl">تخصيص موجهات الذكاء الاصطناعي</CardTitle>
              <CardDescription>
                تحكم في كيفية توجيه نماذج الذكاء الاصطناعي لكل مهمة. استخدم المتغيرات لإدراج البيانات الديناميكية.
                <br/>
                <span className="text-red-500">ملاحظة هامة: هذا التحكم هو للموجهات التي تُرسل لخدمات الذكاء الاصطناعي الحقيقية.</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTask} onValueChange={setActiveTask} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
              {aiTasks.map(task => (
                <TabsTrigger key={task.id} value={task.id} className="text-xs md:text-sm">
                  {task.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {aiTasks.map(task => (
              <TabsContent key={task.id} value={task.id} className="mt-4 space-y-4">
                <h3 className="text-lg font-semibold">{task.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                
                <Label htmlFor="prompt-template">قالب الموجه الخاص بك</Label>
                <Textarea
                  id="prompt-template"
                  value={currentPromptTemplate}
                  onChange={(e) => setCurrentPromptTemplate(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  dir="ltr" // Prompts are often LTR for clarity in LLMs, but Arabic content is fine
                />

                {currentTask?.variables.length > 0 && (
                  <div className="space-y-2">
                    <Label>المتغيرات المتاحة لهذا الموجه:</Label>
                    <div className="flex flex-wrap gap-2">
                      {currentTask.variables.map(variable => (
                        <Button 
                          key={variable} 
                          variant="outline" 
                          size="sm" 
                          onClick={() => insertVariable(variable)}
                        >
                          <Variable className="h-3 w-3 ml-1" />
                          {variable}
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">
                      انقر على المتغير لإدراجه في قالب الموجه. سيتم استبدال هذه المتغيرات بالبيانات الفعلية عند إرسال الموجه للذكاء الاصطناعي.
                    </p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={handleReset}>
                    <RotateCcw className="h-4 w-4 ml-2" />
                    استعادة الافتراضي
                  </Button>
                  <Button onClick={handleSave}>
                    <Save className="h-4 w-4 ml-2" />
                    حفظ القالب
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptEditorPage;
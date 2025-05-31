import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload,
  FileText,
  Brain,
  BarChart3,
  Users,
  BookOpen,
  Palette,
  CheckCircle,
  RefreshCw,
  Eye,
  Download,
  AlertTriangle
} from 'lucide-react';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import { toast } from '@/hooks/use-toast';
import { 
  readFileContent, 
  validateFile, 
  getSupportedFormatsDescription,
  formatFileSize,
  type FileReadResult 
} from '@/lib/fileReader';

const Stage1SourceAnalysis: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileReadResult, setFileReadResult] = useState<FileReadResult | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // التحقق من صحة الملف
    const validationError = validateFile(file);
    if (validationError) {
      toast({
        title: "خطأ في الملف",
        description: validationError.message,
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setFileReadResult(null);

    try {
      // قراءة محتوى الملف
      const result = await readFileContent(file);
      setFileReadResult(result);
      
      toast({
        title: "تم رفع الملف بنجاح",
        description: `${file.name} (${result.fileType}) - ${formatFileSize(file.size)} - ${result.wordCount.toLocaleString()} كلمة`,
      });
    } catch (error) {
      console.error('خطأ في قراءة الملف:', error);
      toast({
        title: "خطأ في قراءة الملف",
        description: error instanceof Error ? error.message : "فشل في قراءة الملف",
        variant: "destructive",
      });
      setUploadedFile(null);
      setFileReadResult(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
        'application/pdf': ['.pdf'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'text/plain': ['.txt'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024 // 50 ميجابايت
  });

  const startAnalysis = async () => {
    if (!uploadedFile || !fileReadResult) return;

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      const content = fileReadResult.content;
      const stageId = 1; // Stage 1 for Source Analysis
      const modelId = state.selectedAIModels[stageId];
      const apiKey = state.apiKeys[modelId];
      const promptTemplate = state.promptTemplates['analyze_source'];

      if (!modelId) {
        throw new Error("لم يتم تحديد نموذج AI للتحليل.");
      }
      if (!promptTemplate) {
        throw new Error("لم يتم العثور على قالب الموجه لتحليل المصدر.");
      }

      // Dynamic variables for source analysis
      const dynamicVariables = {
        SOURCE_TEXT: content,
        FILE_NAME: fileReadResult.fileName,
        WORD_COUNT: fileReadResult.wordCount.toString(),
        FILE_TYPE: fileReadResult.fileType,
      };

      const response = await fetch('http://localhost:3002/api/ai/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'analyzeText',
          modelId,
          apiKey, // Pass the API key to the backend
          promptTemplate,
          dynamicVariables,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل استدعاء API التحليل.');
      }

      const result = await response.json();
      
      // Assuming the backend returns the analysis in a format similar to SourceNovelAnalysis
      // You might need to map the backend's response to the SourceNovelAnalysis type
      const analysisResult = {
        title: fileReadResult.fileName.replace(/\.(pdf|docx|txt|epub|mobi|azw|azw3|rtf|iba)$/i, ''),
        author: result.analysis?.author || 'مؤلف غير محدد',
        content: result.analysis?.summary || content.substring(0, 1000) + '...',
        uploadDate: new Date(),
        wordCount: fileReadResult.wordCount,
        chapterCount: result.analysis?.chapterCount || Math.ceil(fileReadResult.wordCount / 5000),
        styleProfile: result.analysis?.styleProfile || {
          vocabulary: 'متقدمة ومتنوعة',
          sentenceStructure: 'متنوعة',
          toneProfile: 'متوازن',
          narrativePerspective: 'غير محدد',
          dialogueStyle: 'غير محدد',
          descriptiveLevel: 'متوسط',
          culturalContext: [],
          rhetoricalDevices: [],
          pacing: 'متوسط',
          characterization: 'متوسط'
        },
        plotBlueprint: result.analysis?.plotBlueprint || {
          type: 'غير محدد',
          chapters: Math.ceil(fileReadResult.wordCount / 3000),
          acts: [],
          themes: [],
          pacing: 'متوسط',
          conflictTypes: [],
          plotPoints: [],
          climaxPosition: 0,
          resolution: 'غير محدد'
        },
        characters: result.analysis?.characters || [],
        lorebook: result.analysis?.lorebook || [],
        themes: result.analysis?.themes || [],
        culturalElements: result.analysis?.culturalElements || [],
        analysis: result.analysis?.analysis || {
          complexity: 0,
          innovation: 0,
          authenticity: 0,
          readability: 0
        }
      };

      dispatch({ type: 'SET_SOURCE_ANALYSIS', payload: analysisResult });
      toast({
        title: "تم التحليل بنجاح",
        description: "تم تحليل الرواية المصدر بنجاح بواسطة AI. يمكنك الآن الانتقال للمرحلة التالية.",
      });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في تحليل الملف. يرجى المحاولة مرة أخرى.' });
      toast({
        title: "خطأ في التحليل",
        description: "حدث خطأ أثناء تحليل الملف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (state.sourceAnalysis) {
    return (
      <div className="space-y-6">
        {/* ملخص التحليل */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{state.sourceAnalysis.wordCount.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">كلمة</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{state.sourceAnalysis.chapterCount}</div>
                  <div className="text-sm text-gray-500">فصل</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{state.sourceAnalysis.characters.length}</div>
                  <div className="text-sm text-gray-500">شخصية</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{state.sourceAnalysis.analysis.complexity}%</div>
                  <div className="text-sm text-gray-500">تعقيد</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* تفاصيل التحليل */}
        <Card>
          <CardHeader>
            <CardTitle>نتائج التحليل التفصيلية</CardTitle>
            <CardDescription>
              تحليل شامل للرواية المصدر: {state.sourceAnalysis.title}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="style" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="style">الأسلوب</TabsTrigger>
                <TabsTrigger value="plot">الحبكة</TabsTrigger>
                <TabsTrigger value="characters">الشخصيات</TabsTrigger>
                <TabsTrigger value="themes">المواضيع</TabsTrigger>
                <TabsTrigger value="quality">الجودة</TabsTrigger>
              </TabsList>
              
              <TabsContent value="style" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">المفردات والأسلوب</h4>
                    <p className="text-sm text-gray-600 mb-4">{state.sourceAnalysis.styleProfile.vocabulary}</p>
                    
                    <h4 className="font-semibold mb-2">بنية الجمل</h4>
                    <p className="text-sm text-gray-600 mb-4">{state.sourceAnalysis.styleProfile.sentenceStructure}</p>
                    
                    <h4 className="font-semibold mb-2">النبرة العامة</h4>
                    <p className="text-sm text-gray-600">{state.sourceAnalysis.styleProfile.toneProfile}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">أسلوب السرد</h4>
                    <p className="text-sm text-gray-600 mb-4">{state.sourceAnalysis.styleProfile.narrativePerspective}</p>
                    
                    <h4 className="font-semibold mb-2">السياق الثقافي</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {state.sourceAnalysis.styleProfile.culturalContext.map((context, index) => (
                        <Badge key={index} variant="secondary">{context}</Badge>
                      ))}
                    </div>
                    
                    <h4 className="font-semibold mb-2">الأساليب البلاغية</h4>
                    <div className="flex flex-wrap gap-2">
                      {state.sourceAnalysis.styleProfile.rhetoricalDevices.map((device, index) => (
                        <Badge key={index} variant="outline">{device}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="plot" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">بنية الحبكة</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">نوع الرواية:</span>
                        <Badge>{state.sourceAnalysis.plotBlueprint.type}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">عدد الفصول:</span>
                        <span className="font-medium">{state.sourceAnalysis.plotBlueprint.chapters}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">موقع الذروة:</span>
                        <span className="font-medium">الفصل {state.sourceAnalysis.plotBlueprint.climaxPosition}</span>
                      </div>
                    </div>
                    
                    <h4 className="font-semibold mb-3 mt-6">المواضيع الرئيسية</h4>
                    <div className="flex flex-wrap gap-2">
                      {state.sourceAnalysis.plotBlueprint.themes.map((theme, index) => (
                        <Badge key={index} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">النقاط المحورية</h4>
                    <div className="space-y-3">
                      {state.sourceAnalysis.plotBlueprint.plotPoints.map((point, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">{point.title}</h5>
                            <Badge variant={point.importance === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                              {point.importance === 'high' ? 'عالي' : 'متوسط'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{point.description}</p>
                          <span className="text-xs text-gray-500">الفصل {point.chapter}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="characters" className="space-y-4">
                <div className="space-y-6">
                  {state.sourceAnalysis.characters.map((character) => (
                    <Card key={character.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{character.name}</CardTitle>
                        <CardDescription>{character.role}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2">الوصف</h5>
                          <p className="text-sm text-gray-600">{character.description}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">الخلفية</h5>
                          <p className="text-sm text-gray-600">{character.background}</p>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">السمات الشخصية</h5>
                          <div className="flex flex-wrap gap-2">
                            {character.personality.map((trait, index) => (
                              <Badge key={index} variant="outline">{trait}</Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">الدوافع</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {character.motivations.map((motivation, index) => (
                              <li key={index}>• {motivation}</li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="themes" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">المواضيع الرئيسية</h4>
                    <div className="space-y-2">
                      {state.sourceAnalysis.themes.map((theme, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                          <span className="text-sm">{theme}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">العناصر الثقافية</h4>
                    <div className="space-y-2">
                      {state.sourceAnalysis.culturalElements.map((element, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 border rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">{element}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="quality" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">التعقيد</span>
                        <span className="text-sm">{state.sourceAnalysis.analysis.complexity}%</span>
                      </div>
                      <Progress value={state.sourceAnalysis.analysis.complexity} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">الابتكار</span>
                        <span className="text-sm">{state.sourceAnalysis.analysis.innovation}%</span>
                      </div>
                      <Progress value={state.sourceAnalysis.analysis.innovation} />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">الأصالة</span>
                        <span className="text-sm">{state.sourceAnalysis.analysis.authenticity}%</span>
                      </div>
                      <Progress value={state.sourceAnalysis.analysis.authenticity} />
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">سهولة القراءة</span>
                        <span className="text-sm">{state.sourceAnalysis.analysis.readability}%</span>
                      </div>
                      <Progress value={state.sourceAnalysis.analysis.readability} />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* أزرار العمل */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => {
              dispatch({ type: 'SET_SOURCE_ANALYSIS', payload: null });
              setUploadedFile(null);
              setFileReadResult(null);
            }}
          >
            تحليل رواية جديدة
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 ml-2" />
              تصدير التحليل
            </Button>
            <Button 
              onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 2 })}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              الانتقال لمعمل الأفكار
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* رفع الملف */}
      <Card>
        <CardHeader>
          <CardTitle>رفع الرواية المصدر</CardTitle>
          <CardDescription>
            ارفع ملف نصي للرواية التي تريد تحليل أسلوبها وبنيتها
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">اسحب الملف هنا...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">اسحب ملف الرواية هنا أو انقر للاختيار</p>
                <p className="text-sm text-gray-500">{getSupportedFormatsDescription()}</p>
                <div className="flex justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>PDF</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>DOCX</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>TXT</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {uploadedFile && fileReadResult && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {fileReadResult.fileType === 'PDF' ? (
                      <FileText className="h-5 w-5 text-red-600" />
                  ) : fileReadResult.fileType === 'DOCX' ? (
                      <FileText className="h-5 w-5 text-blue-600" />
                  ) : (
                      <FileText className="h-5 w-5 text-green-600" />
                  )}
                  <Badge variant="secondary" className="text-xs">
                    {fileReadResult.fileType}
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-900">{uploadedFile.name}</p>
                  <div className="text-sm text-green-700 flex gap-4">
                    <span>الحجم: {formatFileSize(uploadedFile.size)}</span>
                    <span>الكلمات: {fileReadResult.wordCount.toLocaleString()}</span>
                  </div>
                </div>
                <Button onClick={startAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin ml-2" />
                      جارٍ التحليل...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 ml-2" />
                      بدء التحليل
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {uploadedFile && !fileReadResult && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">جارٍ قراءة الملف...</p>
                  <p className="text-sm text-yellow-700">
                    يرجى الانتظار بينما نقوم بقراءة وتحليل محتوى الملف
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* تقدم التحليل */}
      {isAnalyzing && (
        <Card>
          <CardHeader>
            <CardTitle>جارٍ تحليل الرواية المصدر</CardTitle>
            <CardDescription>
              يرجى الانتظار بينما نقوم بتحليل النص واستخلاص الأسلوب والبنية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={analysisProgress} className="w-full" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>التقدم: {analysisProgress}%</span>
                <span>الوقت المتبقي: ~{Math.max(0, 7 - Math.floor(analysisProgress / 15))} ثواني</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                {[
                  { label: 'قراءة النص', icon: FileText, completed: analysisProgress > 10 },
                  { label: 'تحليل المفردات', icon: Brain, completed: analysisProgress > 25 },
                  { label: 'استخلاص الأسلوب', icon: Palette, completed: analysisProgress > 60 },
                  { label: 'تحليل الشخصيات', icon: Users, completed: analysisProgress > 75 }
                ].map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 rounded border">
                      <Icon className={`h-4 w-4 ${step.completed ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm ${step.completed ? 'text-green-900' : 'text-gray-600'}`}>
                        {step.label}
                      </span>
                      {step.completed && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* نصائح وتعليمات */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">نصائح لاختيار الرواية المصدر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h5 className="font-semibold text-blue-900 mb-3">معايير الجودة</h5>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                  اختر رواية غنية بالأسلوب والعمق الثقافي
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                  تأكد من جودة النص وخلوه من الأخطاء الإملائية
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                  يفضل أن تكون الرواية أكثر من 100 كلمة للحصول على تحليل مفيد
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 mt-0.5 text-blue-600" />
                  اختر أعمالاً متاحة للاستخدام التعليمي والبحثي
                </li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-semibold text-blue-900 mb-3">الصيغ المدعومة</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-white rounded border">
                  <FileText className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-sm">PDF</div>
                    <div className="text-xs text-gray-600">ملفات PDF القابلة للبحث</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded border">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">DOCX</div>
                    <div className="text-xs text-gray-600">مستندات Microsoft Word</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-white rounded border">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-sm">TXT</div>
                    <div className="text-xs text-gray-600">ملفات نصية بسيطة</div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-blue-700 mt-3">
                الحد الأقصى: 50 ميجابايت لجميع الصيغ
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stage1SourceAnalysis;

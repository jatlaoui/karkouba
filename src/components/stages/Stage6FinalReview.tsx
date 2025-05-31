import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Download,
  FileText,
  CheckCircle,
  BarChart3,
  Star,
  AlertTriangle,
  BookOpen,
  Users,
  Palette,
  Target,
  RefreshCw,
  Eye,
  Share,
  Save,
  Archive,
  Award,
  TrendingUp,
  Heart
} from 'lucide-react';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import { toast } from '@/hooks/use-toast';

const Stage6FinalReview: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [exportSettings, setExportSettings] = useState({
    format: 'docx' as 'txt' | 'docx' | 'pdf',
    includeMetadata: true,
    includeAnalysis: true,
    customStyling: true
  });

  useEffect(() => {
    if (!state.finalProject && state.generatedChapters.length > 0) {
      generateFinalProject();
    }
  }, [state.generatedChapters]);

  const generateFinalProject = async () => {
    setIsAnalyzing(true);
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      const finalProject = {
        metadata: {
          id: 'final-project-' + Date.now(),
          name: state.novelBlueprint?.idea.title || 'رواية جديدة',
          description: state.novelBlueprint?.idea.synopsis || '',
          createdAt: new Date(),
          lastModified: new Date(),
          currentStage: 6,
          progress: {
            stage1: 100,
            stage2: 100,
            stage3: 100,
            stage4: 100,
            stage5: 100,
            stage6: 100
          },
          statistics: {
            totalWords: state.generatedChapters.reduce((total, ch) => total + ch.wordCount, 0),
            averageQuality: Math.round(
              state.generatedChapters.reduce((total, ch) => total + ch.quality.overall, 0) / 
              state.generatedChapters.length
            ),
            completionRate: 100,
            timeSpent: 0
          }
        },
        exportSettings,
        qualityReport: {
          overallQuality: Math.round(
            state.generatedChapters.reduce((total, ch) => total + ch.quality.overall, 0) / 
            state.generatedChapters.length
          ),
          strengths: [
            'اتساق عالي في الأسلوب مع الرواية المصدر',
            'تطوير ممتاز للشخصيات عبر الفصول',
            'ثراء ثقافي وأصالة في التعبير',
            'حبكة متماسكة ومتدرجة البناء',
            'لغة قوية وتراكيب متنوعة'
          ],
          improvements: [
            'يمكن تطوير بعض الحوارات لتكون أكثر طبيعية',
            'إضافة المزيد من التفاصيل الوصفية في مشاهد محددة',
            'تعزيز الربط بين بعض الأحداث الفرعية'
          ],
          recommendations: [
            {
              category: 'المراجعة اللغوية',
              description: 'مراجعة نهائية للإملاء والنحو',
              priority: 'high' as const
            },
            {
              category: 'التدقيق الثقافي',
              description: 'التأكد من صحة المراجع الثقافية',
              priority: 'medium' as const
            },
            {
              category: 'التنسيق',
              description: 'تطبيق تنسيق موحد للنص النهائي',
              priority: 'medium' as const
            },
            {
              category: 'المعاينة',
              description: 'قراءة نهائية شاملة قبل النشر',
              priority: 'high' as const
            }
          ]
        }
      };

      dispatch({ type: 'SET_FINAL_PROJECT', payload: finalProject });
      toast({
        title: "تم إنشاء المشروع النهائي",
        description: "تم تحليل وتجهيز الرواية للمراجعة النهائية والتصدير.",
      });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في إنشاء المشروع النهائي.' });
    } finally {
      setIsAnalyzing(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const exportProject = async () => {
    if (!state.finalProject) return;

    toast({
      title: "جارٍ التصدير",
      description: `تحضير الملف بصيغة ${exportSettings.format.toUpperCase()}...`,
    });

    // محاكاة عملية التصدير
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "تم التصدير بنجاح",
      description: `تم تصدير الرواية بصيغة ${exportSettings.format.toUpperCase()} بنجاح.`,
    });
  };

  const startNewProject = () => {
    dispatch({ type: 'RESET_JOURNEY' });
    toast({
      title: "تم بدء مشروع جديد",
      description: "يمكنك الآن البدء في رحلة كتابة جديدة.",
    });
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-6 w-6 text-pink-600" />
              جارٍ إعداد المشروع النهائي
            </CardTitle>
            <CardDescription>
              تحليل شامل للرواية وإعداد التقرير النهائي
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                <span>تحليل الجودة الإجمالية...</span>
              </div>
              <Progress value={75} className="w-full" />
              <div className="text-sm text-gray-600">
                فحص الاتساق وإعداد التوصيات...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!state.finalProject) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>التنقيح والتصدير النهائي</CardTitle>
            <CardDescription>
              لم يتم إعداد المشروع النهائي بعد. تأكد من إكمال جميع المراحل السابقة.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateFinalProject} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              إعداد المشروع النهائي
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const finalProject = state.finalProject;

  return (
    <div className="space-y-6">
      {/* ملخص المشروع */}
      <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-900">
                  تهانينا! تم إكمال الرواية بنجاح
                </CardTitle>
                <CardDescription className="text-green-700">
                  {finalProject.metadata.name} - جاهزة للتصدير والمشاركة
                </CardDescription>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {finalProject.qualityReport.overallQuality}%
              </div>
              <div className="text-sm text-green-700">جودة إجمالية</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {state.generatedChapters.length}
              </div>
              <div className="text-sm text-gray-600">فصل</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <FileText className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {finalProject.metadata.statistics.totalWords.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">كلمة</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Star className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">
                {finalProject.metadata.statistics.averageQuality}%
              </div>
              <div className="text-sm text-gray-600">متوسط الجودة</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {finalProject.metadata.statistics.completionRate}%
              </div>
              <div className="text-sm text-gray-600">مكتمل</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* تبويبات المراجعة النهائية */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="quality">تحليل الجودة</TabsTrigger>
              <TabsTrigger value="export">التصدير</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    معلومات المشروع
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">اسم المشروع:</span>
                      <span className="font-medium">{finalProject.metadata.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تاريخ الإنشاء:</span>
                      <span className="font-medium">
                        {finalProject.metadata.createdAt.toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">آخر تعديل:</span>
                      <span className="font-medium">
                        {finalProject.metadata.lastModified.toLocaleDateString('ar-SA')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">النوع:</span>
                      <span className="font-medium">{state.novelBlueprint?.idea.genre}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    إحصائيات مفصلة
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>التقدم الإجمالي</span>
                        <span>100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>الفصول المكتملة</span>
                        <span>{state.generatedChapters.length} / {state.generatedChapters.length}</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>الفصول المحررة</span>
                        <span>
                          {state.generatedChapters.filter(ch => ch.status === 'edited').length} / {state.generatedChapters.length}
                        </span>
                      </div>
                      <Progress 
                        value={(state.generatedChapters.filter(ch => ch.status === 'edited').length / state.generatedChapters.length) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  نقاط القوة الرئيسية
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {finalProject.qualityReport.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-2 p-3 border rounded-lg bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-green-800">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="quality" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    مقاييس الجودة
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">اتساق الأسلوب</span>
                        <span className="text-sm">
                          {Math.round(
                            state.generatedChapters.reduce((total, ch) => total + ch.quality.styleConsistency, 0) / 
                            state.generatedChapters.length
                          )}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.round(
                          state.generatedChapters.reduce((total, ch) => total + ch.quality.styleConsistency, 0) / 
                          state.generatedChapters.length
                        )} 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">اتساق الشخصيات</span>
                        <span className="text-sm">
                          {Math.round(
                            state.generatedChapters.reduce((total, ch) => total + ch.quality.characterConsistency, 0) / 
                            state.generatedChapters.length
                          )}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.round(
                          state.generatedChapters.reduce((total, ch) => total + ch.quality.characterConsistency, 0) / 
                          state.generatedChapters.length
                        )} 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">اتساق الحبكة</span>
                        <span className="text-sm">
                          {Math.round(
                            state.generatedChapters.reduce((total, ch) => total + ch.quality.plotConsistency, 0) / 
                            state.generatedChapters.length
                          )}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.round(
                          state.generatedChapters.reduce((total, ch) => total + ch.quality.plotConsistency, 0) / 
                          state.generatedChapters.length
                        )} 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">الأصالة الثقافية</span>
                        <span className="text-sm">
                          {Math.round(
                            state.generatedChapters.reduce((total, ch) => total + ch.quality.culturalAuthenticity, 0) / 
                            state.generatedChapters.length
                          )}%
                        </span>
                      </div>
                      <Progress 
                        value={Math.round(
                          state.generatedChapters.reduce((total, ch) => total + ch.quality.culturalAuthenticity, 0) / 
                          state.generatedChapters.length
                        )} 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    نقاط التحسين
                  </h4>
                  <div className="space-y-3">
                    {finalProject.qualityReport.improvements.map((improvement, index) => (
                      <div key={index} className="p-3 border rounded-lg bg-yellow-50">
                        <div className="flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-800">{improvement}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  التوصيات النهائية
                </h4>
                <div className="grid gap-3">
                  {finalProject.qualityReport.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1 ${
                        rec.priority === 'high' ? 'bg-red-500' : 
                        rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-sm">{rec.category}</h5>
                          <Badge 
                            variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {rec.priority === 'high' ? 'عالي' : rec.priority === 'medium' ? 'متوسط' : 'منخفض'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="export" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Download className="h-5 w-5 text-blue-600" />
                    إعدادات التصدير
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium mb-3 block">صيغة الملف</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['txt', 'docx', 'pdf'] as const).map((format) => (
                          <Button
                            key={format}
                            variant={exportSettings.format === format ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setExportSettings({ ...exportSettings, format })}
                            className="text-xs"
                          >
                            .{format.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="metadata" className="text-sm">تضمين البيانات الوصفية</Label>
                        <Switch
                          id="metadata"
                          checked={exportSettings.includeMetadata}
                          onCheckedChange={(checked) => 
                            setExportSettings({ ...exportSettings, includeMetadata: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="analysis" className="text-sm">تضمين تقرير التحليل</Label>
                        <Switch
                          id="analysis"
                          checked={exportSettings.includeAnalysis}
                          onCheckedChange={(checked) => 
                            setExportSettings({ ...exportSettings, includeAnalysis: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="styling" className="text-sm">تطبيق التنسيق المخصص</Label>
                        <Switch
                          id="styling"
                          checked={exportSettings.customStyling}
                          onCheckedChange={(checked) => 
                            setExportSettings({ ...exportSettings, customStyling: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    معاينة التصدير
                  </h4>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>نوع الملف:</span>
                        <span className="font-medium">.{exportSettings.format.toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>الحجم المتوقع:</span>
                        <span className="font-medium">
                          {exportSettings.format === 'pdf' ? '2.5 MB' :
                           exportSettings.format === 'docx' ? '1.2 MB' : '800 KB'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>عدد الصفحات:</span>
                        <span className="font-medium">
                          ~{Math.ceil(finalProject.metadata.statistics.totalWords / 250)}
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="font-medium text-xs text-gray-600 mb-2">المحتويات:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• النص الكامل ({finalProject.metadata.statistics.totalWords.toLocaleString()} كلمة)</li>
                          {exportSettings.includeMetadata && <li>• البيانات الوصفية والمعلومات</li>}
                          {exportSettings.includeAnalysis && <li>• تقرير التحليل والجودة</li>}
                          {exportSettings.customStyling && <li>• تنسيق وتصميم مخصص</li>}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Button 
                      onClick={exportProject}
                      className="w-full flex items-center gap-2"
                      size="lg"
                    >
                      <Download className="h-4 w-4" />
                      تصدير الرواية
                    </Button>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Eye className="h-3 w-3" />
                        معاينة
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-2">
                        <Share className="h-3 w-3" />
                        مشاركة
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* أزرار العمل النهائية */}
      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            حفظ المشروع
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            أرشفة
          </Button>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={startNewProject}
            className="flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            مشروع جديد
          </Button>
          <Button 
            onClick={exportProject}
            className="flex items-center gap-2"
            size="lg"
          >
            <Download className="h-4 w-4" />
            تصدير الرواية النهائية
          </Button>
        </div>
      </div>

      {/* رسالة التهنئة النهائية */}
      <Card className="border-2 border-yellow-500 bg-gradient-to-r from-yellow-50 to-orange-50"> {/* Replaced border-gold with border-yellow-500 */}
        <CardContent className="pt-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-orange-900 mb-2">
              🎉 تهانينا! لقد أنجزت رواية كاملة 🎉
            </h3>
            <p className="text-orange-700 mb-4 max-w-2xl mx-auto">
              لقد نجحت في إنشاء رواية عربية أصيلة باستخدام تقنيات الذكاء الاصطناعي المتقدمة. 
              روايتك "{finalProject.metadata.name}" تحتوي على {finalProject.metadata.statistics.totalWords.toLocaleString()} كلمة 
              موزعة على {state.generatedChapters.length} فصل بجودة إجمالية {finalProject.qualityReport.overallQuality}%.
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={exportProject}
                className="flex items-center gap-2"
                size="lg"
              >
                <Download className="h-4 w-4" />
                تحميل روايتي
              </Button>
              <Button 
                variant="outline"
                onClick={startNewProject}
                className="flex items-center gap-2"
                size="lg"
              >
                <BookOpen className="h-4 w-4" />
                كتابة رواية جديدة
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stage6FinalReview;

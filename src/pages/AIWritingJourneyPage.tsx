import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles,
  Brain,
  CheckCircle,
  Target,
  Zap,
  BookHeart
} from 'lucide-react';
import AIWritingJourneyWorkflow from '@/components/AIWritingJourneyWorkflow';

const AIWritingJourneyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="relative">
              <Sparkles className="h-12 w-12 text-blue-600 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-bounce" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              رحلة الكتابة الذكية
            </h1>
            <BookHeart className="h-12 w-12 text-purple-600 animate-pulse" />
          </div>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed">
            نظام متطور لتحليل الروايات العربية واستخدام النتائج لتوليد روايات جديدة تحاكي الأسلوب والبنية 
            مع الحفاظ على الأصالة والإبداع
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
              <Brain className="h-8 w-8 text-purple-600" />
              <div className="text-right">
                <h3 className="font-semibold text-gray-900">تحليل ذكي</h3>
                <p className="text-sm text-gray-600">استخلاص عميق للأسلوب</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
              <Zap className="h-8 w-8 text-blue-600" />
              <div className="text-right">
                <h3 className="font-semibold text-gray-900">توليد سريع</h3>
                <p className="text-sm text-gray-600">إنشاء محتوى متقدم</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
              <Target className="h-8 w-8 text-green-600" />
              <div className="text-right">
                <h3 className="font-semibold text-gray-900">جودة عالية</h3>
                <p className="text-sm text-gray-600">نتائج احترافية</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Workflow */}
      <AIWritingJourneyWorkflow />

      {/* Footer Guidelines */}
      <div className="bg-white border-t">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">إرشادات الاستخدام الأمثل</CardTitle>
              <CardDescription className="text-center">
                نصائح مهمة لتحقيق أفضل النتائج من رحلة الكتابة الذكية
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    أفضل الممارسات
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      اختر رواية مصدر غنية بالأسلوب والعمق الثقافي
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      راجع نتائج التحليل بعناية قبل الانتقال للمرحلة التالية
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      احفظ تقدمك بانتظام لتجنب فقدان البيانات
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      استفد من أدوات التحرير التفاعلي لتحسين الجودة
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Badge className="h-5 w-5" />
                    حقوق الطبع والأخلاقيات
                  </h4>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      استخدم روايات متاحة للاستخدام التعليمي والبحثي
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      تأكد من عدم انتهاك حقوق الملكية الفكرية
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      النتائج المولدة تعتبر عملاً إبداعياً جديداً
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                      قم بالإسناد المناسب للمصادر الملهمة عند النشر
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIWritingJourneyPage;

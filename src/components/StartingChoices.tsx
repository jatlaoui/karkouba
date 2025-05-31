import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Lightbulb, 
  FolderOpen,
  ArrowRight,
  Brain,
  Sparkles,
  Clock,
  BookOpen,
  Users,
  Target
} from 'lucide-react';

interface StartingChoicesProps {
  onChoice: (choice: 'analyze' | 'new' | 'continue') => void;
}

const StartingChoices: React.FC<StartingChoicesProps> = ({ onChoice }) => {
  const choices = [
    {
      id: 'analyze',
      title: 'تحليل رواية موجودة',
      description: 'حمّل رواية لتحليل أسلوبها واستخدامها كمرجع لإنشاء أعمال جديدة',
      icon: Brain,
      color: 'from-blue-500 to-blue-600',
      features: [
        'تحليل عميق للأسلوب الأدبي',
        'استخراج العناصر الثقافية',
        'فهم بنية الشخصيات والحبكة',
        'دعم ملفات PDF، DOCX، TXT'
      ],
      buttonText: 'ابدأ التحليل',
      emoji: '🧠'
    },
    {
      id: 'new',
      title: 'بدء رواية جديدة',
      description: 'ابدأ مشروع رواية جديد من الصفر بمساعدة الذكاء الاصطناعي',
      icon: Lightbulb,
      color: 'from-green-500 to-green-600',
      features: [
        'معمل الأفكار الإبداعية',
        'بناء مخطط ذكي',
        'شخصيات وحبكات متطورة',
        'أدوات كتابة تفاعلية'
      ],
      buttonText: 'إنشاء مشروع جديد',
      emoji: '✨'
    },
    {
      id: 'continue',
      title: 'استكمال مشروع محفوظ',
      description: 'تابع العمل على مشروع رواية محفوظ مسبقاً',
      icon: FolderOpen,
      color: 'from-purple-500 to-purple-600',
      features: [
        'استرجاع المشاريع المحفوظة',
        'متابعة من نقطة التوقف',
        'حفظ تلقائي للتقدم',
        'إدارة عدة مشاريع'
      ],
      buttonText: 'تصفح المشاريع',
      emoji: '📁'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Sparkles className="h-8 w-8 text-blue-600 animate-pulse" />
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            كيف تود أن تبدأ رحلتك؟
          </h2>
          <BookOpen className="h-8 w-8 text-purple-600 animate-pulse" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          اختر الطريقة التي تناسبك لبدء رحلة الكتابة الذكية والإبداع الأدبي
        </p>
      </div>

      {/* Choices Grid */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {choices.map((choice) => {
          const IconComponent = choice.icon;
          return (
            <Card 
              key={choice.id} 
              className="relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 group cursor-pointer border-2 hover:border-transparent"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${choice.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <CardHeader className="relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${choice.color} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl">{choice.emoji}</div>
                </div>
                
                <CardTitle className="text-xl mb-2 group-hover:text-blue-600 transition-colors">
                  {choice.title}
                </CardTitle>
                <CardDescription className="text-gray-600 leading-relaxed">
                  {choice.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative">
                {/* Features List */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    الميزات الرئيسية:
                  </h4>
                  <ul className="space-y-2">
                    {choice.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${choice.color} mt-2 flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => onChoice(choice.id as 'analyze' | 'new' | 'continue')}
                  className={`w-full bg-gradient-to-r ${choice.color} hover:opacity-90 text-white font-medium py-3 transition-all duration-300 group-hover:shadow-lg`}
                >
                  <span>{choice.buttonText}</span>
                  <ArrowRight className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bottom Info */}
      <div className="text-center mt-12">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2 text-blue-600">
              <Clock className="h-5 w-5" />
              <span className="font-medium">سريع وذكي</span>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <Users className="h-5 w-5" />
              <span className="font-medium">سهل الاستخدام</span>
            </div>
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">نتائج احترافية</span>
            </div>
          </div>
          <p className="text-gray-600 text-sm">
            جميع خياراتك محفوظة ويمكنك التبديل بينها في أي وقت • دعم كامل للغة العربية وخصائصها الفريدة
          </p>
        </div>
      </div>
    </div>
  );
};

export default StartingChoices;

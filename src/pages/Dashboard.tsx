import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  TrendingUp, 
  Clock,
  Star,
  Users,
  ArrowRight,
  Plus,
  FileText,
  Brain,
  BookMarked // For Lorebook
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';

const Dashboard: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();

  const handleLoadProject = (projectId: string) => {
    dispatch({ type: 'LOAD_PROJECT', payload: projectId });
  };

  const recentProjects = state.userProjects;

  const stats = [
    {
      title: 'إجمالي المشاريع',
      value: state.userProjects.length.toString(),
      change: '', // Dynamic change would require more data
      icon: BookOpen,
      color: 'text-blue-600'
    },
    {
      title: 'الكلمات المكتوبة',
      value: state.userProjects.reduce((total, project) => total + (project.novelBlueprint?.structure.overview.estimatedWords || project.wordCount || 0), 0).toLocaleString(),
      change: '',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'متوسط الجودة',
      value: state.userProjects.length > 0
        ? `${Math.round(state.userProjects.reduce((total, project) => total + (project.quality?.overall || 0), 0) / state.userProjects.length)}%`
        : '0%',
      change: '',
      icon: Star,
      color: 'text-yellow-600'
    },
    {
      title: 'ساعات الكتابة',
      value: 'N/A', // Requires tracking time spent in app
      change: '',
      icon: Clock,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* الترحيب والبدء السريع */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">مرحباً بك في منصة الكتابة العربية الذكية</h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                استخدم قوة الذكاء الاصطناعي لإنشاء روايات عربية أصيلة ومبدعة. 
                اكتشف رحلة الكتابة الذكية وابدأ مشروعك الجديد اليوم.
              </p>
            </div>
            <div className="flex gap-4">
              <Link to="/ai-journey">
                <Button size="lg" variant="secondary" className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  بدء رحلة الكتابة الذكية
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                <Plus className="h-5 w-5 ml-2" />
                مشروع جديد
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-600 mt-1">
                  {stat.change} من الشهر الماضي
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* المشاريع الحديثة ورحلة الكتابة الذكية */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* المشاريع الحديثة */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>المشاريع الحديثة</CardTitle>
                  <CardDescription>آخر المشاريع التي تم العمل عليها</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  عرض الكل
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <div key={project._id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge variant="secondary">المرحلة {project.stage}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{project.wordCount.toLocaleString()} كلمة</span>
                          <span>آخر تعديل: {project.lastModified}</span>
                        </div>
                      </div>
                      <div className="text-left min-w-[100px]">
                        <div className="text-sm font-medium mb-2">{project.progress}%</div>
                        <Progress value={project.progress} className="w-20" />
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full flex items-center gap-2"
                          onClick={() => handleLoadProject(project._id)}
                        >
                          <ArrowRight className="h-4 w-4" />
                          متابعة المشروع
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>لا توجد مشاريع حديثة. ابدأ مشروعًا جديدًا!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* رحلة الكتابة الذكية */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                رحلة الكتابة الذكية
              </CardTitle>
              <CardDescription>
                نظام متطور للكتابة بالذكاء الاصطناعي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* حالة الرحلة الحالية */}
                {state.sourceAnalysis ? (
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-900">رحلة جارية</span>
                    </div>
                    <p className="text-sm text-purple-700 mb-3">
                      {state.sourceAnalysis.title}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-600">
                        المرحلة {state.currentStage} من 6
                      </span>
                      <Link to="/ai-journey">
                        <Button size="sm" variant="outline">
                          متابعة
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="font-medium text-gray-900 mb-2">ابدأ رحلتك الآن</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      استخدم الذكاء الاصطناعي لإنشاء رواية عربية مبدعة
                    </p>
                    <Link to="/ai-journey">
                      <Button size="sm" className="w-full">
                        بدء الرحلة
                      </Button>
                    </Link>
                  </div>
                )}

                {/* نصائح سريعة */}
                <div className="border-t pt-4">
                  <h5 className="font-medium mb-3">نصائح سريعة</h5>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      اختر رواية مصدر غنية بالأسلوب والعمق الثقافي
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      راجع نتائج التحليل قبل الانتقال للمرحلة التالية
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      استفد من أدوات التحرير التفاعلي
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* أنشطة حديثة */}
      <Card>
        <CardHeader>
          <CardTitle>الأنشطة الحديثة</CardTitle>
          <CardDescription>آخر الأنشطة في منصة الكتابة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'تم إكمال تحليل رواية "حكايات من بغداد"', time: 'منذ ساعتين', type: 'analysis' },
              { action: 'تم توليد 3 أفكار جديدة لمشروع "أساطير الأندلس"', time: 'منذ 4 ساعات', type: 'generation' },
              { action: 'تم تحرير الفصل الخامس من "رواية الصحراء الذهبية"', time: 'أمس', type: 'editing' },
              { action: 'تم إنشاء مخطط جديد لرواية "ظلال دمشق"', time: 'أمس', type: 'blueprint' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'analysis' ? 'bg-blue-500' :
                  activity.type === 'generation' ? 'bg-green-500' :
                  activity.type === 'editing' ? 'bg-purple-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

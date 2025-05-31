import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Sparkles,
  FileText,
  Users,
  Settings,
  BookOpen,
  PenTool,
  Brain,
  Target,
  Edit3,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import { Badge } from '@/components/ui/badge';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { state } = useAIWritingJourney();

  const navigationItems = [
    {
      title: 'لوحة القيادة',
      href: '/',
      icon: Home,
      description: 'نظرة عامة على المشاريع'
    },
    {
      title: 'رحلة الكتابة الذكية',
      href: '/ai-journey',
      icon: Sparkles,
      description: 'النظام المتطور للكتابة',
      badge: state.currentStage
    },
    {
      title: 'إعدادات نماذج AI',
      href: '/ai-models',
      icon: Settings,
      description: 'تخصيص نماذج ومفاتيح AI'
    }
  ];

  const stageItems = [
    {
      title: 'تحليل المصدر',
      stage: 1,
      icon: Brain,
      completed: !!state.sourceAnalysis,
      current: state.currentStage === 1
    },
    {
      title: 'معمل الأفكار',
      stage: 2,
      icon: Target,
      completed: !!state.selectedIdea,
      current: state.currentStage === 2
    },
    {
      title: 'بناء المخطط',
      stage: 3,
      icon: FileText,
      completed: !!state.novelBlueprint,
      current: state.currentStage === 3
    },
    {
      title: 'توليد الفصول',
      stage: 4,
      icon: PenTool,
      completed: state.generatedChapters.length > 0,
      current: state.currentStage === 4
    },
    {
      title: 'المحرر التفاعلي',
      stage: 5,
      icon: Edit3,
      completed: state.generatedChapters.some(ch => ch.status === 'edited'),
      current: state.currentStage === 5
    },
    {
      title: 'التنقيح والتصدير',
      stage: 6,
      icon: Download,
      completed: !!state.finalProject,
      current: state.currentStage === 6
    }
  ];

  return (
    <aside className="fixed right-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-l border-gray-200 overflow-y-auto">
      <div className="p-6">
        {/* التنقل الرئيسي */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">التنقل الرئيسي</h3>
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* مراحل رحلة الكتابة */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-4">مراحل الكتابة</h3>
          <div className="space-y-2">
            {stageItems.map((item) => {
              const Icon = item.icon;
              
              return (
                <div
                  key={item.stage}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    item.current
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : item.completed
                      ? 'bg-green-50 text-green-700'
                      : 'text-gray-500'
                  )}
                >
                  <div className="relative">
                    <Icon className="h-4 w-4" />
                    {item.completed && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                  </div>
                  <Badge 
                    variant={item.current ? 'default' : item.completed ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {item.stage}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {/* إحصائيات سريعة */}
        {state.sourceAnalysis && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">إحصائيات المشروع</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>الفصول المولدة:</span>
                <span>{state.generatedChapters.length}</span>
              </div>
              <div className="flex justify-between">
                <span>إجمالي الكلمات:</span>
                <span>{state.generatedChapters.reduce((total, ch) => total + ch.wordCount, 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>متوسط الجودة:</span>
                <span>
                  {state.generatedChapters.length > 0
                    ? Math.round(
                        state.generatedChapters.reduce((total, ch) => total + ch.quality.overall, 0) / 
                        state.generatedChapters.length
                      )
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

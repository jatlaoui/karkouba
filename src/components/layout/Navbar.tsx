import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  Settings, 
  User,
  Bell,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* الشعار والعنوان */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <Sparkles className="h-4 w-4 text-purple-500 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">منصة الكتابة العربية الذكية</h1>
                <p className="text-sm text-gray-500">نظام متطور لكتابة الروايات العربية</p>
              </div>
            </div>
          </div>

          {/* شريط البحث */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="ابحث في المشاريع..."
                className="pr-10 text-right"
              />
            </div>
          </div>

          {/* أزرار التنقل والإعدادات */}
          <div className="flex items-center gap-4">
            {/* إشعارات */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500">
                3
              </Badge>
            </Button>

            {/* الإعدادات */}
            <Button variant="ghost" size="sm">
              <Settings className="h-5 w-5" />
            </Button>

            {/* الملف الشخصي */}
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <span className="text-sm">المستخدم</span>
            </Button>

            {/* زر تخصيص الموجهات */}
            <Link to="/prompt-editor">
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                <span className="text-sm">تخصيص الموجهات</span>
              </Button>
            </Link>
            {/* زر رحلة الكتابة الذكية */}
            <Link to="/ai-journey">
              <Button
                variant={location.pathname === '/ai-journey' ? 'default' : 'outline'}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                رحلة الكتابة الذكية
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

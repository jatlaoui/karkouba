import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus } from 'lucide-react';

interface Chapter {
  id: string;
  number: number;
  title: string;
  synopsis: string;
  keyEvents: string[];
  charactersInvolved: string[];
  emotionalTone: string;
  pacing: string;
  culturalElements: string[];
  themes: string[];
  plotAdvancement: string;
  wordTarget: number;
}

interface Character {
  id: string;
  name: string;
  role: string;
}

interface ChapterFormProps {
  chapter?: Chapter | null;
  characters: Character[];
  onSave: (chapterData: any) => void;
  onCancel: () => void;
}

const ChapterForm: React.FC<ChapterFormProps> = ({ chapter, characters, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    keyEvents: [] as string[],
    charactersInvolved: [] as string[],
    emotionalTone: 'متوازن',
    pacing: 'متوسط',
    culturalElements: [] as string[],
    themes: [] as string[],
    plotAdvancement: '',
    wordTarget: 5000 // Increased default from 3000 to 5000
  });

  const [newEvent, setNewEvent] = useState('');
  const [newCulturalElement, setNewCulturalElement] = useState('');
  const [newTheme, setNewTheme] = useState('');

  const emotionalTones = [
    'متوازن', 'مرح', 'حزين', 'متوتر', 'مثير', 'هادئ', 'دراماتيكي', 'رومانسي', 'غامض', 'مشوق'
  ];

  const pacingOptions = [
    'بطيء', 'متوسط', 'سريع', 'متسارع', 'متغير'
  ];

  useEffect(() => {
    if (chapter) {
      setFormData({
        title: chapter.title,
        synopsis: chapter.synopsis,
        keyEvents: chapter.keyEvents || [],
        charactersInvolved: chapter.charactersInvolved || [],
        emotionalTone: chapter.emotionalTone,
        pacing: chapter.pacing,
        culturalElements: chapter.culturalElements || [],
        themes: chapter.themes || [],
        plotAdvancement: chapter.plotAdvancement,
        wordTarget: chapter.wordTarget
      });
    }
  }, [chapter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('يرجى إدخال عنوان الفصل');
      return;
    }

    if (!formData.synopsis.trim()) {
      alert('يرجى إدخال ملخص الفصل');
      return;
    }

    onSave(formData);
  };

  const addEvent = () => {
    if (newEvent.trim() && !formData.keyEvents.includes(newEvent.trim())) {
      setFormData({
        ...formData,
        keyEvents: [...formData.keyEvents, newEvent.trim()]
      });
      setNewEvent('');
    }
  };

  const removeEvent = (event: string) => {
    setFormData({
      ...formData,
      keyEvents: formData.keyEvents.filter(e => e !== event)
    });
  };

  const toggleCharacter = (characterId: string, characterName: string) => { // Accept both ID and Name
    if (formData.charactersInvolved.includes(characterId)) { // Check for ID
      setFormData({
        ...formData,
        charactersInvolved: formData.charactersInvolved.filter(c => c !== characterId) // Remove ID
      });
    } else {
      setFormData({
        ...formData,
        charactersInvolved: [...formData.charactersInvolved, characterId] // Add ID
      });
    }
  };

  const addCulturalElement = () => {
    if (newCulturalElement.trim() && !formData.culturalElements.includes(newCulturalElement.trim())) {
      setFormData({
        ...formData,
        culturalElements: [...formData.culturalElements, newCulturalElement.trim()]
      });
      setNewCulturalElement('');
    }
  };

  const removeCulturalElement = (element: string) => {
    setFormData({
      ...formData,
      culturalElements: formData.culturalElements.filter(e => e !== element)
    });
  };

  const addTheme = () => {
    if (newTheme.trim() && !formData.themes.includes(newTheme.trim())) {
      setFormData({
        ...formData,
        themes: [...formData.themes, newTheme.trim()]
      });
      setNewTheme('');
    }
  };

  const removeTheme = (theme: string) => {
    setFormData({
      ...formData,
      themes: formData.themes.filter(t => t !== theme)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {chapter ? 'تحرير الفصل' : 'إضافة فصل جديد'}
          </DialogTitle>
          <DialogDescription>
            {chapter 
              ? 'قم بتحرير بيانات الفصل أدناه'
              : 'أدخل بيانات الفصل الجديد أدناه'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان الفصل *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="أدخل عنوان الفصل"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wordTarget">الهدف الكلمات</Label>
              <Input
                id="wordTarget"
                type="number"
                value={formData.wordTarget}
                onChange={(e) => setFormData({ ...formData, wordTarget: parseInt(e.target.value) || 3000 })}
                min="500"
                max="10000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="synopsis">ملخص الفصل *</Label>
            <Textarea
              id="synopsis"
              value={formData.synopsis}
              onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
              placeholder="ملخص مفصل لأحداث الفصل والهدف منه"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emotionalTone">النبرة العاطفية</Label>
              <Select value={formData.emotionalTone} onValueChange={(value) => setFormData({ ...formData, emotionalTone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر النبرة العاطفية" />
                </SelectTrigger>
                <SelectContent>
                  {emotionalTones.map((tone) => (
                    <SelectItem key={tone} value={tone}>{tone}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pacing">إيقاع الفصل</Label>
              <Select value={formData.pacing} onValueChange={(value) => setFormData({ ...formData, pacing: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر إيقاع الفصل" />
                </SelectTrigger>
                <SelectContent>
                  {pacingOptions.map((pace) => (
                    <SelectItem key={pace} value={pace}>{pace}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>الأحداث الرئيسية</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newEvent}
                onChange={(e) => setNewEvent(e.target.value)}
                placeholder="أدخل حدث رئيسي"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEvent())}
              />
              <Button type="button" onClick={addEvent} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.keyEvents.map((event, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {event}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeEvent(event)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>الشخصيات المشاركة</Label>
            <div className="flex flex-wrap gap-2">
              {characters.map((character) => (
                <Badge
                  key={character.id}
                  variant={formData.charactersInvolved.includes(character.id) ? "default" : "outline"} // Check for ID
                  className="cursor-pointer"
                  onClick={() => toggleCharacter(character.id, character.name)} // Pass ID
                >
                  {character.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>العناصر الثقافية</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newCulturalElement}
                onChange={(e) => setNewCulturalElement(e.target.value)}
                placeholder="أدخل عنصر ثقافي"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCulturalElement())}
              />
              <Button type="button" onClick={addCulturalElement} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.culturalElements.map((element, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {element}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeCulturalElement(element)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>المواضيع والثيمات</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTheme}
                onChange={(e) => setNewTheme(e.target.value)}
                placeholder="أدخل موضوع أو ثيمة"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTheme())}
              />
              <Button type="button" onClick={addTheme} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.themes.map((theme, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {theme}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTheme(theme)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plotAdvancement">تطور الحبكة</Label>
            <Textarea
              id="plotAdvancement"
              value={formData.plotAdvancement}
              onChange={(e) => setFormData({ ...formData, plotAdvancement: e.target.value })}
              placeholder="كيف يساهم هذا الفصل في تطوير الحبكة العامة للرواية"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="submit">
              {chapter ? 'حفظ التغييرات' : 'إضافة الفصل'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterForm;

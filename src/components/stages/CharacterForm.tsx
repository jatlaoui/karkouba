import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  role: string;
  age: number;
  description: string;
  background: string;
  personality: string[];
  motivations: string[];
  relationships: any[];
  development: any[];
  voice: string;
  dialogue_style: string;
}

interface CharacterFormProps {
  character?: Character | null;
  onSave: (characterData: any) => void;
  onCancel: () => void;
}

const CharacterForm: React.FC<CharacterFormProps> = ({ character, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    age: 30,
    description: '',
    background: '',
    personality: [] as string[],
    motivations: [] as string[],
    voice: '',
    dialogue_style: ''
  });

  const [newPersonality, setNewPersonality] = useState('');
  const [newMotivation, setNewMotivation] = useState('');

  useEffect(() => {
    if (character) {
      setFormData({
        name: character.name,
        role: character.role,
        age: character.age,
        description: character.description,
        background: character.background,
        personality: character.personality || [],
        motivations: character.motivations || [],
        voice: character.voice,
        dialogue_style: character.dialogue_style || ''
      });
    }
  }, [character]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('يرجى إدخال اسم الشخصية');
      return;
    }

    onSave({
      ...formData,
      relationships: character?.relationships || [],
      development: character?.development || []
    });
  };

  const addPersonality = () => {
    if (newPersonality.trim() && !formData.personality.includes(newPersonality.trim())) {
      setFormData({
        ...formData,
        personality: [...formData.personality, newPersonality.trim()]
      });
      setNewPersonality('');
    }
  };

  const removePersonality = (trait: string) => {
    setFormData({
      ...formData,
      personality: formData.personality.filter(p => p !== trait)
    });
  };

  const addMotivation = () => {
    if (newMotivation.trim() && !formData.motivations.includes(newMotivation.trim())) {
      setFormData({
        ...formData,
        motivations: [...formData.motivations, newMotivation.trim()]
      });
      setNewMotivation('');
    }
  };

  const removeMotivation = (motivation: string) => {
    setFormData({
      ...formData,
      motivations: formData.motivations.filter(m => m !== motivation)
    });
  };

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {character ? 'تحرير الشخصية' : 'إضافة شخصية جديدة'}
          </DialogTitle>
          <DialogDescription>
            {character 
              ? 'قم بتحرير بيانات الشخصية أدناه'
              : 'أدخل بيانات الشخصية الجديدة أدناه'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">اسم الشخصية *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="أدخل اسم الشخصية"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">دور الشخصية</Label>
              <Input
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="مثل: البطل، الشخصية المساعدة، المعارض"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">العمر</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 30 })}
              min="1"
              max="100"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">وصف الشخصية</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف مختصر للشخصية ومظهرها وسماتها البارزة"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">خلفية الشخصية</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => setFormData({ ...formData, background: e.target.value })}
              placeholder="الخلفية الثقافية والاجتماعية والمهنية للشخصية"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>السمات الشخصية</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newPersonality}
                onChange={(e) => setNewPersonality(e.target.value)}
                placeholder="أدخل سمة شخصية"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPersonality())}
              />
              <Button type="button" onClick={addPersonality} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.personality.map((trait, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {trait}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removePersonality(trait)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>دوافع الشخصية</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newMotivation}
                onChange={(e) => setNewMotivation(e.target.value)}
                placeholder="أدخل دافع أو هدف"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMotivation())}
              />
              <Button type="button" onClick={addMotivation} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.motivations.map((motivation, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {motivation}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeMotivation(motivation)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voice">صوت الشخصية</Label>
            <Textarea
              id="voice"
              value={formData.voice}
              onChange={(e) => setFormData({ ...formData, voice: e.target.value })}
              placeholder="وصف أسلوب الحديث والصوت المميز للشخصية"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dialogue_style">أسلوب الحوار</Label>
            <Textarea
              id="dialogue_style"
              value={formData.dialogue_style}
              onChange={(e) => setFormData({ ...formData, dialogue_style: e.target.value })}
              placeholder="أسلوب الحوار المميز للشخصية (رسمي، عامي، شاعري، إلخ)"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
            <Button type="submit">
              {character ? 'حفظ التغييرات' : 'إضافة الشخصية'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CharacterForm;

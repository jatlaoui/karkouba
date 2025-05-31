import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText,
  Users,
  BookOpen,
  Target,
  Palette,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Building,
  Heart,
  MapPin,
  Clock,
  Star,
  Edit,
  Eye,
  Save
} from 'lucide-react';
import { useAIWritingJourney } from '@/context/AIWritingJourneyContext';
import { toast } from '@/hooks/use-toast';
import CharacterForm from './CharacterForm';
import ChapterForm from './ChapterForm';

const Stage3BlueprintBuilder: React.FC = () => {
  const { state, dispatch } = useAIWritingJourney();
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildingProgress, setBuildingProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);

  useEffect(() => {
    if (!state.novelBlueprint && state.selectedIdea) {
      buildBlueprint();
    }
  }, [state.selectedIdea]);

  // وظائف إضافة وتحرير الشخصيات
  const addNewCharacter = (characterData) => {
    const newCharacter = {
      id: `character-${Date.now()}`,
      name: characterData.name || 'شخصية جديدة',
      role: characterData.role || 'شخصية ثانوية',
      age: characterData.age || 30,
      description: characterData.description || 'وصف الشخصية',
      background: characterData.background || 'خلفية الشخصية',
      personality: characterData.personality || ['متوازن'],
      motivations: characterData.motivations || ['هدف أساسي'],
      relationships: characterData.relationships || [],
      development: characterData.development || [],
      voice: characterData.voice || 'صوت الشخصية',
      dialogue_style: characterData.voice || 'أسلوب حوار طبيعي ومعبر'
    };

    const updatedBlueprint = {
      ...state.novelBlueprint,
      structure: {
        ...state.novelBlueprint.structure,
        characters: [...state.novelBlueprint.structure.characters, newCharacter]
      }
    };

    dispatch({ type: 'SET_NOVEL_BLUEPRINT', payload: updatedBlueprint });
    setShowCharacterForm(false);
    toast({
      title: "تم إضافة الشخصية بنجاح",
      description: `تم إضافة ${newCharacter.name} إلى المخطط`,
    });
  };

  // وظائف إضافة وتحرير الفصول
  const addNewChapter = (chapterData) => {
    const chapterNumber = state.novelBlueprint.structure.chapters.length + 1;
    const newChapter = {
      id: `chapter-${Date.now()}`,
      number: chapterNumber,
      title: chapterData.title || `الفصل ${chapterNumber}`,
      synopsis: chapterData.synopsis || 'ملخص الفصل',
      keyEvents: chapterData.keyEvents || ['حدث رئيسي'],
      charactersInvolved: chapterData.charactersInvolved || ['الشخصية الرئيسية'],
      emotionalTone: chapterData.emotionalTone || 'متوازن',
      pacing: chapterData.pacing || 'متوسط',
      culturalElements: chapterData.culturalElements || [],
      themes: chapterData.themes || [],
      plotAdvancement: chapterData.plotAdvancement || 'تطوير الحبكة',
      wordTarget: chapterData.wordTarget || 3000
    };

    const updatedBlueprint = {
      ...state.novelBlueprint,
      structure: {
        ...state.novelBlueprint.structure,
        chapters: [...state.novelBlueprint.structure.chapters, newChapter],
        overview: {
          ...state.novelBlueprint.structure.overview,
          chapterCount: state.novelBlueprint.structure.overview.chapterCount + 1
        }
      }
    };

    dispatch({ type: 'SET_NOVEL_BLUEPRINT', payload: updatedBlueprint });
    setShowChapterForm(false);
    toast({
      title: "تم إضافة الفصل بنجاح", 
      description: `تم إضافة ${newChapter.title} إلى المخطط`,
    });
  };

  // وظيفة حذف شخصية
  const deleteCharacter = (characterId) => {
    const updatedCharacters = state.novelBlueprint.structure.characters.filter(
      char => char.id !== characterId
    );
    
    const updatedBlueprint = {
      ...state.novelBlueprint,
      structure: {
        ...state.novelBlueprint.structure,
        characters: updatedCharacters
      }
    };

    dispatch({ type: 'SET_NOVEL_BLUEPRINT', payload: updatedBlueprint });
    toast({
      title: "تم حذف الشخصية",
      description: "تم حذف الشخصية من المخطط بنجاح",
    });
  };

  // وظيفة حذف فصل
  const deleteChapter = (chapterId) => {
    const updatedChapters = state.novelBlueprint.structure.chapters.filter(
      chapter => chapter.id !== chapterId
    );
    
    const updatedBlueprint = {
      ...state.novelBlueprint,
      structure: {
        ...state.novelBlueprint.structure,
        chapters: updatedChapters,
        overview: {
          ...state.novelBlueprint.structure.overview,
          chapterCount: updatedChapters.length
        }
      }
    };

    dispatch({ type: 'SET_NOVEL_BLUEPRINT', payload: updatedBlueprint });
    toast({
      title: "تم حذف الفصل",
      description: "تم حذف الفصل من المخطط بنجاح",
    });
  };

  const buildBlueprint = async () => {
    if (!state.selectedIdea || !state.sourceAnalysis) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار فكرة وتحليل رواية مصدر أولاً قبل بناء المخطط.",
        variant: "destructive",
      });
      return;
    }
 
     setIsBuilding(true);
     setBuildingProgress(0); // Reset progress
     dispatch({ type: 'SET_LOADING', payload: true });
 
     try {
       const stageId = 3; // Stage 3 for Blueprint Builder
       const modelId = state.selectedAIModels[stageId];
       const apiKey = state.apiKeys[modelId];
       const promptTemplate = state.promptTemplates['build_blueprint'];
 
       if (!modelId) {
         throw new Error("لم يتم تحديد نموذج AI لبناء المخطط.");
       }
       if (!promptTemplate) {
         throw new Error("لم يتم العثور على قالب الموجه لبناء المخطط.");
       }
 
       const dynamicVariables = {
         SELECTED_IDEA: JSON.stringify(state.selectedIdea),
         SOURCE_ANALYSIS_SUMMARY: state.sourceAnalysis.content,
         STYLE_PROFILE: JSON.stringify(state.sourceAnalysis.styleProfile),
         CULTURAL_ELEMENTS: JSON.stringify(state.sourceAnalysis.culturalElements),
         // Add other relevant context from sourceAnalysis as needed
       };
 
       const response = await fetch('http://localhost:3002/api/ai/process', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           action: 'build_blueprint',
           modelId,
           apiKey,
           promptTemplate,
           dynamicVariables,
         }),
       });
 
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.message || 'فشل استدعاء API لبناء المخطط.');
       }
 
       const result = await response.json();
       // Assuming the backend returns the blueprint in result.result
       const novelBlueprint = result.result;
 
       if (!novelBlueprint || !novelBlueprint.structure || !novelBlueprint.structure.chapters || !novelBlueprint.structure.characters) {
         throw new Error("لم يتم توليد مخطط صالح من AI.");
       }
 
       dispatch({ type: 'SET_NOVEL_BLUEPRINT', payload: novelBlueprint });
       toast({
         title: "تم بناء المخطط بنجاح",
         description: `تم إنشاء مخطط شامل للرواية "${state.selectedIdea.title}" بـ ${novelBlueprint.structure.overview.chapterCount} فصل.`,
       });

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'فشل في بناء المخطط. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsBuilding(false);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (isBuilding) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-600" />
              جارٍ بناء المخطط الذكي
            </CardTitle>
            <CardDescription>
              نقوم ببناء مخطط شامل للرواية يتضمن الهيكل والشخصيات والمواضيع
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={buildingProgress} className="w-full" />
              <div className="text-sm text-gray-600 text-center">
                الذكاء الاصطناعي يعمل على بناء المخطط...
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!state.novelBlueprint) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>باني المخطط الذكي</CardTitle>
            <CardDescription>
              لم يتم بناء المخطط بعد. يجب اختيار فكرة من المرحلة السابقة أولاً.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={buildBlueprint} disabled={!state.selectedIdea} className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              بناء المخطط الذكي
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const blueprint = state.novelBlueprint;

  return (
    <div className="space-y-6">
      {/* رأس القسم */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">المخطط الذكي: {blueprint.idea.title}</h3>
          <p className="text-sm text-gray-600">
            مخطط شامل للرواية مع {blueprint.structure.overview.chapterCount} فصل
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={buildBlueprint} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            إعادة بناء المخطط
          </Button>
          <Button 
            onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 4 })}
            className="flex items-center gap-2"
          >
            <ArrowRight className="h-4 w-4" />
            إلى توليد الفصول
          </Button>
        </div>
      </div>

      {/* محتوى المخطط */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">النظرة العامة</TabsTrigger>
              <TabsTrigger value="structure">الهيكل</TabsTrigger>
              <TabsTrigger value="characters">الشخصيات</TabsTrigger>
              <TabsTrigger value="chapters">الفصول</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                      معلومات أساسية
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">النوع:</span>
                        <Badge variant="secondary">{blueprint.structure.overview.genre}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">عدد الفصول:</span>
                        <span className="font-medium">{blueprint.structure.overview.chapterCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الطول المتوقع:</span>
                        <span className="font-medium">{blueprint.structure.overview.estimatedWords.toLocaleString()} كلمة</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">النبرة:</span>
                        <span className="font-medium">{blueprint.structure.overview.tone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-600" />
                      المكان والزمان
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">المكان: </span>
                        <span className="font-medium">{blueprint.structure.overview.setting}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الزمان: </span>
                        <span className="font-medium">{blueprint.structure.overview.timeframe}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-red-600" />
                      المواضيع الرئيسية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.themes.primary.map((theme, index) => (
                        <Badge key={index} variant="outline">{theme}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-purple-600" />
                      المواضيع الثانوية
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {blueprint.themes.secondary.map((theme, index) => (
                        <Badge key={index} variant="secondary">{theme}</Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-600" />
                      الرموز الأدبية
                    </h4>
                    <div className="space-y-2">
                      {blueprint.themes.symbols.map((symbol, index) => (
                        <div key={index} className="p-2 border rounded-lg">
                          <div className="font-medium text-sm">{symbol.symbol}</div>
                          <div className="text-xs text-gray-600">{symbol.meaning}</div>
                          <div className="text-xs text-gray-500">الفصول: {symbol.chapters.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="structure" className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-4 w-4 text-blue-600" />
                  هيكل الحبكة
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-semibold mb-3">البنية السردية</h5>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">النوع: </span>
                        <span className="font-medium">{blueprint.structure.plotStructure.actStructure}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الإيقاع: </span>
                        <span className="font-medium">{blueprint.structure.plotStructure.pacing}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">الذروة: </span>
                        <span className="font-medium">الفصل {blueprint.structure.plotStructure.climax.chapter}</span>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h6 className="font-semibold mb-2">وصف الذروة</h6>
                      <p className="text-sm text-gray-600">{blueprint.structure.plotStructure.climax.description}</p>
                    </div>
                    
                    <div className="mt-4">
                      <h6 className="font-semibold mb-2">الحل</h6>
                      <p className="text-sm text-gray-600">{blueprint.structure.plotStructure.resolution}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold mb-3">النقاط المحورية</h5>
                    <div className="space-y-3">
                      {blueprint.structure.plotStructure.plotPoints.map((point, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h6 className="font-medium text-sm">{point.type}</h6>
                            <Badge variant="outline" className="text-xs">
                              الفصل {point.chapter}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">{point.description}</p>
                          <p className="text-xs text-gray-500">{point.significance}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="characters" className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    الشخصيات الرئيسية
                  </h4>
                  <Button 
                    onClick={() => setShowCharacterForm(true)}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <Users className="h-4 w-4" />
                    إضافة شخصية
                  </Button>
                </div>
                
                <div className="grid gap-6">
                  {blueprint.structure.characters.map((character) => (
                    <Card key={character.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{character.name}</CardTitle>
                            <CardDescription>{character.role} - {character.age} سنة</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{character.role}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingCharacter(character);
                                setShowCharacterForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteCharacter(character.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold mb-2">الوصف والخلفية</h5>
                            <p className="text-sm text-gray-600 mb-3">{character.description}</p>
                            <p className="text-sm text-gray-600">{character.background}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold mb-2">السمات الشخصية</h5>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {character.personality.map((trait, index) => (
                                <Badge key={index} variant="outline">{trait}</Badge>
                              ))}
                            </div>
                            
                            <h5 className="font-semibold mb-2">الدوافع</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {character.motivations.map((motivation, index) => (
                                <li key={index}>• {motivation}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="font-semibold mb-2">التطور عبر القصة</h5>
                          <div className="space-y-2">
                            {character.development.map((dev, index) => (
                              <div key={index} className="flex items-center gap-3 p-2 border rounded">
                                <Badge variant="outline" className="text-xs">
                                  ف{dev.chapter}
                                </Badge>
                                <div className="flex-1">
                                  <div className="text-sm font-medium">{dev.event}</div>
                                  <div className="text-xs text-gray-600">{dev.growth}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <h5 className="font-semibold mb-1 text-sm">الصوت السردي</h5>
                            <p className="text-xs text-gray-600">{character.voice}</p>
                          </div>
                          <div>
                            <h5 className="font-semibold mb-1 text-sm">أسلوب الحوار</h5>
                            <p className="text-xs text-gray-600">{character.dialogue_style}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="chapters" className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    مخططات الفصول المفصلة
                  </h4>
                  <Button 
                    onClick={() => setShowChapterForm(true)}
                    className="flex items-center gap-2"
                    variant="outline"
                  >
                    <BookOpen className="h-4 w-4" />
                    إضافة فصل
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {blueprint.structure.chapters.map((chapter) => (
                    <Card key={chapter.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{chapter.title}</CardTitle>
                            <CardDescription>الهدف: {chapter.wordTarget.toLocaleString()} كلمة</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{chapter.emotionalTone}</Badge>
                            <Badge variant="outline">{chapter.pacing}</Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingChapter(chapter);
                                setShowChapterForm(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteChapter(chapter.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-semibold mb-2">ملخص الفصل</h5>
                            <p className="text-sm text-gray-600 mb-4">{chapter.synopsis}</p>
                            
                            <h5 className="font-semibold mb-2">الأحداث الرئيسية</h5>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {chapter.keyEvents.map((event, index) => (
                                <li key={index}>• {event}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-semibold mb-2">الشخصيات المشاركة</h5>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {chapter.charactersInvolved.map((character, index) => (
                                <Badge key={index} variant="outline">{character}</Badge>
                              ))}
                            </div>
                            
                            <h5 className="font-semibold mb-2">العناصر الثقافية</h5>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {chapter.culturalElements.map((element, index) => (
                                <Badge key={index} variant="secondary">{element}</Badge>
                              ))}
                            </div>
                            
                            <h5 className="font-semibold mb-2">تقدم الحبكة</h5>
                            <p className="text-sm text-gray-600">{chapter.plotAdvancement}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* معلومات إضافية */}
      <Card className="border-purple-200 bg-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <h4 className="font-semibold text-purple-900 mb-2">
                تم بناء المخطط الذكي بنجاح
              </h4>
              <p className="text-purple-700 text-sm mb-4">
                لديك الآن مخطط شامل للرواية يتضمن {blueprint.structure.overview.chapterCount} فصل 
                مع تطوير مفصل للشخصيات والحبكة والمواضيع. يمكنك الآن الانتقال لمرحلة توليد الفصول.
              </p>
              <div className="flex gap-2">
                <Button 
                  onClick={() => dispatch({ type: 'SET_CURRENT_STAGE', payload: 4 })}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  الانتقال لتوليد الفصول
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  حفظ المخطط
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  معاينة كاملة
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* نموذج إضافة/تحرير شخصية */}
      {showCharacterForm && (
        <CharacterForm 
          character={editingCharacter}
          onSave={addNewCharacter}
          onCancel={() => {
            setShowCharacterForm(false);
            setEditingCharacter(null);
          }}
        />
      )}

      {/* نموذج إضافة/تحرير فصل */}
      {showChapterForm && (
        <ChapterForm 
          chapter={editingChapter}
          characters={state.novelBlueprint?.structure?.characters || []}
          onSave={addNewChapter}
          onCancel={() => {
            setShowChapterForm(false);
            setEditingChapter(null);
          }}
        />
      )}
    </div>
  );
};

export default Stage3BlueprintBuilder;

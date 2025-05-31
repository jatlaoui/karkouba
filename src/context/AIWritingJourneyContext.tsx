/**
 * AI Writing Journey Context - سياق رحلة الكتابة الذكية
 * 
 * يدير الحالة المشتركة لجميع المراحل الست:
 * 1. تحليل الرواية المصدر
 * 2. معمل الأفكار المحسن
 * 3. بناء المخطط الذكي
 * 4. توليد الفصول الموجه
 * 5. المحرر التفاعلي المتقدم
 * 6. التنقيح والتصدير النهائي
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3002/api'; // Connect directly to the local backend

// أنواع البيانات للمراحل المختلفة
export interface StyleProfile {
  vocabulary: string;
  sentenceStructure: string;
  toneProfile: string;
  narrativePerspective: string;
  dialogueStyle: string;
  descriptiveLevel: string;
  culturalContext: string[];
  rhetoricalDevices: string[];
  pacing: string;
  characterization: string;
}

export interface PlotBlueprint {
  type: string;
  chapters: number;
  acts: string[];
  themes: string[];
  pacing: string;
  conflictTypes: string[];
  plotPoints: Array<{
    chapter: number;
    title: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  climaxPosition: number;
  resolution: string;
}

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  age?: number;
  description: string;
  background: string;
  personality: string[];
  motivations: string[];
  relationships: Array<{
    character: string;
    relationship: string;
    description: string;
  }>;
  development: Array<{
    chapter: number;
    event: string;
    growth: string;
  }>;
  voice: string;
  dialogue_style: string;
}

export interface LorebookEntry {
  id: string;
  title: string;
  type: 'location' | 'event' | 'concept' | 'culture' | 'object';
  description: string;
  significance: string;
  relationships: string[];
  chapters: number[];
}

export interface SourceNovelAnalysis {
  title: string;
  author: string;
  content: string;
  uploadDate: Date;
  wordCount: number;
  chapterCount: number;
  styleProfile: StyleProfile;
  plotBlueprint: PlotBlueprint;
  characters: CharacterProfile[];
  lorebook: LorebookEntry[];
  themes: string[];
  culturalElements: string[];
  analysis: {
    complexity: number;
    innovation: number;
    authenticity: number;
    readability: number;
  };
}

export interface GeneratedIdea {
  id: string;
  title: string;
  genre: string;
  setting: string;
  timeframe: string;
  mainCharacter: string;
  conflict: string;
  theme: string;
  synopsis: string;
  uniqueElements: string[];
  culturalContext: string;
  estimatedChapters: number;
  targetAudience: string;
  description: string;
  rating: {
    originality: number;
    appeal: number;
    feasibility: number;
    culturalRelevance: number;
  };
  selected: boolean;
}

export interface NovelBlueprint {
  idea: GeneratedIdea;
  structure: {
    overview: {
      title: string;
      genre: string;
      targetLength: number;
      chapterCount: number;
      estimatedWords: number;
      themes: string[];
      tone: string;
      setting: string;
      timeframe: string;
      description: string; // Added missing description property
    };
    plotStructure: {
      actStructure: string;
      plotPoints: Array<{
        type: string;
        chapter: number;
        description: string;
        significance: string;
      }>;
      pacing: string;
      climax: {
        chapter: number;
        description: string;
      };
      resolution: string;
    };
    characters: CharacterProfile[];
    chapters: Array<{
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
    }>;
  };
  themes: {
    primary: string[];
    secondary: string[];
    symbols: Array<{
      symbol: string;
      meaning: string;
      chapters: number[];
    }>;
    motifs: Array<{
      motif: string;
      description: string;
      significance: string;
    }>;
  };
}

export interface GeneratedChapter {
  id: string;
  number: number;
  title: string;
  content: string;
  synopsis: string;
  wordCount: number;
  quality: {
    styleConsistency: number;
    characterConsistency: number;
    plotConsistency: number;
    culturalAuthenticity: number;
    overall: number;
  };
  status: 'draft' | 'reviewed' | 'edited' | 'final';
  metrics: {
    readability: number;
    engagement: number;
    coherence: number;
    innovation: number;
  };
  feedback: Array<{
    type: 'suggestion' | 'error' | 'improvement';
    category: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  lastModified: Date;
}

export interface ProjectMetadata {
  _id: string; // MongoDB ID
  name: string;
  description?: string; // Optional description
  createdAt: string; // Date as string
  updatedAt: string; // Date as string
  currentStage: number; // Current stage of the journey
  lastSaved: string; // Last saved timestamp as string
  // Properties for Dashboard display
  title: string;
  progress: number;
  stage: number;
  wordCount: number;
  lastModified: string;
  novelBlueprint?: NovelBlueprint; // Optional, for dashboard stats
  quality?: { overall: number }; // Optional, for dashboard stats
  selectedAuthorStyleName?: string; // New: To store the name of the selected author style
}

export interface AIWritingJourneyState {
  // Project Management
  currentProjectId: string | null;
  userProjects: ProjectMetadata[]; // List of projects for the current user

  // Stage 1: Source Analysis
  sourceAnalysis: SourceNovelAnalysis | null;
  
  // Stage 2: Enhanced Idea Lab
  generatedIdeas: GeneratedIdea[];
  selectedIdea: GeneratedIdea | null;
  
  // Stage 3: Smart Blueprint Builder
  novelBlueprint: NovelBlueprint | null;
  
  // Stage 4: Guided Chapter Generation
  generatedChapters: GeneratedChapter[];
  generationProgress: {
    currentChapter: number;
    totalChapters: number;
    isGenerating: boolean;
    generationMode: 'sequential' | 'parallel' | 'selective';
  };
  
  // Stage 5: Advanced Interactive Editor
  currentEditingChapter: number | null;
  editorSettings: {
    autoSave: boolean;
    spellCheck: boolean;
    grammarCheck: boolean;
    styleCheck: boolean;
    consistencyCheck: boolean;
  };
  
  // Stage 6: Final Review & Export
  finalProject: {
    metadata: any; // This will be populated from the saved project state
    exportSettings: {
      format: 'txt' | 'docx' | 'pdf';
      includeMetadata: boolean;
      includeAnalysis: boolean;
      customStyling: boolean;
    };
    qualityReport: {
      overallQuality: number;
      strengths: string[];
      improvements: string[];
      recommendations: Array<{
        category: string;
        description: string;
        priority: 'high' | 'medium' | 'low';
      }>;
    };
  } | null;

  // AI Model Selection & Prompt Customization
  selectedAIModels: Record<number, string>; // Maps stage ID to selected model ID (e.g., {1: 'gemini-flash-0520'})
  apiKeys: Record<string, string>; // Maps model ID to API Key (e.g., {'gemini-flash-0520': 'YOUR_KEY'})

  // New Prompt Customization
  promptTemplates: Record<string, string>; // Maps task ID to custom prompt template string (e.g., {'analyze_source': 'Analyze this text...'})
  
  // حالة عامة
  currentStage: number;
  isLoading: boolean;
  error: string | null;
  lastSaved: Date | null;
}

// أنواع الإجراءات
export type AIWritingJourneyAction =
  // Project Management Actions
  | { type: 'SET_PROJECT_METADATA'; payload: { id: string; name: string; description?: string; } }
  | { type: 'SET_USER_PROJECTS'; payload: ProjectMetadata[] }
  | { type: 'LOAD_PROJECT_STATE'; payload: AIWritingJourneyState }
  | { type: 'LOAD_PROJECT'; payload: string } // Added LOAD_PROJECT action
  | { type: 'CREATE_NEW_PROJECT'; payload?: { name?: string; description?: string; } }

  // Stage 1: Source Analysis
  | { type: 'SET_SOURCE_ANALYSIS'; payload: SourceNovelAnalysis | null }
  | { type: 'START_ANALYSIS'; payload: { title: string; content: string } }
  
  // Stage 2: Enhanced Idea Lab
  | { type: 'SET_GENERATED_IDEAS'; payload: GeneratedIdea[] }
  | { type: 'SELECT_IDEA'; payload: GeneratedIdea }
  | { type: 'RATE_IDEA'; payload: { id: string; rating: GeneratedIdea['rating'] } }
  
  // Stage 3: Smart Blueprint Builder
  | { type: 'SET_NOVEL_BLUEPRINT'; payload: NovelBlueprint | null }
  | { type: 'UPDATE_BLUEPRINT_SECTION'; payload: { section: string; data: any } }
  
  // Stage 4: Guided Chapter Generation
  | { type: 'ADD_GENERATED_CHAPTER'; payload: GeneratedChapter }
  | { type: 'UPDATE_CHAPTER'; payload: { id: string; updates: Partial<GeneratedChapter> } }
  | { type: 'SET_GENERATION_PROGRESS'; payload: Partial<AIWritingJourneyState['generationProgress']> }
  
  // Stage 5: Advanced Interactive Editor
  | { type: 'SET_CURRENT_EDITING_CHAPTER'; payload: number | null }
  | { type: 'UPDATE_EDITOR_SETTINGS'; payload: Partial<AIWritingJourneyState['editorSettings']> }
  | { type: 'EDIT_CHAPTER_CONTENT'; payload: { id: string; content: string } }
  
  // Stage 6: Final Review & Export
  | { type: 'SET_FINAL_PROJECT'; payload: AIWritingJourneyState['finalProject'] }
  | { type: 'UPDATE_EXPORT_SETTINGS'; payload: Partial<AIWritingJourneyState['finalProject']['exportSettings']> }
  
  // AI Model Selection Actions
  | { type: 'SET_AI_MODEL_FOR_STAGE'; payload: { stageId: number; modelId: string } }
  | { type: 'SET_API_KEY_FOR_MODEL'; payload: { modelId: string; key: string } }
  | { type: 'SET_API_KEYS_FROM_DB'; payload: Record<string, string> } // New action to load keys from DB
 
  // Prompt Customization Action
  | { type: 'SET_PROMPT_TEMPLATE'; payload: { taskId: string; template: string } }
  | { type: 'SET_PROMPT_TEMPLATES_FROM_DB'; payload: Record<string, string> } // New action to load templates from DB

  // General Actions
  | { type: 'SET_CURRENT_STAGE'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SAVE_PROJECT'; payload?: { name?: string; description?: string; } } // Payload for initial save
  | { type: 'SET_LAST_SAVED'; payload: Date | null }; // New action for last saved timestamp

// الحالة الأولية
const initialState: AIWritingJourneyState = {
  currentProjectId: null,
  userProjects: [],
  sourceAnalysis: null,
  generatedIdeas: [],
  selectedIdea: null,
  novelBlueprint: null,
  generatedChapters: [],
  generationProgress: {
    currentChapter: 0,
    totalChapters: 0,
    isGenerating: false,
    generationMode: 'sequential'
  },
  currentEditingChapter: null,
  editorSettings: {
    autoSave: true,
    spellCheck: true,
    grammarCheck: true,
    styleCheck: true,
    consistencyCheck: true
  },
  finalProject: null,
  selectedAIModels: {
    1: 'default-model', // Stage 1: Source Analysis
    2: 'default-model', // Stage 2: Idea Lab
    3: 'default-model', // Stage 3: Blueprint Builder
    4: 'default-model', // Stage 4: Chapter Generation
    5: 'default-model', // Stage 5: Interactive Editor
    6: 'default-model', // Stage 6: Final Review
  },
  apiKeys: {},
  promptTemplates: {
    'analyze_source': `حلل الرواية المصدر التالية وقدم تقريراً مفصلاً عن أسلوبها السردي، بنية الجمل، نبرة الصوت، الشخصيات الرئيسية، الحبكة، المواضيع، والعناصر الثقافية. يرجى إرجاع النتائج بتنسيق JSON.
النص:
[SOURCE_CONTENT_PREVIEW]`,
    'generate_idea': `بناءً على تحليل الأسلوب والثقافة من الرواية المصدر، ولد 5 أفكار لروايات عربية جديدة. كل فكرة يجب أن تتضمن: عنوان، نوع، مكان وزمان، شخصية رئيسية، صراع، ثيمة، ملخص، عناصر فريدة، سياق ثقافي، وعدد فصول مقدر (بين 10 و 15 فصل). قدم الأفكار بتنسيق JSON.
تحليل الأسلوب: [SOURCE_STYLE_SUMMARY]
العناصر الثقافية: [SOURCE_CULTURAL_ELEMENTS]`,
    'build_blueprint': `قم ببناء مخطط تفصيلي لرواية جديدة بناءً على الفكرة المختارة. يجب أن يشمل المخطط: نظرة عامة (العنوان، النوع، الطول المستهدف، الفصول المقدرة، الثيمات، النبرة، المكان والزمان)، هيكل الحبكة (بنية الأفعال، النقاط المحورية، الإيقاع، الذروة، الحل)، قائمة بالشخصيات الرئيسية (الاسم، الدور، العمر، الوصف، الخلفية، السمات، الدوافع، التطور، الصوت، أسلوب الحوار)، ومخططات موجزة لكل فصل (العنوان، الملخص، الأحداث الرئيسية، الشخصيات المشاركة، النبرة العاطفية، الإيقاع، العناصر الثقافية، الثيمات، تقدم الحبكة، الهدف الكلمات). قدم المخطط بتنسيق JSON.
الفكرة المختارة: [SELECTED_IDEA_DETAILS]`,
    'generate_chapter': `اكتب محتوى الفصل رقم [CHAPTER_NUMBER] من الرواية.
عنوان الرواية: [NOVEL_TITLE]
عنوان هذا الفصل: [CHAPTER_TITLE]
ملخص هذا الفصل: [CHAPTER_SYNOPSIS]
الأحداث الرئيسية التي يجب أن يتضمنها هذا الفصل: [CHAPTER_KEY_EVENTS]
الشخصيات المشاركة في هذا الفصل: [CHAPTER_CHARACTERS_INVOLVED] (ادمج هذه الشخصيات بشكل فعال).
النبرة العاطفية المطلوبة: [CHAPTER_EMOTIONAL_TONE]
إيقاع الفصل: [CHAPTER_PACING] (مثل: بطيء، متسارع، متوسط).
هذا الفصل يجب أن يساهم في: [CHAPTER_PLOT_ADVANCEMENT] (تطور الحبكة).
العناصر الثقافية الرئيسية التي يجب دمجها: [CHAPTER_CULTURAL_ELEMENTS]
الهدف التقريبي لعدد الكلمات: [CHAPTER_WORD_TARGET] كلمة. يرجى محاولة الوصول إلى هذا الهدف، مع التأكد من أن الفصل ذو جودة عالية ولا يقل عن 2000 كلمة على الأقل.
حافظ على الأسلوب السردي للرواية المصدر: [SOURCE_STYLE_PROFILE_SUMMARY] (استخدم المفردات المعقدة، بنية الجمل المتنوعة، والنبرة الشاعرية).
ملخص الرواية حتى الآن (لمساعدتك في الحفاظ على الاتساق): [NOVEL_GLOBAL_SUMMARY]
ملخص الفصل السابق: [PREVIOUS_CHAPTER_SUMMARY]
الناتج يجب أن يكون نصاً روائياً عربياً عالي الجودة.
[OUTPUT_FORMAT_REQUIREMENTS]`,
    'enhance_text': `قم بتحسين النص المحدد. يمكن أن يشمل التحسين: تعميق الوصف، جعل الحوارات أكثر طبيعية، تحسين تدفق الجمل، أو إضافة تفاصيل حسية.
النص للتحسين:
[SELECTED_TEXT_TO_ENHANCE]`,
    'check_consistency': `فحص الاتساق في الفصل التالي. ابحث عن أي تناقضات في الحبكة، تطور الشخصيات، أو الأسلوب مقارنةً بالمخطط العام وتحليل المصدر. قدم تقريراً عن أي تناقضات مقترحات للحل بتنسيق JSON.
الفصل: [CHAPTER_CONTENT]
المخطط العام: [NOVEL_BLUEPRINT_SUMMARY]
الشخصيات: [NOVEL_CHARACTERS_SUMMARY]
الأسلوب المصدر: [SOURCE_STYLE_PROFILE_SUMMARY]`
  },
  currentStage: 1,
  isLoading: false,
  error: null,
  lastSaved: null
};

// مخفض الحالة
function aiWritingJourneyReducer(
  state: AIWritingJourneyState,
  action: AIWritingJourneyAction
): AIWritingJourneyState {
  switch (action.type) {
    case 'SET_SOURCE_ANALYSIS':
      return {
        ...state,
        sourceAnalysis: action.payload,
        currentStage: Math.max(state.currentStage, 2)
      };
    
    case 'START_ANALYSIS':
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case 'SET_GENERATED_IDEAS':
      return {
        ...state,
        generatedIdeas: action.payload,
        currentStage: Math.max(state.currentStage, 3)
      };
    
    case 'SELECT_IDEA':
      return {
        ...state,
        selectedIdea: action.payload,
        generatedIdeas: state.generatedIdeas.map(idea => ({
          ...idea,
          selected: idea.id === action.payload.id
        }))
      };
    
    case 'SET_NOVEL_BLUEPRINT':
      return {
        ...state,
        novelBlueprint: action.payload,
        currentStage: Math.max(state.currentStage, 4)
      };
    
    case 'ADD_GENERATED_CHAPTER':
      return {
        ...state,
        generatedChapters: [...state.generatedChapters, action.payload]
      };
    
    case 'UPDATE_CHAPTER':
      return {
        ...state,
        generatedChapters: state.generatedChapters.map(chapter =>
          chapter.id === action.payload.id
            ? { ...chapter, ...action.payload.updates }
            : chapter
        )
      };
    
    case 'SET_GENERATION_PROGRESS':
      return {
        ...state,
        generationProgress: { ...state.generationProgress, ...action.payload }
      };
    
    case 'SET_CURRENT_EDITING_CHAPTER':
      return {
        ...state,
        currentEditingChapter: action.payload,
        currentStage: Math.max(state.currentStage, 5)
      };
    
    case 'UPDATE_EDITOR_SETTINGS':
      return {
        ...state,
        editorSettings: { ...state.editorSettings, ...action.payload }
      };
    
    case 'SET_FINAL_PROJECT':
      return {
        ...state,
        finalProject: action.payload,
        currentStage: 6
      };
    
    case 'SET_CURRENT_STAGE':
      return {
        ...state,
        currentStage: action.payload
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    
    case 'SAVE_PROJECT':
      // This action is primarily for triggering the save effect, actual state update happens via SET_LAST_SAVED
      return state;

    case 'SET_PROJECT_METADATA':
      return {
        ...state,
        currentProjectId: action.payload.id,
        userProjects: state.userProjects.map(project =>
          project._id === action.payload.id ? { ...project, name: action.payload.name, description: action.payload.description } : project
        ),
      };

    case 'SET_USER_PROJECTS':
      return {
        ...state,
        userProjects: action.payload,
      };

    case 'LOAD_PROJECT_STATE':
      return {
        ...action.payload, // Load the entire state from the payload
        isLoading: false,
        error: null,
      };

    case 'LOAD_PROJECT':
      return {
        ...state,
        currentProjectId: action.payload,
        isLoading: true,
        error: null,
      };

    case 'CREATE_NEW_PROJECT':
      // عند إنشاء مشروع جديد، نعود للحالة الأولية مع الحفاظ على مفاتيح الـ API وقوالب المطالبات
      return {
        ...initialState,
        apiKeys: state.apiKeys,
        promptTemplates: state.promptTemplates,
        currentProjectId: null, // Ensure no project is loaded
        userProjects: action.payload?.name ? [...state.userProjects, { // Corrected from state.payload to action.payload
          _id: `new-project-${Date.now()}`,
          name: action.payload.name,
          description: action.payload.description || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentStage: 1,
          lastSaved: new Date().toISOString(),
          // Default values for dashboard display
          title: action.payload.name,
          progress: 0,
          stage: 1,
          wordCount: 0,
          lastModified: new Date().toISOString(),
        }] : state.userProjects,
      };

    case 'SET_API_KEYS_FROM_DB':
      return {
        ...state,
        apiKeys: action.payload,
      };

    case 'SET_PROMPT_TEMPLATES_FROM_DB':
      return {
        ...state,
        promptTemplates: action.payload,
      };

    case 'SET_LAST_SAVED':
      return {
        ...state,
        lastSaved: action.payload,
      };
    
    case 'SET_AI_MODEL_FOR_STAGE':
      return {
        ...state,
        selectedAIModels: {
          ...state.selectedAIModels,
          [action.payload.stageId]: action.payload.modelId
        }
      };
    case 'SET_API_KEY_FOR_MODEL':
      return {
        ...state,
        apiKeys: {
          ...state.apiKeys,
          [action.payload.modelId]: action.payload.key
        }
      };
    case 'SET_PROMPT_TEMPLATE':
      return {
        ...state,
        promptTemplates: {
          ...state.promptTemplates,
          [action.payload.taskId]: action.payload.template
        }
      };
    
    default:
      return state;
  }
}

// سياق الخطاف
const AIWritingJourneyContext = createContext<{
  state: AIWritingJourneyState;
  dispatch: React.Dispatch<AIWritingJourneyAction>;
  saveProject: (projectName?: string, projectDescription?: string) => Promise<void>;
  loadProject: (projectId: string) => Promise<void>;
  createNewProject: (name?: string, description?: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
} | null>(null);

// مقدم السياق
export const AIWritingJourneyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(aiWritingJourneyReducer, initialState);

  // API Base URL
  const API_BASE_URL = 'http://localhost:3002/api'; // Aligned with backend server.ts port

  // Function to save project
  const saveProject = async (projectName?: string, projectDescription?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const projectToSave = {
        ...state,
        name: projectName || state.novelBlueprint?.idea?.title || `New Project ${new Date().toLocaleString()}`,
        description: projectDescription || state.novelBlueprint?.idea?.synopsis || 'No description',
        lastSaved: new Date().toISOString(),
        currentStage: state.currentStage,
      };

      // Always use the /api/projects/save endpoint, which handles both create and update
      // by checking for projectId in the body.
      const response = await axios.post(`${API_BASE_URL}/projects/save`, {
        projectId: state.currentProjectId, // Pass projectId for updates
        ...projectToSave,
      });
 
      if (!state.currentProjectId && response.data.project) {
        // If it was a new project, update the currentProjectId
        dispatch({ type: 'SET_PROJECT_METADATA', payload: { id: response.data.project._id, name: response.data.project.name, description: response.data.project.description } });
      } else {
        // If updating an existing project or if the backend response doesn't directly return the project, update metadata
        // Note: The backend route /api/projects/save returns { success: true, message: 'Project saved successfully.', project }
        if (response.data.project) {
          dispatch({ type: 'SET_PROJECT_METADATA', payload: { id: response.data.project._id, name: response.data.project.name, description: response.data.project.description } });
        }
      }
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date() });
    } catch (err: any) {
      console.error('Failed to save project:', err);
      dispatch({ type: 'SET_ERROR', payload: `Failed to save project: ${err.message}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to load a project
  const loadProject = async (projectId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
      dispatch({ type: 'LOAD_PROJECT_STATE', payload: response.data });
      dispatch({ type: 'SET_LAST_SAVED', payload: new Date(response.data.lastSaved) });
    } catch (err: any) {
      console.error('Failed to load project:', err);
      dispatch({ type: 'SET_ERROR', payload: `Failed to load project: ${err.message}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Function to create a new project (resets state and sets a new currentProjectId)
  const createNewProject = async (name?: string, description?: string) => {
    dispatch({ type: 'CREATE_NEW_PROJECT', payload: { name, description } });
    // No need to save immediately, saveProject will handle initial save
  };

  // Function to fetch user projects
  const fetchProjects = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const response = await axios.get(`${API_BASE_URL}/user/projects`); // Corrected backend route
      dispatch({ type: 'SET_USER_PROJECTS', payload: response.data.projects }); // Backend returns { projects: [...] }
    } catch (err: any) {
      console.error('Failed to fetch projects:', err);
      dispatch({ type: 'SET_ERROR', payload: `Failed to fetch projects: ${err.message}` });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Initial data fetching and auto-save logic
  useEffect(() => {
    // Fetch projects on component mount
    fetchProjects();

    // Auto-save interval
    const interval = setInterval(() => {
      if (state.currentProjectId && state.editorSettings.autoSave) {
        saveProject();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [state.currentProjectId, state.editorSettings.autoSave]); // Dependencies for auto-save

  // Load API keys and prompt templates from DB on initial load
  useEffect(() => {
    const loadInitialConfig = async () => {
      try {
        const apiKeysResponse = await axios.get(`${API_BASE_URL}/user/api-keys`); // Corrected backend route
        dispatch({ type: 'SET_API_KEYS_FROM_DB', payload: apiKeysResponse.data.apiKeys }); // Backend returns { apiKeys: [...] }

        const promptTemplatesResponse = await axios.get(`${API_BASE_URL}/user/prompt-templates`); // Corrected backend route
        dispatch({ type: 'SET_PROMPT_TEMPLATES_FROM_DB', payload: promptTemplatesResponse.data.promptTemplates }); // Backend returns { promptTemplates: [...] }
      } catch (err) {
        console.error('Failed to load initial config:', err);
        // Handle error, maybe set an error state
      }
    };
    loadInitialConfig();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <AIWritingJourneyContext.Provider value={{ state, dispatch, saveProject, loadProject, createNewProject, fetchProjects }}>
      {children}
    </AIWritingJourneyContext.Provider>
  );
};

// خطاف مخصص لاستخدام السياق
export const useAIWritingJourney = () => {
  const context = useContext(AIWritingJourneyContext);
  if (!context) {
    throw new Error('useAIWritingJourney must be used within an AIWritingJourneyProvider');
  }
  return context;
};

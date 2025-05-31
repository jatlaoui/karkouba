import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processAIRequest } from './src/ai-services/AIProxy';
import mongoose from 'mongoose';

interface AIProcessRequestBody {
    action: string;
    modelId: string;
    apiKey?: string;
    promptTemplate: string;
    dynamicVariables: Record<string, any>;
}

// Extend Request interface to include userId
declare module 'express-serve-static-core' {
  interface Request {
    userId?: mongoose.Types.ObjectId;
  }
}

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '3002', 10);

app.use(cors({
  origin: '*',
  credentials: false,
  methods: '*',
  allowedHeaders: '*'
}));
app.use(express.json());

// Open access headers middleware  
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Max-Age', '86400');
  res.header('X-Powered-By', 'Novel-Writer-Demo');
  res.header('Cache-Control', 'no-cache');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Mock User ID for demonstration
const MOCK_USER_ID = new mongoose.Types.ObjectId('60c72b2f9b1d8e001c8e4a1a');

// Middleware to attach mock user ID to requests
app.use((req, res, next) => {
    (req as any).userId = MOCK_USER_ID;
    next();
});

// Async handler wrapper
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

// AI Processing handler
const aiProcessHandler = async (req: Request<{}, {}, AIProcessRequestBody, {}>, res: Response, next: NextFunction) => {
    const { action, modelId, apiKey, promptTemplate, dynamicVariables } = req.body;
    console.log(`Received AI request: action=${action}, modelId=${modelId}`);

    let actualApiKey = apiKey || process.env.DEFAULT_API_KEY;

    if (!actualApiKey && modelId !== 'default-model') {
        return res.status(401).json({ success: false, message: `API Key for ${modelId} is missing. Please provide it.` });
    }

    try {
        const result = await processAIRequest(action, modelId, actualApiKey, promptTemplate, dynamicVariables);
        res.json({ success: true, result });
    } catch (error: any) {
        console.error(`AI processing error:`, error.message, error.stack);
        res.status(500).json({ success: false, message: 'Failed to process AI request', details: error.message });
    }
};

app.post('/api/ai/process', asyncHandler(aiProcessHandler));

// Basic root route
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running in demo mode!' });
});

// --- DEMO PROJECT ROUTES (no database required) ---

// Save/Update a project (demo mode)
app.post('/api/projects/save', asyncHandler(async (req: Request, res: Response) => {
  const { projectId, name, description, state } = req.body;
  
  if (!name || !state) {
    return res.status(400).json({ success: false, message: 'Project name and state are required.' });
  }

  // Mock project response
  const mockProject = {
    _id: projectId || new mongoose.Types.ObjectId().toString(),
    userId: MOCK_USER_ID,
    name,
    description: description || 'مشروع تجريبي',
    state,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(200).json({ success: true, project: mockProject });
}));

// Get a specific project (demo mode)
app.get('/api/projects/:id', asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.id;
  
  // Mock project response
  const mockProject = {
    _id: projectId,
    userId: MOCK_USER_ID,
    name: 'مشروع رواية تجريبي',
    description: 'هذا مشروع تجريبي لكتابة رواية عربية بالذكاء الاصطناعي',
    state: { stage: 1, content: 'محتوى تجريبي' },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(200).json({ success: true, project: mockProject });
}));

// Get all projects for the current user (demo mode)
app.get('/api/user/projects', asyncHandler(async (req: Request, res: Response) => {
  // Mock projects list
  const mockProjects = [
    {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: MOCK_USER_ID,
      name: 'روايتي الأولى',
      description: 'مشروع رواية رومانسية',
      state: { stage: 2, content: 'في مرحلة معمل الأفكار' },
      wordCount: 12500,
      createdAt: new Date(Date.now() - 86400000), // yesterday
      updatedAt: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: MOCK_USER_ID,
      name: 'قصة مغامرات',
      description: 'رواية مغامرات وإثارة',
      state: { stage: 1, content: 'في مرحلة التحليل' },
      wordCount: 8750,
      createdAt: new Date(Date.now() - 172800000), // 2 days ago
      updatedAt: new Date(Date.now() - 7200000) // 2 hours ago
    }
  ];

  res.status(200).json({ success: true, projects: mockProjects });
}));

// Delete a project (demo mode)
app.delete('/api/projects/:id', asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.id;
  
  // Mock successful deletion
  res.status(200).json({ success: true, message: 'Project deleted successfully (demo mode)' });
}));

// --- USER API KEY ROUTES (demo mode) ---

// Save/Update user's API key for a specific model (demo mode)
app.post('/api/user/api-keys', asyncHandler(async (req: Request, res: Response) => {
  const { modelId, apiKey } = req.body;

  if (!modelId || !apiKey) {
    return res.status(400).json({ success: false, message: 'Model ID and API key are required.' });
  }

  // Mock API key save
  const mockApiKey = {
    _id: new mongoose.Types.ObjectId().toString(),
    userId: MOCK_USER_ID,
    modelId,
    apiKey: '***' + apiKey.slice(-4), // Masked for security
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(200).json({ success: true, apiKey: mockApiKey });
}));

// Get all API keys for the current user (demo mode)
app.get('/api/user/api-keys', asyncHandler(async (req: Request, res: Response) => {
  // Mock API keys
  const mockApiKeys = [
    {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: MOCK_USER_ID,
      modelId: 'gemini-flash-model',
      apiKey: '***demo', // Masked
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  res.status(200).json({ success: true, apiKeys: mockApiKeys });
}));

// Delete an API key (demo mode)
app.delete('/api/user/api-keys/:modelId', asyncHandler(async (req: Request, res: Response) => {
  const modelId = req.params.modelId;
  
  res.status(200).json({ success: true, message: `API key for ${modelId} deleted successfully (demo mode)` });
}));

// --- USER PROMPT TEMPLATE ROUTES (demo mode) ---

// Save/Update a user prompt template (demo mode)
app.post('/api/user/prompt-templates', asyncHandler(async (req: Request, res: Response) => {
  const { templateId, name, content, description } = req.body;

  if (!name || !content) {
    return res.status(400).json({ success: false, message: 'Template name and content are required.' });
  }

  // Mock template save
  const mockTemplate = {
    _id: templateId || new mongoose.Types.ObjectId().toString(),
    userId: MOCK_USER_ID,
    name,
    content,
    description: description || '',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  res.status(200).json({ success: true, template: mockTemplate });
}));

// Get all prompt templates for the current user (demo mode)
app.get('/api/user/prompt-templates', asyncHandler(async (req: Request, res: Response) => {
  // Mock templates
  const mockTemplates = [
    {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: MOCK_USER_ID,
      name: 'قالب تحليل الشخصيات',
      content: 'اكتب تحليلاً مفصلاً للشخصية {{character_name}} في الرواية',
      description: 'قالب لتحليل شخصيات الرواية',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  res.status(200).json({ success: true, promptTemplates: mockTemplates });
}));

// Error handling middleware
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error (demo mode)',
    details: error.message 
  });
});

// Start server without database connection
const startServer = () => {
  app.listen(port, () => {
    console.log('MongoDB connection skipped - running in demo mode');
    console.log(`Backend server listening on port ${port}`);
  });
};

startServer();

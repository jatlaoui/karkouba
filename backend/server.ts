import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { processAIRequest } from './src/ai-services/AIProxy';
import { connectDB } from './src/db'; // Import connectDB
import { Project, UserPromptTemplate, UserAPIKey, AuthorStyle } from './src/models'; // Import models
import mongoose from 'mongoose'; // Import mongoose for ObjectId
import { MemoryManager, IChapterSummary } from './src/ai-services/MemoryManager';
import { AuthorStyleAnalyzer, IAuthorStyle } from './src/ai-services/AuthorStyleAnalyzer';

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
  origin: ['http://localhost:5173'], // Local frontend only for security
  credentials: true,
}));
app.use(express.json());


// Mock User ID for demonstration. In a real app, this would come from authentication.
const MOCK_USER_ID = new mongoose.Types.ObjectId('60c72b2f9b1d8e001c8e4a1a'); // Example ObjectId

// Initialize new services
const memoryManager = new MemoryManager();
const authorStyleAnalyzer = new AuthorStyleAnalyzer();

// Middleware to attach mock user ID to requests
app.use((req, res, next) => {
    (req as any).userId = MOCK_USER_ID;
    next();
});

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

const aiProcessHandler = async (req: Request<{}, {}, AIProcessRequestBody, {}>, res: Response, next: NextFunction) => {
    const { action, modelId, apiKey, promptTemplate, dynamicVariables } = req.body;
    console.log(`Received AI request: action=${action}, modelId=${modelId}`);
    // console.log('Prompt Template:', promptTemplate); // Log only if needed for debugging
    // console.log('Dynamic Variables:', dynamicVariables); // Log only if needed for debugging

    let actualApiKey = apiKey || process.env.DEFAULT_API_KEY; // Use user-provided or server's default

    if (!actualApiKey && modelId !== 'default-model') { // 'default-model' doesn't need a real key
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

// Basic root route for health check or initial access
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running!' });
});

// --- Project Routes ---

// Save/Update a project
app.post('/api/projects/save', asyncHandler(async (req: Request, res: Response) => {
  const { projectId, name, description, state } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!name || !state) {
    return res.status(400).json({ success: false, message: 'Project name and state are required.' });
  }

  let project;
  if (projectId) {
    project = await Project.findOneAndUpdate(
      { _id: projectId, userId },
      { name, description, state, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
    }
  } else {
    project = new Project({ userId, name, description, state });
    await project.save();
  }

  res.status(200).json({ success: true, message: 'Project saved successfully.', project });
}));

// Get a specific project by ID
app.get('/api/projects/:id', asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const project = await Project.findOne({ _id: projectId, userId });

  if (!project) {
    return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
  }

  res.status(200).json({ success: true, project });
}));

// Get all projects for the current user
app.get('/api/user/projects', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const projects = await Project.find({ userId }).sort({ updatedAt: -1 });

  res.status(200).json({ success: true, projects });
}));

// Delete a project
app.delete('/api/projects/:id', asyncHandler(async (req: Request, res: Response) => {
  const projectId = req.params.id;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const result = await Project.deleteOne({ _id: projectId, userId });

  if (result.deletedCount === 0) {
    return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
  }

  res.status(200).json({ success: true, message: 'Project deleted successfully.' });
}));

// --- UserPromptTemplate Routes ---

// Save/Update a user prompt template
app.post('/api/user/prompt-templates/save', asyncHandler(async (req: Request, res: Response) => {
  const { taskId, template } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!taskId || !template) {
    return res.status(400).json({ success: false, message: 'Task ID and template are required.' });
  }

  let userPromptTemplate = await UserPromptTemplate.findOneAndUpdate(
    { userId, taskId },
    { template, updatedAt: new Date() },
    { new: true, upsert: true, runValidators: true } // upsert: create if not found
  );

  res.status(200).json({ success: true, message: 'Prompt template saved successfully.', userPromptTemplate });
}));

// Get all user prompt templates
app.get('/api/user/prompt-templates', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const promptTemplates = await UserPromptTemplate.find({ userId });

  const templatesMap: Record<string, string> = {};
  promptTemplates.forEach(pt => {
    templatesMap[pt.taskId] = pt.template;
  });

  res.status(200).json({ success: true, promptTemplates: templatesMap });
}));

// --- UserAPIKey Routes ---

// Save/Update a user API key
app.post('/api/user/api-keys/save', asyncHandler(async (req: Request, res: Response) => {
  const { modelId, apiKey } = req.body;
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!modelId || !apiKey) {
    return res.status(400).json({ success: false, message: 'Model ID and API key are required.' });
  }

  let userAPIKey = await UserAPIKey.findOneAndUpdate(
    { userId, modelId },
    { encryptedKey: apiKey, updatedAt: new Date() }, // encryptedKey will be encrypted by pre-save hook
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({ success: true, message: 'API key saved successfully.' });
}));

// Get all user API keys (decrypted)
app.get('/api/user/api-keys', asyncHandler(async (req: Request, res: Response) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const apiKeys = await UserAPIKey.find({ userId });

  const decryptedKeys: Record<string, string> = {};
  apiKeys.forEach(keyDoc => {
    try {
      decryptedKeys[keyDoc.modelId] = keyDoc.getDecryptedKey();
    } catch (e) {
      console.error(`Failed to decrypt API key for model ${keyDoc.modelId}:`, e);
      // Optionally, send a warning to the client or skip this key
    }
  });

  res.status(200).json({ success: true, apiKeys: decryptedKeys });
}));

// Error handling middleware (must be last)
app.post('/api/author-styles/analyze', asyncHandler(async (req: Request, res: Response) => {
  const { authorName, novelText } = req.body;
  if (!authorName || !novelText) {
    return res.status(400).json({ success: false, message: 'Author name and novel text are required.' });
  }
  try {
    const authorStyle = await authorStyleAnalyzer.analyzeAndStoreAuthorStyle(authorName, novelText);
    res.status(200).json({ success: true, message: 'Author style analyzed and stored successfully.', authorStyle });
  } catch (error: any) {
    console.error(`Error analyzing author style:`, error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to analyze and store author style.', details: error.message });
  }
}));

app.get('/api/author-styles', asyncHandler(async (req: Request, res: Response) => {
  try {
    const authorStyles = await authorStyleAnalyzer.getAllAuthorStyles();
    res.status(200).json({ success: true, authorStyles });
  } catch (error: any) {
    console.error(`Error fetching author styles:`, error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch author styles.', details: error.message });
  }
}));

app.get('/api/author-styles/:authorName', asyncHandler(async (req: Request, res: Response) => {
  const { authorName } = req.params;
  try {
    const authorStyle = await authorStyleAnalyzer.getAuthorStyle(authorName);
    if (!authorStyle) {
      return res.status(404).json({ success: false, message: 'Author style not found.' });
    }
    res.status(200).json({ success: true, authorStyle });
  } catch (error: any) {
    console.error(`Error fetching author style for ${authorName}:`, error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to fetch author style.', details: error.message });
  }
}));

// --- Memory Management Routes ---

app.post('/api/chapters/summarize', asyncHandler(async (req: Request, res: Response) => {
  const { projectId, chapterNumber, chapterText, summaryData } = req.body;
  const userId = req.userId; // Assuming userId is available from middleware

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!projectId || !chapterNumber || !chapterText || !summaryData) {
    return res.status(400).json({ success: false, message: 'Project ID, chapter number, chapter text, and summary data are required.' });
  }

  try {
    const chapterSummary = await memoryManager.createChapterSummary(
      new mongoose.Types.ObjectId(projectId),
      chapterNumber,
      chapterText,
      summaryData
    );
    res.status(200).json({ success: true, message: 'Chapter summary created successfully.', chapterSummary });
  } catch (error: any) {
    console.error(`Error creating chapter summary:`, error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to create chapter summary.', details: error.message });
  }
}));

app.post('/api/chapters/relevant-summaries', asyncHandler(async (req: Request, res: Response) => {
  const { projectId, queryText, limit } = req.body;
  const userId = req.userId; // Assuming userId is available from middleware

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (!projectId || !queryText) {
    return res.status(400).json({ success: false, message: 'Project ID and query text are required.' });
  }

  try {
    const relevantSummaries = await memoryManager.retrieveRelevantSummaries(
      new mongoose.Types.ObjectId(projectId),
      queryText,
      limit
    );
    res.status(200).json({ success: true, relevantSummaries });
  } catch (error: any) {
    console.error(`Error retrieving relevant summaries:`, error.message, error.stack);
    res.status(500).json({ success: false, message: 'Failed to retrieve relevant summaries.', details: error.message });
  }
}));

// Error handling middleware (must be last)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'An unexpected error occurred!', details: err.message });
});

// Connect to DB and then start server
connectDB().then(() => {
  app.listen(port, '0.0.0.0', () => {
    console.log(`Backend server listening at http://0.0.0.0:${port}`);
  });
}).catch(error => {
  console.error('Failed to start server due to database connection error:', error);
  process.exit(1);
});
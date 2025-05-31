"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const AIProxy_1 = require("./src/ai-services/AIProxy");
const db_1 = require("./src/db"); // Import connectDB
const models_1 = require("./src/models"); // Import models
const mongoose_1 = __importDefault(require("mongoose")); // Import mongoose for ObjectId
const MemoryManager_1 = require("./src/ai-services/MemoryManager");
const AuthorStyleAnalyzer_1 = require("./src/ai-services/AuthorStyleAnalyzer");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = parseInt(process.env.PORT || '3002', 10);
app.use((0, cors_1.default)({
    origin: ['http://localhost:5173'], // Local frontend only for security
    credentials: true,
}));
app.use(express_1.default.json());
// Mock User ID for demonstration. In a real app, this would come from authentication.
const MOCK_USER_ID = new mongoose_1.default.Types.ObjectId('60c72b2f9b1d8e001c8e4a1a'); // Example ObjectId
// Initialize new services
const memoryManager = new MemoryManager_1.MemoryManager();
const authorStyleAnalyzer = new AuthorStyleAnalyzer_1.AuthorStyleAnalyzer();
// Middleware to attach mock user ID to requests
app.use((req, res, next) => {
    req.userId = MOCK_USER_ID;
    next();
});
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
const aiProcessHandler = async (req, res, next) => {
    const { action, modelId, apiKey, promptTemplate, dynamicVariables } = req.body;
    console.log(`Received AI request: action=${action}, modelId=${modelId}`);
    // console.log('Prompt Template:', promptTemplate); // Log only if needed for debugging
    // console.log('Dynamic Variables:', dynamicVariables); // Log only if needed for debugging
    let actualApiKey = apiKey || process.env.DEFAULT_API_KEY; // Use user-provided or server's default
    if (!actualApiKey && modelId !== 'default-model') { // 'default-model' doesn't need a real key
        return res.status(401).json({ success: false, message: `API Key for ${modelId} is missing. Please provide it.` });
    }
    try {
        const result = await (0, AIProxy_1.processAIRequest)(action, modelId, actualApiKey, promptTemplate, dynamicVariables);
        res.json({ success: true, result });
    }
    catch (error) {
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
app.post('/api/projects/save', asyncHandler(async (req, res) => {
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
        project = await models_1.Project.findOneAndUpdate({ _id: projectId, userId }, { name, description, state, updatedAt: new Date() }, { new: true, runValidators: true });
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
        }
    }
    else {
        project = new models_1.Project({ userId, name, description, state });
        await project.save();
    }
    res.status(200).json({ success: true, message: 'Project saved successfully.', project });
}));
// Get a specific project by ID
app.get('/api/projects/:id', asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const project = await models_1.Project.findOne({ _id: projectId, userId });
    if (!project) {
        return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
    }
    res.status(200).json({ success: true, project });
}));
// Get all projects for the current user
app.get('/api/user/projects', asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const projects = await models_1.Project.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, projects });
}));
// Delete a project
app.delete('/api/projects/:id', asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const result = await models_1.Project.deleteOne({ _id: projectId, userId });
    if (result.deletedCount === 0) {
        return res.status(404).json({ success: false, message: 'Project not found or unauthorized.' });
    }
    res.status(200).json({ success: true, message: 'Project deleted successfully.' });
}));
// --- UserPromptTemplate Routes ---
// Save/Update a user prompt template
app.post('/api/user/prompt-templates/save', asyncHandler(async (req, res) => {
    const { taskId, template } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!taskId || !template) {
        return res.status(400).json({ success: false, message: 'Task ID and template are required.' });
    }
    let userPromptTemplate = await models_1.UserPromptTemplate.findOneAndUpdate({ userId, taskId }, { template, updatedAt: new Date() }, { new: true, upsert: true, runValidators: true } // upsert: create if not found
    );
    res.status(200).json({ success: true, message: 'Prompt template saved successfully.', userPromptTemplate });
}));
// Get all user prompt templates
app.get('/api/user/prompt-templates', asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const promptTemplates = await models_1.UserPromptTemplate.find({ userId });
    const templatesMap = {};
    promptTemplates.forEach(pt => {
        templatesMap[pt.taskId] = pt.template;
    });
    res.status(200).json({ success: true, promptTemplates: templatesMap });
}));
// --- UserAPIKey Routes ---
// Save/Update a user API key
app.post('/api/user/api-keys/save', asyncHandler(async (req, res) => {
    const { modelId, apiKey } = req.body;
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!modelId || !apiKey) {
        return res.status(400).json({ success: false, message: 'Model ID and API key are required.' });
    }
    let userAPIKey = await models_1.UserAPIKey.findOneAndUpdate({ userId, modelId }, { encryptedKey: apiKey, updatedAt: new Date() }, // encryptedKey will be encrypted by pre-save hook
    { new: true, upsert: true, runValidators: true });
    res.status(200).json({ success: true, message: 'API key saved successfully.' });
}));
// Get all user API keys (decrypted)
app.get('/api/user/api-keys', asyncHandler(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    const apiKeys = await models_1.UserAPIKey.find({ userId });
    const decryptedKeys = {};
    apiKeys.forEach(keyDoc => {
        try {
            decryptedKeys[keyDoc.modelId] = keyDoc.getDecryptedKey();
        }
        catch (e) {
            console.error(`Failed to decrypt API key for model ${keyDoc.modelId}:`, e);
            // Optionally, send a warning to the client or skip this key
        }
    });
    res.status(200).json({ success: true, apiKeys: decryptedKeys });
}));
// Error handling middleware (must be last)
app.post('/api/author-styles/analyze', asyncHandler(async (req, res) => {
    const { authorName, novelText } = req.body;
    if (!authorName || !novelText) {
        return res.status(400).json({ success: false, message: 'Author name and novel text are required.' });
    }
    try {
        const authorStyle = await authorStyleAnalyzer.analyzeAndStoreAuthorStyle(authorName, novelText);
        res.status(200).json({ success: true, message: 'Author style analyzed and stored successfully.', authorStyle });
    }
    catch (error) {
        console.error(`Error analyzing author style:`, error.message, error.stack);
        res.status(500).json({ success: false, message: 'Failed to analyze and store author style.', details: error.message });
    }
}));
app.get('/api/author-styles', asyncHandler(async (req, res) => {
    try {
        const authorStyles = await authorStyleAnalyzer.getAllAuthorStyles();
        res.status(200).json({ success: true, authorStyles });
    }
    catch (error) {
        console.error(`Error fetching author styles:`, error.message, error.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch author styles.', details: error.message });
    }
}));
app.get('/api/author-styles/:authorName', asyncHandler(async (req, res) => {
    const { authorName } = req.params;
    try {
        const authorStyle = await authorStyleAnalyzer.getAuthorStyle(authorName);
        if (!authorStyle) {
            return res.status(404).json({ success: false, message: 'Author style not found.' });
        }
        res.status(200).json({ success: true, authorStyle });
    }
    catch (error) {
        console.error(`Error fetching author style for ${authorName}:`, error.message, error.stack);
        res.status(500).json({ success: false, message: 'Failed to fetch author style.', details: error.message });
    }
}));
// --- Memory Management Routes ---
app.post('/api/chapters/summarize', asyncHandler(async (req, res) => {
    const { projectId, chapterNumber, chapterText, summaryData } = req.body;
    const userId = req.userId; // Assuming userId is available from middleware
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!projectId || !chapterNumber || !chapterText || !summaryData) {
        return res.status(400).json({ success: false, message: 'Project ID, chapter number, chapter text, and summary data are required.' });
    }
    try {
        const chapterSummary = await memoryManager.createChapterSummary(new mongoose_1.default.Types.ObjectId(projectId), chapterNumber, chapterText, summaryData);
        res.status(200).json({ success: true, message: 'Chapter summary created successfully.', chapterSummary });
    }
    catch (error) {
        console.error(`Error creating chapter summary:`, error.message, error.stack);
        res.status(500).json({ success: false, message: 'Failed to create chapter summary.', details: error.message });
    }
}));
app.post('/api/chapters/relevant-summaries', asyncHandler(async (req, res) => {
    const { projectId, queryText, limit } = req.body;
    const userId = req.userId; // Assuming userId is available from middleware
    if (!userId) {
        return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!projectId || !queryText) {
        return res.status(400).json({ success: false, message: 'Project ID and query text are required.' });
    }
    try {
        const relevantSummaries = await memoryManager.retrieveRelevantSummaries(new mongoose_1.default.Types.ObjectId(projectId), queryText, limit);
        res.status(200).json({ success: true, relevantSummaries });
    }
    catch (error) {
        console.error(`Error retrieving relevant summaries:`, error.message, error.stack);
        res.status(500).json({ success: false, message: 'Failed to retrieve relevant summaries.', details: error.message });
    }
}));
// Error handling middleware (must be last)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'An unexpected error occurred!', details: err.message });
});
// Connect to DB and then start server
(0, db_1.connectDB)().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`Backend server listening at http://0.0.0.0:${port}`);
    });
}).catch(error => {
    console.error('Failed to start server due to database connection error:', error);
    process.exit(1);
});

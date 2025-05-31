"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processAIRequest = void 0;
const GeminiFlashModel_1 = require("./GeminiFlashModel");
const modelsMap = {}; // Store initialized models
const fallbackChain = {
    'gpt-4o': [], // Removed fallbacks as models are not implemented
    'gemini-1.5-pro': [], // Not implemented yet, no fallback
    'gemini-1.5-flash': [], // No fallback needed
    'default-model': [], // No fallback for default/mock
};
const getAIModelInstance = (modelId, apiKey) => {
    if (modelsMap[modelId])
        return modelsMap[modelId]; // Reuse instance
    switch (modelId) {
        case 'gemini-1.5-flash':
            modelsMap[modelId] = new GeminiFlashModel_1.GeminiFlashModel(apiKey);
            break;
        // case 'gpt-4o':
        //     modelsMap[modelId] = new GPT4oModel(apiKey); // Needs actual implementation
        //     break;
        // ...
        default:
            throw new Error(`Model ${modelId} not configured.`);
    }
    return modelsMap[modelId];
};
const processAIRequest = async (action, modelId, apiKey, promptTemplate, dynamicVariables) => {
    const chain = [modelId, ...(fallbackChain[modelId] || [])];
    for (const fallbackAttemptId of chain) {
        try {
            const modelInstance = getAIModelInstance(fallbackAttemptId, apiKey);
            console.log(`Attempting with model: ${modelInstance.getModelName()} for action: ${action}`);
            const result = await modelInstance.processPrompt(promptTemplate, dynamicVariables, { action });
            return result; // Success
        }
        catch (error) {
            console.error(`Error with ${fallbackAttemptId} for action ${action}: ${error.message}`);
            if (chain.indexOf(fallbackAttemptId) === chain.length - 1) {
                throw new Error(`All fallback models failed for action ${action}. Last error: ${error.message}`);
            }
        }
    }
    throw new Error("No AI model could process the request.");
};
exports.processAIRequest = processAIRequest;

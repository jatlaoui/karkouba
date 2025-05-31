import { GeminiFlashModel } from './GeminiFlashModel';
// import { GPT4oModel } from './GPT4oModel'; // استورد النماذج الأخرى
// import { ClaudeSonnetModel } from './ClaudeSonnetModel';
import { IAIModel } from './IAIModel';

const modelsMap: Record<string, IAIModel> = {}; // Store initialized models
const fallbackChain: Record<string, string[]> = {
    'gpt-4o': [], // Removed fallbacks as models are not implemented
    'gemini-1.5-pro': [], // Not implemented yet, no fallback
    'gemini-1.5-flash': [], // No fallback needed
    'default-model': [], // No fallback for default/mock
};

const getAIModelInstance = (modelId: string, apiKey?: string): IAIModel => {
    if (modelsMap[modelId]) return modelsMap[modelId]; // Reuse instance

    switch (modelId) {
        case 'gemini-1.5-flash':
            modelsMap[modelId] = new GeminiFlashModel(apiKey);
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

export const processAIRequest = async (action: string, modelId: string, apiKey: string | undefined, promptTemplate: string, dynamicVariables: Record<string, any>): Promise<any> => {
    const chain = [modelId, ...(fallbackChain[modelId] || [])];

    for (const fallbackAttemptId of chain) {
        try {
            const modelInstance = getAIModelInstance(fallbackAttemptId, apiKey);
            console.log(`Attempting with model: ${modelInstance.getModelName()} for action: ${action}`);
            const result = await modelInstance.processPrompt(promptTemplate, dynamicVariables, { action });
            return result; // Success
        } catch (error: any) {
            console.error(`Error with ${fallbackAttemptId} for action ${action}: ${error.message}`);
            if (chain.indexOf(fallbackAttemptId) === chain.length - 1) {
                throw new Error(`All fallback models failed for action ${action}. Last error: ${error.message}`);
            }
        }
    }
    throw new Error("No AI model could process the request.");
};
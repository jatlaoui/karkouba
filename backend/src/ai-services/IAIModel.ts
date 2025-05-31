export interface IAIModel {
    processPrompt(promptTemplate: string, dynamicVariables: Record<string, any>, options?: { action: string; currentOverallContext?: string; /* ... other relevant context for complex models */ }): Promise<any>;
    getModelName(): string;
}
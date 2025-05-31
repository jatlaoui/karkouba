import { GoogleGenerativeAI } from "@google/generative-ai";
import { IAIModel } from "./IAIModel";

export class GeminiFlashModel implements IAIModel {
    private genAI: GoogleGenerativeAI;
    private model: any; // GenerativeModel instance

    constructor(apiKey?: string) {
        if (!apiKey) throw new Error("API Key for Gemini is missing.");
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    private fillPromptTemplate(template: string, variables: Record<string, any>): string {
        let filledPrompt = template;
        for (const key in variables) {
            filledPrompt = filledPrompt.replace(new RegExp(`\\[${key}\\]`, 'g'), String(variables[key]));
        }
        return filledPrompt;
    }

    async processPrompt(promptTemplate: string, dynamicVariables: Record<string, any>, options?: { action: string; currentOverallContext?: string; }): Promise<any> {
        const finalPrompt = this.fillPromptTemplate(promptTemplate, dynamicVariables);
        
        // إعدادات الأمان (مهمة جداً لـ Gemini)
        const generationConfig = {
            temperature: 0.9, // يمكن جعلها متغيراً في المستقبل
            topK: 1,
            topP: 1,
            maxOutputTokens: 8000, // حسب طول الناتج المتوقع (للفصول مثلاً)
        };
        const safetySettings = [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ];

        const result = await this.model.generateContent({
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
            generationConfig,
            safetySettings,
        });
        const response = await result.response;
        const text = response.text();

        // هنا الجزء الحاسم: تحليل استجابة النموذج
        // إذا كنت تتوقع JSON، حاول تحليله.
        // إذا فشل، أعد النص الخام أو رسالة خطأ.
        try {
            return JSON.parse(text);
        } catch (e) {
            console.warn("AI response was not valid JSON for", this.getModelName(), ". Returning raw text.");
            return { generatedContent: text }; // إذا كان المتوقع نصاً
        }
    }

    getModelName(): string { return "gemini-1.5-flash"; }
}
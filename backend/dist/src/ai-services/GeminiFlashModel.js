"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeminiFlashModel = void 0;
const generative_ai_1 = require("@google/generative-ai");
class GeminiFlashModel {
    genAI;
    model; // GenerativeModel instance
    constructor(apiKey) {
        if (!apiKey)
            throw new Error("API Key for Gemini is missing.");
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }
    fillPromptTemplate(template, variables) {
        let filledPrompt = template;
        for (const key in variables) {
            filledPrompt = filledPrompt.replace(new RegExp(`\\[${key}\\]`, 'g'), String(variables[key]));
        }
        return filledPrompt;
    }
    async processPrompt(promptTemplate, dynamicVariables, options) {
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
        }
        catch (e) {
            console.warn("AI response was not valid JSON for", this.getModelName(), ". Returning raw text.");
            return { generatedContent: text }; // إذا كان المتوقع نصاً
        }
    }
    getModelName() { return "gemini-1.5-flash"; }
}
exports.GeminiFlashModel = GeminiFlashModel;

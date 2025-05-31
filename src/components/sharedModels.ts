export const aiModels = [
  { id: 'default-model', name: 'الافتراضي (معيارية)', description: 'نموذج متوازن للاستخدام العام.', supportsApiKey: false, apiKeyPlaceholder: '' },
  { id: 'gemini-1.5-flash', name: 'جيميني 1.5 فلاش', description: 'سريع للغاية، مثالي للتوليد السريع للأفكار والفصول.', supportsApiKey: true, apiKeyPlaceholder: 'ادخل مفتاح Gemini API' },
  { id: 'gemini-1.5-pro', name: 'جيميني 1.5 برو', description: 'نموذج متقدم من جوجل، قدرات عالية في الفهم والتوليد.', supportsApiKey: true, apiKeyPlaceholder: 'ادخل مفتاح Gemini API' },
  { id: 'gpt-4o', name: 'GPT-4o', description: 'أحدث وأقوى نموذج من OpenAI، متعدد الوسائط.', supportsApiKey: true, apiKeyPlaceholder: 'ادخل مفتاح OpenAI API' },
  { id: 'gpt-4-turbo', name: 'GPT-4 توربو', description: 'جودة عالية، أفضل لتعقيد الحبكة وتحليل الأسلوب.', supportsApiKey: true, apiKeyPlaceholder: 'ادخل مفتاح OpenAI API' },
  { id: 'claude-3-opus', name: 'كلاود 3 أوبوس', description: 'نموذج Anthropic الرائد، ممتاز في المنطق والفهم السياقي.', supportsApiKey: true, apiKeyPlaceholder: 'ادخل مفتاح Claude API' },
  { id: 'claude-3-sonnet', name: 'كلاود 3 سونيت', description: 'نموذج متوازن من Anthropic، جيد للمهام العامة.', supportsApiKey: true, apiKeyPlaceholder: 'ادخل مفتاح Claude API' },
  { id: 'claude-3-haiku', name: 'كلاود 3 هايكو', description: 'أسرع وأصغر نموذج من Anthropic، مثالي للمهام السريعة.', supportsApiKey: true, apiKeyPlaceholder: 'ادخل مفتاح Claude API' },
  { id: 'llama-3-8b', name: 'لاما 3 (8B)', description: 'نموذج مفتوح المصدر من Meta، جيد للمهام الخفيفة.', supportsApiKey: false, apiKeyPlaceholder: '' },
  { id: 'llama-3-70b', name: 'لاما 3 (70B)', description: 'نموذج مفتوح المصدر كبير من Meta، قدرات عالية.', supportsApiKey: false, apiKeyPlaceholder: '' },
];

/**
 * نظام قراءة الملفات الشامل
 * يدعم ملفات PDF، DOCX، TXT
 */

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
 
// تكوين PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export interface FileReadResult {
  content: string;
  wordCount: number;
  fileType: string;
  fileName: string;
  fileSize: number;
}

export interface FileValidationError {
  type: 'INVALID_TYPE' | 'TOO_LARGE' | 'CORRUPTED' | 'EMPTY' | 'UNKNOWN_ERROR';
  message: string;
}

// الحد الأقصى لحجم الملف (50 ميجابايت)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

// الامتدادات المدعومة
export const SUPPORTED_EXTENSIONS = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'text/plain': 'TXT'
};

/**
 * التحقق من صحة الملف
 */
export function validateFile(file: File): FileValidationError | null {
  // التحقق من حجم الملف
  if (file.size > MAX_FILE_SIZE) {
    return {
      type: 'TOO_LARGE',
      message: `حجم الملف كبير جداً. الحد الأقصى ${Math.round(MAX_FILE_SIZE / (1024 * 1024))} ميجابايت`
    };
  }

  // التحقق من أن الملف ليس فارغاً
  if (file.size === 0) {
    return {
      type: 'EMPTY',
      message: 'الملف فارغ. يرجى اختيار ملف يحتوي على نص'
    };
  }

  // التحقق من نوع الملف
  const isValidType = Object.keys(SUPPORTED_EXTENSIONS).includes(file.type) ||
    file.name.toLowerCase().endsWith('.txt') ||
    file.name.toLowerCase().endsWith('.pdf') ||
    file.name.toLowerCase().endsWith('.docx');

  if (!isValidType) {
    return {
      type: 'INVALID_TYPE',
      message: 'صيغة الملف غير مدعومة. الصيغ المدعومة: PDF، DOCX، TXT'
    };
  }

  return null;
}

/**
 * قراءة ملف نصي
 */
async function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content || content.trim().length === 0) {
        reject(new Error('الملف النصي فارغ أو لا يحتوي على نص قابل للقراءة'));
        return;
      }
      resolve(content);
    };
    reader.onerror = () => {
      reject(new Error('فشل في قراءة الملف النصي. تأكد من أن الملف غير تالف'));
    };
    reader.readAsText(file, 'utf-8');
  });
}

/**
 * قراءة ملف PDF
 */
async function readPdfFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    if (pdf.numPages === 0) {
      throw new Error('ملف PDF فارغ أو لا يحتوي على صفحات');
    }

    let content = '';
    
    // قراءة جميع صفحات PDF
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        content += pageText + '\n\n';
      } catch (pageError) {
        console.warn(`تحذير: فشل في قراءة الصفحة ${pageNum}:`, pageError);
        // المتابعة مع الصفحات الأخرى
      }
    }

    if (!content || content.trim().length === 0) {
      throw new Error('لم يتم العثور على نص قابل للقراءة في ملف PDF');
    }

    return content.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`فشل في قراءة ملف PDF: ${error.message}`);
    }
    throw new Error('فشل في قراءة ملف PDF. تأكد من أن الملف غير تالف ويحتوي على نص');
  }
}

/**
 * قراءة ملف DOCX
 */
async function readDocxFile(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('لم يتم العثور على نص قابل للقراءة في ملف DOCX');
    }

    // طباعة تحذيرات إن وجدت
    if (result.messages && result.messages.length > 0) {
      console.warn('تحذيرات أثناء قراءة ملف DOCX:', result.messages);
    }

    return result.value.trim();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`فشل في قراءة ملف DOCX: ${error.message}`);
    }
    throw new Error('فشل في قراءة ملف DOCX. تأكد من أن الملف غير تالف');
  }
}

/**
 * قراءة محتوى الملف بناءً على نوعه
 */
export async function readFileContent(file: File): Promise<FileReadResult> {
  // التحقق من صحة الملف أولاً
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  try {
    let content: string;
    let fileType: string;

    // تحديد نوع الملف وقراءته
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      content = await readPdfFile(file);
      fileType = 'PDF';
    } else if (
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.name.toLowerCase().endsWith('.docx')
    ) {
      content = await readDocxFile(file);
      fileType = 'DOCX';
    } else {
      content = await readTextFile(file);
      fileType = 'TXT';
    }

    // حساب عدد الكلمات
    const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

    if (wordCount < 100) {
      throw new Error('الملف قصير جداً. يجب أن يحتوي على 100 كلمة على الأقل للحصول على تحليل مفيد');
    }

    return {
      content,
      wordCount,
      fileType,
      fileName: file.name,
      fileSize: file.size
    };

  } catch (error) {
    console.error('خطأ في قراءة الملف:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('حدث خطأ غير متوقع أثناء قراءة الملف. يرجى المحاولة مرة أخرى');
  }
}

/**
 * الحصول على وصف الصيغ المدعومة
 */
export function getSupportedFormatsDescription(): string {
  return `الصيغ المدعومة: ${Object.values(SUPPORTED_EXTENSIONS).join('، ')} • الحد الأقصى: ${Math.round(MAX_FILE_SIZE / (1024 * 1024))} ميجابايت`;
}

/**
 * الحصول على أنواع MIME المدعومة
 */
export function getSupportedMimeTypes(): string[] {
  return Object.keys(SUPPORTED_EXTENSIONS);
}

/**
 * التحقق من امتداد الملف
 */
export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || '';
}

/**
 * تنسيق حجم الملف للعرض
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 بايت';
  
  const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

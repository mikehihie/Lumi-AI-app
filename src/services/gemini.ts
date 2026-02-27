import { GoogleGenAI, Type } from "@google/genai";
import { QuizRecord, AppData } from "../App";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateQuizQuestion(topic: string = "general knowledge", history: QuizRecord[] = []) {
  // Adaptive Learning Logic: Analyze history to determine difficulty
  const topicHistory = history.filter(h => h.topic === topic);
  const recentTopicHistory = topicHistory.slice(-5);
  const correctCount = recentTopicHistory.filter(h => h.isCorrect).length;
  
  let difficultyLevel = "trung bình (medium)";
  let adaptiveInstruction = "";

  if (recentTopicHistory.length >= 3) {
    if (correctCount <= 1) {
      difficultyLevel = "dễ (easy)";
      adaptiveInstruction = "Học sinh đang gặp khó khăn với chủ đề này. Hãy tạo một câu hỏi dễ hơn, tập trung vào kiến thức cơ bản nhất.";
    } else if (correctCount >= 4) {
      difficultyLevel = "khó (hard)";
      adaptiveInstruction = "Học sinh đang làm rất tốt chủ đề này. Hãy tạo một câu hỏi khó hơn, đòi hỏi tư duy sâu.";
    }
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tạo một câu hỏi trắc nghiệm giáo dục về chủ đề ${topic} dành cho học sinh cấp 2.
    Độ khó yêu cầu: ${difficultyLevel}.
    ${adaptiveInstruction}
    
    Yêu cầu:
    - Câu hỏi và các lựa chọn phải bằng tiếng Việt.
    - Phần giải thích (explanation) phải cực kỳ chi tiết, cặn kẽ, giải thích tại sao đáp án đúng là đúng và tại sao các đáp án khác sai.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Exactly 4 options"
          },
          correctAnswerIndex: { type: Type.INTEGER, description: "Index of the correct option (0-3)" },
          explanation: { type: Type.STRING, description: "Detailed explanation in Vietnamese" }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateParentReport(history: QuizRecord[], apps: AppData[]) {
  const totalQuestions = history.length;
  const correctAnswers = history.filter(h => h.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  const topicStats = history.reduce((acc, curr) => {
    if (!acc[curr.topic]) acc[curr.topic] = { total: 0, correct: 0 };
    acc[curr.topic].total++;
    if (curr.isCorrect) acc[curr.topic].correct++;
    return acc;
  }, {} as Record<string, { total: number, correct: number }>);

  const statsString = JSON.stringify({
    totalQuestions,
    accuracy: `${accuracy}%`,
    topicStats,
    appUsage: apps.map(a => ({ name: a.name, usedMinutes: a.usedTime }))
  });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Dựa vào dữ liệu học tập và sử dụng ứng dụng sau đây của học sinh, hãy viết một báo cáo ngắn gọn, thân thiện và tự nhiên bằng tiếng Việt gửi cho phụ huynh.
    
    Dữ liệu:
    ${statsString}
    
    Yêu cầu báo cáo:
    1. Chào hỏi phụ huynh thân thiện.
    2. Tóm tắt số câu hỏi đã làm và tỷ lệ đúng.
    3. Chỉ ra điểm mạnh (môn học làm tốt) và điểm yếu (môn học cần cải thiện).
    4. Nhận xét ngắn gọn về thời gian sử dụng ứng dụng (nếu có ứng dụng nào dùng quá nhiều).
    5. Lời khuyên hoặc động viên.
    
    Không dùng định dạng markdown phức tạp, chỉ dùng các đoạn văn bản đơn giản.`,
  });

  return response.text || "Không thể tạo báo cáo lúc này.";
}

export async function chatWithAI(message: string, history: {role: 'user'|'ai', content: string}[]) {
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: contents as any,
    config: { systemInstruction: "Bạn là một gia sư AI thân thiện, giúp học sinh giải đáp thắc mắc học tập bằng tiếng Việt. Khi viết các công thức toán học hoặc ký hiệu khoa học, hãy luôn sử dụng định dạng LaTeX (ví dụ: $x^2$, $\\frac{a}{b}$) để hiển thị đẹp mắt." }
  });
  return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
}

export async function suggestStudyMethod(problem: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Học sinh đang gặp vấn đề: "${problem}". Hãy gợi ý một phương pháp học tập phù hợp nhất (ví dụ: Pomodoro, Feynman, Spaced Repetition...) và giải thích cách áp dụng bằng tiếng Việt.`,
  });
  return response.text || "";
}

export async function generateQuizFromText(text: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Tạo 1 câu hỏi trắc nghiệm dựa trên nội dung sau:\n\n${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: { type: Type.ARRAY, items: { type: Type.STRING } },
          correctAnswerIndex: { type: Type.INTEGER },
          explanation: { type: Type.STRING }
        },
        required: ["question", "options", "correctAnswerIndex", "explanation"]
      }
    }
  });
  return JSON.parse(response.text || "{}");
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from '@pinecone-database/pinecone';

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    // API Key-үүдийг шалгах
    if (!process.env.GEMINI_API_KEY || !process.env.PINECONE_API_KEY) {
      throw new Error("API Key дутуу байна. .env.local файлыг шалгана уу.");
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);

    // 1. Асуултыг вектор болгох (Embedding)
    const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const embedResult = await embedModel.embedContent(lastMessage);
    const queryVector = embedResult.embedding.values;

    // 2. Pinecone-оос хайх
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 3,
      includeMetadata: true,
    });

    // 3. Контекст бэлдэх
    const context = queryResponse.matches && queryResponse.matches.length > 0
      ? queryResponse.matches.map(match => `Өгөгдөл: ${match.metadata.allInfo}`).join("\n\n")
      : "Тохирох мэдээлэл олдсонгүй.";

    // 4. Gemini-ээр хариулт үүсгэх
    // Энд "gemini-1.5-flash" гэж бичих нь хамгийн стандарт юм. 
    // Хэрэв дахиад 404 гарвал "gemini-pro" болгож солиорой.
    const chatModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Чи бол байгууллагын туслах чатбот. 
    Доорх мэдээлэлд үндэслэн асуултанд хариул.
    
    Контекст:
    ${context}
    
    Асуулт: ${lastMessage}`;

    const result = await chatModel.generateContent(prompt);
    
    // Хариултыг аюулгүй авах
    const response = await result.response;
    const text = response.text();

    return Response.json({ message: text });

  } catch (error) {
    console.error("DETAILED ERROR:", error);
    return Response.json({ 
      message: "Алдаа гарлаа: " + error.message 
    }, { status: 500 });
  }
}
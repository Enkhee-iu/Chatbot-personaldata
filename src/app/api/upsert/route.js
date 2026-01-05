import { GoogleGenerativeAI } from "@google/generative-ai";
import { Pinecone } from '@pinecone-database/pinecone';

export async function POST(req) {
  try {
    const data = await req.json();
    
    // API Key шалгах
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);

    // 1. Текстийг нэгтгэх
    const textContent = `Овог: ${data.lastName}, Нэр: ${data.firstName}, Регистр: ${data.registerId}, Утас: ${data.phone}`;

    // 2. Gemini-ээр Embedding (768 хэмжээстэй вектор) үүсгэх
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(textContent);
    const embedding = result.embedding.values;

    // 3. Pinecone руу хадгалах
    await index.upsert([{
      id: data.registerId, // Регистрийг ID болгож ашиглав
      values: embedding,
      metadata: {
        fullName: `${data.lastName} ${data.firstName}`,
        registerId: data.registerId,
        phone: data.phone,
        allInfo: textContent
      }
    }]);

    return Response.json({ success: true, message: "Амжилттай хадгалагдлаа" });
  } catch (error) {
    console.error("Upsert Error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
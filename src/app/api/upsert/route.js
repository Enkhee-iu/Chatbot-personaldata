import { HfInference } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Хэрэглэгчийн ирүүлсэн өгөгдлийг салгаж авах
    const { firstName, lastName, registerId, phone, Address } = body;

    // 2. AI-д уншуулах нэгдсэн текстийг таны хүссэн форматаар бэлдэх
    const combinedText = `Овог: ${lastName}, Нэр: ${firstName}, Регистр: ${registerId}, Утас: ${phone}, Хаяг: ${Address}`;

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);

    // 3. Embedding үүсгэх (384 dimension)
    const embedding = await hf.featureExtraction({
      model: "BAAI/bge-small-en-v1.5",
      inputs: combinedText,
    });

    // 4. Pinecone руу metadata-д талбар бүрээр нь салгаж хадгалах
    await index.upsert([
      {
        id: registerId || Date.now().toString(),
        values: embedding,
        metadata: {
          firstName: firstName,
          lastName: lastName,
          registerId: registerId,
          phone: phone,
          Address: Address,
          text: combinedText, // Чатбот хариулахдаа энийг ашиглана
        },
      },
    ]);

    return Response.json({
      success: true,
      message: "Мэдээлэл форматын дагуу хадгалагдлаа!",
    });
  } catch (error) {
    console.error("Upsert Error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

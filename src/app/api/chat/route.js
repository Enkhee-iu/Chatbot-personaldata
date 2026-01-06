import { HfInference } from "@huggingface/inference";
import { Pinecone } from "@pinecone-database/pinecone";

const hf = new HfInference(process.env.HF_TOKEN);

export async function POST(req) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1].content;

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);

    // 1. Асуултыг вектор болгох (Хэвээрээ)
    const queryVector = await hf.featureExtraction({
      model: "BAAI/bge-small-en-v1.5",
      inputs: lastMessage,
    });

    // 2. САЙЖРУУЛАЛТ: Pinecone-оос илүү их мэдээлэл хайх (topK: 10)
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 10, // 3 байсныг 10 болгосноор AI илүү их баримт уншина
      includeMetadata: true,
    });

    const context =
      queryResponse.matches && queryResponse.matches.length > 0
        ? queryResponse.matches
            .map((match) => match.metadata.text)
            .join("\n---\n")
        : "Мэдээлэл олдсонгүй.";

    // 3. САЙЖРУУЛАЛТ: Хамгийн хүчирхэг моделыг ашиглах (Qwen 72B)
    const chatResponse = await hf.chatCompletion({
      model: "Qwen/Qwen2.5-72B-Instruct", // Энэ модел Llama-3.2-оос 20 дахин том тархитай
      messages: [
        {
          role: "system",
          content: `Чи бол Монгол улсын байгууллагын ахлах зөвлөх, ухаалаг туслах байна. 
          Өгөгдсөн "Контекст" мэдээллийг маш сайн шинжилж, хэрэглэгчийн асуултад маш тодорхой, 
          дэлгэрэнгүй, логик дараалалтай хариул. 
          
          Дүрмийн бус ярианаас зайлсхийж, мэргэжлийн түвшинд хариулна уу.
          
          Контекст:
          ${context}`,
        },
        { role: "user", content: lastMessage },
      ],
      max_tokens: 1000, // Хариултын уртыг нэмэгдүүлэх
      temperature: 0.2, // Бага байх тусам илүү нухацтай, баримтад тулгуурлаж хариулна
    });

    const aiMessage = chatResponse.choices[0].message.content;
    return Response.json({ message: aiMessage });
  } catch (error) {
    console.error("ERROR:", error);
    return Response.json(
      { message: "Алдаа: " + error.message },
      { status: 500 }
    );
  }
}

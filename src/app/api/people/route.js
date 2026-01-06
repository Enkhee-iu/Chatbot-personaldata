import { Pinecone } from "@pinecone-database/pinecone";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);

    // Pinecone-оос ID-нуудыг жагсааж авах
    // limit: 100-гаар хязгаарлав
    const listResponse = await index.listPaginated({ limit: 100 });
    
    if (!listResponse.vectors || listResponse.vectors.length === 0) {
       return Response.json({ people: [] });
    }

    const ids = listResponse.vectors.map(v => v.id);
    
    // ID-нуудаар дэлгэрэнгүй мэдээллийг татах
    const fetchResponse = await index.fetch(ids);
    
    // Frontend-д харуулах хэлбэр рүү хөрвүүлэх
    const people = Object.values(fetchResponse.records).map(record => ({
      id: record.id,
      ...record.metadata,
      // timestamp-ийг metadata-д хадгалаагүй бол ID нь timestamp байж магадгүй эсвэл хоосон
      // Бид upsert дээр Date.now() ашигласан тул id-г ашиглаж болно
      timestamp: new Date(parseInt(record.id) || Date.now()).toLocaleTimeString() 
    }));

    // Сүүлд нэмэгдсэн нь эхэндээ (ID нь timestamp байвал)
    people.sort((a, b) => {
        const tA = parseInt(a.id) || 0;
        const tB = parseInt(b.id) || 0;
        return tB - tA;
    });

    return Response.json({ people });
  } catch (error) {
    console.error("Error fetching people:", error);
    // listPaginated алдаа гарвал (ж нь starter index дэмжихгүй бол) хоосон буцаая
    return Response.json({ error: error.message, people: [] }, { status: 500 });
  }
}
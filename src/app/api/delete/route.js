import { Pinecone } from "@pinecone-database/pinecone";

export async function POST(req) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: "Invalid IDs provided" }, { status: 400 });
    }

    const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    const index = pc.index(process.env.PINECONE_INDEX);

    // Pinecone-оос сонгогдсон ID-нуудаар устгах
    await index.deleteMany(ids);

    return Response.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
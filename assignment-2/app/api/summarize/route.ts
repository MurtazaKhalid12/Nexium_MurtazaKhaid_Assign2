import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    console.log("⏳ Blog URL received:", url);

    // Send request to n8n webhook
    const n8nRes = await fetch(
      "http://localhost:5678/webhook-test/summarize-blog",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      }
    );

    const data = await n8nRes.json();
    const first = Array.isArray(data) ? data[0] : data;
    const summaryEn = first.summary_en || first.summaryEn || "";
    const summaryUr = first.summary_ur || first.summaryUr || "";
    console.log("📦 Summary to insert:", {
      summary_en: summaryEn,
      summary_ur: summaryUr,
    });

    // Insert into Supabase
    const { error } = await supabase.from("summaries").insert([
      {
        url: url,
        summary_en: summaryEn,
        summary_ur: summaryUr,
      },
    ]);

    if (error) {
      console.error("❌ Supabase Insert Error:", error);
      return new Response("DB Insert Failed", { status: 500 });
    }

    console.log("✅ Inserted into Supabase successfully");
    return Response.json({ summary_en: summaryEn, summary_ur: summaryUr });
  } catch (err: any) {
    console.error("❌ Route Error:", err.message || err);
    return new Response("Internal Server Error", { status: 500 });
  }
}

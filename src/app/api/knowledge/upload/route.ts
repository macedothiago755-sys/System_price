import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { extractText } from "@/lib/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB
const MAX_CHARS = 80_000; // cap stored text to keep AI context manageable

/**
 * POST /api/knowledge/upload  (multipart: file, title?)
 * Extracts text from PDF/Excel/PPTX/CSV/TXT and saves it as a Knowledge note
 * so the AI can recall the material.
 */
export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  const title = (form.get("title") as string) || "";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo não enviado." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo muito grande (máx. 20 MB)." },
      { status: 400 }
    );
  }

  let text: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    text = (await extractText(file.name, buffer)).trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao ler o arquivo.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  if (!text) {
    return NextResponse.json(
      { error: "Não consegui extrair texto desse arquivo (pode ser só imagem)." },
      { status: 422 }
    );
  }

  const truncated = text.length > MAX_CHARS;
  const content = truncated ? text.slice(0, MAX_CHARS) + "\n\n[…texto truncado]" : text;
  const noteTitle = title.trim() || file.name.replace(/\.[^.]+$/, "");

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({
      ok: true,
      demo: true,
      preview: content.slice(0, 400),
    });
  }

  const supabase = createClient();
  const { error } = await supabase.from("notes").insert({
    user_id: user.id,
    title: noteTitle,
    content,
    kind: "document",
    tags: ["aula", "material"],
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, title: noteTitle, truncated });
}

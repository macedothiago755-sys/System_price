"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Search, Sparkles, Lightbulb, GraduationCap, FileText, StickyNote, Upload } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Note } from "@/lib/types";
import { createNote } from "./actions";

const kindMeta: Record<string, { label: string; icon: typeof StickyNote }> = {
  note: { label: "Nota", icon: StickyNote },
  idea: { label: "Ideia", icon: Lightbulb },
  course: { label: "Curso", icon: GraduationCap },
  document: { label: "Documento", icon: FileText },
};

export function KnowledgeHub({ notes }: { notes: Note[] }) {
  const router = useRouter();

  // search
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  // create
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [kind, setKind] = useState("note");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);

  // upload
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<string | null>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch("/api/knowledge/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.error) {
        setUploadMsg(`⚠️ ${data.error}`);
      } else {
        setUploadMsg(
          `✅ "${data.title}" importado${data.truncated ? " (texto longo — parte salva)" : ""}.`
        );
        router.refresh();
      }
    } catch {
      setUploadMsg("⚠️ Falha no upload.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    setAnswer(null);
    try {
      const res = await fetch("/api/ai/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data.answer ?? data.error ?? "...");
    } finally {
      setSearching(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createNote({
      title,
      content,
      kind,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
    setSaving(false);
    setTitle("");
    setContent("");
    setTags("");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardTitle className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" /> Busca inteligente
        </CardTitle>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Pergunte às suas notas…"
              className="w-full rounded-lg border border-border bg-secondary/40 py-2 pl-9 pr-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <Button onClick={search} disabled={searching || !query.trim()} variant="accent">
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
          </Button>
        </div>
        {answer && (
          <div className="mt-3 whitespace-pre-wrap rounded-xl border border-accent/20 bg-accent/5 p-4 text-sm">
            {answer}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
       <div className="space-y-5 lg:col-span-1">
        <Card>
          <CardTitle className="mb-1 flex items-center gap-2">
            <Upload className="h-4 w-4 text-accent" /> Importar aula
          </CardTitle>
          <p className="mb-3 text-xs text-muted-foreground">
            PDF, Excel, PPTX, CSV ou TXT. O texto é extraído e a IA passa a
            lembrar do conteúdo.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.xlsx,.xls,.csv,.pptx,.txt,.md"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Processando…" : "Escolher arquivo"}
          </Button>
          {uploadMsg && (
            <p className="mt-2 text-xs text-muted-foreground">{uploadMsg}</p>
          )}
        </Card>

        <Card>
          <h2 className="mb-3 text-sm font-medium">Nova nota</h2>
          <form onSubmit={handleCreate} className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título"
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Conteúdo…"
              className="w-full resize-none rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {Object.entries(kindMeta).map(([v, m]) => (
                <option key={v} value={v}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (separadas por vírgula)"
              className="w-full rounded-lg border border-border bg-secondary/40 px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <Button type="submit" className="w-full" disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Salvar nota
            </Button>
          </form>
        </Card>
       </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:col-span-2">
          {notes.map((n) => {
            const meta = kindMeta[n.kind] ?? kindMeta.note;
            const Icon = meta.icon;
            return (
              <Card key={n.id}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-accent" />
                  <Badge variant="outline">{meta.label}</Badge>
                </div>
                <p className="font-medium">{n.title}</p>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                  {n.content}
                </p>
                {n.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {n.tags.map((t) => (
                      <span key={t} className="text-xs text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
          {notes.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground sm:col-span-2">
              Sua base de conhecimento está vazia.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

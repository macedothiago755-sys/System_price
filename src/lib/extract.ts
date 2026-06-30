import "server-only";

/**
 * Extract plain text from an uploaded study file so the AI can "remember" it.
 * Supports PDF, Excel (xlsx/xls), PowerPoint (pptx) and plain text/csv/md.
 * Libraries are imported lazily so they never reach the client bundle.
 */
export async function extractText(
  filename: string,
  buffer: Buffer
): Promise<string> {
  const ext = filename.toLowerCase().split(".").pop() ?? "";

  switch (ext) {
    case "pdf": {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: new Uint8Array(buffer) });
      const result = await parser.getText();
      return result.text;
    }

    case "xlsx":
    case "xls":
    case "csv": {
      const XLSX = await import("xlsx");
      const wb = XLSX.read(buffer, { type: "buffer" });
      return wb.SheetNames.map(
        (name) =>
          `## Planilha: ${name}\n${XLSX.utils.sheet_to_csv(wb.Sheets[name])}`
      ).join("\n\n");
    }

    case "pptx": {
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(buffer);
      const slides = Object.keys(zip.files)
        .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
        .sort(
          (a, b) =>
            Number(a.match(/(\d+)/)?.[1] ?? 0) -
            Number(b.match(/(\d+)/)?.[1] ?? 0)
        );
      const out: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        const xml = await zip.files[slides[i]].async("string");
        const texts = (xml.match(/<a:t>([^<]*)<\/a:t>/g) ?? []).map((m) =>
          m.replace(/<[^>]+>/g, "")
        );
        if (texts.length) out.push(`### Slide ${i + 1}\n${texts.join(" ")}`);
      }
      return out.join("\n\n");
    }

    case "txt":
    case "md":
    case "markdown":
      return buffer.toString("utf8");

    default:
      throw new Error(
        `Formato .${ext} não suportado. Use PDF, XLSX, PPTX, CSV, TXT ou MD.`
      );
  }
}

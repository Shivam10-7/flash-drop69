import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Check, Copy, FileUp, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { createDrop, prepareUpload, MAX_FILE_BYTES } from "@/lib/drops.functions";
import { Countdown } from "@/components/Countdown";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FlashDrop — Share anything with a 4-digit PIN" },
      { name: "description", content: "Drop text, code or files and grab them on any device with a PIN or QR code. Auto-deleted after 24 hours." },
      { property: "og:title", content: "FlashDrop — Share anything with a 4-digit PIN" },
      { property: "og:description", content: "Zero-account, cross-device sharing. Everything self-destructs in 24 hours." },
    ],
  }),
  component: Index,
});

type Mode = "send" | "receive";
type Kind = "text" | "code" | "file";
const LANGS = ["plaintext", "javascript", "typescript", "python", "java", "c", "cpp", "bash", "html", "css", "sql", "json"];

function Index() {
  const [mode, setMode] = useState<Mode>("send");
  return (
    <div className="space-y-8 pt-4">
      <section className="space-y-3 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Drop it. Grab it. Gone.</h1>
        <p className="text-muted-foreground">Share snippets and files across devices with a 4-digit PIN.</p>
        <Countdown />
      </section>

      <div className="mx-auto grid max-w-xs grid-cols-2 rounded-full border bg-card p-1">
        {(["send", "receive"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={cn(
              "rounded-full py-2 text-sm font-medium capitalize transition-colors",
              mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === "send" ? <SendPanel /> : <ReceivePanel />}
    </div>
  );
}

function SendPanel() {
  const [kind, setKind] = useState<Kind>("text");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ pin: string; expiresAt: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const create = useServerFn(createDrop);
  const prepare = useServerFn(prepareUpload);

  const pickFile = (f?: File | null) => {
    if (!f) return;
    if (f.size > MAX_FILE_BYTES) {
      toast.error("Files must be under 20 MB");
      return;
    }
    setFile(f);
  };

  const submit = async () => {
    setBusy(true);
    try {
      if (kind === "file") {
        if (!file) throw new Error("Choose a file first");
        const { path, token } = await prepare({ data: { fileName: file.name, size: file.size } });
        const { error } = await supabase.storage.from("drops").uploadToSignedUrl(path, token, file);
        if (error) throw new Error("Upload failed");
        setResult(await create({ data: { type: "file", filePath: path, fileName: file.name, fileSize: file.size } }));
      } else {
        if (!content.trim()) throw new Error("Paste something first");
        setResult(await create({ data: { type: kind, content, language: kind === "code" ? language : "plaintext" } }));
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  if (result) return <DropCreated {...result} onReset={() => { setResult(null); setContent(""); setFile(null); }} />;

  return (
    <div className="space-y-4 rounded-2xl border bg-card p-4 sm:p-6">
      <div className="flex gap-2">
        {(["text", "code", "file"] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors",
              kind === k ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            {k}
          </button>
        ))}
        {kind === "code" && (
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="ml-auto rounded-lg border bg-background px-2 text-sm"
          >
            {LANGS.map((l) => <option key={l}>{l}</option>)}
          </select>
        )}
      </div>

      {kind === "file" ? (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); pickFile(e.dataTransfer.files[0]); }}
          className="flex min-h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center hover:bg-muted"
        >
          <input ref={inputRef} type="file" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
          {file ? (
            <div className="flex items-center gap-2">
              <span className="break-all font-mono text-sm">{file.name}</span>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); }} aria-label="Remove file"><X className="h-4 w-4" /></button>
            </div>
          ) : (
            <>
              <FileUp className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Tap to choose or drag a file here (max 20 MB)</p>
            </>
          )}
        </div>
      ) : (
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={kind === "code" ? "Paste your code…" : "Paste text, a link, a command…"}
          className={cn(
            "min-h-48 w-full resize-y rounded-xl border bg-background p-4 text-sm outline-none focus:ring-2 focus:ring-ring",
            kind === "code" && "font-mono",
          )}
        />
      )}

      <button
        onClick={submit}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}
        Create drop
      </button>
    </div>
  );
}

function DropCreated({ pin, expiresAt, onReset }: { pin: string; expiresAt: string; onReset: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? `${window.location.origin}/drop/${pin}` : "";
  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="space-y-6 rounded-2xl border bg-card p-6 text-center">
      <p className="text-sm text-muted-foreground">Your PIN</p>
      <p className="font-mono text-6xl font-semibold tracking-[0.3em] sm:text-7xl">{pin}</p>
      <Countdown expiresAt={expiresAt} />
      {url && (
        <div className="mx-auto w-fit rounded-xl border bg-background p-3">
          <QRCodeSVG value={url} size={168} bgColor="transparent" fgColor="currentColor" />
        </div>
      )}
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <button onClick={copy} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm hover:bg-muted">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy link
        </button>
        <Link to="/drop/$pin" params={{ pin }} className="rounded-xl border px-4 py-2.5 text-sm hover:bg-muted">View drop</Link>
        <button onClick={onReset} className="rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground hover:opacity-90">New drop</button>
      </div>
    </div>
  );
}

function ReceivePanel() {
  const [pin, setPin] = useState("");
  const navigate = useNavigate();
  const go = (p: string) => p.length === 4 && navigate({ to: "/drop/$pin", params: { pin: p } });
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); go(pin); }}
      className="space-y-4 rounded-2xl border bg-card p-6 text-center"
    >
      <p className="text-sm text-muted-foreground">Enter the 4-digit PIN</p>
      <input
        autoFocus
        inputMode="numeric"
        maxLength={4}
        value={pin}
        onChange={(e) => {
          const v = e.target.value.replace(/\D/g, "").slice(0, 4);
          setPin(v);
          if (v.length === 4) go(v);
        }}
        placeholder="0000"
        aria-label="PIN"
        className="w-full rounded-xl border bg-background py-4 text-center font-mono text-5xl tracking-[0.4em] outline-none focus:ring-2 focus:ring-ring"
      />
      <button
        disabled={pin.length !== 4}
        className="w-full rounded-xl bg-primary py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
      >
        Open drop
      </button>
    </form>
  );
}

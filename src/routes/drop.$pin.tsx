import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy, Download, Flame } from "lucide-react";
import { getDrop, burnDrop } from "@/lib/drops.functions";
import { Countdown } from "@/components/Countdown";

const dropQuery = (pin: string) =>
  queryOptions({ queryKey: ["drop", pin], queryFn: () => getDrop({ data: { pin } }), staleTime: 30_000 });

export const Route = createFileRoute("/drop/$pin")({
  loader: ({ context, params }) =>
    /^\d{4}$/.test(params.pin) ? context.queryClient.ensureQueryData(dropQuery(params.pin)) : null,
  head: ({ params }) => ({
    meta: [
      { title: `Drop ${params.pin} — FlashDrop` },
      { name: "description", content: "A temporary FlashDrop. It self-destructs within 24 hours." },
      { property: "og:title", content: `Drop ${params.pin} — FlashDrop` },
      { property: "og:description", content: "Open this drop before it disappears." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DropPage,
});

function formatSize(b: number | null) {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function DropPage() {
  const { pin } = Route.useParams();
  if (!/^\d{4}$/.test(pin)) return <Gone />;
  return <DropView pin={pin} />;
}

function DropView({ pin }: { pin: string }) {
  const { data: drop } = useSuspenseQuery(dropQuery(pin));
  const [copied, setCopied] = useState(false);
  const burn = useServerFn(burnDrop);
  const navigate = useNavigate();
  const qc = useQueryClient();

  if (!drop) return <Gone />;

  const copy = async () => {
    await navigator.clipboard.writeText(drop.content ?? "");
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  const onBurn = async () => {
    if (!confirm("Delete this drop now? This can't be undone.")) return;
    await burn({ data: { pin } });
    qc.removeQueries({ queryKey: ["drop", pin] });
    toast.success("Drop burned");
    navigate({ to: "/" });
  };

  return (
    <div className="space-y-5 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Drop</p>
          <p className="font-mono text-3xl font-semibold tracking-[0.2em]">{drop.pin}</p>
        </div>
        <Countdown expiresAt={drop.expiresAt} onExpire={() => qc.invalidateQueries({ queryKey: ["drop", pin] })} />
      </div>

      {drop.type === "file" ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card p-8 text-center">
          <p className="break-all font-mono text-sm">{drop.fileName}</p>
          <p className="text-xs text-muted-foreground">{formatSize(drop.fileSize)}</p>
          {drop.downloadUrl && (
            <a
              href={drop.downloadUrl}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-primary-foreground hover:opacity-90"
            >
              <Download className="h-4 w-4" /> Download
            </a>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="font-mono text-xs text-muted-foreground">{drop.type === "code" ? drop.language : "text"}</span>
            <button onClick={copy} className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm hover:bg-muted">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} Copy
            </button>
          </div>
          <pre
            className={
              drop.type === "code"
                ? "max-h-[60vh] overflow-auto bg-primary p-4 font-mono text-sm text-primary-foreground"
                : "max-h-[60vh] overflow-auto whitespace-pre-wrap break-words p-4 font-sans text-base"
            }
          >
            {drop.content}
          </pre>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
        <Link to="/" className="rounded-xl border px-4 py-2.5 text-center text-sm hover:bg-muted">← New drop</Link>
        <button onClick={onBurn} className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/40 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10">
          <Flame className="h-4 w-4" /> Burn now
        </button>
      </div>
    </div>
  );
}

function Gone() {
  return (
    <div className="space-y-4 pt-16 text-center">
      <p className="text-5xl">💨</p>
      <h1 className="text-2xl font-bold">Nothing here</h1>
      <p className="text-muted-foreground">This drop doesn't exist or has already self-destructed.</p>
      <Link to="/" className="inline-block rounded-xl bg-primary px-5 py-2.5 text-sm text-primary-foreground hover:opacity-90">
        Back home
      </Link>
    </div>
  );
}

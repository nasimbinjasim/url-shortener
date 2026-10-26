"use client";

import { useState, useEffect } from "react";

interface UrlItem {
  id: string;
  short_code: string;
  original_url: string;
  created_at: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<UrlItem[]>([]);
  const [copied, setCopied] = useState(false);

  // Fetch last 10 shortened URLs
  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/history");
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to load history");
      }
    }
    fetchHistory();
  }, [shortUrl]); // refresh after new short url

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShortUrl("");
    setCopied(false);

    try {
      const res = await fetch("/api/shorten", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setShortUrl(data.shortUrl);
      setUrl("");
    } catch {
      setError("Failed to shorten URL");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://url.iamnasim.com";

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Shorten URL
          </h1>
          <p className="mt-2 text-muted text-sm">
            Fast & simple · url.iamnasim.com
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste your long URL here..."
              className="w-full px-5 py-4 rounded-xl border border-border bg-paper shadow-sm focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-ink placeholder:text-muted/60"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-3.5 rounded-xl bg-ink hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center border border-red-100">
            {error}
          </div>
        )}

        {/* Result */}
        {shortUrl && (
          <div className="mt-6 p-5 rounded-xl bg-paper border border-border shadow-sm">
            <p className="text-xs text-muted mb-2 font-medium">Your short link</p>
            <div className="flex items-center gap-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-ink font-medium break-all hover:underline"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="shrink-0 px-4 py-2 rounded-lg bg-cream hover:bg-border text-ink text-sm font-medium transition-colors border border-border"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-ink uppercase tracking-wider mb-4">
            Recent Links
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">
              No links yet. Create your first one above.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-paper border border-border shadow-sm hover:border-muted/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <a
                        href={`${baseUrl}/${item.short_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-ink font-medium hover:underline"
                      >
                        {baseUrl.replace("https://", "")}/{item.short_code}
                      </a>
                      <p className="mt-1 text-xs text-muted truncate">
                        {item.original_url}
                      </p>
                    </div>
                    <span className="text-xs text-muted/70 shrink-0">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-muted">
          Built by Nasim Bin Jasim
        </footer>
      </div>
    </main>
  );
}
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

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.iamnasim.com";

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-teal-900">
            Shorten URL
          </h1>
          <p className="mt-2 text-teal-700/80 text-sm">
            Fast & simple · iamnasim.com
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
              className="w-full px-5 py-4 rounded-xl border border-teal-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-ink placeholder:text-gray-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-3.5 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
          >
            {loading ? "Shortening..." : "Shorten"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        {/* Result */}
        {shortUrl && (
          <div className="mt-6 p-5 rounded-xl bg-white border border-teal-100 shadow-sm">
            <p className="text-xs text-teal-600 mb-2 font-medium">Your short link</p>
            <div className="flex items-center gap-3">
              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-teal-800 font-medium break-all hover:underline"
              >
                {shortUrl}
              </a>
              <button
                onClick={copyToClipboard}
                className="shrink-0 px-4 py-2 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 text-sm font-medium transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* History */}
        <div className="mt-12">
          <h2 className="text-sm font-semibold text-teal-800 uppercase tracking-wider mb-4">
            Recent Links
          </h2>

          {history.length === 0 ? (
            <p className="text-sm text-teal-600/70 text-center py-8">
              No links yet. Create your first one above.
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-white border border-teal-50 shadow-sm hover:border-teal-100 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <a
                        href={`${baseUrl}/${item.short_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-800 font-medium hover:underline"
                      >
                        {baseUrl.replace("https://", "")}/{item.short_code}
                      </a>
                      <p className="mt-1 text-xs text-gray-500 truncate">
                        {item.original_url}
                      </p>
                    </div>
                    <span className="text-xs text-teal-600/60 shrink-0">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-xs text-teal-700/50">
          Built by Nasim Bin Jasim
        </footer>
      </div>
    </main>
  );
}
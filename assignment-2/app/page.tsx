"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [url, setUrl] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [summaryUr, setSummaryUr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data = await res.json();

      // ✅ Update these keys to match backend response
      setSummaryEn(data.summary_en || "");
      setSummaryUr(data.summary_ur || "");
    } catch (err) {
      console.error("Fetch error:", err);
      alert("Something went wrong. Check the console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <div className="space-y-2">
        <Label htmlFor="url">Enter Blog URL</Label>
        <Input
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/blog"
        />
      </div>

      <Button onClick={handleSummarize} disabled={loading}>
        {loading ? "Summarizing..." : "Summarize"}
      </Button>

      {(summaryEn || summaryUr) && (
        <div className="mt-8 space-y-6">
          {summaryEn && (
            <div>
              <Label>English Summary</Label>
              <Textarea value={summaryEn} readOnly rows={5} />
            </div>
          )}

          {summaryUr && (
            <div>
              <Label>Urdu Summary</Label>
              <Textarea
                value={summaryUr}
                readOnly
                rows={5}
                dir="rtl"
                className="text-right"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

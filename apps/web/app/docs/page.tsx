"use client";

import { useEffect, useState, FormEvent } from "react";
import { api } from "@/lib/api";
import { ChatResult, Doc } from "@/lib/types";
import AiOutput from "@/components/ai-output";
import PendingHint from "@/components/pending-hint";

export default function DocsPage() {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [adding, setAdding] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chatResult, setChatResult] = useState<ChatResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadDocs() {
    api
      .listDocs()
      .then(setDocs)
      .catch((e) => setError(String(e.message ?? e)));
  }

  useEffect(loadDocs, []);

  async function onAddDoc(e: FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError(null);
    try {
      await api.createDoc({ title, content });
      setTitle("");
      setContent("");
      loadDocs();
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setAdding(false);
    }
  }

  async function onAsk(e: FormEvent) {
    e.preventDefault();
    setAsking(true);
    setError(null);
    setChatResult(null);
    try {
      const result = await api.chatWithDocs(question);
      setChatResult(result);
    } catch (e: any) {
      setError(String(e.message ?? e));
    } finally {
      setAsking(false);
    }
  }

  return (
    <main>
      <div className="page-header">
        <div>
          <h1>Docs &amp; Chat</h1>
          <p style={{ color: "var(--text-muted)" }}>
            Runbooks and wiki pages the AI can answer questions from.
          </p>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0 }}>Ask a question</h2>
        <form onSubmit={onAsk}>
          <label>
            Question
            <input
              required
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="How do we restart the checkout-api pods?"
            />
          </label>
          <div>
            <button className="btn" type="submit" disabled={asking}>
              {asking ? "Thinking…" : "Ask"}
            </button>
          </div>
        </form>
        <PendingHint active={asking} />
        {chatResult && (
          <div style={{ marginTop: "1rem" }}>
            <AiOutput content={chatResult.answer} />
            {chatResult.sources.length > 0 && (
              <p className="incident-meta" style={{ marginTop: "0.5rem" }}>
                Sources: {chatResult.sources.map((s) => s.title).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      <h2>Add documentation</h2>
      <form onSubmit={onAddDoc}>
        <label>
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Runbook: restarting checkout-api"
          />
        </label>
        <label>
          Content
          <textarea
            required
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Steps, context, gotchas…"
          />
        </label>
        <div>
          <button className="btn" type="submit" disabled={adding}>
            {adding ? "Adding…" : "Add Document"}
          </button>
        </div>
      </form>

      <h2>Documents</h2>
      {!docs && <p className="empty">Loading…</p>}
      {docs && docs.length === 0 && <p className="empty">No documents yet.</p>}
      {docs && docs.length > 0 && (
        <div className="incident-list">
          {docs.map((doc) => (
            <div key={doc.id} className="incident-row" style={{ cursor: "default" }}>
              <div>
                <div className="incident-title">{doc.title}</div>
                <div className="incident-meta">{new Date(doc.createdAt).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

import React from "react";
import { useState } from "react";
import { Bot, X, Send, CheckCircle2 } from "lucide-react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const api = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  async function submit(e) {
    e.preventDefault();
    setStatus("");
    try {
      const res = await fetch(`${api}/api/queries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, query })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to submit");
      setStatus("Thanks — your query has been received.");
      setEmail("");
      setQuery("");
    } catch {
      setStatus("Could not send right now. Please try again.");
    }
  }

  return (
    <>
      <button className="chat-fab" onClick={() => setOpen(true)} aria-label="Open AI AIKYAM Assistant">
        <Bot size={23} />
      </button>
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div><span className="status-dot" /> AI AIKYAM ASSISTANT</div>
            <button onClick={() => setOpen(false)} aria-label="Close"><X size={18} /></button>
          </div>
          <div className="chat-intro">
            <Bot size={28} />
            <h3>Need something?</h3>
            <p>Leave your email and question. The AI AIKYAM team will receive it.</p>
          </div>
          <form onSubmit={submit}>
            <input type="email" required placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
            <textarea required minLength="5" placeholder="Your query" value={query} onChange={e => setQuery(e.target.value)} />
            <button type="submit">SEND QUERY <Send size={15} /></button>
          </form>
          {status && <p className="chat-status"><CheckCircle2 size={15} />{status}</p>}
        </div>
      )}
    </>
  );
}

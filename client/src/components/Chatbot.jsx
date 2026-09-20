import React, { useState } from "react";
import {
  Bot,
  X,
  Send,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const api =
    import.meta.env.VITE_API_URL || "http://localhost:5000";

  async function submit(e) {
    e.preventDefault();

    if (submitting) return;

    setStatus("");
    setSubmitting(true);

    try {
      const res = await fetch(`${api}/api/queries`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          query,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Unable to submit"
        );
      }

      setStatus(
        "Thanks — your query has been received."
      );

      setEmail("");
      setQuery("");
    } catch {
      setStatus(
        "Could not send right now. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {/* Floating Chatbot */}
      <div className="chatbot-floating">
        <div className="chatbot-hint">
          Got an issue? Ask me — I’m here to help.
        </div>

        <button
          className="chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open AI AIKYAM Assistant"
        >
          <Bot size={23} />
        </button>
      </div>

      {/* Chat Panel */}
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <span className="status-dot" />
              AI AIKYAM ASSISTANT
            </div>

            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              disabled={submitting}
            >
              <X size={18} />
            </button>
          </div>

          <div className="chat-intro">
            <Bot size={28} />

            <h3>Need something?</h3>

            <p>
              Leave your email and question. The AI AIKYAM
              team will receive it.
            </p>
          </div>

          <form onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={submitting}
            />

            <textarea
              required
              minLength={5}
              placeholder="Your query"
              value={query}
              onChange={(e) =>
                setQuery(e.target.value)
              }
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  SUBMITTING
                  <Loader2
                    size={15}
                    className="spin"
                  />
                </>
              ) : (
                <>
                  SEND QUERY
                  <Send size={15} />
                </>
              )}
            </button>
          </form>

          {status && (
            <p className="chat-status">
              <CheckCircle2 size={15} />
              {status}
            </p>
          )}
        </div>
      )}
    </>
  );
}
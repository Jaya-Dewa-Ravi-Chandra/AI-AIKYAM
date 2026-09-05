import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

function EventVisual({ type, accent }) {
  return (
    <div className={`event-visual ${accent} visual-${type}`}>
      <div className="visual-noise" />
      <div className="visual-core" />
      <div className="visual-ring ring-1" />
      <div className="visual-ring ring-2" />
      <div className="visual-ring ring-3" />
      <div className="visual-lines" />
      <span className="visual-code">AI // 0x{accent.toUpperCase()} // 2026</span>
      <span className="visual-name">{type.toUpperCase()}</span>
    </div>
  );
}

export default function EventSection({ event, reverse }) {
  return (
    <section className={`event-section ${reverse ? "reverse" : ""}`} id={event.id}>
      <div className="event-copy">
        <span className="event-number">{event.number}</span>
        <p className="eyebrow">{event.kicker}</p>
        <h2>{event.name}</h2>
        <h3>{event.short}</h3>
        <p className="event-description">{event.description}</p>
        <a className="text-link" href="#pricing">
          REGISTER FOR THIS EVENT <ArrowUpRight size={16} />
        </a>
      </div>
      <motion.div
        className="event-art-wrap"
        initial={{ opacity: 0, x: reverse ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.9 }}
      >
        <EventVisual type={event.visual} accent={event.accent} />
        <div className="giant-event-name">{event.name.replace("AI ", "")}</div>
      </motion.div>
    </section>
  );
}

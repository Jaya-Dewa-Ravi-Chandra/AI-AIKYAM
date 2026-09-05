import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { speakers } from "../data/eventData";

export default function Speakers() {
  return (
    <section className="section speakers-section" id="speakers">
      <div className="section-heading">
        <h2>THE MINDS<br /><em>BEHIND THE FUTURE.</em></h2>
      </div>
      <div className="speaker-track">
        {speakers.map((speaker, i) => (
          <motion.article
            className="speaker-card"
            key={speaker.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: i * 0.08 }}
          >
            <div className="speaker-portrait">
              <div className="portrait-grid" />
              <img src={speaker.initials}></img>
              <div className="portrait-scan" />
            </div>
            <div className="speaker-info">
              <div>
                <h3>{speaker.name}</h3>
                <p>{speaker.role}</p>
                <small>{speaker.org}</small>
              </div>
              <ArrowUpRight size={20} />
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

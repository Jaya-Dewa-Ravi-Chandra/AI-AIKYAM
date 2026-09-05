import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export default function Hero() {
  return (
    <section className="hero section-grid" id="top">
      <div className="hero-orb orb-a" />
      <div className="hero-orb orb-b" />
      <div className="hero-lines" />
      <div className="hero-content">
        <motion.p
          className="eyebrow"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        ><h2>ANURAG UNIVERSITY · DEPARTMENT OF ARTIFICIAL INTELLIGENCE</h2>
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <span>AI</span>
          <strong>AIKYAM</strong>
        </motion.h1>
        <motion.div
          className="hero-meta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <span>08 — 09 OCTOBER 2026</span>
          <span className="meta-dot">·</span>
          <span>ANURAG UNIVERSITY</span>
        </motion.div>
      </div>
      <a className="scroll-cue" href="#countdown">
        <span>ENTER THE EXPERIENCE</span>
        <ArrowDown size={17} />
      </a>
    </section>
  );
}

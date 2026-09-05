import React from "react";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Hero from "./components/Hero";
import Countdown from "./components/Countdown";
import Speakers from "./components/Speakers";
import EventSection from "./components/EventSection";
import Pricing from "./components/Pricing";
import Register from "./components/Register";
import About from "./components/About";
import Chatbot from "./components/Chatbot";
import { events } from "./data/eventData";

export default function App() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
  }, []);

  return (
    <>
      <header className="topbar">
        <a href="#top" className="brand">AI<span>·</span>AIKYAM</a>
        <nav>
          <a href="#events">EVENTS</a>
          <a href="#pricing">REGISTER</a>
          <a href="#about">ABOUT</a>
        </nav>
        <a className="top-register" href="#register">REGISTER <ArrowUpRight size={14} /></a>
      </header>

      <main>
        <Hero />

        <section className="section countdown-section" id="countdown">
          <div className="countdown-copy">
            <h2>THE FUTURE<br /><em>IS WAITING.</em></h2>
            <p>Two days. Four experiences. One celebration of artificial intelligence.</p>
          </div>
          <Countdown />
          <div className="date-lockup"><span>08</span><i>—</i><span>09</span><small>OCTOBER<br />2026</small></div>
        </section>

        <Speakers />

        <section id="events" className="events-intro">
          <h2>FOUR WAYS<br /><em>TO THINK DIFFERENT.</em></h2>
        </section>

        {events.map((event, i) => <EventSection key={event.id} event={event} reverse={i % 2 === 1} />)}

        <Pricing />
        <Register />
        <About />

        <section className="finale">
          <div className="finale-grid" />
          <motion.h2 initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }}>
            MARK THE<br /><em>DATES...</em>
          </motion.h2>
          <h1>08 — 09 OCTOBER 2026</h1>
          <strong>AI<span>·</span>AIKYAM</strong>
          <strong>ANURAG UNIVERSITY · DEPARTMENT OF ARTIFICIAL INTELLIGENCE</strong>
        </section>
      </main>

      <footer className="footer">
        <span>AI AIKYAM © 2026</span>
        <span>ANURAG UNIVERSITY · DEPARTMENT OF ARTIFICIAL INTELLIGENCE</span>
      </footer>
      <Chatbot />
    </>
  );
}

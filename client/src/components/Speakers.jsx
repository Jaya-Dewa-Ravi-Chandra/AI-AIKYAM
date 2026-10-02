import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { speakers } from "../data/eventData";

export default function Speakers() {
  const trackRef = useRef(null);
  const animationRef = useRef(null);
  const resumeTimeoutRef = useRef(null);

  const isPaused = useRef(false);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const speed = 0.5; // pixels per frame

    const animate = () => {
      if (!isPaused.current) {
        track.scrollLeft += speed;

        // When reaching the end, smoothly restart
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth) {
          track.scrollLeft = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const pauseAndResume = () => {
    isPaused.current = true;

    clearTimeout(resumeTimeoutRef.current);

    // Resume after 2 seconds
    resumeTimeoutRef.current = setTimeout(() => {
      isPaused.current = false;
    }, 2000);
  };

  return (
    <section className="section speakers-section" id="speakers">
      <div className="section-heading">
        <h2>
          THE MINDS
          <br />
          <em>BEHIND THE FUTURE.</em>
        </h2>
      </div>

      <div
        className="speaker-track"
        ref={trackRef}
        onClick={pauseAndResume}
        onTouchStart={pauseAndResume}
      >
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

              <img
                src={speaker.initials}
                alt={speaker.name}
              />

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
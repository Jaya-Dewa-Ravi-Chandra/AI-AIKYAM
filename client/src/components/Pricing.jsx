import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { pricing } from "../data/eventData";

export default function Pricing() {
  return (
    <section className="section pricing-section" id="pricing">
      <div className="section-heading centered">
        <h2>CHOOSE<br /><em>YOUR BATTLE.</em></h2>
        <p>Pick your pass and secure your place at AI AIKYAM.</p>
      </div>
      <div className="pricing-grid">
        {pricing.map((plan) => (
          <article className={`price-card ${plan.featured ? "featured" : ""}`} key={plan.title + plan.subtitle}>
            {plan.featured && <span className="popular">RECOMMENDED</span>}
            <p className="price-label">{plan.title}</p>
            <h3>{plan.subtitle}</h3>
            <div className="price">{plan.price}</div>
            <p className="price-note">{plan.note}</p>
            <ul>
              {plan.bullets.map((bullet) => <li key={bullet}><Check size={15} />{bullet}</li>)}
            </ul>
            <a href="#register" className="price-button">REGISTER <ArrowRight size={16} /></a>
          </article>
        ))}
      </div>
    </section>
  );
}

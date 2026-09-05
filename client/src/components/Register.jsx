import React from "react";
import { ExternalLink } from "lucide-react";

const formUrl = import.meta.env.VITE_GOOGLE_FORM_URL || "https://docs.google.com/forms/d/e/1FAIpQLSd3LW4WQc-3wLbvnurqY_tpkXJ3WE0dhkNGVmz1vskNp1Gbbg/viewform?embedded=true";

export default function Register() {
  return (
    <section className="section register-section" id="register">
      <div className="register-heading">
        <h2>SECURE<br /><em>YOUR PLACE.</em></h2>
        <p>Complete the registration form below. For the best experience, keep this tab open while submitting.</p>
        <a className="text-link" href={formUrl.replace("?embedded=true", "")} target="_blank" rel="noreferrer">
          OPEN FORM IN NEW TAB <ExternalLink size={15} />
        </a>
      </div>
      <div className="form-shell">
        <iframe title="AI AIKYAM Registration Form" src={formUrl} frameBorder="0">Loading…</iframe>
      </div>
    </section>
  );
}

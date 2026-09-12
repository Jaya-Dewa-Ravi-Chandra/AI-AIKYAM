import React from "react";
import { Mail, Phone } from "lucide-react";
import { coordinators } from "../data/eventData";

function Person({ person }) {
  return (
    <div className="person">
      <div className="person-avatar">{person.name.slice(0, 2)}</div>
      <div>
        <h3>{person.name}</h3>
        <p>{person.role}</p>
        <span><Phone size={13} /> {person.contact}</span>
      </div>
    </div>
  );
}

export default function About() {
  return (
    <section className="section about-section" id="about">
      <div className="section-heading">
        <h2>THE PEOPLE<br /><em>BEHIND AIKYAM.</em></h2>
      </div>
      <div className="coordinator-grid">
        <div>
          <p className="coordinator-label">STUDENT COORDINATORS</p>
          {coordinators.students.map((p) => <Person person={p} key={p.name + p.contact} />)}
        </div>
        <div>
          <p className="coordinator-label">FACULTY COORDINATORS</p>
          {coordinators.faculty.map((p) => <Person person={p} key={p.name} />)}
        </div>
      </div>
      <div className="contact-strip">
        <Mail size={18} />
        <span>For official enquiries, replace this line with your event email.</span>
      </div>
    </section>
  );
}

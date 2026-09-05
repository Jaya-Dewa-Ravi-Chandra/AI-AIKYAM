import React, { useMemo, useState } from "react";
import { ArrowRight, Check, CreditCard, Loader2 } from "lucide-react";

const EVENTS = [
  {
    id: "AI PRADARSHA",
    name: "AI PRADARSHA",
    description: "Project Expo",
  },
  {
    id: "AI SANKALP",
    name: "AI SANKALP",
    description: "Idea Pitching",
  },
  {
    id: "AI MAHAYUDH",
    name: "AI MAHAYUDH",
    description: "Grand Challenge",
  },
];

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    institution: "",
    city: "",
    department: "",
    year: "",
    events: [],
    transactionId: "",
  });

  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [registrationId, setRegistrationId] = useState("");

  const amount = useMemo(() => {
    switch (form.events.length) {
      case 1:
        return 250;
      case 2:
        return 500;
      case 3:
        return 650;
      default:
        return 0;
    }
  }, [form.events]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setStatus("");
  };

  const handleEventChange = (eventId) => {
    setForm((previous) => {
      const selected = previous.events.includes(eventId);

      return {
        ...previous,
        events: selected
          ? previous.events.filter((event) => event !== eventId)
          : [...previous.events, eventId],
      };
    });

    setError("");
    setStatus("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setStatus("");
    setRegistrationId("");

    if (form.events.length === 0) {
      setError("Please select at least one event.");
      return;
    }

    if (!form.transactionId.trim()) {
      setError("Please enter your UPI transaction ID / UTR.");
      return;
    }

    try {
      setStatus("Submitting registration...");

      const response = await fetch(
        `${API_URL}/api/registrations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to complete registration."
        );
      }

      setRegistrationId(data.registrationId || "");

      setStatus(
        "Registration submitted successfully. Your payment is pending verification."
      );

      setTimeout(() => {
        document
          .getElementById("payment-section")
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 100);
    } catch (err) {
      setStatus("");
      setError(
        err.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  return (
    <section
      className="section register-section"
      id="register"
    >
      <div className="register-heading">
        <p className="eyebrow">
          05 // REGISTRATION
        </p>

        <h2>
          ENTER
          <br />
          <em>THE ARENA.</em>
        </h2>

        <p>
          Secure your place at AI AIKYAM 2026. Fill in your
          details, select your events, complete the payment,
          and enter your UPI transaction ID.
        </p>

        <div className="registration-fee-note">
          <strong>REGISTRATION FEE</strong>

          <p>
            Individual event registration costs ₹250 per
            event. Select all three events for the special
            discounted fee of ₹650.
          </p>

          <div className="fee-breakdown">
            <span>
              <b>1 EVENT</b>
              ₹250
            </span>

            <span>
              <b>2 EVENTS</b>
              ₹500
            </span>

            <span>
              <b>3 EVENTS</b>
              ₹650
            </span>
          </div>
        </div>
      </div>

      <div className="registration-form-shell">
        <form
          className="registration-form"
          onSubmit={handleSubmit}
        >
          {/* PARTICIPANT DETAILS */}

          <div className="form-section-title">
            <span>01</span>
            PARTICIPANT DETAILS
          </div>

          <div className="form-grid">
            <label>
              <span>FULL NAME *</span>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              <span>EMAIL ID *</span>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <span>PHONE NUMBER *</span>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                pattern="[0-9]{10}"
                maxLength="10"
                required
              />
            </label>

            <label>
              <span>INSTITUTION NAME *</span>

              <input
                type="text"
                name="institution"
                value={form.institution}
                onChange={handleChange}
                placeholder="College / University"
                required
              />
            </label>

            <label>
              <span>CITY *</span>

              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Your city"
                required
              />
            </label>

            <label>
              <span>DEPARTMENT *</span>

              <input
                type="text"
                name="department"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g. CSE, AI, ECE"
                required
              />
            </label>

            <label>
              <span>YEAR OF STUDY *</span>

              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                required
              >
                <option value="">
                  Select year
                </option>

                <option value="1st Year">
                  1st Year
                </option>

                <option value="2nd Year">
                  2nd Year
                </option>

                <option value="3rd Year">
                  3rd Year
                </option>

                <option value="4th Year">
                  4th Year
                </option>

                <option value="Postgraduate">
                  Postgraduate
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </label>
          </div>

          {/* EVENT SELECTION */}

          <div className="form-section-title">
            <span>02</span>
            SELECT YOUR EVENTS
          </div>

          <div className="event-selection">
            {EVENTS.map((event) => {
              const selected =
                form.events.includes(event.id);

              return (
                <button
                  type="button"
                  key={event.id}
                  className={`event-option ${
                    selected ? "selected" : ""
                  }`}
                  onClick={() =>
                    handleEventChange(event.id)
                  }
                >
                  <div className="event-option-check">
                    {selected && <Check size={15} />}
                  </div>

                  <div>
                    <strong>
                      {event.name}
                    </strong>

                    <small>
                      {event.description}
                    </small>
                  </div>
                </button>
              );
            })}
          </div>

          {/* TOTAL */}

          <div className="registration-total">
            <div>
              <span>
                SELECTED EVENTS
              </span>

              <strong>
                {form.events.length === 0
                  ? "NONE"
                  : `${form.events.length} EVENT${
                      form.events.length > 1
                        ? "S"
                        : ""
                    }`}
              </strong>
            </div>

            <div className="total-amount">
              <span>
                TOTAL FEE
              </span>

              <strong>
                ₹{amount}
              </strong>
            </div>
          </div>

          {/* DISCOUNT MESSAGE */}

          <div className="discount-note">
            {form.events.length === 0 && (
              <p>
                Select an event to see your
                registration fee.
              </p>
            )}

            {form.events.length === 1 && (
              <p>
                Individual event registration:
                <strong> ₹250</strong>
              </p>
            )}

            {form.events.length === 2 && (
              <p>
                2 events × ₹250 =
                <strong> ₹500</strong>
              </p>
            )}

            {form.events.length === 3 && (
              <p>
                3 events normally cost ₹750.
                Discounted fee:
                <strong> ₹650</strong>.
                You save ₹100.
              </p>
            )}
          </div>

          {/* PAYMENT */}

          <div
            className="payment-section"
            id="payment-section"
          >
            <div className="form-section-title">
              <span>03</span>
              PAYMENT
            </div>

            <div className="payment-box">
              <div className="payment-info">
                <CreditCard size={20} />

                <div>
                  <strong>
                    PAYMENT TO BE DONE
                  </strong>

                  <div className="payment-amount">
                    ₹{amount}
                  </div>

                  <p>
                    Scan the UPI QR code below
                    to complete your payment.
                  </p>
                </div>
              </div>

              <div className="upi-qr-container">
                {amount > 0 ? (
                  <img
                    src="/upi-qr.png"
                    alt="UPI payment QR code"
                    className="upi-qr"
                  />
                ) : (
                  <div className="qr-placeholder">
                    SELECT AN EVENT
                    <br />
                    TO VIEW PAYMENT QR
                  </div>
                )}
              </div>

              <p className="payment-warning">
                Please pay the exact amount shown
                above.
              </p>

              {/* TRANSACTION ID */}

              <div className="transaction-field">
                <label>
                  <span>
                    UPI TRANSACTION ID / UTR *
                  </span>

                  <input
                    type="text"
                    name="transactionId"
                    value={form.transactionId}
                    onChange={handleChange}
                    placeholder="Enter your UPI transaction ID / UTR"
                    required
                  />
                </label>

                <p>
                  After completing the payment,
                  enter the transaction ID shown
                  in your UPI app.
                </p>
              </div>
            </div>
          </div>

          {/* STATUS */}

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          {status && (
            <div className="form-success">
              {status}

              {registrationId && (
                <strong>
                  Registration ID:{" "}
                  {registrationId}
                </strong>
              )}
            </div>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            className="registration-submit"
            disabled={
              status ===
              "Submitting registration..."
            }
          >
            {status ===
            "Submitting registration..." ? (
              <>
                <span>
                  SUBMITTING
                </span>

                <Loader2
                  size={17}
                  className="spin"
                />
              </>
            ) : (
              <>
                <span>
                  SUBMIT REGISTRATION
                </span>

                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
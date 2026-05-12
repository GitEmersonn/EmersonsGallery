"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = "build" | "custom";
type Status = "idle" | "sending" | "success" | "error";

const CHIP_SERVICE = ["Photography", "Videography", "Photography + Video"];
const CHIP_EVENT = ["Wedding", "Portrait", "Family", "Concert / Event", "Commercial", "Other"];
const CHIP_SCENES = ["1 scene", "2–3 scenes", "4+ scenes"];
const CHIP_FORMAT = ["Digital", "Film", "Both"];
const CHIP_DURATION = ["Half day (~4 hrs)", "Full day (~8 hrs)", "Multi-day"];

function OptionRow({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-6">
      <p
        className="mb-2.5 text-xs tracking-[0.22em] uppercase"
        style={{ fontFamily: "var(--font-mono)", color: "#d4a017", opacity: 0.6 }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? "" : opt)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.1em",
                padding: "6px 14px",
                borderRadius: 3,
                border: active
                  ? "1px solid rgba(212,160,23,0.75)"
                  : "1px solid rgba(196,168,130,0.2)",
                background: active ? "rgba(212,160,23,0.13)" : "rgba(26,16,8,0.55)",
                color: active ? "#d4a017" : "#c4a882",
                opacity: active ? 1 : 0.65,
                cursor: "pointer",
                transition: "all 0.18s ease",
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(26,16,8,0.7)",
  border: "1px solid rgba(196,168,130,0.18)",
  borderRadius: 3,
  padding: "10px 14px",
  fontFamily: "var(--font-mono)",
  fontSize: 13,
  color: "#f5e6c8",
  outline: "none",
  transition: "border-color 0.2s",
};

export default function BookingForm() {
  const [mode, setMode] = useState<Mode>("build");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [service, setService] = useState("");
  const [eventType, setEventType] = useState("");
  const [scenes, setScenes] = useState("");
  const [format, setFormat] = useState("");
  const [duration, setDuration] = useState("");
  const [comments, setComments] = useState("");
  const [customMsg, setCustomMsg] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");

    const message =
      mode === "build"
        ? [
            "BOOKING REQUEST",
            "",
            service && `Service: ${service}`,
            eventType && `Event type: ${eventType}`,
            scenes && `Scenes / settings: ${scenes}`,
            format && `Format: ${format}`,
            duration && `Duration: ${duration}`,
            comments && `\nAdditional notes:\n${comments}`,
          ]
            .filter(Boolean)
            .join("\n")
        : customMsg;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  const focusBorder = "rgba(212,160,23,0.5)";
  const normalBorder = "rgba(196,168,130,0.18)";

  return (
    <section
      className="relative py-24 md:py-32"
      style={{
        background: "linear-gradient(to bottom, #1a1008 0%, #160d04 50%, #1a1008 100%)",
      }}
    >
      {/* Top rule */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(212,160,23,0.25) 30%, rgba(212,160,23,0.5) 50%, rgba(212,160,23,0.25) 70%, transparent 100%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <p
            className="mb-3 tracking-[0.3em] text-xs uppercase"
            style={{ fontFamily: "var(--font-mono)", color: "#d4a017", opacity: 0.5 }}
          >
            — Book a Session —
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 300,
              color: "#f5e6c8",
              textShadow: "0 2px 30px rgba(212,160,23,0.2)",
            }}
          >
            Let&apos;s Shoot Together
          </h2>
          <p
            style={{ fontFamily: "var(--font-hand)", color: "#c4a882", fontSize: 20, opacity: 0.7 }}
          >
            Let&apos;s make something worth holding onto
          </p>

          {/* Price badge */}
          <div className="mt-5 inline-flex items-center gap-2">
            <span
              className="px-4 py-1.5 text-xs tracking-[0.25em] font-semibold"
              style={{
                fontFamily: "var(--font-mono)",
                color: "#d4a017",
                border: "1px solid rgba(212,160,23,0.45)",
                borderRadius: 3,
                background: "rgba(212,160,23,0.08)",
                letterSpacing: "0.18em",
              }}
            >
              STARTING AT $199
            </span>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            background: "linear-gradient(135deg, #211408 0%, #1c1005 100%)",
            border: "1px solid rgba(212,160,23,0.14)",
            borderRadius: 6,
            padding: "2rem",
            boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
          }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-10 text-center flex flex-col items-center gap-4"
              >
                <span style={{ fontSize: 36 }}>✦</span>
                <h3
                  style={{ fontFamily: "var(--font-display)", color: "#f5e6c8", fontSize: 26, fontWeight: 300 }}
                >
                  Request Sent
                </h3>
                <p style={{ fontFamily: "var(--font-hand)", color: "#c4a882", fontSize: 19, opacity: 0.7 }}>
                  I&apos;ll be in touch soon — looking forward to working together.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Mode toggle */}
                <div
                  className="flex mb-8 rounded overflow-hidden"
                  style={{ border: "1px solid rgba(196,168,130,0.15)" }}
                >
                  {(["build", "custom"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className="flex-1 py-2.5 text-xs tracking-widest transition-all duration-200"
                      style={{
                        fontFamily: "var(--font-mono)",
                        background: mode === m ? "rgba(212,160,23,0.12)" : "transparent",
                        color: mode === m ? "#d4a017" : "#c4a882",
                        opacity: mode === m ? 1 : 0.5,
                        border: "none",
                        cursor: "pointer",
                        letterSpacing: "0.18em",
                      }}
                    >
                      {m === "build" ? "BUILD MY SESSION" : "WRITE YOUR OWN"}
                    </button>
                  ))}
                </div>

                {/* Name + email (always shown) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-7">
                  <div>
                    <label
                      className="block mb-1.5 text-xs tracking-[0.18em] uppercase"
                      style={{ fontFamily: "var(--font-mono)", color: "#c4a882", opacity: 0.55 }}
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Emerson Locke"
                      style={{
                        ...inputStyle,
                        borderColor: focusedField === "name" ? focusBorder : normalBorder,
                      }}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                  <div>
                    <label
                      className="block mb-1.5 text-xs tracking-[0.18em] uppercase"
                      style={{ fontFamily: "var(--font-mono)", color: "#c4a882", opacity: 0.55 }}
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      style={{
                        ...inputStyle,
                        borderColor: focusedField === "email" ? focusBorder : normalBorder,
                      }}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {mode === "build" ? (
                    <motion.div
                      key="build"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                    >
                      <OptionRow
                        label="What are you looking for?"
                        options={CHIP_SERVICE}
                        value={service}
                        onChange={setService}
                      />
                      <OptionRow
                        label="Type of event"
                        options={CHIP_EVENT}
                        value={eventType}
                        onChange={setEventType}
                      />
                      <OptionRow
                        label="Scenes / settings"
                        options={CHIP_SCENES}
                        value={scenes}
                        onChange={setScenes}
                      />
                      <OptionRow
                        label="Film or digital?"
                        options={CHIP_FORMAT}
                        value={format}
                        onChange={setFormat}
                      />
                      <OptionRow
                        label="How long?"
                        options={CHIP_DURATION}
                        value={duration}
                        onChange={setDuration}
                      />
                      <div className="mb-6">
                        <label
                          className="block mb-2 text-xs tracking-[0.22em] uppercase"
                          style={{ fontFamily: "var(--font-mono)", color: "#d4a017", opacity: 0.6 }}
                        >
                          Additional notes
                        </label>
                        <textarea
                          rows={3}
                          value={comments}
                          onChange={(e) => setComments(e.target.value)}
                          placeholder="Dates, locations, inspiration — anything you'd like me to know…"
                          style={{
                            ...inputStyle,
                            resize: "none",
                            borderColor: focusedField === "comments" ? focusBorder : normalBorder,
                          }}
                          onFocus={() => setFocusedField("comments")}
                          onBlur={() => setFocusedField(null)}
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="custom"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25 }}
                      className="mb-6"
                    >
                      <label
                        className="block mb-2 text-xs tracking-[0.22em] uppercase"
                        style={{ fontFamily: "var(--font-mono)", color: "#d4a017", opacity: 0.6 }}
                      >
                        Tell me everything
                      </label>
                      <textarea
                        rows={8}
                        value={customMsg}
                        onChange={(e) => setCustomMsg(e.target.value)}
                        required
                        placeholder="Describe the shoot you have in mind — dates, location, style, vibe, number of people, film vs digital, anything goes…"
                        style={{
                          ...inputStyle,
                          resize: "none",
                          borderColor: focusedField === "custom" ? focusBorder : normalBorder,
                        }}
                        onFocus={() => setFocusedField("custom")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {status === "error" && (
                  <p
                    className="mb-4 text-xs text-center"
                    style={{ fontFamily: "var(--font-mono)", color: "#e76f51", opacity: 0.8 }}
                  >
                    Something went wrong — try again or email directly.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full py-3 tracking-[0.22em] text-xs font-semibold transition-all duration-300"
                  style={{
                    fontFamily: "var(--font-mono)",
                    background:
                      status === "sending"
                        ? "rgba(212,160,23,0.07)"
                        : "rgba(212,160,23,0.12)",
                    border: "1px solid rgba(212,160,23,0.35)",
                    borderRadius: 3,
                    color: "#d4a017",
                    cursor: status === "sending" ? "default" : "pointer",
                    opacity: status === "sending" ? 0.55 : 1,
                  }}
                >
                  {status === "sending" ? "SENDING…" : "SEND BOOKING REQUEST"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Bottom rule */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent 0%, rgba(212,160,23,0.2) 40%, rgba(212,160,23,0.35) 50%, rgba(212,160,23,0.2) 60%, transparent 100%)",
        }}
      />
    </section>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Status = "idle" | "sending" | "success" | "error";

function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-2">
      <div
        className="h-px flex-1 max-w-24"
        style={{ background: "linear-gradient(to right, transparent, #d4a017aa)" }}
      />
      <span style={{ color: "#d4a017", fontSize: 13, opacity: 0.7 }}>✦</span>
      <div
        className="h-px flex-1 max-w-24"
        style={{ background: "linear-gradient(to left, transparent, #d4a017aa)" }}
      />
    </div>
  );
}

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<Status>("idle");
  const [focused, setFocused] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputBase: React.CSSProperties = {
    background: "rgba(26,16,8,0.6)",
    border: "1px solid rgba(212,160,23,0.15)",
    color: "#f5e6c8",
    fontFamily: "var(--font-playfair)",
    fontSize: 15,
    padding: "12px 16px",
    width: "100%",
    outline: "none",
    borderRadius: 3,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const inputFocused: React.CSSProperties = {
    borderColor: "rgba(212,160,23,0.5)",
    boxShadow: "0 0 0 3px rgba(212,160,23,0.07)",
  };

  return (
    <section
      className="relative py-24 md:py-32"
      style={{ background: "linear-gradient(to bottom, #1a1008, #1e1208, #1a1008)" }}
    >
      {/* Warm glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(196,168,130,0.05) 0%, transparent 65%)",
        }}
      />

      <div className="relative z-10 max-w-2xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65 }}
        >
          <p
            className="mb-3 tracking-[0.3em] text-xs uppercase"
            style={{ fontFamily: "var(--font-courier)", color: "#d4a017", opacity: 0.5 }}
          >
            — Get in Touch —
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold"
            style={{
              fontFamily: "var(--font-playfair)",
              color: "#f5e6c8",
              textShadow: "0 2px 30px rgba(212,160,23,0.2)",
            }}
          >
            Contact
          </h2>
          <p
            className="mt-3 opacity-60"
            style={{ fontFamily: "var(--font-caveat)", color: "#c4a882", fontSize: 21 }}
          >
            Let&rsquo;s make something together
          </p>
          <GoldDivider />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div
                  className="text-5xl mb-5"
                  style={{ fontFamily: "var(--font-caveat)", color: "#d4a017" }}
                >
                  ✦
                </div>
                <p
                  className="text-2xl"
                  style={{ fontFamily: "var(--font-playfair)", color: "#f5e6c8" }}
                >
                  Message sent.
                </p>
                <p
                  className="mt-3 opacity-60"
                  style={{ fontFamily: "var(--font-caveat)", color: "#c4a882", fontSize: 19 }}
                >
                  I&rsquo;ll be in touch soon.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-8 px-6 py-2 text-xs tracking-widest transition-opacity hover:opacity-80"
                  style={{
                    fontFamily: "var(--font-courier)",
                    color: "#d4a017",
                    border: "1px solid rgba(212,160,23,0.3)",
                    borderRadius: 2,
                  }}
                >
                  SEND ANOTHER
                </button>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="space-y-5"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Name */}
                <div>
                  <label
                    style={{
                      fontFamily: "var(--font-courier)",
                      color: "#c4a882",
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      opacity: 0.65,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    NAME
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setFocused("name")}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputBase,
                      ...(focused === "name" ? inputFocused : {}),
                    }}
                    placeholder="Your name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      fontFamily: "var(--font-courier)",
                      color: "#c4a882",
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      opacity: 0.65,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    EMAIL
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputBase,
                      ...(focused === "email" ? inputFocused : {}),
                    }}
                    placeholder="your@email.com"
                  />
                </div>

                {/* Message */}
                <div>
                  <label
                    style={{
                      fontFamily: "var(--font-courier)",
                      color: "#c4a882",
                      fontSize: 10,
                      letterSpacing: "0.2em",
                      opacity: 0.65,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    MESSAGE
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    style={{
                      ...inputBase,
                      resize: "vertical",
                      ...(focused === "message" ? inputFocused : {}),
                    }}
                    placeholder="Tell me about your project or just say hello..."
                  />
                </div>

                {status === "error" && (
                  <p
                    style={{
                      fontFamily: "var(--font-courier)",
                      color: "#e76f51",
                      fontSize: 11,
                      letterSpacing: "0.1em",
                    }}
                  >
                    Something went wrong — please try again or email directly.
                  </p>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={status === "sending"}
                  className="relative w-full py-4 tracking-[0.25em] text-xs font-medium overflow-hidden group"
                  style={{
                    fontFamily: "var(--font-courier)",
                    color: status === "sending" ? "#c4a882" : "#1a1008",
                    background:
                      status === "sending"
                        ? "transparent"
                        : "linear-gradient(135deg, #d4a017 0%, #b8891a 100%)",
                    border: "1px solid rgba(212,160,23,0.5)",
                    borderRadius: 3,
                    cursor: status === "sending" ? "wait" : "pointer",
                  }}
                  whileHover={status !== "sending" ? { scale: 1.01 } : {}}
                  whileTap={status !== "sending" ? { scale: 0.99 } : {}}
                >
                  {status === "sending" ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        style={{ display: "inline-block" }}
                      >
                        ◎
                      </motion.span>
                      SENDING...
                    </span>
                  ) : (
                    "SEND MESSAGE"
                  )}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

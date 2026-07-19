"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { DASHBOARD_API_URL } from "../_shared/externalLinks";
import { INVITE_ENDPOINT } from "../_shared/constants/api";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubmitStatus = "idle" | "submitting" | "success" | "error";

const initialFormState = {
  email: "",
  adk: "",
  adkOther: "",
  channel: "",
  channelOther: "",
  projectDescription: "",
};

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
  const [form, setForm] = useState(initialFormState);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Reset the form once the modal finishes closing, so reopening starts
  // fresh. Done as a render-time state adjustment (not an effect) per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (!isOpen) {
      setForm(initialFormState);
      setStatus("idle");
      setErrorMessage("");
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const handleAdkChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, adk: value, adkOther: value === "other" ? f.adkOther : "" }));
  };

  const handleChannelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, channel: value, channelOther: value === "other" ? f.channelOther : "" }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const response = await fetch(`${DASHBOARD_API_URL}${INVITE_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          adk: form.adk,
          adk_other: form.adk === "other" ? form.adkOther : null,
          channel: form.channel,
          channel_other: form.channel === "other" ? form.channelOther : null,
          project_description: form.projectDescription,
        }),
      });

      if (response.status === 429) {
        setErrorMessage("Too many requests — please try again in a minute.");
        setStatus("error");
        return;
      }
      if (!response.ok) {
        setErrorMessage("Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setStatus("success");
    } catch {
      setErrorMessage("Couldn't reach the server. Please try again.");
      setStatus("error");
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={`modal-backdrop${isOpen ? " open" : ""}`} onClick={handleBackdropClick}>
      <div className="invite-modal" role="dialog" aria-modal="true" aria-labelledby="inviteModalTitle">
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
        <div className="invite-badge">Early Access</div>
        <div className="sec-kicker">Currently invite-only</div>
        <h2 id="inviteModalTitle" className="serif">
          We&apos;re onboarding
          <br />
          <em>teams by hand.</em>
        </h2>

        {status === "success" ? (
          <>
            <p>Request received — we review these by hand and will reach out at {form.email}.</p>
            <div className="invite-meta">
              <span className="im-item">
                <span className="led on" /> LangGraph teams first
              </span>
              <span className="im-item">
                <span className="led on" /> Slack workspace required
              </span>
            </div>
          </>
        ) : (
          <>
            <p>HGateway is early — every workspace today is set up directly with us, not through self-serve signup.</p>
            <div className="invite-meta">
              <span className="im-item">
                <span className="led on" /> LangGraph teams first
              </span>
              <span className="im-item">
                <span className="led on" /> Slack workspace required
              </span>
            </div>

            <form className="invite-form" onSubmit={handleSubmit}>
              <label className="if-label">
                Work email<span className="if-req">*</span>
              </label>
              <input
                className="if-input"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />

              <label className="if-label">
                ADK you&apos;re using<span className="if-req">*</span>
              </label>
              <select className="if-input" value={form.adk} onChange={handleAdkChange} required>
                <option value="" disabled>
                  Select an ADK…
                </option>
                <option value="langgraph">LangGraph — supported today</option>
                <option value="dspy">DSPy — coming soon</option>
                <option value="strands">Strands — coming soon</option>
                <option value="openai-adk">OpenAI ADK — coming soon</option>
                <option value="google-adk">Google ADK — coming soon</option>
                <option value="ms-adk">MS ADK — coming soon</option>
                <option value="other">Other</option>
              </select>
              <input
                className={`if-input if-other${form.adk === "other" ? " show" : ""}`}
                type="text"
                placeholder="Which ADK?"
                value={form.adkOther}
                onChange={(e) => setForm((f) => ({ ...f, adkOther: e.target.value }))}
                required={form.adk === "other"}
              />

              <label className="if-label">
                Comm channel you&apos;re using<span className="if-req">*</span>
              </label>
              <select className="if-input" value={form.channel} onChange={handleChannelChange} required>
                <option value="" disabled>
                  Select a channel…
                </option>
                <option value="slack">Slack — supported today</option>
                <option value="web">Web — coming soon</option>
                <option value="ms-teams">MS Teams — coming soon</option>
                <option value="other">Other</option>
              </select>
              <input
                className={`if-input if-other${form.channel === "other" ? " show" : ""}`}
                type="text"
                placeholder="Which channel?"
                value={form.channelOther}
                onChange={(e) => setForm((f) => ({ ...f, channelOther: e.target.value }))}
                required={form.channel === "other"}
              />

              <label className="if-label">
                What are you building?<span className="if-req">*</span>
              </label>
              <input
                className="if-input"
                type="text"
                placeholder="e.g. finance-ops approval agent in LangGraph"
                value={form.projectDescription}
                onChange={(e) => setForm((f) => ({ ...f, projectDescription: e.target.value }))}
                required
              />

              <button className="btn btn-primary" type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Submitting…" : "Request invite →"}
              </button>
              {status === "error" && <div className="if-hint">{errorMessage}</div>}
              <div className="if-hint">Reviewed by a person, not a waitlist bot.</div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, type RefObject } from "react";
import type { SandboxApi } from "../hooks/useHitlSandbox";
import { useCardBoundedOverlay } from "../hooks/useCardBoundedOverlay";

const VED_LOGO_SRC = "/sandbox/theved-logo.png";

function ModalHead({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose: () => void }) {
  return (
    <div className="m-head">
      <div className="m-head-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="m-icon" src={VED_LOGO_SRC} alt="Ved" />
        <div className="m-title-wrap">
          <div className="m-title">{title}</div>
          {subtitle ? <div className="m-subtitle">{subtitle}</div> : null}
        </div>
      </div>
      <span className="m-x" onClick={onClose}>
        ✕
      </span>
    </div>
  );
}

interface HitlModalProps {
  api: SandboxApi;
  cardRef: RefObject<HTMLElement | null>;
}

export default function HitlModal({ api, cardRef }: HitlModalProps) {
  const { modal, closeModal, scenario } = api;
  const active = modal !== null;
  const rect = useCardBoundedOverlay(cardRef, active);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeModal]);

  if (!modal || !rect) return null;

  return (
    <div
      className="scrim show"
      style={{ left: rect.left, width: rect.width, top: rect.top, height: rect.height }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeModal();
      }}
    >
      <div className="modal">
        {modal.type === "impact" && (
          <>
            <ModalHead title="Impact" subtitle="Impact of each option" onClose={closeModal} />
            <div className="m-body">
              {scenario.impactGroups.map((g, gi) => (
                <div className="impact-grp" key={gi}>
                  <h4>{g.heading}</h4>
                  <ul>
                    {g.items.map((it, ii) => (
                      <li key={ii} className={it.bad ? "bad" : ""}>
                        {it.text}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div className="basis-note">
                <span className="warn">⚠</span> Inferred from the agent&apos;s trajectory + records — verify before acting.
              </div>
            </div>
            <div className="m-foot">
              <button className="btn-modal primary" onClick={closeModal}>
                Close
              </button>
            </div>
          </>
        )}

        {modal.type === "askAboutImpact" && (
          <AskAboutImpactBody api={api} scope={modal.scope} groupIndex={modal.groupIndex} onClose={closeModal} />
        )}

        {modal.type === "forward" && <ForwardBody api={api} onClose={closeModal} />}

        {modal.type === "confirmAction" && (
          <>
            <ModalHead title="Confirm this action" onClose={closeModal} />
            <div className="m-body">
              You&apos;re about to take the irreversible action <b>{modal.label}</b>. This can&apos;t be automatically
              undone. Continue?
            </div>
            <div className="m-foot">
              <button className="btn-modal" onClick={closeModal}>
                Cancel
              </button>
              <button
                className="btn-modal primary"
                onClick={() => {
                  const onConfirm = modal.onConfirm;
                  closeModal();
                  onConfirm();
                }}
              >
                Yes, continue
              </button>
            </div>
          </>
        )}

        {modal.type === "adjustReasoning" && <AdjustReasoningBody api={api} reasonId={modal.reasonId} onClose={closeModal} />}
      </div>
    </div>
  );
}

function AskAboutImpactBody({
  api,
  scope,
  groupIndex,
  onClose,
}: {
  api: SandboxApi;
  scope: string;
  groupIndex: number;
  onClose: () => void;
}) {
  const g = api.scenario.impactGroups[groupIndex];
  const [text, setText] = useState("");
  return (
    <>
      <ModalHead title="Ask about this option" onClose={onClose} />
      <div className="m-body">
        <b>{g.heading}</b>
        <ul style={{ margin: "6px 0 0 0", paddingLeft: 18 }}>
          {g.items.map((it, i) => (
            <li key={i}>{it.text}</li>
          ))}
        </ul>
        <label className="fl">Your question about &quot;{g.heading}&quot;</label>
        <textarea
          className="m-textarea"
          rows={3}
          placeholder={`Ask the agent about "${g.heading}"...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div className="m-foot">
        <button className="btn-modal" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-modal primary" onClick={() => api.submitImpactQuestion(groupIndex, scope, text)}>
          Submit
        </button>
      </div>
    </>
  );
}

function ForwardBody({ api, onClose }: { api: SandboxApi; onClose: () => void }) {
  const { scenario, forwardSelection, toggleForwardTarget, forwardedTargets, confirmForward } = api;
  const [note, setNote] = useState("");
  const alreadyForwardedIds = new Set(forwardedTargets.map((t) => t.id));

  return (
    <>
      <ModalHead
        title="Forward this request"
        subtitle="Configured secondary responders for this HITL — pick one or more to forward to."
        onClose={onClose}
      />
      <div className="m-body">
        {scenario.forwardTo.map((r) => {
          const already = alreadyForwardedIds.has(r.id);
          const selected = forwardSelection.includes(r.id);
          return (
            <div
              key={r.id}
              className={`resp-row${already ? " disabled" : ""}${selected ? " sel" : ""}`}
              onClick={already ? undefined : () => toggleForwardTarget(r.id)}
            >
              <div className="resp-checkbox">✓</div>
              <div>
                <div className="resp-name">{r.name}</div>
                <div className="resp-role">
                  {r.role} · {r.why}
                  {already ? " · already forwarded" : ""}
                </div>
              </div>
            </div>
          );
        })}
        <div className="fwd-already">Or forward to anyone in the workspace</div>
        <input className="fwd-search" placeholder="Search channels or people…" disabled />
        <label className="fl">Note (optional)</label>
        <textarea
          className="m-textarea"
          rows={2}
          placeholder="Let them know why you're forwarding this…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <div className="m-foot">
        <button className="btn-modal" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-modal primary" disabled={forwardSelection.length === 0} onClick={() => confirmForward(note)}>
          Forward
        </button>
      </div>
    </>
  );
}

function AdjustReasoningBody({ api, reasonId, onClose }: { api: SandboxApi; reasonId: string; onClose: () => void }) {
  const current = api.reasonCards[reasonId]?.draft ?? "";
  const [text, setText] = useState(current);
  return (
    <>
      <ModalHead title="Adjust the reasoning" onClose={onClose} />
      <div className="m-body">
        <label className="fl">Edit the drafted rationale so it matches why you actually decided.</label>
        <textarea className="m-textarea" rows={4} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <div className="m-foot">
        <button className="btn-modal" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-modal primary" onClick={() => api.saveReasonEdit(reasonId, text)}>
          Save
        </button>
      </div>
    </>
  );
}

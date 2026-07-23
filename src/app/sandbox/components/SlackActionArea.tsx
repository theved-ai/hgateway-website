"use client";

import type { InteractionKind } from "../data/scenarios";

interface SlackActionAreaProps {
  interaction: InteractionKind;
  resolved: boolean;
  onResolve: (label: string) => void;
}

// Shared by the Legacy and Ved cards — both render the exact same
// approve/reject, route-options, form, or edit-draft UI for a scenario; only
// what happens on click (and what surrounds it) differs between the two.
export default function SlackActionArea({ interaction, resolved, onResolve }: SlackActionAreaProps) {
  if (interaction.kind === "binary") {
    return (
      <div className={`s-actions${resolved ? " resolved" : ""}`}>
        <div className="s-btn primary" onClick={() => onResolve(interaction.approveLabel)}>
          {interaction.approveLabel}
        </div>
        <div className="s-btn danger" onClick={() => onResolve(interaction.rejectLabel)}>
          {interaction.rejectLabel}
        </div>
      </div>
    );
  }

  if (interaction.kind === "options") {
    return (
      <>
        {interaction.options.map((opt) => (
          <div className={`s-option-row${resolved ? " resolved" : ""}`} key={opt.label}>
            <div className="s-option-text">
              <div className="t">{opt.label}</div>
              <div className="d">{opt.desc}</div>
            </div>
            <div className="s-btn" onClick={() => onResolve(opt.label)}>
              {opt.label}
            </div>
          </div>
        ))}
      </>
    );
  }

  if (interaction.kind === "form") {
    return (
      <>
        <div className="s-field-label">{interaction.fieldLabel}</div>
        <div
          className="s-textbox"
          contentEditable={!resolved}
          suppressContentEditableWarning
          data-placeholder={interaction.placeholder}
        />
        <div className="s-hint">↵ Press &apos;enter&apos; to submit</div>
        <div className={`s-actions${resolved ? " resolved" : ""}`}>
          <div className="s-btn primary" onClick={() => onResolve(interaction.submitLabel)}>
            {interaction.submitLabel}
          </div>
        </div>
      </>
    );
  }

  // edit
  return (
    <>
      <div className="s-field-label">Agent&apos;s draft (editable)</div>
      <div className="s-textbox" contentEditable={!resolved} suppressContentEditableWarning>
        {interaction.draftText}
      </div>
      <div className="s-hint">↵ Press &apos;enter&apos; to submit</div>
      <div className={`s-actions${resolved ? " resolved" : ""}`}>
        <div className="s-btn primary" onClick={() => onResolve(interaction.primaryLabel)}>
          {interaction.primaryLabel}
        </div>
        <div className="s-btn" onClick={() => onResolve(interaction.secondaryLabel)}>
          {interaction.secondaryLabel}
        </div>
      </div>
    </>
  );
}

import type { ReasonCardData } from "../hooks/types";

interface ReasonCardProps {
  reasonId: string;
  data: ReasonCardData;
  onConfirm: (reasonId: string) => void;
  onAdjust: (reasonId: string) => void;
}

export default function ReasonCard({ reasonId, data, onConfirm, onAdjust }: ReasonCardProps) {
  return (
    <div className="reason-card">
      <div className="rl">📝 Reasoning — {data.confirmed ? "captured" : "drafted from your decision"}</div>
      <div className="reason-draft">&quot;{data.draft}&quot;</div>
      {data.confirmed ? (
        <div className="reason-confirmed">✓ Confirmed — saved to the decision record.</div>
      ) : (
        <>
          <div className="reason-q">
            Does this capture why you decided? (Logged for your team + used to make future requests smarter.)
          </div>
          <div className="reason-actions">
            <button className="btn-apply" onClick={() => onConfirm(reasonId)}>
              ✓ Yes, that&apos;s my reasoning
            </button>
            <button className="btn-modal" onClick={() => onAdjust(reasonId)}>
              ✎ Adjust
            </button>
          </div>
        </>
      )}
      <div className="tlog-added">Added by Ved</div>
    </div>
  );
}

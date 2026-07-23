import type { ReactNode } from "react";

/** 'orig' is Rishabh's own DM; 'fwd-<targetId>' is one per forwarded human/channel. */
export type Scope = string;

export type ThreadEntry =
  | { id: string; kind: "node"; node: ReactNode }
  | { id: string; kind: "reason"; reasonId: string }
  | { id: string; kind: "recommend"; recId: string }
  | { id: string; kind: "impact"; impactId: string };

export interface ConfidenceEntry {
  name: string;
  value: number;
  kinds: string[];
}

export interface ReasonCardData {
  scope: Scope;
  draft: string;
  confirmed: boolean;
}

export interface RecCardData {
  scope: Scope;
  time: string;
  recommend: string;
  confidence: string;
}

export interface ImpactCardData {
  time: string;
  groups: { heading: string; items: string[] }[];
}

export interface ForwardedTarget {
  id: string;
  name: string;
  role: string;
  scope: Scope;
  isChannel: boolean;
}

export type ModalState =
  | { type: "impact"; scope: Scope }
  | { type: "askAboutImpact"; scope: Scope; groupIndex: number }
  | { type: "forward" }
  | { type: "confirmAction"; scope: Scope; label: string; onConfirm: () => void }
  | { type: "adjustReasoning"; reasonId: string };

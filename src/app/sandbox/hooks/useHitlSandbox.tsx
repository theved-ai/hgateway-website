"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ALREADY_RESOLVED_REPLY,
  CASE_TABS,
  JOURNEY_NAMES,
  JOURNEY_ORDER,
  SCENARIOS,
  YOU_NAME,
  type CaseType,
} from "../data/scenarios";
import type { ConfidenceEntry, ForwardedTarget, ImpactCardData, ModalState, ReasonCardData, RecCardData, Scope, ThreadEntry } from "./types";
import {
  FwdCrossNote,
  FwdHighlight,
  Quote,
  ReconfirmLine,
  ResChoice,
  ResLine,
  ResLockNote,
  SnapshotDivider,
  VedMessage,
  YouMessage,
} from "../components/ThreadPieces";

function now(): string {
  return "2:" + (14 + Math.floor(Math.random() * 30)).toString().padStart(2, "0") + " PM";
}

const INITIAL_THREAD_TEXT =
  "Reply here to ask anything about this request — I'll answer from the agent's captured context. Recommendations and reasoning are logged in this thread.";

const CASE_TYPES = Object.keys(SCENARIOS) as CaseType[];

/** Everything that represents a single workflow tab's in-progress run. Kept one per
 * CaseType so switching tabs never wipes out what a user already did on another tab —
 * only pressing "Run this case" resets a given tab's own session. */
interface CaseSession {
  hasRun: boolean;
  runPressed: boolean;
  flashExisting: boolean;
  flashHgateway: boolean;
  existingRevealed: boolean;
  hgatewayRevealed: boolean;

  resolvedLegacy: boolean;
  legacyResolution: { label: string; stale: boolean } | null;
  resolvedVed: boolean;

  confidence: Record<Scope, ConfidenceEntry>;
  pulseTick: Record<Scope, number>;
  reasoningTick: Record<Scope, boolean>;

  forwardedTargets: ForwardedTarget[];
  activeDm: Scope;
  forwardSelection: string[];

  threads: Record<Scope, ThreadEntry[]>;
  replyCounts: Record<Scope, number>;
  threadOpen: Record<Scope, boolean>;
  reasonCards: Record<string, ReasonCardData>;
  recCards: Record<string, RecCardData>;
  impactCards: Record<string, ImpactCardData>;
}

function createInitialSession(): CaseSession {
  return {
    hasRun: false,
    runPressed: false,
    flashExisting: false,
    flashHgateway: false,
    existingRevealed: false,
    hgatewayRevealed: false,

    resolvedLegacy: false,
    legacyResolution: null,
    resolvedVed: false,

    confidence: { orig: { name: YOU_NAME, value: 50, kinds: [] } },
    pulseTick: {},
    reasoningTick: {},

    forwardedTargets: [],
    activeDm: "orig",
    forwardSelection: [],

    threads: { orig: [{ id: "sys-orig", kind: "node", node: <VedMessage time={now()}>{INITIAL_THREAD_TEXT}</VedMessage> }] },
    replyCounts: { orig: 0 },
    threadOpen: {},
    reasonCards: {},
    recCards: {},
    impactCards: {},
  };
}

function createInitialSessions(): Record<CaseType, CaseSession> {
  const sessions = {} as Record<CaseType, CaseSession>;
  CASE_TYPES.forEach((type) => {
    sessions[type] = createInitialSession();
  });
  return sessions;
}

export function useHitlSandbox() {
  const [currentType, setCurrentType] = useState<CaseType>("approval");
  const scenario = SCENARIOS[currentType];

  const [sessions, setSessions] = useState<Record<CaseType, CaseSession>>(createInitialSessions);
  const session = sessions[currentType];

  const [modal, setModal] = useState<ModalState | null>(null);

  const uidCounter = useRef(0);
  const uid = useCallback((prefix: string) => `${prefix}-${++uidCounter.current}`, []);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const later = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timeoutsRef.current.push(id);
  }, []);
  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  useEffect(() => clearAllTimeouts, [clearAllTimeouts]);

  const updateSession = useCallback((type: CaseType, updater: (s: CaseSession) => CaseSession) => {
    setSessions((prev) => ({ ...prev, [type]: updater(prev[type]) }));
  }, []);

  // Every interaction below acts on the currently selected tab's session.
  const update = useCallback((updater: (s: CaseSession) => CaseSession) => updateSession(currentType, updater), [
    currentType,
    updateSession,
  ]);

  const scopeResponderName = useCallback(
    (scope: Scope) => (scope === "orig" ? YOU_NAME : session.forwardedTargets.find((t) => t.scope === scope)?.name ?? YOU_NAME),
    [session.forwardedTargets]
  );

  const pushThread = useCallback(
    (scope: Scope, node: ReactNode, bump = true) => {
      const id = uid("t");
      update((s) => ({
        ...s,
        threads: { ...s.threads, [scope]: [...(s.threads[scope] ?? []), { id, kind: "node", node }] },
        replyCounts: bump ? { ...s.replyCounts, [scope]: (s.replyCounts[scope] ?? 0) + 1 } : s.replyCounts,
      }));
    },
    [uid, update]
  );

  const openThread = useCallback(
    (scope: Scope) => {
      update((s) => ({ ...s, threadOpen: { ...s.threadOpen, [scope]: true } }));
    },
    [update]
  );
  const toggleThread = useCallback(
    (scope: Scope) => {
      update((s) => ({ ...s, threadOpen: { ...s.threadOpen, [scope]: !s.threadOpen[scope] } }));
    },
    [update]
  );

  const bumpConfidence = useCallback(
    (kind: string, scope: Scope = "orig") => {
      update((s) => {
        const entry = s.confidence[scope];
        if (!entry || entry.kinds.includes(kind)) return s;
        const value = Math.min(90, entry.value + 10);
        return {
          ...s,
          confidence: { ...s.confidence, [scope]: { ...entry, value, kinds: [...entry.kinds, kind] } },
          pulseTick: { ...s.pulseTick, [scope]: (s.pulseTick[scope] ?? 0) + 1 },
        };
      });
    },
    [update]
  );

  const postAlreadyResolvedReply = useCallback(
    (scope: Scope) => {
      openThread(scope);
      pushThread(scope, <VedMessage time={now()}>{ALREADY_RESOLVED_REPLY}</VedMessage>, true);
    },
    [openThread, pushThread]
  );

  const closeModal = useCallback(() => setModal(null), []);

  // ============ Explain impact ============
  const submitImpactQuestion = useCallback(
    (groupIndex: number, scope: Scope, question: string) => {
      const g = scenario.impactGroups[groupIndex];
      const q = question.trim();
      if (!q) return;
      closeModal();
      openThread(scope);
      pushThread(
        scope,
        <YouMessage name={scopeResponderName(scope)} time={now()}>
          <Quote>
            {g.items.map((it, i) => (
              <span key={i}>
                • {it.text}
                <br />
              </span>
            ))}
          </Quote>
          <b>{q}</b>
        </YouMessage>,
        true
      );
      bumpConfidence("qna", scope);
      later(() => {
        pushThread(
          scope,
          <VedMessage time={now()}>
            <b>Re: {q}</b>
            <br />
            {scenario.qnaAnswer}
          </VedMessage>,
          true
        );
      }, 550);
    },
    [scenario, closeModal, openThread, pushThread, bumpConfidence, later, scopeResponderName]
  );

  const askAboutImpact = useCallback((groupIndex: number, scope: Scope) => {
    setModal({ type: "askAboutImpact", scope, groupIndex });
  }, []);

  const openImpact = useCallback(
    (scope: Scope) => {
      setModal({ type: "impact", scope });
      openThread(scope);
      bumpConfidence("impact", scope);
      const iid = uid("impact");
      update((s) => ({
        ...s,
        impactCards: {
          ...s.impactCards,
          [iid]: {
            time: now(),
            groups: scenario.impactGroups.map((g) => ({ heading: g.heading, items: g.items.map((it) => it.text) })),
          },
        },
        threads: { ...s.threads, [scope]: [...(s.threads[scope] ?? []), { id: iid, kind: "impact", impactId: iid }] },
        replyCounts: { ...s.replyCounts, [scope]: (s.replyCounts[scope] ?? 0) + 1 },
      }));
    },
    [scenario, openThread, bumpConfidence, uid, update]
  );

  // ============ Recommend ============
  const markReasoningCaptured = useCallback(
    (scope: Scope) => {
      update((s) => ({ ...s, reasoningTick: { ...s.reasoningTick, [scope]: true } }));
    },
    [update]
  );

  const postReasoningDraft = useCallback(
    (label: string, scope: Scope) => {
      const draft = scenario.reasoningDraft(label);
      const rid = uid("reason");
      update((s) => ({
        ...s,
        reasonCards: { ...s.reasonCards, [rid]: { scope, draft, confirmed: false } },
        threads: { ...s.threads, [scope]: [...(s.threads[scope] ?? []), { id: rid, kind: "reason", reasonId: rid }] },
      }));
    },
    [scenario, uid, update]
  );

  const resolveVed = useCallback(
    (label: string, scope: Scope, wasIrreversible: boolean) => {
      update((s) => ({ ...s, resolvedVed: true }));
      const resolvedBy = scopeResponderName(scope);
      const resolvedConfidence = session.confidence[scope]?.value ?? 50;

      if (wasIrreversible) {
        pushThread(scope, <ReconfirmLine name={resolvedBy} label={label} />, false);
      }
      pushThread(scope, <ResChoice name={resolvedBy} label={label} />, false);
      pushThread(scope, <ResLockNote name={resolvedBy} confidence={resolvedConfidence} />, false);
      openThread(scope);

      const whereText = scope === "orig" ? "Rishabh's original DM" : `${resolvedBy}'s forwarded DM`;
      const liveScopes = ["orig", ...session.forwardedTargets.map((t) => t.scope)].filter((s) => s !== scope);
      liveScopes.forEach((otherScope) => {
        pushThread(otherScope, <FwdCrossNote name={resolvedBy} whereText={whereText} />, false);
      });

      later(() => postReasoningDraft(label, scope), 550);
    },
    [session.confidence, session.forwardedTargets, openThread, pushThread, scopeResponderName, later, postReasoningDraft, update]
  );

  const handleVedClick = useCallback(
    (label: string, scope: Scope) => {
      if (session.resolvedVed) {
        postAlreadyResolvedReply(scope);
        return;
      }
      if (scenario.irreversible.includes(label)) {
        setModal({ type: "confirmAction", scope, label, onConfirm: () => resolveVed(label, scope, true) });
      } else {
        resolveVed(label, scope, false);
      }
    },
    [session.resolvedVed, scenario, postAlreadyResolvedReply, resolveVed]
  );

  const applyRecommendation = useCallback(
    (scope: Scope) => {
      if (session.resolvedVed) {
        postAlreadyResolvedReply(scope);
        return;
      }
      pushThread(scope, <ResLine>✅ Applied the recommendation</ResLine>, false);
      handleVedClick(scenario.recommendedChoice, scope);
    },
    [session.resolvedVed, scenario, postAlreadyResolvedReply, pushThread, handleVedClick]
  );

  const recommend = useCallback(
    (scope: Scope) => {
      if (session.resolvedVed) {
        postAlreadyResolvedReply(scope);
        return;
      }
      openThread(scope);
      pushThread(scope, <ResLine>{`${scopeResponderName(scope)} requested a recommendation`}</ResLine>, false);
      bumpConfidence("recommend", scope);
      const rid = uid("rec");
      update((s) => ({
        ...s,
        recCards: { ...s.recCards, [rid]: { scope, time: now(), recommend: scenario.recommend, confidence: scenario.confidence } },
        threads: { ...s.threads, [scope]: [...(s.threads[scope] ?? []), { id: rid, kind: "recommend", recId: rid }] },
        replyCounts: { ...s.replyCounts, [scope]: (s.replyCounts[scope] ?? 0) + 1 },
      }));
    },
    [session.resolvedVed, scenario, postAlreadyResolvedReply, openThread, pushThread, bumpConfidence, scopeResponderName, uid, update]
  );

  const confirmReason = useCallback(
    (rid: string) => {
      const scope = session.reasonCards[rid]?.scope ?? "orig";
      update((s) => (s.reasonCards[rid] ? { ...s, reasonCards: { ...s.reasonCards, [rid]: { ...s.reasonCards[rid], confirmed: true } } } : s));
      markReasoningCaptured(scope);
    },
    [session.reasonCards, update, markReasoningCaptured]
  );

  const openAdjustReasoning = useCallback((rid: string) => {
    setModal({ type: "adjustReasoning", reasonId: rid });
  }, []);

  const saveReasonEdit = useCallback(
    (rid: string, text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      update((s) => (s.reasonCards[rid] ? { ...s, reasonCards: { ...s.reasonCards, [rid]: { ...s.reasonCards[rid], draft: trimmed } } } : s));
      closeModal();
      confirmReason(rid);
    },
    [update, closeModal, confirmReason]
  );

  // ============ Forward ============
  const toggleForwardTarget = useCallback(
    (id: string) => {
      update((s) => ({
        ...s,
        forwardSelection: s.forwardSelection.includes(id) ? s.forwardSelection.filter((x) => x !== id) : [...s.forwardSelection, id],
      }));
    },
    [update]
  );

  const openForward = useCallback(() => {
    update((s) => ({ ...s, forwardSelection: [] }));
    setModal({ type: "forward" });
  }, [update]);

  const buildForwardedDm = useCallback(
    (target: { id: string; name: string; role: string }, preSnapshot: ThreadEntry[], preSnapshotCount: number) => {
      const scope = "fwd-" + target.id;
      const isChannel = target.name.startsWith("#");
      update((s) => ({
        ...s,
        forwardedTargets: [...s.forwardedTargets, { id: target.id, name: target.name, role: target.role, scope, isChannel }],
        threads: { ...s.threads, [scope]: [...preSnapshot, { id: uid("snap"), kind: "node", node: <SnapshotDivider name={target.name} /> }] },
        replyCounts: { ...s.replyCounts, [scope]: preSnapshotCount },
        confidence: isChannel
          ? s.confidence
          : { ...s.confidence, [scope]: { name: target.name, value: s.confidence.orig?.value ?? 50, kinds: [] } },
      }));
    },
    [uid, update]
  );

  const confirmForward = useCallback(
    (note: string) => {
      if (!session.forwardSelection.length) return;
      const targets = scenario.forwardTo.filter((t) => session.forwardSelection.includes(t.id));
      closeModal();

      const preSnapshot = session.threads.orig ?? [];
      const preSnapshotCount = session.replyCounts.orig ?? 0;

      const names = targets.map((t) => (
        <span key={t.id} className="mention" style={{ cursor: "pointer" }} onClick={() => update((s) => ({ ...s, activeDm: "fwd-" + t.id }))}>
          @{t.name}
        </span>
      ));
      openThread("orig");
      pushThread(
        "orig",
        <ResLine>
          <b>{YOU_NAME}</b> forwarded to{" "}
          {names.map((n, i) => (
            <span key={i}>
              {i > 0 && ", "}
              {n}
            </span>
          ))}
          {note ? ` — "${note}"` : ""}
        </ResLine>,
        false
      );
      pushThread(
        "orig",
        <FwdHighlight>
          {targets.map((t) => `@${t.name}`).join(", ")} now hold{targets.length === 1 ? "s" : ""} this request; the agent
          stays paused and the TTL is reset to <b>1h</b>. This message stays active until someone responds.
        </FwdHighlight>,
        false
      );
      bumpConfidence("forward", "orig");

      targets.forEach((target) => buildForwardedDm(target, preSnapshot, preSnapshotCount));
      update((s) => ({ ...s, activeDm: "fwd-" + targets[0].id }));
    },
    [session.forwardSelection, session.threads, session.replyCounts, scenario, closeModal, openThread, pushThread, bumpConfidence, buildForwardedDm, update]
  );

  // ============ legacy column ============
  const resolveLegacyAction = useCallback(
    (label: string) => {
      if (session.resolvedLegacy) return;
      update((s) => ({ ...s, resolvedLegacy: true, legacyResolution: { label, stale: false } }));
    },
    [session.resolvedLegacy, update]
  );
  const simulateStale = useCallback(() => {
    if (session.resolvedLegacy) return;
    update((s) => ({ ...s, resolvedLegacy: true, legacyResolution: { label: "", stale: true } }));
  }, [session.resolvedLegacy, update]);

  // ============ ask a question in the thread composer ============
  const askQuestion = useCallback(
    (scope: Scope, question: string) => {
      const q = question.trim();
      if (!q) return;
      openThread(scope);
      pushThread(
        scope,
        <YouMessage name={scopeResponderName(scope)} time={now()}>
          {q}
        </YouMessage>,
        true
      );
      if (session.resolvedVed) {
        later(() => pushThread(scope, <VedMessage time={now()}>{ALREADY_RESOLVED_REPLY}</VedMessage>, true), 450);
        return;
      }
      bumpConfidence("qna", scope);
      later(() => pushThread(scope, <VedMessage time={now()}>{scenario.qnaAnswer}</VedMessage>, true), 550);
    },
    [openThread, pushThread, scopeResponderName, session.resolvedVed, later, bumpConfidence, scenario]
  );

  // ============ run ============
  const selectCase = useCallback((type: CaseType) => {
    setCurrentType(type);
    setModal(null);
  }, []);

  const runCase = useCallback(() => {
    clearAllTimeouts();
    updateSession(currentType, () => createInitialSession());
    update((s) => ({ ...s, runPressed: true }));
    later(() => update((s) => ({ ...s, runPressed: false })), 200);

    update((s) => ({ ...s, existingRevealed: true, flashExisting: true }));

    later(() => {
      update((s) => ({ ...s, hgatewayRevealed: true, flashHgateway: true }));
    }, 260);

    later(() => {
      update((s) => ({ ...s, flashExisting: false, flashHgateway: false }));
    }, 1200);

    update((s) => ({ ...s, hasRun: true }));
  }, [clearAllTimeouts, updateSession, currentType, update, later]);

  const journeyIndex = JOURNEY_ORDER.indexOf(currentType);
  const responderNames = (() => {
    const humanTargets = session.forwardedTargets.filter((t) => !t.isChannel);
    return humanTargets.length ? `${YOU_NAME} & ${humanTargets.map((t) => t.name).join(" & ")}` : YOU_NAME;
  })();

  const dmTabs = [
    { scope: "orig", label: `${YOU_NAME}'s DM` },
    ...session.forwardedTargets.map((t) => ({ scope: t.scope, label: `${t.name}'s DM` })),
  ];

  return {
    caseTabs: CASE_TABS,
    currentType,
    scenario,
    journeyIndex,
    journeyName: JOURNEY_NAMES[currentType],
    selectCase,

    hasRun: session.hasRun,
    runPressed: session.runPressed,
    runCase,

    existingRevealed: session.existingRevealed,
    hgatewayRevealed: session.hgatewayRevealed,
    flashExisting: session.flashExisting,
    flashHgateway: session.flashHgateway,

    resolvedLegacy: session.resolvedLegacy,
    legacyResolution: session.legacyResolution,
    resolveLegacyAction,
    simulateStale,

    resolvedVed: session.resolvedVed,
    confidence: session.confidence,
    pulseTick: session.pulseTick,
    reasoningTick: session.reasoningTick,

    dmTabs,
    activeDm: session.activeDm,
    switchDm: (scope: Scope) => update((s) => ({ ...s, activeDm: scope })),
    forwardedTargets: session.forwardedTargets,
    responderNames,

    threads: session.threads,
    replyCounts: session.replyCounts,
    threadOpen: session.threadOpen,
    toggleThread,
    reasonCards: session.reasonCards,
    recCards: session.recCards,
    impactCards: session.impactCards,

    modal,
    closeModal,
    openImpact,
    askAboutImpact,
    submitImpactQuestion,
    recommend,
    applyRecommendation,
    openForward,
    forwardSelection: session.forwardSelection,
    toggleForwardTarget,
    confirmForward,
    handleVedClick,
    confirmReason,
    openAdjustReasoning,
    saveReasonEdit,
    askQuestion,
  };
}

export type SandboxApi = ReturnType<typeof useHitlSandbox>;

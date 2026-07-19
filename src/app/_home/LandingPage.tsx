"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./landing.css";
import SiteNav from "../_shared/SiteNav";
import { DOCS_URL, DASHBOARD_URL } from "../_shared/externalLinks";
import { ROUTE_SANDBOX } from "../_shared/constants/routes";
import MiniCodePanel from "./MiniCodePanel";
import PainChipPanel from "./PainChipPanel";
import InviteModal from "./InviteModal";
import { PAINS, HERO_DIFF_CODE_HTML, INTEGRATION_CODE_HTML } from "./data";

// Generic scroll-reveal: observes every element registered via `register`
// (keyed by a stable string id, not the DOM node itself, so membership can
// be read during render without touching ref.current) and marks each key
// "in" once its element enters the viewport — mirroring the prototype's
// single shared IntersectionObserver over `.reveal` elements.
function useScrollReveal() {
  const [inKeys, setInKeys] = useState<Set<string>>(new Set());
  const elements = useRef<Map<string, HTMLElement>>(new Map());

  const register = (key: string) => (el: HTMLElement | null) => {
    if (el) elements.current.set(key, el);
  };

  useEffect(() => {
    const keyByElement = new Map<HTMLElement, string>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = keyByElement.get(entry.target as HTMLElement);
            if (key) {
              setInKeys((prev) => new Set(prev).add(key));
            }
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    elements.current.forEach((el, key) => {
      keyByElement.set(el, key);
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const isIn = (key: string) => inKeys.has(key);

  return { register, isIn };
}

export default function LandingPage() {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const { register, isIn } = useScrollReveal();

  return (
    <div className="landing-page">
      <SiteNav />

      <section className="hero">
        <div className="hero-inner">
          <div>
            <div className="hero-kicker">
              <span className="dot" /> HRRM for Agents
            </div>
            <h1 className="serif">
              The infrastructure layer for
              <br />
              <em>agent-human interaction.</em>
            </h1>
            <p className="lede">
              One HITL gateway that owns every human-in-the-loop request your agents raise — across nodes, across
              agents.
            </p>
            <div className="hero-ctas">
              <Link className="btn btn-primary" href={ROUTE_SANDBOX}>
                Try the sandbox →
              </Link>
              <button
                type="button"
                className="btn btn-highlight invite-trigger"
                onClick={() => setIsInviteOpen(true)}
              >
                Request invite<span className="seal">✓</span>
              </button>
            </div>
            <div className="hero-trust">
              <div className="stack">
                <span>💰</span>
                <span>🎧</span>
                <span>📄</span>
                <span>📣</span>
              </div>
              4 HITL types, one SDK — approval, decision, context, review/edit
            </div>
          </div>

          <div className="hero-code-wrap">
            <MiniCodePanel title="hitl_node.py — diff" codeHtml={HERO_DIFF_CODE_HTML} />
            <div className="hero-code-caption">
              <span className="badge">DIFF</span> one decorator, one swapped call — that&apos;s the whole migration.
            </div>
          </div>
        </div>
      </section>

      <section ref={register("problem")} className={`problem wrap reveal${isIn("problem") ? " in" : ""}`} id="problem">
        <div className="sec-head center" style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 720 }}>
          <div className="sec-kicker" style={{ textAlign: "center" }}>
            The problem
          </div>
          <h2>
            Agents can act on their own — <em>until a human has to weigh in.</em>
          </h2>
          <p style={{ margin: "0 auto" }}>
            That hand-off is hand-rolled today: a raw <code className="mono">interrupt()</code>, a bespoke Slack
            message, no owner if the reply never comes. Click a chip to see the pain, in their own words.
          </p>
        </div>

        <div className="problem-cols">
          <PainChipPanel who="Shubham" avatarLetter="S" role="builder" items={PAINS.builder} />
          <PainChipPanel who="Rishabh" avatarLetter="R" role="responder" items={PAINS.responder} />
        </div>

        <div className="problem-note">
          Every one of these is the same problem wearing a different costume:{" "}
          <b>the human step has no infrastructure of its own.</b>
        </div>
      </section>

      <section
        ref={register("revealProduct")}
        className={`reveal-product wrap reveal${isIn("revealProduct") ? " in" : ""}`}
      >
        <div className="reveal-product-card">
          <div className="sec-kicker" style={{ color: "var(--green-br)" }}>
            This is where HGateway comes in
          </div>
          <h2 className="serif">
            A gateway that sits between
            <br />
            your agent and <em>the human it needs.</em>
          </h2>
          <p className="reveal-quote">
            A CRM is infrastructure for company <span className="rq-arrow">↔</span> customer interaction.
            <br />
            HGateway is an <b>HRRM — a Human Responder Relationship Manager — for agent <span className="rq-arrow">↔</span>{" "}
            human interaction.</b>
          </p>
          <p className="reveal-lede">
            Same idea as a CRM: one system of record for every interaction, instead of each team improvising its own.
            Your agent registers a typed request and waits — the gateway owns everything that happens next.
          </p>
          <div className="reveal-points">
            <div className="reveal-point">
              <span className="rp-ic">🧭</span>
              <div>
                <b>Who gets asked</b> — routing to the right person or channel, with a fallback if they&apos;re
                unavailable.
              </div>
            </div>
            <div className="reveal-point">
              <span className="rp-ic">⏱️</span>
              <div>
                <b>What happens if they don&apos;t answer</b> — TTL, auto-forwarding, and a safe fallback response.
              </div>
            </div>
            <div className="reveal-point">
              <span className="rp-ic">🎯</span>
              <div>
                <b>No more guessing</b> — an interactive Slack message means the responder acts with full context
                and confidence, not a blind reply.
              </div>
            </div>
            <div className="reveal-point">
              <span className="rp-ic">🗂️</span>
              <div>
                <b>Why the decision was made</b> — the responder&apos;s reasoning is captured and kept, so every
                decision is auditable later.
              </div>
            </div>
          </div>
          <p className="reveal-close">
            Your agent code shrinks to a decorator and one typed call. Everything above is the gateway&apos;s job now.
          </p>
        </div>
      </section>

      <section ref={register("solution")} className={`solution wrap reveal${isIn("solution") ? " in" : ""}`}>
        <div className="sec-head">
          <div className="sec-kicker">The integration</div>
          <h2>
            What that looks like in <em>your code.</em>
          </h2>
          <p>Two lines of your own logic. The gateway does the rest.</p>
        </div>

        <div className="steps">
          <div className="step-card">
            <div className="step-num">1</div>
            <h3>Decorate your HITL node</h3>
            <p>
              <code className="mono">@hg.hitl_node</code> binds the current LangGraph state and config so the SDK
              can build context automatically — the SDK auto-inits on first use, reading your API key from{" "}
              <code className="mono">HGATEWAY_AGENT_API_KEY</code>.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">2</div>
            <h3>Raise the interrupt</h3>
            <p>
              <code className="mono">hg.raise_interrupt()</code> registers with the gateway and suspends the graph —
              the typed response comes back on resume.
            </p>
          </div>
          <div className="step-card">
            <div className="step-num">3</div>
            <h3>The gateway takes it from there</h3>
            <p>
              Routing, TTL, escalation and the Slack delivery are the gateway&apos;s job now — not a growing pile of
              code in your own repo.
            </p>
          </div>
        </div>

        <div className="solution-code">
          <MiniCodePanel title="agent.py — full integration" codeHtml={INTEGRATION_CODE_HTML} />
        </div>
      </section>

      <section
        ref={register("teaser")}
        className={`sandbox-teaser wrap reveal${isIn("teaser") ? " in" : ""}`}
      >
        <div className="teaser-card">
          <div className="teaser-text">
            <div className="sec-kicker">See it, don&apos;t just read it</div>
            <h2>
              Run the same case, <em>two ways at once.</em>
            </h2>
            <p>
              The interactive sandbox plays a real agent scenario through a hand-rolled interrupt and through
              HGateway, side by side — same request, two very different experiences.
            </p>
            <Link className="btn btn-primary" href={ROUTE_SANDBOX}>
              Open the sandbox →
            </Link>
          </div>
          <div className="teaser-visual">
            <div className="teaser-vs">
              <div className="teaser-col left">💬</div>
              <div className="teaser-col right">✅</div>
            </div>
            <div className="teaser-vs-badge">vs</div>
          </div>
        </div>
      </section>

      <section ref={register("features")} className={`features wrap reveal${isIn("features") ? " in" : ""}`}>
        <div className="sec-head">
          <div className="sec-kicker">What the gateway owns</div>
          <h2>
            Everything you&apos;d otherwise <em>build twice.</em>
          </h2>
          <p>
            Routing, timeouts, escalation and delivery — scoped per run, configured in code, not in a dashboard you
            have to babysit.
          </p>
        </div>

        <div className="bento">
          <div className="bento-card">
            <span className="bento-ic">🧭</span>
            <h3>Routing &amp; escalation</h3>
            <p>
              Primary and fallback recipients per run — forward to another responder on the fly with no graph
              changes, no redeploy.
            </p>
            <span className="bento-tag">Core</span>
          </div>
          <div className="bento-card">
            <span className="bento-ic">⏱️</span>
            <h3>TTL &amp; fallback</h3>
            <p>Auto-forwards on timeout; a typed fallback keeps the graph moving if the gateway itself is unreachable.</p>
          </div>
          <div className="bento-card">
            <span className="bento-ic">🗂️</span>
            <h3>4 HITL types</h3>
            <p>Approval, decision, context and review/edit content schemas, typed end to end.</p>
          </div>
          <div className="bento-card">
            <span className="bento-ic">💬</span>
            <h3>Slack-native delivery</h3>
            <p>Rich block-kit messages with context, reasoning, and inline actions — not a bare text prompt.</p>
          </div>
          <div className="bento-card">
            <span className="bento-ic">🧵</span>
            <h3>Async reasoning stack</h3>
            <p>
              Captures the responder&apos;s reasoning after the fact, out of band — so the &quot;why&quot; behind a
              decision doesn&apos;t get lost once the thread goes quiet.
            </p>
          </div>
          <div className="bento-card">
            <span className="bento-ic">🛡️</span>
            <h3>Safe by default</h3>
            <p>
              Gateway down? Falls back to a local <code className="mono">interrupt()</code> automatically — your
              agent never hangs.
            </p>
          </div>
        </div>
      </section>

      <section ref={register("support")} className={`support wrap reveal${isIn("support") ? " in" : ""}`} id="support">
        <div className="sec-kicker" style={{ marginBottom: 22 }}>
          Supported ADKs &amp; channels
        </div>

        <div className="support-tracks">
          <div className="support-track">
            <div className="support-track-label">
              <span className="stl-num">01</span> Agent framework <span className="stl-sub">(ADK)</span>
            </div>
            <div className="support-row">
              <div className="support-slot live">
                <span className="ss-status live">
                  <span className="led on" /> supported
                </span>
                <span className="ss-ic">🦜</span>
                <span className="ss-name">LangGraph</span>
                <span className="ss-desc">
                  Native <code className="mono">@hg.hitl_node</code> integration, first-class today.
                </span>
              </div>
              <div className="support-slot ghost">
                <span className="ss-status">
                  <span className="led" /> coming soon
                </span>
                <span className="ss-ic">＋</span>
                <span className="ss-name">More ADKs</span>
                <span className="ss-desc">DSPy, Strands, OpenAI ADK, Google ADK and MS ADK are next.</span>
              </div>
            </div>
          </div>

          <div className="support-seam">
            <span />
          </div>

          <div className="support-track">
            <div className="support-track-label">
              <span className="stl-num">02</span> Communication channel
            </div>
            <div className="support-row">
              <div className="support-slot live">
                <span className="ss-status live">
                  <span className="led on" /> supported
                </span>
                <span className="ss-ic">💬</span>
                <span className="ss-name">Slack</span>
                <span className="ss-desc">Rich block-kit delivery, routing and escalation, today.</span>
              </div>
              <div className="support-slot ghost">
                <span className="ss-status">
                  <span className="led" /> coming soon
                </span>
                <span className="ss-ic">＋</span>
                <span className="ss-name">More channels</span>
                <span className="ss-desc">Web and MS Teams are next.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} />

      <section className="docs-band" id="docs">
        <div className="wrap docs-inner">
          <div className="docs-text">
            <h2>
              Read the <em>API reference.</em>
            </h2>
            <p>
              Generated straight from the SDK&apos;s own docstrings — <code>@hg.hitl_node</code>,{" "}
              <code>hg.raise_interrupt</code>, and every content/response schema.
            </p>
          </div>
          <a className="btn-docs" href={DOCS_URL} target="_blank" rel="noopener noreferrer">
            docs.hgateway.theved.ai →
          </a>
        </div>
      </section>

      <section ref={register("finalCta")} className={`final-cta wrap reveal${isIn("finalCta") ? " in" : ""}`}>
        <h2>
          Stop hand-rolling <em>human-in-the-loop.</em>
        </h2>
        <p>Try the sandbox first — no signup, no API calls, just the two experiences side by side.</p>
        <div className="hero-ctas">
          <Link className="btn btn-primary" href={ROUTE_SANDBOX}>
            Try the sandbox →
          </Link>
          <a className="btn btn-ghost" href={`${DASHBOARD_URL}/login`}>
            Sign in to the dashboard
          </a>
        </div>
      </section>

      <footer>theved.ai — HGateway is a prototype product surface for design validation.</footer>
    </div>
  );
}

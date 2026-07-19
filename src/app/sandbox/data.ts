// Data for the HITL sandbox, ported verbatim from ux-prototypes/hitl-sandbox.html.
// Code and Slack embeds are stored as pre-formatted HTML strings (rendered via
// dangerouslySetInnerHTML) because the prototype's syntax-highlighted code and
// Slack-message markup is itself the content, not something to re-derive.

export type CaseMode = "existing" | "hgateway";
export type Persona = "builder" | "responder";

export interface Scenario {
  avatar: string;
  title: string;
  desc: string;
  code: Record<CaseMode, string>;
  slack: Record<CaseMode, string>;
  pains: Record<CaseMode, Record<Persona, [string, string][]>>;
}

export type CaseType = "approval" | "decision" | "context" | "edit";

const IMPORTS = {
  existing: `<span class="tok-kw">from</span> langgraph.graph <span class="tok-kw">import</span> StateGraph
<span class="tok-kw">from</span> langgraph.types <span class="tok-kw">import</span> interrupt

`,
  hgateway: `<span class="tok-kw">from</span> langgraph.graph <span class="tok-kw">import</span> StateGraph
<span class="tok-kw">import</span> hgateway_sdk <span class="tok-kw">as</span> hg
`,
};

const LOGO_SRC = "/sandbox/theved-logo.png";

export const SCENARIOS: Record<CaseType, Scenario> = {
  approval: {
    avatar: "💰",
    title: "Finance Ops Agent — Invoice Payment Approval",
    desc: "Autonomously processes vendor invoices; pauses for human sign-off above $10k.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("finance_approval_node", finance_approval_node)

<span class="tok-kw">def</span> <span class="tok-fn">finance_approval_node</span>(state):
    invoice = state["invoice"]

<span class="hl-block warn">    reply = interrupt({
        "question": f"Approve payment of \${invoice['amount']} to {invoice['vendor']}?",
        "options": ["approve", "reject"],
    })</span>

    if reply["choice"] == "approve":
        return {"status": "approved"}
    return {"status": "rejected"}`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> BinaryApprovalContent, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("finance_approval_node", finance_approval_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">finance_approval_node</span>(state):
    invoice = state["invoice"]

    <span class="tok-com"># choices default to Approve/Reject</span>
    content = BinaryApprovalContent(
        prompt=f"Approve payment of \${invoice['amount']} to {invoice['vendor']}?",
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "invoice-approval",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#finance-ops"])),
        ),
        fallback={"decision": "reject"},
    )</span>

    return {"status": resp["decision"]}`,
    },
    slack: {
      existing: `
        <div class="slack-msg">
          <div class="s-avatar">💰</div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">finance-ops-agent</span><span class="s-time">9:41 AM</span></div>
            <div class="s-prompt">Approve payment of $12,400.00 to Acme Supplies?</div>
            <div class="s-actions">
              <div class="s-btn primary">✓ Approve</div>
              <div class="s-btn danger">✕ Reject</div>
            </div>
          </div>
        </div>`,
      hgateway: `
        <div class="slack-msg">
          <div class="s-avatar"><img src="${LOGO_SRC}" alt="Ved" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">Ved</span><span class="s-bot-tag">APP</span><span class="s-time">9:41 AM</span></div>
            <div class="s-title-row"><span class="s-dot" style="background:var(--sk-green)"></span><span class="s-title">Approval needed · finance-ops-agent</span></div>
            <div class="s-meta">From: <b>finance-ops-agent</b> · run <b>run-fin-1</b> · For: <b>@Rishabh</b> · Type: Approval</div>
            <div class="s-context-block">💭 <span><b>CONTEXT</b> &nbsp;<b>Why:</b> The agent matched the invoice to PO #A-2291 and flagged the $12,400 amount as above the $10k auto-approval threshold; sign-off is required before payment is released.</span></div>
            <hr class="s-divider">
            <div class="s-tagline"># HITL CONTENT · <span class="s-tag">VED.HITL(APPROVAL)</span></div>
            <div class="s-prompt">Approve payment of $12,400.00 to Acme Supplies?</div>
            <div class="s-actions">
              <div class="s-btn primary">✓ Approve</div>
              <div class="s-btn danger">✕ Reject</div>
            </div>
            <hr class="s-divider">
            <div class="s-footer-actions">
              <div class="s-footer-btn">🔍 Explain impact</div>
              <div class="s-footer-btn">💡 Recommend</div>
              <div class="s-footer-btn">↪ Forward</div>
            </div>
            <div class="s-autoforward">⏳ Auto-forwards to <span class="s-mention">#finance-ops</span> in 1h if no response</div>
            <div class="s-thread"><div class="s-thread-avatar"></div><b>1 reply</b> Today at 9:52 AM</div>
          </div>
        </div>`,
    },
    pains: {
      existing: {
        builder: [
          ["Stale HITL, no reply", "How do I handle a stale HITL if Rishabh doesn't respond in time?"],
          ["Rishabh = bottleneck", "Rishabh has become a bottleneck for every invoice approval."],
          ["Can't re-route on the fly", "I can't re-route this HITL to another responder on the fly."],
          ["No reasoning captured", "How do I capture the reasoning behind Rishabh's decision?"],
        ],
        responder: [
          ["No context to decide", "How can I approve/reject this without any context?"],
          ["Sneha should see this", "I think Sneha has better context here — how do I route this to her?"],
          ["Fear of breaking things", "What if I approve this and something breaks?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forwards on timeout", "TTL + auto-forward to #finance-ops handles stale HITLs automatically."],
          ["No single point of failure", "Rishabh isn't a single point of failure — it escalates if he's unavailable."],
          ["Forward to Sneha, no code", "Forward re-routes to Sneha on the fly, no graph changes needed."],
          ["Reasoning logged automatically", "Every decision is captured with reasoning in the audit trail."],
        ],
        responder: [
          ["Context shown upfront", "Context/reasoning is shown right alongside the ask."],
          ["One-click forward to Sneha", "One click to Forward to Sneha if she has better context."],
          ["See impact before deciding", "Explain impact before deciding — know what breaks if I approve."],
        ],
      },
    },
  },

  decision: {
    avatar: "🎧",
    title: "Support Triage Agent — Escalation Routing",
    desc: "Classifies escalated tickets and hands off to the right specialist team.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("ticket_routing_node", ticket_routing_node)

<span class="tok-kw">def</span> <span class="tok-fn">ticket_routing_node</span>(state):
    ticket = state["ticket"]

<span class="hl-block warn">    reply = interrupt({
        "question": f'Route ticket #{ticket["id"]}: "{ticket["summary"]}"',
        "options": ["billing", "technical", "legal"],
    })

    team = reply["choice"]
    if team not in ("billing", "technical", "legal"):
        team = "technical"  # silent fallback</span>
    return {"routed_team": team}`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> SingleDecisionContent, Option, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("ticket_routing_node", ticket_routing_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">ticket_routing_node</span>(state):
    ticket = state["ticket"]

    content = SingleDecisionContent(
        prompt=f'Route ticket #{ticket["id"]}: "{ticket["summary"]}"',
        options=[
            Option("billing", "Billing"),
            Option("technical", "Technical"),
            Option("legal", "Legal"),
        ],
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "ticket-routing",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#support-escalations"])),
        ),
        fallback={"selected": "technical"},
    )</span>

    return {"routed_team": resp["selected"]}`,
    },
    slack: {
      existing: `
        <div class="slack-msg">
          <div class="s-avatar">🎧</div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">support-triage-agent</span><span class="s-time">11:02 AM</span></div>
            <div class="s-prompt">Route ticket #9931: "Refund not reflecting after cancellation"</div>
            <div class="s-option-row"><div class="s-option-text"><div class="t">Billing</div><div class="d">Invoicing, refunds &amp; payment disputes</div></div><div class="s-btn">Billing</div></div>
            <div class="s-option-row"><div class="s-option-text"><div class="t">Technical</div><div class="d">Bugs, outages &amp; product defects</div></div><div class="s-btn">Technical</div></div>
            <div class="s-option-row"><div class="s-option-text"><div class="t">Legal</div><div class="d">Compliance, contracts &amp; disputes</div></div><div class="s-btn">Legal</div></div>
          </div>
        </div>`,
      hgateway: `
        <div class="slack-msg">
          <div class="s-avatar"><img src="${LOGO_SRC}" alt="Ved" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">Ved</span><span class="s-bot-tag">APP</span><span class="s-time">11:02 AM</span></div>
            <div class="s-title-row"><span class="s-dot" style="background:var(--sk-blue)"></span><span class="s-title">Decision needed · support-triage-agent</span></div>
            <div class="s-meta">From: <b>support-triage-agent</b> · run <b>run-sup-2</b> · For: <b>@Rishabh</b> · Type: Decision</div>
            <div class="s-context-block">💭 <span><b>CONTEXT</b> &nbsp;<b>Why:</b> The agent classified this as a billing-adjacent technical issue but confidence is split between Billing and Technical ownership; routing needs a human call.</span></div>
            <hr class="s-divider">
            <div class="s-tagline"># HITL CONTENT · <span class="s-tag">VED.HITL(DECISION)</span></div>
            <div class="s-prompt">Route ticket #9931: "Refund not reflecting after cancellation"</div>
            <div class="s-option-row"><div class="s-option-text"><div class="t">Billing</div><div class="d">Invoicing, refunds &amp; payment disputes</div></div><div class="s-btn">Billing</div></div>
            <div class="s-option-row"><div class="s-option-text"><div class="t">Technical</div><div class="d">Bugs, outages &amp; product defects</div></div><div class="s-btn">Technical</div></div>
            <div class="s-option-row"><div class="s-option-text"><div class="t">Legal</div><div class="d">Compliance, contracts &amp; disputes</div></div><div class="s-btn">Legal</div></div>
            <hr class="s-divider">
            <div class="s-footer-actions">
              <div class="s-footer-btn">🔍 Explain impact</div>
              <div class="s-footer-btn">💡 Recommend</div>
              <div class="s-footer-btn">↪ Forward</div>
            </div>
            <div class="s-autoforward">⏳ Auto-forwards to <span class="s-mention">#support-escalations</span> in 1h if no response</div>
            <div class="s-thread"><div class="s-thread-avatar"></div><b>1 reply</b> Today at 11:14 AM</div>
          </div>
        </div>`,
    },
    pains: {
      existing: {
        builder: [
          ["Ticket sits unrouted", "Ticket sits unrouted if Rishabh misses the free-text reply."],
          ["Typos silently misroute", "One misspelled reply silently defaults to the wrong team."],
          ["Can't loop in Sneha", "No way to loop in Sneha if she's better placed to route this."],
          ["No routing rationale", "No record of why a ticket was routed a certain way."],
        ],
        responder: [
          ["Which team owns this?", "Which team actually owns this — billing or technical?"],
          ["Not sure it's mine", "I'm not sure this is mine — how do I hand it to Sneha?"],
          ["What if I ignore it?", "What happens to the ticket if I ignore this?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forward prevents drift", "TTL + auto-forward to #support-escalations prevents unrouted tickets."],
          ["Structured options, no typos", "Structured options mean routing can never silently misfire."],
          ["Forward to Sneha instantly", "Forward re-routes to Sneha without touching the graph."],
          ["Routing + reasoning logged", "Routing decision + reasoning is logged automatically."],
        ],
        responder: [
          ["Each option explains itself", "Each option shows why it might apply — no guessing."],
          ["One-click forward to Sneha", "Forward to Sneha in one click if she's the better owner."],
          ["Auto-forwards after 2h", "Auto-forwards after 2h if I don't act — nothing's dropped."],
        ],
      },
    },
  },

  context: {
    avatar: "📄",
    title: "Deal Desk Agent — Requesting More Context",
    desc: "Drafting a sales contract but is missing details it can't infer from the CRM.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("contract_context_node", contract_context_node)

<span class="tok-kw">def</span> <span class="tok-fn">contract_context_node</span>(state):
    customer = state["customer"]

<span class="hl-block warn">    reply = interrupt({
        "question": f"Missing details to finish {customer['name']}'s contract",
        "fields": ["billing_address", "payment_terms"],
    })</span>

    return {
        "billing_address": reply["billing_address"],
        "payment_terms": reply["payment_terms"],
    }`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> FormContextContent, FormField, FieldType, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("contract_context_node", contract_context_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">contract_context_node</span>(state):
    customer = state["customer"]

    content = FormContextContent(
        prompt=f"Missing details to finish {customer['name']}'s contract",
        fields=[
            FormField("billing_address", "Billing address", FieldType.TEXT),
            FormField("payment_terms", "Payment terms", FieldType.TEXT),
        ],
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "contract-context",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#sales-ops"])),
        ),
        fallback={"billing_address": "", "payment_terms": "net-30"},
    )</span>

    return resp`,
    },
    slack: {
      existing: `
        <div class="slack-msg">
          <div class="s-avatar">📄</div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">deal-desk-agent</span><span class="s-time">2:14 PM</span></div>
            <div class="s-prompt">Missing details to finish Nimbus Retail's contract.</div>
            <div class="s-field-label">Billing address &amp; payment terms</div>
            <div class="s-textbox"><span class="s-input-ph">e.g. 123 Main St, Springfield — Net 30 terms</span></div>
            <div class="s-hint">↵ Press 'enter' to submit</div>
            <div class="s-actions"><div class="s-btn primary">Provide input</div></div>
          </div>
        </div>`,
      hgateway: `
        <div class="slack-msg">
          <div class="s-avatar"><img src="${LOGO_SRC}" alt="Ved" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">Ved</span><span class="s-bot-tag">APP</span><span class="s-time">2:14 PM</span></div>
            <div class="s-title-row"><span class="s-dot" style="background:var(--sk-purple)"></span><span class="s-title">Context needed · deal-desk-agent</span></div>
            <div class="s-meta">From: <b>deal-desk-agent</b> · run <b>run-deal-4</b> · For: <b>@Rishabh</b> · Type: Context</div>
            <div class="s-context-block">💭 <span><b>CONTEXT</b> &nbsp;<b>Why:</b> The agent has every deal term except billing address and payment terms, which aren't present in the CRM record and can't be safely inferred.</span></div>
            <hr class="s-divider">
            <div class="s-tagline"># HITL CONTENT · <span class="s-tag">VED.HITL(CONTEXT)</span></div>
            <div class="s-prompt">Missing details to finish Nimbus Retail's contract.</div>
            <div class="s-field-label">Billing address &amp; payment terms</div>
            <div class="s-textbox"><span class="s-input-ph">e.g. 123 Main St, Springfield — Net 30 terms</span></div>
            <div class="s-hint">↵ Press 'enter' to submit</div>
            <div class="s-actions"><div class="s-btn primary">Provide input</div></div>
            <hr class="s-divider">
            <div class="s-footer-actions">
              <div class="s-footer-btn">🔍 Explain impact</div>
              <div class="s-footer-btn">💡 Recommend</div>
              <div class="s-footer-btn">↪ Forward</div>
            </div>
            <div class="s-autoforward">⏳ Auto-forwards to <span class="s-mention">#sales-ops</span> in 1h if no response</div>
            <div class="s-thread"><div class="s-thread-avatar"></div><b>1 reply</b> Today at 2:26 PM</div>
          </div>
        </div>`,
    },
    pains: {
      existing: {
        builder: [
          ["Contract stalls on silence", "Contract stalls indefinitely if Rishabh doesn't reply."],
          ["One typo corrupts data", "One missing '|' in the reply corrupts the parsed fields."],
          ["Can't redirect to Sneha", "No way to redirect this to Sneha if she owns this account."],
          ["No trail of who replied", "No trail of who supplied the missing terms."],
        ],
        responder: [
          ["Why ask me specifically?", "Why does the agent need this from me specifically?"],
          ["Sneha owns this account", "Sneha owns this account — how do I pass this to her?"],
          ["Did my reply even parse?", "Did my reply even get parsed correctly?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forward keeps deals moving", "TTL + auto-forward to #sales-ops keeps deals from stalling."],
          ["Validated fields, no corruption", "Structured fields are validated on submit — no corrupted data."],
          ["Forward to Sneha in one click", "Forward to Sneha in one click if she owns the account."],
          ["Every field logged with source", "Every submitted field is logged with who supplied it."],
        ],
        responder: [
          ["Reasoning explains the ask", "Reasoning tells me exactly why this info is needed."],
          ["One-click forward to Sneha", "Forward to Sneha in one click if she's the account owner."],
          ["Structured form, no guessing", "A structured form — no guessing the reply format."],
        ],
      },
    },
  },

  edit: {
    avatar: "📣",
    title: "Marketing Copy Agent — Social Post Review",
    desc: "Drafts launch announcements; a human edits or approves copy before it ships.",
    code: {
      existing: `${IMPORTS.existing}workflow = StateGraph(AgentState)
workflow.add_node("social_copy_node", social_copy_node)

<span class="tok-kw">def</span> <span class="tok-fn">social_copy_node</span>(state):
    draft = state["draft_post"]

<span class="hl-block warn">    reply = interrupt({
        "question": "Review the draft post before it goes out",
        "original_content": draft,
    })</span>

    return {"final_copy": reply.get("edited_content", draft)}`,
      hgateway: `${IMPORTS.hgateway}<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> ContentEditContent, RunFeatures, Routing, Recipients

workflow = StateGraph(AgentState)
workflow.add_node("social_copy_node", social_copy_node)

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">social_copy_node</span>(state):
    draft = state["draft_post"]

    content = ContentEditContent(
        prompt="Review the draft post before it goes out",
        draft=draft,
    )

<span class="hl-block">    resp = hg.raise_interrupt(
        "social-copy-review",
        content,
        features=RunFeatures(
            routing=Routing(primary=Recipients(channels=["#marketing"])),
        ),
        fallback={"edited_content": draft},
    )</span>

    return {"final_copy": resp["edited_content"]}`,
    },
    slack: {
      existing: `
        <div class="slack-msg">
          <div class="s-avatar">📣</div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">marketing-copy-agent</span><span class="s-time">4:30 PM</span></div>
            <div class="s-prompt">Review the draft post before it goes out.</div>
            <div class="s-field-label">Agent's draft (editable)</div>
            <div class="s-textbox">We are shipping Nimbus 2.0 today — faster sync, smarter search, same price.</div>
            <div class="s-hint">↵ Press 'enter' to submit</div>
            <div class="s-actions"><div class="s-btn primary">Send</div><div class="s-btn">Send without edits</div></div>
          </div>
        </div>`,
      hgateway: `
        <div class="slack-msg">
          <div class="s-avatar"><img src="${LOGO_SRC}" alt="Ved" style="width:100%;height:100%;object-fit:cover;border-radius:8px;"></div>
          <div class="s-body">
            <div class="s-head"><span class="s-name">Ved</span><span class="s-bot-tag">APP</span><span class="s-time">4:30 PM</span></div>
            <div class="s-title-row"><span class="s-dot" style="background:var(--sk-orange)"></span><span class="s-title">Review needed · marketing-copy-agent</span></div>
            <div class="s-meta">From: <b>marketing-copy-agent</b> · run <b>run-mkt-3</b> · For: <b>@Rishabh</b> · Type: Edit</div>
            <div class="s-context-block">💭 <span><b>CONTEXT</b> &nbsp;<b>Why:</b> The agent drafted the launch announcement but is unsure the tone matches brand style guide and whether pricing language needs legal sign-off before it's public.</span></div>
            <hr class="s-divider">
            <div class="s-tagline"># HITL CONTENT · <span class="s-tag">VED.HITL(EDIT)</span></div>
            <div class="s-prompt">Review the draft post before it goes out.</div>
            <div class="s-field-label">Agent's draft (editable)</div>
            <div class="s-textbox">We are shipping Nimbus 2.0 today — faster sync, smarter search, same price.</div>
            <div class="s-hint">↵ Press 'enter' to submit</div>
            <div class="s-actions"><div class="s-btn primary">Send</div><div class="s-btn">Send without edits</div></div>
            <hr class="s-divider">
            <div class="s-footer-actions">
              <div class="s-footer-btn">🔍 Explain impact</div>
              <div class="s-footer-btn">💡 Recommend</div>
              <div class="s-footer-btn">↪ Forward</div>
            </div>
            <div class="s-autoforward">⏳ Auto-forwards to <span class="s-mention">#marketing</span> in 1h if no response</div>
            <div class="s-thread"><div class="s-thread-avatar"></div><b>1 reply</b> Today at 4:41 PM</div>
          </div>
        </div>`,
    },
    pains: {
      existing: {
        builder: [
          ["Draft sits unreviewed", "Draft sits unreviewed if Rishabh is heads-down."],
          ["Reply overwrites, no diff", "A free-text reply overwrites the draft — no diff, no history."],
          ["Can't loop in Sneha", "Can't loop in Sneha for a second pass on tone or legal."],
          ["No edit history", "No record of what was changed or why."],
        ],
        responder: [
          ["Legal sign-off needed?", "Is this ready to publish, or does legal need to see it first?"],
          ["Sneha should review pricing", "Sneha should really review the pricing language — how do I loop her in?"],
          ["Is original recoverable?", "If I edit this, is the original draft still recoverable?"],
        ],
      },
      hgateway: {
        builder: [
          ["Auto-forward if unavailable", "TTL + auto-forward to #marketing if Rishabh's unavailable."],
          ["Edits captured as a diff", "Edits are captured as a diff against the original draft."],
          ["Forward to Sneha, 2nd pass", "Forward to Sneha in one click for a second pass."],
          ["Full edit history logged", "Full history of every edit and who made it."],
        ],
        responder: [
          ["Context flags legal review", "Context shown upfront — know if legal sign-off is needed."],
          ["One-click forward to Sneha", "Forward to Sneha in one click if she should weigh in."],
          ["Inline edit, original kept", "Edit inline — the original draft stays recoverable."],
        ],
      },
    },
  },
};

export const CASE_TABS: { type: CaseType; icon: string; label: string }[] = [
  { type: "approval", icon: "💰", label: "Approval" },
  { type: "decision", icon: "🎧", label: "Decision" },
  { type: "context", icon: "📄", label: "Context" },
  { type: "edit", icon: "📣", label: "Review / Edit" },
];

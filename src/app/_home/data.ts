// Ported verbatim from ux-prototypes/landing-page.html's inline <script> PAINS object
// and the two <pre class="mini-code"> blocks in the hero and integration sections.

export const PAINS: { builder: [string, string][]; responder: [string, string][] } = {
  builder: [
    ["Stale HITL, no reply", "How do I handle a stale HITL if Rishabh doesn't respond in time?"],
    ["Rishabh = bottleneck", "Rishabh has become a bottleneck for every invoice approval."],
    ["Can't re-route on the fly", "I can't re-route this HITL to another responder on the fly."],
    ["No reasoning captured", "How do I capture the reasoning behind Rishabh's decision?"],
    ["Reply overwrites, no diff", "A free-text reply overwrites the draft — no diff, no history."],
    ["No routing rationale", "No record of why a ticket was routed a certain way."],
  ],
  responder: [
    ["No context to decide", "How can I approve/reject this without any context?"],
    ["Sneha should see this", "I think Sneha has better context here — how do I route this to her?"],
    ["Fear of breaking things", "What if I approve this and something breaks?"],
    ["Which team owns this?", "Which team actually owns this — billing or technical?"],
    ["Did my reply even parse?", "Did my reply even get parsed correctly?"],
    [
      "Responding without awareness",
      "I need to interact with this HITL to respond with complete awareness — not just guess from a one-line message.",
    ],
  ],
};

export const HERO_DIFF_CODE_HTML = `<span class="tok-kw">import</span> hgateway_sdk <span class="tok-kw">as</span> hg
<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> BinaryApprovalContent
<span class="hl-block diff-add">+<span class="tok-dec">@hg.hitl_node</span></span><span class="tok-kw">def</span> <span class="tok-fn">review_node</span>(state):
    content = BinaryApprovalContent(
        prompt=f<span class="tok-str">"Approve {state['summary']}?"</span>,
    )

<span class="hl-block diff-remove">-    reply = interrupt({<span class="tok-str">"question"</span>: prompt})</span><span class="hl-block diff-add">+    resp = hg.raise_interrupt(
+        <span class="tok-str">"approve-action"</span>, content
+    )</span>
    <span class="tok-kw">return</span> {<span class="tok-str">"decision"</span>: resp[<span class="tok-str">"decision"</span>]}`;

export const INTEGRATION_CODE_HTML = `<span class="tok-kw">import</span> hgateway_sdk <span class="tok-kw">as</span> hg
<span class="tok-kw">from</span> hgateway_sdk <span class="tok-kw">import</span> BinaryApprovalContent, RunFeatures, Routing, Recipients

<span class="tok-dec">@hg.hitl_node</span>
<span class="tok-kw">def</span> <span class="tok-fn">review_node</span>(state):
    content = BinaryApprovalContent(prompt=f<span class="tok-str">"Approve {state['summary']}?"</span>)

    resp = hg.raise_interrupt(
        <span class="tok-str">"approve-action"</span>, content,
        features=RunFeatures(routing=Routing(primary=Recipients(channels=[<span class="tok-str">"#ops"</span>]))),
        fallback={<span class="tok-str">"decision"</span>: <span class="tok-str">"reject"</span>},
    )
    <span class="tok-kw">return</span> {<span class="tok-str">"decision"</span>: resp[<span class="tok-str">"decision"</span>]}`;

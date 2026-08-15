/**
 * OrionPulse hovering advisor widget — drop-in, single file.
 *
 * USAGE ON orionpulse.co.in (GitHub Pages):
 *   <script src="orionpulse-widget.js" defer></script>
 *   right before </body>. No other markup needed — it injects itself.
 *
 * ── BEFORE YOU DEPLOY ────────────────────────────────────────────────
 * GitHub Pages is static hosting. It cannot hold an Anthropic API key
 * safely — anything in this file is visible to every visitor. The
 * API_ENDPOINT below currently points at the sandboxed proxy this demo
 * runs against inside the Claude artifact preview. For the live site,
 * stand up a tiny backend (a Cloudflare Worker, Vercel/Netlify function,
 * or similar) that:
 *   1. holds your real ANTHROPIC_API_KEY as a server-side secret
 *   2. accepts { system, messages } from this widget
 *   3. forwards to https://api.anthropic.com/v1/messages and returns the result
 * Then change API_ENDPOINT to that function's URL. Nothing else in this
 * file needs to change.
 * ────────────────────────────────────────────────────────────────────
 */
(function () {
  "use strict";

  const API_ENDPOINT = "https://api.anthropic.com/v1/messages"; // demo proxy — replace before going live
  const MODEL = "claude-sonnet-4-6";
  const MAX_TOKENS = 1000; // raise this (e.g. 1500-2000) once you're on your own backend — FULL-mode answers can run long

  // ── The routed OrionPulse system prompt ──────────────────────────
  // Section 0 decides QUICK vs FULL mode per message, so the widget
  // only ever needs to make one model call per turn — no separate
  // classifier call, no extra latency, nothing else to wire up.
  const SYSTEM_PROMPT = `ORIONPULSE BUSINESS ADVISOR — MASTER AGENT PROMPT (WIDGET BUILD)

You are the OrionPulse Business Advisor.

You are not a generic business chatbot.

Your purpose is to help business owners understand what is actually happening in their business, identify the most likely underlying cause, determine what evidence should be checked, and recommend the most appropriate next action.

Your reasoning must be grounded in the OrionPulse Business Knowledge Architecture and its approved reasoning frameworks.

---

0. RESPONSE MODE ROUTER

You run inside a hovering widget. Most visitors open it with something small — a definition question, a greeting, "what does this thing do." Only some arrive with an actual symptom to diagnose. Decide the mode before you answer.

Use QUICK mode when the message is:
- a definition or general business-concept question ("what's CAC?", "what's a good close rate?")
- small talk, a greeting, or a question about what OrionPulse does
- a yes/no or single-fact question
- too vague or under-specified to diagnose anything yet

In QUICK mode:
- Answer in 2–5 plain sentences. No headers, no numbered sections, no "What I see / What it could mean" scaffolding.
- Still obey the Honesty Rule below — never invent a number, benchmark, or outcome, even in a short answer.
- If the question is actually the start of a real diagnostic conversation but lacks detail, don't guess — ask ONE plain-language clarifying question that would let you start (e.g. "What changed most recently — leads coming in, your close rate, or something else?").
- Never produce the full 7-part Response Format in QUICK mode. If the owner wants to go deeper, they'll say more, and that reply is what triggers FULL mode.

Use FULL mode when the message:
- describes a specific business signal, trend, or metric change (e.g. "my cost per lead is up over the last few months and close rate hasn't moved")
- explicitly asks for a diagnosis, root-cause analysis, or a recommendation on a real situation
- is a follow-up to your own clarifying question that now has enough detail to reason about

In FULL mode, run the complete process below — Business Knowledge Structure, Framework Reasoning, Decision Engine, and the full Response Format — end to end.

If you're genuinely unsure which mode applies, default to QUICK and ask the one clarifying question. Never stretch a vague prompt into a full diagnosis to seem more capable.

---

1. CORE ORIONPULSE PRINCIPLE

Do not give generic business advice. Never jump directly from a symptom to a recommendation. Always reason through:

SIGNAL OBSERVED → LIKELY CAUSAL CHAIN → WHAT TO CHECK → RECOMMENDATION → NEXT ACTION

A recommendation must be tied to something that was actually found. If the available information does not establish the cause, say "Not enough information yet," then identify exactly what information is missing. Never invent numbers, benchmarks, case studies, customer results, or market data.

---

2. BUSINESS KNOWLEDGE STRUCTURE

FOUNDATION: entrepreneurship & idea validation, business models, economics & unit economics, strategy & positioning, finance fundamentals, legal & compliance awareness.
GROWTH: marketing, sales, customer psychology, branding & customer experience, product development, growth mechanics, analytics for growth.
SCALE: operations, automation & technology, management & team, customer concentration & risk, scaling decisions.

Do not assume every problem is a marketing problem. A business may have a Foundation problem even when the owner asks a Growth question.

---

3. FRAMEWORK REASONING

Every framework follows: 1. SIGNAL(S) OBSERVED, 2. LIKELY CAUSAL CHAIN, 3. WHAT TO CHECK, 4. RECOMMENDATION. Treat causal chains as ranked hypotheses, not facts. Never assume the first plausible explanation is correct. Confirm the cause before recommending a major intervention. When several causes are possible, rank them and explain why.

ACTIVE FRAMEWORK 01 — RISING COST PER LEAD + FLAT OR DECLINING CLOSE RATE

Trigger condition: CPL has increased over at least 3–4 comparable periods AND close rate has remained flat or declined over the same period. Do NOT trigger on one noisy period. Do NOT treat "CPL rising while close rate improves" as the same problem.

Ranked causal hypotheses, in order:
1. Lead quality has declined (targeting drift, keyword changes, audience changes, competitors bidding into the same audience, channel reaching further down the intent curve).
2. The offer or message has become stale (creative run too long, audience fatigue, declining response from previously responsive segments).
3. The lead-to-close handoff has deteriorated (response time, follow-up cadence, missed follow-ups, pricing/scope changes, mismatch between marketing promise and sales conversation).
4. Competitive pressure has increased (competitor visibility, competing offers, auction/search environment, positioning changes).
5. Seasonality or market-wide demand has weakened — do not automatically assume the business caused the decline.

Required diagnostic checks:
- Check 1 — Channel/source segmentation: is CPL rising everywhere or in one channel? Single-channel points to channel-specific causes; across-channel points to offer, market, or handling.
- Check 2 — Lead quality: compare geography, budget signals, stated need, fit with original target customer. Volume is not quality.
- Check 3 — Creative/listing/message age: how long has the current ad/listing/landing page been unchanged, and does early performance differ materially from current performance?
- Check 4 — Lead-to-close handoff: response time, follow-up cadence, sales process, pricing, scope, whether the sales conversation still matches the marketing promise.
- Check 5 — Competition: have competitors become more visible or aggressive in the same channel?
- Check 6 — Seasonality/market pattern: before blaming the business, check whether the same pattern exists across the broader category or market.

Recommendation rules:
- Lead quality declined → recommend tightening targeting/audience/keywords before increasing spend.
- Creative/message stale → recommend refreshing message/creative/offer before changing budget.
- Handling deteriorated → do NOT recommend increasing spend first; fix response time and follow-up.
- Competition increased → treat as a positioning/differentiation issue, not simply higher spend.
- Seasonal/market-wide → the correct call may be to hold steady rather than overreact.
- If none of the checks establish the cause → say "Not enough data yet" and specify exactly what should be tracked during the next comparable period.

NEVER output "Increase your budget," "Improve your ads," or "Do more marketing" unless the evidence specifically supports it.

---

4. DECISION ENGINE

Step 1 — Identify the signal: what is actually happening?
Step 2 — Identify the domain: Foundation, Growth, or Scale?
Step 3 — Identify the subtopic: marketing, sales, economics, positioning, operations, analytics, etc.
Step 4 — Check framework triggers: does an existing framework apply?
Step 5 — Ask clarifying questions if the question is vague — do not pretend certainty. Example: "I'm not growing" → "'Not growing' can mean several things. Which changed most recently: leads, conversion rate, customers, revenue, retention, or profit?"
Step 6 — Diagnose using the applicable framework.
Step 7 — Recommend the smallest/highest-leverage intervention the evidence supports.
Step 8 — Define what should be measured next.

---

5. AI ADVISOR BEHAVIOUR

Explain reasoning, not just conclusions. The owner should understand what is happening, why it may be happening, what evidence supports the diagnosis, what remains uncertain, what to do next, and what to measure afterward. Plain business language, no unnecessary jargon. Never pretend certainty when evidence is weak. Never fabricate benchmarks, client results, or case studies. If a number wasn't provided by the owner or derived directly from what they provided, don't present it as fact.

---

6. TEACH THE OWNER

The goal is not just to solve today's problem but to gradually improve the owner's ability to recognize the same pattern themselves. Briefly explain the reasoning pattern behind a recommendation when appropriate. Don't overwhelm with theory — teach progressively.

---

7. RESPONSE FORMAT (FULL MODE ONLY)

What I see — state the observed signal.
What it could mean — list the most likely causes, ranked.
What we need to check — specific checks.
What the evidence says — separate confirmed findings from hypotheses.
Recommendation — tied directly to the evidence.
Next action — the immediate step.
What to measure — the metric or signal to monitor next.

If there is insufficient information, stop before making an unsupported recommendation. QUICK mode never uses this structure — see Section 0.

---

8. HONESTY RULE

Prefer "Not enough information yet" over a confident but unsupported answer. Never manufacture certainty to sound intelligent. The goal is to improve the business owner's decision, not to appear smart.

---

9. EXECUTION BOUNDARY

You are an ADVISOR only. Do not spend money, change advertising campaigns, contact customers, change prices, or modify business systems. Diagnose and recommend — execution is a separate future layer.

---

FINAL OPERATING PRINCIPLE

You are not an answer generator. You are a reasoning system for business decisions. Observe → Diagnose → Verify → Recommend → Measure. Evidence before advice. Reasoning before recommendation. Honesty before confidence.`;

  // ── Stage labels for the loading trace (mirrors the framework itself) ──
  const STAGES = [
    "Reading signal…",
    "Ranking causes…",
    "Checking evidence…",
    "Preparing recommendation…",
  ];

  // ── Styles (scoped inside a shadow root so the host page can't clash) ──
  const CSS = `
    :host, * { box-sizing: border-box; }
    .op-root {
      position: fixed; right: 22px; bottom: 22px; z-index: 999999;
      font-family: 'IBM Plex Sans', system-ui, -apple-system, sans-serif;
      color: #E8ECF2;
    }
    .op-bubble {
      width: 58px; height: 58px; border-radius: 50%;
      background: linear-gradient(160deg, #16213A, #0B1220);
      border: 1px solid rgba(242,169,59,0.35);
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; box-shadow: 0 6px 24px rgba(0,0,0,0.45);
      transition: transform .18s ease, box-shadow .18s ease;
    }
    .op-bubble:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.55); }
    .op-bubble svg { width: 26px; height: 26px; }
    .op-bubble .op-trace {
      stroke: #F2A93B; stroke-width: 2; fill: none;
      stroke-dasharray: 120; stroke-dashoffset: 0;
      animation: op-pulse 2.6s ease-in-out infinite;
    }
    @keyframes op-pulse {
      0% { stroke-dashoffset: 120; opacity: .35; }
      50% { stroke-dashoffset: 0; opacity: 1; }
      100% { stroke-dashoffset: -120; opacity: .35; }
    }
    .op-panel {
      position: absolute; right: 0; bottom: 74px;
      width: 366px; max-width: calc(100vw - 32px);
      height: 540px; max-height: 72vh;
      background: #0F1626; border: 1px solid rgba(232,236,242,0.09);
      border-radius: 14px; overflow: hidden;
      display: flex; flex-direction: column;
      box-shadow: 0 20px 60px rgba(0,0,0,0.55);
      opacity: 0; transform: translateY(10px) scale(.98);
      pointer-events: none; transition: opacity .16s ease, transform .16s ease;
    }
    .op-panel.op-open { opacity: 1; transform: translateY(0) scale(1); pointer-events: auto; }
    .op-header {
      padding: 14px 16px 12px; border-bottom: 1px solid rgba(232,236,242,0.08);
      background: #111A2E;
    }
    .op-header-row { display: flex; align-items: center; justify-content: space-between; }
    .op-title { font-family: 'Space Grotesk', 'IBM Plex Sans', sans-serif; font-weight: 600; font-size: 15px; letter-spacing: .2px; }
    .op-subtitle { font-size: 11px; color: #7C8AA3; margin-top: 2px; letter-spacing: .3px; text-transform: uppercase; }
    .op-close { cursor: pointer; color: #7C8AA3; font-size: 18px; line-height: 1; background: none; border: none; padding: 4px; }
    .op-close:hover { color: #E8ECF2; }
    .op-headerline { width: 100%; height: 22px; margin-top: 8px; }
    .op-messages { flex: 1; overflow-y: auto; padding: 14px 14px 6px; display: flex; flex-direction: column; gap: 10px; }
    .op-msg { font-size: 13.5px; line-height: 1.55; padding: 10px 12px; border-radius: 10px; white-space: pre-wrap; max-width: 88%; }
    .op-msg-user { align-self: flex-end; background: #1B2A44; color: #E8ECF2; border-bottom-right-radius: 3px; }
    .op-msg-bot { align-self: flex-start; background: #16213A; color: #DCE3EE; border-bottom-left-radius: 3px; border: 1px solid rgba(79,209,197,0.12); }
    .op-msg-intro { align-self: flex-start; font-size: 12.5px; color: #8792A6; }
    .op-stage { align-self: flex-start; display: flex; align-items: center; gap: 8px; font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: #F2A93B; padding: 2px 2px; }
    .op-dot { width: 6px; height: 6px; border-radius: 50%; background: #F2A93B; animation: op-blink 1s ease-in-out infinite; }
    @keyframes op-blink { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
    .op-inputrow { border-top: 1px solid rgba(232,236,242,0.08); padding: 10px; display: flex; gap: 8px; background: #0F1626; }
    .op-input { flex: 1; resize: none; background: #16213A; border: 1px solid rgba(232,236,242,0.10); border-radius: 8px; color: #E8ECF2; font-family: inherit; font-size: 13px; padding: 9px 10px; max-height: 90px; }
    .op-input:focus { outline: none; border-color: rgba(242,169,59,0.45); }
    .op-send { background: #F2A93B; color: #10141F; border: none; border-radius: 8px; padding: 0 14px; font-weight: 600; font-size: 13px; cursor: pointer; }
    .op-send:disabled { opacity: .45; cursor: default; }
    .op-foot { font-size: 10px; color: #56617A; text-align: center; padding: 6px 10px 10px; }
    .op-messages::-webkit-scrollbar { width: 6px; }
    .op-messages::-webkit-scrollbar-thumb { background: rgba(232,236,242,0.12); border-radius: 3px; }
  `;

  function buildDOM(root) {
    root.innerHTML = `
      <div class="op-root">
        <div class="op-panel" id="op-panel">
          <div class="op-header">
            <div class="op-header-row">
              <div>
                <div class="op-title">OrionPulse</div>
                <div class="op-subtitle">Business Advisor</div>
              </div>
              <button class="op-close" id="op-close" aria-label="Close">&times;</button>
            </div>
            <svg class="op-headerline" viewBox="0 0 300 22" preserveAspectRatio="none">
              <path d="M0 11 L60 11 L72 3 L84 19 L96 11 L300 11" fill="none" stroke="#4FD1C5" stroke-width="1.5" opacity="0.5"/>
            </svg>
          </div>
          <div class="op-messages" id="op-messages">
            <div class="op-msg-intro">Tell me what's changed in the business — a metric, a trend, a symptom — and I'll work through what's likely causing it and what to check before you act.</div>
          </div>
          <div class="op-inputrow">
            <textarea class="op-input" id="op-input" rows="1" placeholder="e.g. My cost per lead is up 3 months running…"></textarea>
            <button class="op-send" id="op-send">Send</button>
          </div>
          <div class="op-foot">Advisory only — reviews reasoning, doesn't act on your accounts.</div>
        </div>
        <div class="op-bubble" id="op-bubble" aria-label="Open OrionPulse advisor">
          <svg viewBox="0 0 40 40"><path class="op-trace" d="M2 20 L12 20 L16 8 L22 32 L27 20 L38 20"/></svg>
        </div>
      </div>
    `;
  }

  function init() {
    const host = document.createElement("div");
    host.id = "orionpulse-widget-host";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = CSS;
    shadow.appendChild(style);

    const container = document.createElement("div");
    shadow.appendChild(container);
    buildDOM(container);

    const panel = container.querySelector("#op-panel");
    const bubble = container.querySelector("#op-bubble");
    const closeBtn = container.querySelector("#op-close");
    const messages = container.querySelector("#op-messages");
    const input = container.querySelector("#op-input");
    const sendBtn = container.querySelector("#op-send");

    let history = []; // { role, content }
    let stageTimer = null;

    bubble.addEventListener("click", () => {
      panel.classList.add("op-open");
      input.focus();
    });
    closeBtn.addEventListener("click", () => panel.classList.remove("op-open"));

    function addMessage(role, text) {
      const div = document.createElement("div");
      div.className = "op-msg " + (role === "user" ? "op-msg-user" : "op-msg-bot");
      div.textContent = text;
      messages.appendChild(div);
      messages.scrollTop = messages.scrollHeight;
      return div;
    }

    function showStageTrace() {
      const el = document.createElement("div");
      el.className = "op-stage";
      el.id = "op-stage-el";
      const dot = document.createElement("span");
      dot.className = "op-dot";
      const label = document.createElement("span");
      label.textContent = STAGES[0];
      el.appendChild(dot);
      el.appendChild(label);
      messages.appendChild(el);
      messages.scrollTop = messages.scrollHeight;

      let i = 0;
      stageTimer = setInterval(() => {
        i = (i + 1) % STAGES.length;
        label.textContent = STAGES[i];
      }, 900);
    }

    function clearStageTrace() {
      if (stageTimer) clearInterval(stageTimer);
      stageTimer = null;
      const el = messages.querySelector("#op-stage-el");
      if (el) el.remove();
    }

    async function send() {
      const text = input.value.trim();
      if (!text) return;
      input.value = "";
      sendBtn.disabled = true;
      addMessage("user", text);
      history.push({ role: "user", content: text });
      showStageTrace();

      try {
        const res = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
    

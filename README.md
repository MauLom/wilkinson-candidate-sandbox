# CRM interview sandbox

Local exercise only. No real customer data, accounts, or external API calls.

## Setup (part of the assessment, target 10 minutes)
Prerequisite: Node.js 22 or newer and npm. No database or paid account required.

1. Extract the ZIP and open a terminal in this folder.
2. Run `node --version`.
3. Copy `.env.example` to `.env`: macOS/Linux `cp .env.example .env`; PowerShell `Copy-Item .env.example .env`.
4. Run `npm install` (this project deliberately has no third-party dependencies).
5. Run `npm start` and open http://localhost:4317.
6. In another terminal, run `npm test`.

If port 4317 is occupied, change PORT in .env. Commands must run from this folder.
Run `npm run reset` to restore fixtures, then refresh the browser. Reset erases only local sandbox records.

## Assignment (35 minutes investigation and fix)
A message appears on a prospect immediately after sending. After a provider webhook arrives and history is refreshed, it disappears from that prospect.

Use Jordan Morgan for the reproduction:
- Send a mock message.
- Click Simulate sent webhook.
- Click Refresh history (or reload the page).

Find and explain the root cause. Make a focused fix. Verify that the message stays on the intended prospect, duplicate events do not duplicate messages, and status-only events preserve the body. Add a regression test for the original failure.

Use the final 10 minutes to demonstrate your tests and explain your changes, plus 5 minutes for a short written handoff. If the full session has a different agreed duration, the interviewer will tell you before starting.

AI and documentation are allowed. Explain and verify your solution. If unfinished, report findings and next steps honestly. We assess reasoning, verification, communication, and safe escalation, not typing speed.

## Mock provider
The send button saves locally. Provider events happen only when you click the simulation buttons. These operate on the last message sent in the current browser session; after a browser reload, send another test message to enable them again. No real SMS is sent.

## Structure
- public/index.html: simple conversation UI
- src/server.js: local HTTP API
- src/messages.js: send and webhook behavior
- src/store.js: JSON persistence and fixtures
- test/messages.test.js: starter tests, not complete regression coverage
- data/store.json: generated runtime data, safe to inspect

API: GET /api/prospects; GET/POST /api/prospects/:id/messages; GET /api/activity?prospectId=:id; POST /api/webhooks/messages.
Webhook example: {"type":"message.sent","messageId":"ID_FROM_SEND","externalNumber":"+12025550123","status":"sent","body":"Hello"}.
Status-only: same fields, type message.status_updated, status delivered, omit body.

## Submission
Submit changed files or a git diff, test results, a 2-3 sentence user update, and a technical handoff (cause, changes, tests, remaining risks, next steps). Do not include .env or generated data/store.json. There is no requirement to deploy or push publicly.

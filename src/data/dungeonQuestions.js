// Question Dungeon content: real junior-to-mid interview questions with
// model answers that reflect actual practice (test cases, bug reports,
// Postman/Swagger workflows). Static content — no AI involved here.

export const DUNGEON_TOPICS = [
  { id: 'manual', icon: '📝', label: 'Manual Testing' },
  { id: 'api', icon: '🔌', label: 'API Testing' },
  { id: 'automation', icon: '🤖', label: 'Automation' },
  { id: 'sql', icon: '🗄️', label: 'SQL / Database' },
  { id: 'agile', icon: '🌀', label: 'Agile / Process' },
  { id: 'hr', icon: '🎤', label: 'Interview / HR' },
]

export const DUNGEON_QUESTIONS = [
  // ── Manual Testing ────────────────────────────────────────────────
  {
    id: 'man-1', topic: 'manual',
    q: 'What makes a good test case? Walk me through the fields you write.',
    a: 'A test case anyone can execute without asking me questions: unique ID, title, precondition (state and data needed), numbered steps with exact test data, expected result per step or at the end, and priority. I keep one verification goal per case — if a case checks five things, failures become ambiguous. In practice I also link each case to its requirement so coverage is traceable.',
  },
  {
    id: 'man-2', topic: 'manual',
    q: 'Severity vs. priority — explain with an example of high severity/low priority and the reverse.',
    a: 'Severity is technical impact; priority is business urgency. High severity, low priority: the app crashes on a settings page used by 0.1% of users once a year — bad crash, but it can wait a sprint. Low severity, high priority: the CEO’s name is misspelled on the landing page — cosmetically trivial, but it gets fixed today. QA proposes severity; triage with the product owner sets priority.',
  },
  {
    id: 'man-3', topic: 'manual',
    q: 'You find a bug that you cannot reproduce consistently. What do you do?',
    a: 'I still report it — intermittent bugs are often the worst ones in production. I capture everything from the failing run: exact build, environment, account, timestamps, logs, screenshots/video, and network traces if available. I note the observed frequency ("2 of 10 attempts"), what I varied, and my best hypothesis (timing, caching, data state). Then I flag it as intermittent so developers read it as a pattern-hunt, not a recipe.',
  },
  {
    id: 'man-4', topic: 'manual',
    q: 'How would you test a file upload feature?',
    a: 'First clarify requirements: allowed types, max size, multiple files? Then: happy path per allowed type; boundaries — exactly max size, 1 byte over, empty 0-byte file; negative — blocked extensions, renamed extensions (.exe renamed to .jpg), corrupted files, filenames with unicode/emoji/very long names/path characters; behavior — cancel mid-upload, retry on network drop, duplicate names; security — script in SVG, oversized payloads; and UX — progress indicator, clear errors, keyboard accessibility.',
  },
  {
    id: 'man-5', topic: 'manual',
    q: 'What is the bug life cycle in a tool like Jira?',
    a: 'New/Open → Assigned → In Progress → Fixed/Resolved → Ready for QA → Verified/Closed, with side paths: Rejected (not a bug/works as designed), Duplicate, Deferred (valid but postponed), and Reopened when my retest fails. My job doesn’t end at reporting: I verify the fix on the fix build, run a quick regression around the touched area, and only then close with evidence attached.',
  },

  // ── API Testing ───────────────────────────────────────────────────
  {
    id: 'api-1', topic: 'api',
    q: 'How do you test an API you have never seen before, starting from its Swagger docs?',
    a: 'I read the Swagger/OpenAPI spec to map resources, methods, auth, and schemas — the spec is my requirements document. I import it into Postman to generate a collection, set up an environment with baseUrl and token variables, then hit the happy path for each endpoint and assert status, schema, and values. Next comes the real testing: negative cases (missing/invalid fields, wrong types, expired tokens), boundaries on every constrained field, and cross-checks — does the POST actually persist what the GET returns?',
  },
  {
    id: 'api-2', topic: 'api',
    q: 'Name the status codes you assert most and what each means.',
    a: '200 OK (read/update success), 201 Created (successful POST), 204 No Content (successful delete), 400 Bad Request (client sent invalid data — my negative tests expect this), 401 Unauthorized (no/invalid credentials), 403 Forbidden (authenticated but not allowed), 404 Not Found, 409 Conflict (duplicate/state clash), 429 Too Many Requests (rate limiting), 500 Internal Server Error — which should never leak stack traces; if it does, that’s a second bug.',
  },
  {
    id: 'api-3', topic: 'api',
    q: 'What do you validate in an API response beyond the status code?',
    a: 'Four layers: schema (fields present, correct types, no unexpected extras), data correctness (values match what I created or what the DB holds), headers (content-type, cache-control, security headers), and behavior (response time within SLA, pagination correctness, idempotency of PUT/DELETE). In Postman I write test scripts for these so the collection runs in CI with Newman and fails loudly.',
  },
  {
    id: 'api-4', topic: 'api',
    q: 'How would you test rate limiting on an endpoint?',
    a: 'Find the documented limit, then script a burst just under it (all should succeed), at it, and over it — asserting the 429 response, a Retry-After or rate-limit header, and a safe error body. Then verify recovery: after the window passes, requests succeed again. I also check that the limit is per-key/per-IP as designed — one noisy client must not lock out others — and that the 429 path itself doesn’t crash anything downstream.',
  },
  {
    id: 'api-5', topic: 'api',
    q: 'A GET returns 200 in Postman but the frontend shows an error. How do you localize the fault?',
    a: 'Compare the two requests byte-for-byte: browser DevTools network tab vs. my Postman call — URL, method, headers (auth! content-type! origin), and body. Common culprits: the frontend hits a different environment, sends a stale token, or a CORS preflight fails (which Postman never does). If requests match and responses match, the bug is in frontend parsing/rendering; I then check the console for JS errors. The point is to hand developers a precise "it breaks between X and Y", not "it doesn’t work".',
  },

  // ── Automation ────────────────────────────────────────────────────
  {
    id: 'auto-1', topic: 'automation',
    q: 'What do you automate first in a project with zero automation?',
    a: 'The smoke suite for critical business flows — login, the main money path, core CRUD — because it runs on every build and saves the most manual time. I pick stable features (no point automating UI that changes weekly), start API-level where possible since those tests are faster and less flaky, and wire everything into CI from day one. Automation that doesn’t run on every push is just code that rots.',
  },
  {
    id: 'auto-2', topic: 'automation',
    q: 'What causes flaky tests and how do you fight them?',
    a: 'Top causes: timing (fixed sleeps, missing waits), test interdependence (test B needs data test A created), environment instability, and animation/network variance. Fixes: explicit waits or Playwright auto-waiting assertions, each test creating and cleaning its own data, retry-with-report as a tripwire (never as a cure), and quarantining flaky tests so the suite stays trusted. A suite the team ignores because "it’s always red" is worse than no suite.',
  },
  {
    id: 'auto-3', topic: 'automation',
    q: 'Explain the Page Object Model and why teams use it.',
    a: 'Each page or component gets a class holding its locators and user actions (login(user, pass), addToCart(item)). Tests read like user stories and never touch selectors directly. When the UI changes, I fix one page object instead of every test that touches the page. In Playwright I combine it with fixtures for setup; in Selenium with a base page for shared waits. The result is automation that survives refactors.',
  },
  {
    id: 'auto-4', topic: 'automation',
    q: 'Selenium vs. Playwright — how do you choose?',
    a: 'Playwright for new web projects: auto-waiting kills most flakiness, one API drives Chromium/Firefox/WebKit, it has built-in trace viewer, network mocking, and parallelism. Selenium when the ecosystem demands it: huge legacy suites, exotic browser/grid requirements, or teams standardized on Java toolchains. I know both — the concepts (locators, waits, POM) transfer; only the syntax changes.',
  },
  {
    id: 'auto-5', topic: 'automation',
    q: 'Your automated regression passes but a bug still reached production. What is your takeaway process?',
    a: 'Blameless root-cause: was the scenario missing from the suite, wrongly asserted, or environment-masked? I write the missing test first (it should fail on the buggy build, pass on the fix), then ask what class of bugs this represents and add coverage for the class, not just the instance. Finally I check the pyramid: could a cheaper API or unit test have caught it earlier than E2E? Escapes are tuition — expensive, so learn the whole lesson.',
  },

  // ── SQL / Database ────────────────────────────────────────────────
  {
    id: 'sql-1', topic: 'sql',
    q: 'How do you use SQL day-to-day as a QA engineer?',
    a: 'To verify truth behind the UI: after creating an order in the app, I SELECT it and check every column — values, defaults, timestamps, foreign keys. I hunt duplicates with GROUP BY/HAVING, orphans with LEFT JOIN … IS NULL, and state bugs by comparing status columns against what the UI claims. For test setup I query realistic data instead of clicking for ten minutes. Read-only by default — I don’t UPDATE production-like data without a very good reason and a backup.',
  },
  {
    id: 'sql-2', topic: 'sql',
    q: 'Write a query to find users who registered but never placed an order.',
    a: 'SELECT u.id, u.email FROM users u LEFT JOIN orders o ON o.user_id = u.id WHERE o.id IS NULL; — LEFT JOIN keeps all users, and the WHERE keeps only those with no matching order. The same pattern finds any "parent without children" data issue: products never sold, accounts never logged in, emails never verified.',
  },
  {
    id: 'sql-3', topic: 'sql',
    q: 'What is the difference between DELETE, TRUNCATE and DROP?',
    a: 'DELETE removes rows (optionally filtered with WHERE), is transactional, and fires triggers — slow on huge tables but precise. TRUNCATE empties the whole table fast, usually without firing row triggers, and typically can’t be filtered or (in some DBs) rolled back. DROP removes the table itself — structure and all. As QA: on shared environments I use DELETE with WHERE and a transaction I can roll back; TRUNCATE/DROP only on disposable test databases.',
  },
  {
    id: 'sql-4', topic: 'sql',
    q: 'A report shows 105% total. What database checks would you run?',
    a: 'Classic double-counting. I check for duplicate rows in the source (GROUP BY the business key HAVING COUNT(*) > 1), JOINs that fan out (one-to-many joined then summed), NULL handling in the denominator, and rows counted in two categories because of overlapping WHERE conditions. I reproduce the report’s query step by step, comparing counts at each stage until the inflation appears — then the bug report includes the exact query evidence.',
  },
  {
    id: 'sql-5', topic: 'sql',
    q: 'What are ACID properties and why should a tester care?',
    a: 'Atomicity (all or nothing), Consistency (rules hold before and after), Isolation (concurrent transactions don’t corrupt each other), Durability (committed data survives crashes). Testers care because these define concrete test ideas: kill the app mid-payment — is there a half-written order (atomicity)? Two users buy the last item simultaneously — does stock go negative (isolation)? Server restarts after commit — is the data still there (durability)?',
  },

  // ── Agile / Process ───────────────────────────────────────────────
  {
    id: 'ag-1', topic: 'agile',
    q: 'What does QA actually do in each Scrum ceremony?',
    a: 'Planning: I question acceptance criteria and estimate testing effort — vague criteria become concrete examples before we commit. Daily: I surface blockers and what’s ready for test. Refinement: I bring the "what about…" edge cases early, when they’re cheap. Review: I demo quality evidence alongside features. Retro: I bring data — escape count, flaky test rate — not feelings. QA in Scrum is an embedded engineer, not a downstream gate.',
  },
  {
    id: 'ag-2', topic: 'agile',
    q: 'A developer says your bug "works as designed". What do you do?',
    a: 'First I re-read the requirement — they might be right, and I say so if so. If the spec is ambiguous, that ambiguity is itself the finding: I bring the case to the product owner with both interpretations and a user-impact argument, and we get a written decision. If the spec clearly supports the bug, I show the exact line. Either way it stays about the product, never about winning — the tie-breaker is the user, and the decision gets recorded so we don’t re-fight it.',
  },
  {
    id: 'ag-3', topic: 'agile',
    q: 'The sprint ends tomorrow and testing is not finished. What do you tell the team?',
    a: 'The truth, with a risk map: what was covered (and its state), what wasn’t, and what could realistically break in the untested area. I recommend: ship with known risk documented, cut the risky story from the release, or extend — but the call belongs to the team/PO with my evidence on the table. What I never do is silently sign off. "QA-approved" must keep meaning something, or it protects no one.',
  },
  {
    id: 'ag-4', topic: 'agile',
    q: 'What is shift-left testing in practice, not as a buzzword?',
    a: 'Finding problems before code exists: I review requirements and designs asking "how would I test this?" — unanswerable means untestable means unclear. I write acceptance examples with the PO before development starts, pair with developers on unit-test ideas, and review API contracts before implementation. A requirement bug caught in refinement costs a conversation; the same bug in production costs an incident.',
  },
  {
    id: 'ag-5', topic: 'agile',
    q: 'How do you test a microservices application differently from a monolith?',
    a: 'The integration seams become the main battlefield. Per service: contract tests against its API spec. Between services: what happens when a dependency is slow, down, or returns garbage — timeouts, retries, fallbacks. Data consistency across services (eventual consistency windows, duplicate events). At BRAC IT I test multi-module enterprise platforms, so I map which service owns which data and trace one business flow across service boundaries with correlation IDs in the logs.',
  },

  // ── Interview / HR ────────────────────────────────────────────────
  {
    id: 'hr-1', topic: 'hr',
    q: 'Tell me about yourself (as a junior SQA engineer).',
    a: 'Structure: present → past → why you fit → hook. Example shape: "I’m a Junior SQA Engineer at BRAC IT testing microservices-based enterprise platforms — manual, API testing with Postman/Swagger, and growing automation with Playwright. Before that I built a Spring Boot hospital system as a Java intern, which taught me to read code, not just test it. My base is CSE at AIUB plus competitive programming — 200+ Codeforces problems — so edge-case hunting is a reflex. I’m now leveling up automation and AI-assisted QA." Under 90 seconds, then let them dig.',
  },
  {
    id: 'hr-2', topic: 'hr',
    q: 'Why did you choose QA over development?',
    a: 'Answer honestly and positively — never "development was too hard". Strong angle: QA rewards a destructive-creative mindset — you get paid to think "how does this break?" — plus breadth: one day API contracts, next day SQL forensics, next day automation code. Having a development background (Java, Spring Boot) is a strength IN QA: you read stack traces, review code, and speak developer fluently. Close with intent: aiming at SDET/automation, where both skills compound.',
  },
  {
    id: 'hr-3', topic: 'hr',
    q: 'Where do you see yourself in five years?',
    a: 'Show a trajectory the company can host: deepen automation mastery (Playwright/Selenium frameworks, CI/CD), grow into an SDET or senior QA role owning quality strategy for a product, and mentor juniors along the way — teaching is how you prove you understand. Mention the AI angle: whoever masters AI-assisted testing early will define the next five years of QA. Ambitious, specific, and it maps onto a real career ladder.',
  },
  {
    id: 'hr-4', topic: 'hr',
    q: 'Describe a conflict with a teammate and how you handled it.',
    a: 'Pick a real, low-drama example and STAR it. Good shape: disagreement with a developer over a bug’s severity → I gathered evidence (reproduction rate, affected user segment, business impact) instead of repeating my opinion louder → proposed we let the product owner weigh it with the data → decision made in ten minutes, and we agreed on a severity rubric so the same argument never repeated. Lesson: escalate with evidence, decide with the right owner, fix the process not the person.',
  },
  {
    id: 'hr-5', topic: 'hr',
    q: 'What questions should YOU ask at the end of a QA interview?',
    a: 'Ask what reveals how quality actually works there: "What does the path to production look like — who can block a release?", "What’s the ratio of manual to automated coverage, and where do you want it in a year?", "How do developers and QA collaborate — embedded in squads or a separate team?", "What happened after your last serious production incident?" These show senior thinking, and their answers tell you if you want the job.',
  },
]

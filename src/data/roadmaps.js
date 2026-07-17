// Career roadmaps hub: pick a class, walk its skill tree. Every step links
// to real, reputable, mostly-free resources. Curated by hand — the kind of
// map Soyed wishes he'd had on day one.

export const ROADMAPS = [
  {
    id: 'qa',
    icon: '🐞',
    title: 'Software QA Engineer',
    tagline: 'From zero to the engineer who guards the release.',
    steps: [
      {
        title: 'Testing fundamentals',
        desc: 'Why software breaks, test levels, severity vs priority, the bug life cycle. Learn the vocabulary first.',
        links: [
          { label: 'roadmap.sh/qa', url: 'https://roadmap.sh/qa' },
          { label: 'ISTQB Foundation syllabus', url: 'https://www.istqb.org/certifications/certified-tester-foundation-level' },
        ],
      },
      {
        title: 'Test design & bug reporting',
        desc: 'Equivalence partitioning, boundary values, decision tables — and bug reports developers thank you for.',
        links: [
          { label: 'BBST course materials', url: 'https://bbst.courses/' },
          { label: 'Ministry of Testing', url: 'https://www.ministryoftesting.com/' },
        ],
      },
      {
        title: 'API testing',
        desc: 'HTTP, status codes, Postman collections, schema checks, negative tests. Test below the UI.',
        links: [
          { label: 'Postman Learning Center', url: 'https://learning.postman.com/' },
          { label: 'Swagger / OpenAPI docs', url: 'https://swagger.io/docs/' },
        ],
      },
      {
        title: 'SQL for testers',
        desc: 'Verify the truth behind every UI claim: JOINs, GROUP BY, duplicates, orphaned rows.',
        links: [
          { label: 'SQLBolt (interactive)', url: 'https://sqlbolt.com/' },
          { label: 'SQLZoo', url: 'https://sqlzoo.net/' },
        ],
      },
      {
        title: 'Automation',
        desc: 'Playwright or Selenium, Page Object Model, explicit waits, the test pyramid. Automate the boring laps.',
        links: [
          { label: 'Test Automation University (free)', url: 'https://testautomationu.applitools.com/' },
          { label: 'Playwright docs', url: 'https://playwright.dev/docs/intro' },
        ],
      },
      {
        title: 'Git + CI/CD',
        desc: 'Tests that don’t run on every push are just code that rots. Wire your suite into a pipeline.',
        links: [
          { label: 'Learn Git Branching', url: 'https://learngitbranching.js.org/' },
          { label: 'GitHub Actions docs', url: 'https://docs.github.com/actions' },
        ],
      },
      {
        title: 'Specialize',
        desc: 'Performance (k6), security (OWASP), or AI-assisted testing. Pick the tree branch that excites you.',
        links: [
          { label: 'k6 performance testing', url: 'https://k6.io/docs/' },
          { label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' },
        ],
      },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI Engineer',
    tagline: 'Build with models — and know when they lie.',
    steps: [
      {
        title: 'Python foundations',
        desc: 'The lingua franca of AI. Get fluent: data structures, functions, packages, notebooks.',
        links: [
          { label: 'roadmap.sh/ai-engineer', url: 'https://roadmap.sh/ai-engineer' },
          { label: 'freeCodeCamp Python', url: 'https://www.freecodecamp.org/learn/scientific-computing-with-python/' },
        ],
      },
      {
        title: 'ML fundamentals',
        desc: 'Supervised vs unsupervised, train/test splits, overfitting, evaluation metrics. Concepts before libraries.',
        links: [
          { label: 'Andrew Ng — ML Specialization', url: 'https://www.coursera.org/specializations/machine-learning-introduction' },
          { label: 'Google ML Crash Course', url: 'https://developers.google.com/machine-learning/crash-course' },
        ],
      },
      {
        title: 'Working with LLMs',
        desc: 'Prompting, context windows, temperature, structured output, function calling. The new core skill.',
        links: [
          { label: 'Anthropic docs & courses', url: 'https://docs.anthropic.com/' },
          { label: 'DeepLearning.AI short courses', url: 'https://www.deeplearning.ai/short-courses/' },
        ],
      },
      {
        title: 'RAG & agents',
        desc: 'Ground models in real data, chain tools, build agents that act. Where AI apps get real.',
        links: [
          { label: 'LangChain docs', url: 'https://python.langchain.com/docs/introduction/' },
          { label: 'Hugging Face course', url: 'https://huggingface.co/learn' },
        ],
      },
      {
        title: 'Evaluation & safety',
        desc: 'Golden datasets, LLM-as-judge, hallucination hunting, prompt-injection defense. QA skills compound here.',
        links: [
          { label: 'OWASP LLM Top 10', url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/' },
        ],
      },
      {
        title: 'Ship something',
        desc: 'An AI feature in production beats ten certificates. (The quiz generator on this site is one.)',
        links: [
          { label: 'Vercel AI SDK', url: 'https://sdk.vercel.ai/docs' },
          { label: 'Gemini API docs', url: 'https://ai.google.dev/docs' },
        ],
      },
    ],
  },
  {
    id: 'frontend',
    icon: '🎨',
    title: 'Frontend Developer',
    tagline: 'Everything the user sees — make it fast and beautiful.',
    steps: [
      {
        title: 'HTML & CSS',
        desc: 'Semantic markup, flexbox, grid, responsive design. The skeleton and the skin.',
        links: [
          { label: 'roadmap.sh/frontend', url: 'https://roadmap.sh/frontend' },
          { label: 'MDN — Learn web development', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
        ],
      },
      {
        title: 'JavaScript, properly',
        desc: 'Closures, async/await, the event loop, DOM. Don’t rush this — everything stands on it.',
        links: [
          { label: 'javascript.info', url: 'https://javascript.info/' },
          { label: 'freeCodeCamp JS', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/' },
        ],
      },
      {
        title: 'React',
        desc: 'Components, props, state, hooks, thinking in UI trees. The industry default.',
        links: [
          { label: 'react.dev (official tutorial)', url: 'https://react.dev/learn' },
        ],
      },
      {
        title: 'TypeScript',
        desc: 'Types catch bugs before QA ever sees them. The professional baseline in 2026.',
        links: [
          { label: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html' },
        ],
      },
      {
        title: 'A meta-framework',
        desc: 'Next.js: routing, server components, deployment. Ship real apps, not just demos.',
        links: [
          { label: 'Next.js Learn', url: 'https://nextjs.org/learn' },
        ],
      },
      {
        title: 'Testing & performance',
        desc: 'Playwright E2E, Core Web Vitals, accessibility. Frontends that survive contact with users.',
        links: [
          { label: 'Playwright docs', url: 'https://playwright.dev/docs/intro' },
          { label: 'web.dev', url: 'https://web.dev/learn' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    icon: '⚙️',
    title: 'Backend Developer',
    tagline: 'The engine room: data, logic, and APIs that never lie.',
    steps: [
      {
        title: 'Pick a language',
        desc: 'Java (Spring), JavaScript/TS (Node/Nest), or Python (Django/FastAPI). Depth beats breadth.',
        links: [
          { label: 'roadmap.sh/backend', url: 'https://roadmap.sh/backend' },
        ],
      },
      {
        title: 'HTTP & REST',
        desc: 'Methods, status codes, headers, idempotency, versioning. The contract everything speaks.',
        links: [
          { label: 'MDN — HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP' },
        ],
      },
      {
        title: 'Databases',
        desc: 'Schema design, JOINs, indexes, transactions, migrations. PostgreSQL is a superb default.',
        links: [
          { label: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/' },
          { label: 'SQLBolt', url: 'https://sqlbolt.com/' },
        ],
      },
      {
        title: 'A framework, deeply',
        desc: 'Spring Boot, NestJS or Django: routing, validation, auth, testing, project structure.',
        links: [
          { label: 'Spring Boot guides', url: 'https://spring.io/guides' },
          { label: 'NestJS docs', url: 'https://docs.nestjs.com/' },
        ],
      },
      {
        title: 'Auth & security',
        desc: 'Sessions vs JWT, OAuth, hashing, rate limiting, OWASP. Assume every input is hostile.',
        links: [
          { label: 'OWASP Cheat Sheets', url: 'https://cheatsheetseries.owasp.org/' },
        ],
      },
      {
        title: 'Deploy & scale',
        desc: 'Docker, CI/CD, logs, monitoring — then system design: caching, queues, microservices.',
        links: [
          { label: 'Docker get-started', url: 'https://docs.docker.com/get-started/' },
          { label: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer' },
        ],
      },
    ],
  },
  {
    id: 'cp',
    icon: '⚔️',
    title: 'Competitive Programming',
    tagline: 'The training arena that forged this portfolio’s edge-case sense.',
    steps: [
      {
        title: 'C++ for CP',
        desc: 'STL containers, iterators, fast I/O. The tournament language for a reason.',
        links: [
          { label: 'learncpp.com', url: 'https://www.learncpp.com/' },
        ],
      },
      {
        title: 'DSA fundamentals',
        desc: 'Arrays, strings, sorting, binary search, prefix sums, two pointers, recursion.',
        links: [
          { label: 'USACO Guide (free, structured)', url: 'https://usaco.guide/' },
        ],
      },
      {
        title: 'Grind a judge',
        desc: 'Solve daily. Start easy, upsolve what beats you. Consistency out-levels talent.',
        links: [
          { label: 'Codeforces', url: 'https://codeforces.com/' },
          { label: 'CSES Problem Set', url: 'https://cses.fi/problemset/' },
          { label: 'LeetCode', url: 'https://leetcode.com/' },
        ],
      },
      {
        title: 'Core algorithms',
        desc: 'Graphs (BFS/DFS/Dijkstra), DP, greedy proofs, number theory, segment trees.',
        links: [
          { label: 'cp-algorithms.com', url: 'https://cp-algorithms.com/' },
        ],
      },
      {
        title: 'Contests & upsolving',
        desc: 'Enter live rounds; afterwards, solve every problem you missed. That’s where rating grows.',
        links: [
          { label: 'Codeforces contests', url: 'https://codeforces.com/contests' },
          { label: 'AtCoder', url: 'https://atcoder.jp/' },
        ],
      },
      {
        title: 'Team up for ICPC',
        desc: 'Three people, one keyboard, five hours. (Soyed’s team: Top 10 at AIUB, ICPC Dhaka regional.)',
        links: [
          { label: 'ICPC official', url: 'https://icpc.global/' },
        ],
      },
    ],
  },
]

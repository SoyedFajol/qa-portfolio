// Single source of truth for Soyed's REAL profile data.
// Imported by BOTH the frontend (src/) and the serverless functions (api/).
// PRIVACY RULE (non-negotiable): no phone number, no home address — anywhere.

export const PROFILE = {
  name: 'Soyed Md. Solaman Fajul',
  displayName: 'Soyed Solaman',
  headline: 'Software Engineer · SQA @ BRAC IT',
  title: 'Junior SQA Engineer @ BRAC IT Services Ltd. · Builder of fun things',
  location: 'Dhaka, Bangladesh',
  email: 'soyedmdsolemanfajul@gmail.com',
  github: 'https://github.com/SoyedFajol',
  linkedin: 'https://www.linkedin.com/in/soyed-md-solaman-fajul-a492b6214/',

  education: {
    degree: 'B.Sc. in Computer Science & Engineering',
    school: 'American International University-Bangladesh (AIUB)',
    cgpa: '3.44',
  },

  careerSummary:
    'SQA Engineer with one year of hands-on experience testing microservices-based enterprise applications, including large-scale ERP systems. Strong in manual testing, test case design, API testing using Postman and Swagger, defect tracking, and UAT execution. Experienced in Agile/Scrum environments, collaborating closely with developers and stakeholders to ensure release quality. Known for a problem-solving mindset with growing expertise in test automation and backend systems. Focused on delivering reliable, high-quality software.',

  experience: [
    {
      role: 'Jr. SQA Engineer',
      company: 'BRAC IT Services Ltd.',
      period: 'May 2025 – Present',
      bullets: [
        'Testing microservices-based enterprise applications, including university ERP systems',
        'Writing and executing test cases; manual testing across multiple modules',
        'Conducting UAT with stakeholders to ensure business requirements are met',
        'RESTful API testing with Postman & Swagger',
        'Reporting and tracking bugs with clear documentation',
        'Supporting automation testing efforts · Agile/Scrum, cross-functional teams',
      ],
    },
    {
      role: 'Java Developer Intern',
      company: 'CMED Health Ltd.',
      period: 'Feb 2025 – Apr 2025',
      bullets: [
        'Spring Boot hospital appointment management system',
        'Microservice backend development',
        'QA collaborator: API testing & business-logic validation',
        'Clean Java code + relational database integration',
      ],
    },
  ],

  competitive: [
    '200+ problems solved on Codeforces, 100+ on other platforms',
    'Top 15 — AIUB Programming Competition 2024 & 2025',
    'Top 10 AIUB team — solved 2 problems in ICPC Asia Dhaka Regional Online Contest 2024',
  ],

  extras: [
    'Research: Economics & Psychology of Gaming in Bangladesh — player behavior prediction using ML',
    'AIUB Competitive Programming Club member',
    'Campus Ambassador (Locus, Creative Wings)',
    'Taught kids coding',
  ],

  // levels: 3 = strong, 2 = working, 1 = learning
  skills: {
    testing: [
      { name: 'Manual Testing', level: 3 },
      { name: 'API Testing', level: 3 },
      { name: 'Automation Testing', level: 2 },
      { name: 'Security Testing', level: 1 },
    ],
    frameworks: [
      { name: 'Playwright', level: 2 },
      { name: 'Selenium', level: 2 },
      { name: 'n8n (workflow automation)', level: 2 },
    ],
    programming: [
      { name: 'Java', level: 3 },
      { name: 'Python', level: 2 },
      { name: 'C++ (competitive programming)', level: 2 },
    ],
    databases: ['MySQL', 'SQL', 'PostgreSQL'],
    tools: ['Jira', 'Postman', 'Swagger', 'Git'],
    apis: ['RESTful API', 'Third-party API integration'],
    secretClass: ['Spring Boot', 'Microservices'],
  },

  story: [
    { icon: '🎓', title: 'AIUB CSE student', desc: 'Discovers coding at American International University-Bangladesh.' },
    { icon: '⚔️', title: 'Competitive programmer', desc: 'Falls in love with problem solving — 200+ Codeforces problems, ICPC regional contestant.' },
    { icon: '☕', title: 'Java Developer Intern @ CMED Health', desc: 'Builds a Spring Boot hospital appointment system, tastes real-world QA.' },
    { icon: '🐞', title: 'Jr. SQA Engineer @ BRAC IT', desc: 'Levels up: testing enterprise microservices with Postman, Swagger & sharp eyes.' },
    { icon: '🤖', title: 'Current quest', desc: 'Mastering automation (Playwright/Selenium) and AI-powered QA.' },
    { icon: '🎮', title: 'Side quest (always active)', desc: 'Building fun, informative websites — like this one.' },
  ],
}

// ── Public-safe integration constants ─────────────────────────────────────
// Web3Forms access keys are public-safe by design. TODO: paste yours from
// https://web3forms.com (free) to activate the "Send a Raven" form.
export const WEB3FORMS_ACCESS_KEY = ''

// TODO: paste your Calendly scheduling URL (e.g. https://calendly.com/yourname/qa-career-chat)
// to activate the "Party Up" booking widget.
export const CALENDLY_URL = ''

// The in-site resume page (print → save as PDF). Point this at a hosted PDF
// instead if one is ever dropped in /public.
export const RESUME_URL = '/resume'

export const SITE_URL = 'https://soyed-solaman.vercel.app'

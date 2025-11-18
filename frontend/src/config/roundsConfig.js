// Centralized interview rounds configuration
// Supports both technical and non-technical track flows.
// Each round object kept intentionally descriptive to allow future AI-driven feedback modules.

export const ROUND_MODES = {
  MCQ: 'MCQ',
  CODING: 'Coding Compiler',
  PERSON: 'Person-to-Person',
  CASE: 'case',
  SCENARIO: 'scenario',
  PITCH: 'pitch',
  ANALYSIS: 'analysis'
};

// Ordered round definitions.
export const rounds = [
  // --- Technical (Software Engineering baseline) ---
  {
    id: 'tech-diagnostic',
    trackGroup: 'tech',
    appliesTo: ['software-engineering','cybersecurity','data-science'],
    stage: 0,
    label: 'Baseline Diagnostic',
    mode: ROUND_MODES.MCQ,
    difficultyProfile: ['easy','medium'],
    objectives: ['calibrate_level','identify_gaps'],
    next: 'tech-core-coding'
  },
  {
    id: 'tech-core-coding',
    trackGroup: 'tech',
    appliesTo: ['software-engineering','cybersecurity','data-science'],
    stage: 1,
    label: 'Core Coding Fundamentals',
    mode: ROUND_MODES.CODING,
    topics: ['arrays','strings','hashing'],
    difficultyProfile: ['easy','medium'],
    questionCount: 2,
    next: 'tech-patterns'
  },
  {
    id: 'tech-patterns',
    trackGroup: 'tech',
    appliesTo: ['software-engineering'],
    stage: 2,
    label: 'Problem Solving Patterns',
    mode: ROUND_MODES.CODING,
    topics: ['recursion','dp','graphs'],
    difficultyProfile: ['medium'],
    next: 'tech-advanced'
  },
  {
    id: 'tech-advanced',
    trackGroup: 'tech',
    appliesTo: ['software-engineering','cybersecurity'],
    stage: 3,
    label: 'Advanced Coding & Optimization',
    mode: ROUND_MODES.CODING,
    difficultyProfile: ['medium','hard'],
    next: 'tech-architecture'
  },
  {
    id: 'tech-architecture',
    trackGroup: 'tech',
    appliesTo: ['software-engineering'],
    stage: 4,
    label: 'System / Architecture Thinking',
    mode: ROUND_MODES.CASE,
    objectives: ['tradeoffs','scalability'],
    next: 'tech-person-interview'
  },
  {
    id: 'tech-person-interview',
    trackGroup: 'tech',
    appliesTo: ['software-engineering','cybersecurity','data-science'],
    stage: 5,
    label: 'Interactive Technical Interview',
    mode: ROUND_MODES.PERSON,
    next: 'tech-reflection'
  },
  {
    id: 'tech-reflection',
    trackGroup: 'tech',
    appliesTo: ['software-engineering','cybersecurity','data-science'],
    stage: 6,
    label: 'Reflection & Growth Plan',
    mode: ROUND_MODES.ANALYSIS,
    optional: true
  },

  // --- Product Management ---
  {
    id: 'pm-product-sense',
    trackGroup: 'nonTech',
    appliesTo: ['product-management'],
    stage: 1,
    label: 'Product Sense Case',
    mode: ROUND_MODES.CASE,
    next: 'pm-prioritization'
  },
  {
    id: 'pm-prioritization',
    trackGroup: 'nonTech',
    appliesTo: ['product-management'],
    stage: 2,
    label: 'Prioritization & Execution',
    mode: ROUND_MODES.CASE,
    next: 'pm-metrics'
  },
  {
    id: 'pm-metrics',
    trackGroup: 'nonTech',
    appliesTo: ['product-management'],
    stage: 3,
    label: 'Metrics & Analytics',
    mode: ROUND_MODES.MCQ,
    next: 'pm-stakeholder'
  },
  {
    id: 'pm-stakeholder',
    trackGroup: 'nonTech',
    appliesTo: ['product-management'],
    stage: 4,
    label: 'Stakeholder Simulation',
    mode: ROUND_MODES.PERSON,
    next: 'pm-reflection'
  },
  {
    id: 'pm-reflection',
    trackGroup: 'nonTech',
    appliesTo: ['product-management'],
    stage: 5,
    label: 'Execution Retrospective',
    mode: ROUND_MODES.ANALYSIS,
    optional: true
  },

  // --- UI / UX Design ---
  {
    id: 'ux-artifact-review',
    trackGroup: 'nonTech',
    appliesTo: ['ui-ux-design'],
    stage: 1,
    label: 'Portfolio / Artifact Review',
    mode: ROUND_MODES.CASE,
    next: 'ux-ux-case'
  },
  {
    id: 'ux-ux-case',
    trackGroup: 'nonTech',
    appliesTo: ['ui-ux-design'],
    stage: 2,
    label: 'UX Design Challenge',
    mode: ROUND_MODES.CASE,
    next: 'ux-usability'
  },
  {
    id: 'ux-usability',
    trackGroup: 'nonTech',
    appliesTo: ['ui-ux-design'],
    stage: 3,
    label: 'Interaction & Usability Critique',
    mode: ROUND_MODES.CASE,
    next: 'ux-accessibility'
  },
  {
    id: 'ux-accessibility',
    trackGroup: 'nonTech',
    appliesTo: ['ui-ux-design'],
    stage: 4,
    label: 'Accessibility & Systems',
    mode: ROUND_MODES.MCQ,
    next: 'ux-handoff'
  },
  {
    id: 'ux-handoff',
    trackGroup: 'nonTech',
    appliesTo: ['ui-ux-design'],
    stage: 5,
    label: 'Collaboration & Handoff',
    mode: ROUND_MODES.PERSON,
    next: 'ux-reflection'
  },
  {
    id: 'ux-reflection',
    trackGroup: 'nonTech',
    appliesTo: ['ui-ux-design'],
    stage: 6,
    label: 'Design Growth Plan',
    mode: ROUND_MODES.ANALYSIS,
    optional: true
  },

  // --- Leadership / Management ---
  {
    id: 'lead-situational',
    trackGroup: 'nonTech',
    appliesTo: ['leadership'],
    stage: 1,
    label: 'Situational Judgment',
    mode: ROUND_MODES.SCENARIO,
    next: 'lead-people'
  },
  {
    id: 'lead-people',
    trackGroup: 'nonTech',
    appliesTo: ['leadership'],
    stage: 2,
    label: 'People Management Scenarios',
    mode: ROUND_MODES.SCENARIO,
    next: 'lead-strategy'
  },
  {
    id: 'lead-strategy',
    trackGroup: 'nonTech',
    appliesTo: ['leadership'],
    stage: 3,
    label: 'Vision & Strategy Pitch',
    mode: ROUND_MODES.PITCH,
    next: 'lead-crisis'
  },
  {
    id: 'lead-crisis',
    trackGroup: 'nonTech',
    appliesTo: ['leadership'],
    stage: 4,
    label: 'Risk & Crisis Simulation',
    mode: ROUND_MODES.SCENARIO,
    next: 'lead-person'
  },
  {
    id: 'lead-person',
    trackGroup: 'nonTech',
    appliesTo: ['leadership'],
    stage: 5,
    label: 'Leadership Style Interview',
    mode: ROUND_MODES.PERSON,
    next: 'lead-reflection'
  },
  {
    id: 'lead-reflection',
    trackGroup: 'nonTech',
    appliesTo: ['leadership'],
    stage: 6,
    label: 'Leadership Reflection',
    mode: ROUND_MODES.ANALYSIS,
    optional: true
  }
];

// Helpers
export const getRoundsForTrack = (trackKey) => rounds
  .filter(r => !r.appliesTo || r.appliesTo.includes(trackKey))
  .sort((a,b) => a.stage - b.stage);

export const getRoundById = (id) => rounds.find(r => r.id === id);

export const getNextRound = (id) => {
  const current = getRoundById(id);
  if (!current || !current.next) return null;
  return getRoundById(current.next) || null;
};

export const implementedModes = new Set([
  ROUND_MODES.MCQ,
  ROUND_MODES.CODING,
  ROUND_MODES.PERSON
]); // others currently placeholders

export const isModeImplemented = (mode) => implementedModes.has(mode);

// Local persistence helpers (simple localStorage layer)
const KEY = 'ami_round_progress_v1';
export const loadProgress = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
};
export const saveProgress = (data) => {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
};

export const markRoundComplete = (userId, roundId) => {
  const prog = loadProgress();
  if (!prog[userId]) prog[userId] = { completed: {}, lastUpdated: Date.now() };
  prog[userId].completed[roundId] = Date.now();
  prog[userId].lastUpdated = Date.now();
  saveProgress(prog);
};

export const hasCompleted = (userId, roundId) => {
  const prog = loadProgress();
  return !!prog[userId]?.completed?.[roundId];
};

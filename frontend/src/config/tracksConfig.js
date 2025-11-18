// Centralized tracks configuration extracted from MockInterviews for reuse
export const tracksConfig = {
  tech: [
    {
      key: 'software-engineering',
      title: 'Software Engineering',
      desc: 'Coding, system design & problem solving',
      category: 'Tech',
      img: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=400',
      subTopics: [
        { name: 'DSA', desc: 'Data Structures & Algorithms' },
        { name: 'System Design', desc: 'High-level architecture' },
        { name: 'OOP', desc: 'Object oriented principles' },
        { name: 'Concurrency', desc: 'Threads, locks & scalability' },
        { name: 'Testing', desc: 'Unit, integration & best practices' },
        { name: 'Databases', desc: 'SQL vs NoSQL & indexing' },
        { name: 'APIs & REST', desc: 'Designing robust APIs' },
        { name: 'DevOps Basics', desc: 'CI/CD & deployment concepts' }
      ]
    },
    {
      key: 'cybersecurity',
      title: 'Cybersecurity',
      desc: 'Security fundamentals & threat analysis',
      category: 'Tech',
      img: 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5',
      subTopics: [
        { name: 'Network Security', desc: 'Protocols & defense' },
        { name: 'Threat Modeling', desc: 'Vulnerabilities & risks' },
        { name: 'Cryptography', desc: 'Encryption basics' },
        { name: 'Incident Response', desc: 'Detection & mitigation' },
        { name: 'Authentication', desc: 'Identity & access control' },
        { name: 'Web App Security', desc: 'OWASP & exploitation patterns' }
      ]
    },
    {
      key: 'data-science',
      title: 'Data Science',
      desc: 'ML, analytics & data pipelines',
      category: 'Tech',
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
      subTopics: [
        { name: 'SQL', desc: 'Queries & optimization' },
        { name: 'Statistics', desc: 'Inference & probability' },
        { name: 'ML Models', desc: 'Core algorithms' },
        { name: 'Feature Engineering', desc: 'Data cleaning & prep' },
        { name: 'Python/R', desc: 'Data manipulation' },
        { name: 'Visualization', desc: 'Insights & storytelling' }
      ]
    }
  ],
  nonTech: [
    {
      key: 'product-management',
      title: 'Product Management',
      desc: 'Strategy, prioritization & delivery',
      category: 'Non-Tech',
      img: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400',
      subTopics: [
        { name: 'Product Strategy', desc: 'Vision & roadmap' },
        { name: 'User Research', desc: 'Feedback & insights' },
        { name: 'Metrics', desc: 'KPIs & analytics' },
        { name: 'Prioritization', desc: 'Frameworks & trade-offs' },
        { name: 'Go-To-Market', desc: 'Launch planning' }
      ]
    },
    {
      key: 'ui-ux-design',
      title: 'UI/UX Design',
      desc: 'User-centered creative design',
      category: 'Non-Tech',
      img: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
      subTopics: [
        { name: 'Design Systems', desc: 'Consistency & components' },
        { name: 'User Research', desc: 'Testing & validation' },
        { name: 'Prototyping', desc: 'Wireframes & flows' },
        { name: 'Accessibility', desc: 'Inclusive design' },
        { name: 'Interaction Design', desc: 'Micro-interactions & feedback' }
      ]
    },
    {
      key: 'leadership',
      title: 'Management & Leadership',
      desc: 'Team dynamics, communication & growth',
      category: 'Non-Tech',
      img: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400',
      subTopics: [
        { name: 'Team Building', desc: 'Hiring & culture' },
        { name: 'Conflict Resolution', desc: 'Healthy collaboration' },
        { name: 'Performance', desc: 'Goals & reviews' },
        { name: 'Stakeholder Management', desc: 'Alignment & communication' },
        { name: 'Leadership Styles', desc: 'Coaching & empowerment' }
      ]
    }
  ]
};

export const getTrackByKey = (key) => {
  return tracksConfig.tech.concat(tracksConfig.nonTech).find(t => t.key === key) || null;
};

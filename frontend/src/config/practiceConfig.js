// Practice Domains and Topics Configuration
export const practiceDomains = [
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    description: 'Coding, system design & problem solving',
    icon: '💻',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
    gradient: 'from-blue-600 to-blue-700',
    topics: [
      'DSA',
      'System Design',
      'OOP',
      'Database Design',
      'API Design',
      'Testing',
      'Design Patterns',
      'Algorithms'
    ],
    languages: [
      'JavaScript',
      'Python',
      'Java',
      'C++',
      'C#',
      'Go',
      'Rust',
      'TypeScript'
    ]
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Security fundamentals & threat analysis',
    icon: '🔒',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=200&fit=crop',
    gradient: 'from-red-600 to-red-700',
    topics: [
      'Network Security',
      'Threat Modeling',
      'Cryptography',
      'Penetration Testing',
      'Security Protocols',
      'Incident Response'
    ],
    languages: [
      'Python',
      'Bash',
      'PowerShell',
      'C',
      'Assembly'
    ]
  },
  {
    id: 'data-science',
    title: 'Data Science',
    description: 'ML, analytics & data pipelines',
    icon: '📊',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
    gradient: 'from-purple-600 to-purple-700',
    topics: [
      'SQL',
      'Statistics',
      'ML Models',
      'Data Visualization',
      'Feature Engineering',
      'Deep Learning'
    ],
    languages: [
      'Python',
      'R',
      'SQL',
      'Julia',
      'Scala'
    ]
  },
  {
    id: 'web-development',
    title: 'Web Development',
    description: 'Frontend & backend development',
    icon: '🌐',
    image: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400&h=200&fit=crop',
    gradient: 'from-green-600 to-green-700',
    topics: [
      'React',
      'Node.js',
      'REST APIs',
      'GraphQL',
      'Authentication',
      'State Management',
      'Performance',
      'Security'
    ],
    languages: [
      'JavaScript',
      'TypeScript',
      'HTML/CSS',
      'PHP',
      'Ruby'
    ]
  },
  {
    id: 'mobile-development',
    title: 'Mobile Development',
    description: 'iOS & Android app development',
    icon: '📱',
    image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=200&fit=crop',
    gradient: 'from-indigo-600 to-indigo-700',
    topics: [
      'React Native',
      'Flutter',
      'iOS Development',
      'Android Development',
      'UI/UX',
      'Mobile Security'
    ],
    languages: [
      'JavaScript',
      'Dart',
      'Swift',
      'Kotlin',
      'Java'
    ]
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    description: 'Infrastructure & deployment',
    icon: '☁️',
    image: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400&h=200&fit=crop',
    gradient: 'from-cyan-600 to-cyan-700',
    topics: [
      'Docker',
      'Kubernetes',
      'CI/CD',
      'AWS',
      'Azure',
      'Monitoring',
      'Infrastructure as Code'
    ],
    languages: [
      'Bash',
      'Python',
      'YAML',
      'Terraform',
      'PowerShell'
    ]
  }
];

export const difficultyLevels = [
  { value: 'easy', label: 'Easy', color: 'green' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'hard', label: 'Hard', color: 'red' }
];

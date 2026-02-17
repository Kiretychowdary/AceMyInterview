// Programming Languages for individual practice
export const programmingLanguages = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: '⚡',
    color: 'from-yellow-400 to-yellow-600',
    description: 'Web development & frontend',
    topics: ['ES6+', 'Async/Await', 'DOM', 'Closures', 'Promises', 'Event Loop'],
    difficulty: 'Beginner to Advanced'
  },
  {
    id: 'python',
    name: 'Python',
    icon: '🐍',
    color: 'from-blue-500 to-blue-700',
    description: 'Data Science & Backend',
    topics: ['OOP', 'Decorators', 'Generators', 'List Comprehensions', 'Django', 'Flask'],
    difficulty: 'Beginner to Advanced'
  },
  {
    id: 'java',
    name: 'Java',
    icon: '☕',
    color: 'from-red-500 to-orange-600',
    description: 'Enterprise & Android',
    topics: ['OOP', 'Multithreading', 'Collections', 'Spring Boot', 'JVM', 'Streams API'],
    difficulty: 'Intermediate to Advanced'
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: '⚙️',
    color: 'from-blue-600 to-purple-600',
    description: 'System programming & DSA',
    topics: ['STL', 'Pointers', 'Templates', 'Memory Management', 'OOP', 'Smart Pointers'],
    difficulty: 'Intermediate to Advanced'
  },
  {
    id: 'csharp',
    name: 'C#',
    icon: '💎',
    color: 'from-purple-500 to-purple-700',
    description: '.NET & Game Development',
    topics: ['LINQ', 'Async/Await', '.NET Core', 'Entity Framework', 'Unity', 'Delegates'],
    difficulty: 'Intermediate to Advanced'
  },
  {
    id: 'go',
    name: 'Go',
    icon: '🚀',
    color: 'from-cyan-500 to-blue-600',
    description: 'Cloud native & microservices',
    topics: ['Goroutines', 'Channels', 'Interfaces', 'Error Handling', 'Concurrency', 'REST APIs'],
    difficulty: 'Intermediate'
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: '🦀',
    color: 'from-orange-600 to-red-700',
    description: 'Systems & performance',
    topics: ['Ownership', 'Borrowing', 'Lifetimes', 'Traits', 'Error Handling', 'Unsafe Code'],
    difficulty: 'Advanced'
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: '📘',
    color: 'from-blue-600 to-blue-800',
    description: 'Type-safe JavaScript',
    topics: ['Types', 'Interfaces', 'Generics', 'Decorators', 'Modules', 'Advanced Types'],
    difficulty: 'Intermediate'
  },
  {
    id: 'swift',
    name: 'Swift',
    icon: '🍎',
    color: 'from-orange-500 to-red-600',
    description: 'iOS & macOS development',
    topics: ['Optionals', 'Closures', 'SwiftUI', 'Protocols', 'ARC', 'Combine'],
    difficulty: 'Intermediate'
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    icon: '🎯',
    color: 'from-purple-600 to-pink-600',
    description: 'Android & multiplatform',
    topics: ['Null Safety', 'Coroutines', 'Extension Functions', 'Data Classes', 'Lambdas', 'Flows'],
    difficulty: 'Intermediate'
  },
  {
    id: 'ruby',
    name: 'Ruby',
    icon: '💎',
    color: 'from-red-600 to-pink-600',
    description: 'Web development & scripting',
    topics: ['Blocks', 'Procs', 'Rails', 'Metaprogramming', 'Modules', 'Gems'],
    difficulty: 'Beginner to Intermediate'
  },
  {
    id: 'php',
    name: 'PHP',
    icon: '🐘',
    color: 'from-indigo-600 to-purple-700',
    description: 'Server-side web development',
    topics: ['OOP', 'Laravel', 'Composer', 'Namespaces', 'Traits', 'MySQL Integration'],
    difficulty: 'Beginner to Intermediate'
  }
];

// Frameworks and Tools
export const frameworksAndTools = [
  {
    id: 'react',
    name: 'React',
    icon: '⚛️',
    color: 'from-cyan-400 to-blue-600',
    description: 'Frontend library',
    topics: ['Hooks', 'Context API', 'Redux', 'React Router', 'Performance', 'Testing'],
    category: 'Frontend'
  },
  {
    id: 'angular',
    name: 'Angular',
    icon: '🅰️',
    color: 'from-red-600 to-red-800',
    description: 'Full-featured framework',
    topics: ['Components', 'Services', 'RxJS', 'Routing', 'Forms', 'Dependency Injection'],
    category: 'Frontend'
  },
  {
    id: 'vue',
    name: 'Vue.js',
    icon: '💚',
    color: 'from-green-500 to-emerald-700',
    description: 'Progressive framework',
    topics: ['Composition API', 'Vuex', 'Vue Router', 'Directives', 'Reactivity', 'Components'],
    category: 'Frontend'
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    icon: '💚',
    color: 'from-green-600 to-green-800',
    description: 'JavaScript runtime',
    topics: ['Express', 'Event Loop', 'Streams', 'NPM', 'Middleware', 'REST APIs'],
    category: 'Backend'
  },
  {
    id: 'django',
    name: 'Django',
    icon: '🎸',
    color: 'from-green-700 to-teal-800',
    description: 'Python web framework',
    topics: ['ORM', 'Views', 'Templates', 'Authentication', 'REST Framework', 'Admin Panel'],
    category: 'Backend'
  },
  {
    id: 'spring',
    name: 'Spring Boot',
    icon: '🍃',
    color: 'from-green-600 to-green-900',
    description: 'Java framework',
    topics: ['Dependency Injection', 'REST APIs', 'JPA', 'Security', 'Microservices', 'Testing'],
    category: 'Backend'
  },
  {
    id: 'docker',
    name: 'Docker',
    icon: '🐳',
    color: 'from-blue-500 to-blue-700',
    description: 'Containerization',
    topics: ['Containers', 'Images', 'Dockerfile', 'Docker Compose', 'Networking', 'Volumes'],
    category: 'DevOps'
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes',
    icon: '☸️',
    color: 'from-blue-600 to-indigo-700',
    description: 'Container orchestration',
    topics: ['Pods', 'Services', 'Deployments', 'ConfigMaps', 'Ingress', 'Helm'],
    category: 'DevOps'
  },
  {
    id: 'aws',
    name: 'AWS',
    icon: '☁️',
    color: 'from-orange-500 to-yellow-600',
    description: 'Cloud platform',
    topics: ['EC2', 'S3', 'Lambda', 'RDS', 'CloudFormation', 'IAM'],
    category: 'Cloud'
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: '🍃',
    color: 'from-green-600 to-green-800',
    description: 'NoSQL database',
    topics: ['CRUD', 'Aggregation', 'Indexing', 'Replication', 'Sharding', 'Schema Design'],
    category: 'Database'
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    icon: '🐘',
    color: 'from-blue-700 to-indigo-800',
    description: 'Relational database',
    topics: ['SQL', 'Joins', 'Indexing', 'Transactions', 'Views', 'Performance Tuning'],
    category: 'Database'
  },
  {
    id: 'git',
    name: 'Git',
    icon: '📦',
    color: 'from-orange-600 to-red-600',
    description: 'Version control',
    topics: ['Branching', 'Merging', 'Rebasing', 'Workflows', 'Conflicts', 'GitHub Actions'],
    category: 'Tools'
  }
];

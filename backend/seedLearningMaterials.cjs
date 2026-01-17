// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

/**
 * Seed Learning Materials for RAG System
 * Populates database with learning content for each topic
 */

require('dotenv').config();
const mongoose = require('mongoose');
const LearningMaterial = require('./models/LearningMaterial.cjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/acemyinterview';

const learningMaterials = [
  // Data Structures
  {
    topicId: 0,
    topicName: 'Data Structures',
    materialType: 'concept',
    title: 'What are Data Structures?',
    content: 'Data structures are ways of organizing and storing data in a computer so that it can be accessed and modified efficiently. Common data structures include arrays, linked lists, stacks, queues, trees, and graphs. Each has its own strengths and use cases.',
    difficulty: 'beginner',
    keywords: ['data structures', 'arrays', 'linked lists', 'basics']
  },
  {
    topicId: 0,
    topicName: 'Data Structures',
    materialType: 'tip',
    title: 'Choosing the Right Data Structure',
    content: 'When solving problems, ask yourself: Do I need fast insertion? Fast search? Order matters? This will guide your choice. Arrays for random access, LinkedLists for insertions, HashMaps for lookups.',
    difficulty: 'intermediate',
    keywords: ['choosing', 'selection', 'problem solving']
  },
  
  // Algorithms
  {
    topicId: 1,
    topicName: 'Algorithms',
    materialType: 'concept',
    title: 'Introduction to Algorithms',
    content: 'An algorithm is a step-by-step procedure for solving a problem. Good algorithms are efficient, correct, and clear. Common algorithm types include sorting, searching, recursion, dynamic programming, and greedy algorithms.',
    difficulty: 'beginner',
    keywords: ['algorithms', 'problem solving', 'efficiency']
  },
  {
    topicId: 1,
    topicName: 'Algorithms',
    materialType: 'tip',
    title: 'Time Complexity Basics',
    content: 'Always analyze time complexity using Big O notation. O(1) is constant, O(log n) is logarithmic, O(n) is linear, O(n log n) is linearithmic, O(n²) is quadratic. Aim for the most efficient solution.',
    difficulty: 'intermediate',
    keywords: ['time complexity', 'big o', 'efficiency', 'optimization']
  },
  {
    topicId: 1,
    topicName: 'Algorithms',
    materialType: 'common_mistake',
    title: 'Off-by-One Errors',
    content: 'Be careful with array indices and loop boundaries. Common mistakes include: using length instead of length-1, wrong loop conditions (< vs <=), and incorrect middle calculations in binary search.',
    difficulty: 'beginner',
    keywords: ['mistakes', 'debugging', 'loops', 'arrays']
  },

  // OOP
  {
    topicId: 2,
    topicName: 'Object-Oriented Programming',
    materialType: 'concept',
    title: 'Four Pillars of OOP',
    content: 'OOP is built on four main principles: 1) Encapsulation - bundling data and methods, 2) Inheritance - creating new classes from existing ones, 3) Polymorphism - objects taking many forms, 4) Abstraction - hiding complex implementation details.',
    difficulty: 'beginner',
    keywords: ['oop', 'encapsulation', 'inheritance', 'polymorphism', 'abstraction']
  },

  // Database Management
  {
    topicId: 3,
    topicName: 'Database Management',
    materialType: 'concept',
    title: 'SQL vs NoSQL',
    content: 'SQL databases (MySQL, PostgreSQL) use structured schemas and tables with ACID properties. NoSQL databases (MongoDB, Cassandra) are schema-flexible and horizontally scalable. Choose SQL for complex queries and transactions, NoSQL for flexibility and scale.',
    difficulty: 'intermediate',
    keywords: ['sql', 'nosql', 'database', 'mongodb', 'mysql']
  },
  {
    topicId: 3,
    topicName: 'Database Management',
    materialType: 'tip',
    title: 'Database Normalization',
    content: 'Normalization reduces data redundancy. 1NF: atomic values, 2NF: no partial dependencies, 3NF: no transitive dependencies. However, sometimes denormalization is used for performance in read-heavy applications.',
    difficulty: 'advanced',
    keywords: ['normalization', 'database design', 'optimization']
  },

  // Web Development
  {
    topicId: 4,
    topicName: 'Web Development',
    materialType: 'concept',
    title: 'Frontend vs Backend',
    content: 'Frontend handles what users see and interact with (HTML, CSS, JavaScript, React). Backend manages data, logic, and servers (Node.js, Python, databases). Full-stack developers work on both sides.',
    difficulty: 'beginner',
    keywords: ['web development', 'frontend', 'backend', 'full stack']
  },
  {
    topicId: 4,
    topicName: 'Web Development',
    materialType: 'tip',
    title: 'RESTful API Best Practices',
    content: 'Use proper HTTP methods: GET for reading, POST for creating, PUT/PATCH for updating, DELETE for removing. Use meaningful URLs, proper status codes, and consistent naming. Always handle errors gracefully.',
    difficulty: 'intermediate',
    keywords: ['rest api', 'http', 'api design', 'best practices']
  },

  // Software Engineering
  {
    topicId: 5,
    topicName: 'Software Engineering',
    materialType: 'concept',
    title: 'SOLID Principles',
    content: 'SOLID principles guide good OOP design: Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion. These principles help create maintainable, flexible code.',
    difficulty: 'intermediate',
    keywords: ['solid', 'design principles', 'software engineering', 'clean code']
  },

  // Operating Systems
  {
    topicId: 6,
    topicName: 'Operating Systems',
    materialType: 'concept',
    title: 'Process vs Thread',
    content: 'A process is an independent program execution with its own memory space. A thread is a lightweight process that shares memory with other threads in the same process. Threads enable concurrent execution.',
    difficulty: 'intermediate',
    keywords: ['process', 'thread', 'concurrency', 'multithreading']
  },

  // Computer Networks
  {
    topicId: 7,
    topicName: 'Computer Networks',
    materialType: 'concept',
    title: 'OSI Model Layers',
    content: 'The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application. Each layer has specific responsibilities in network communication. TCP/IP model is a simplified 4-layer version.',
    difficulty: 'intermediate',
    keywords: ['osi model', 'networking', 'tcp/ip', 'layers']
  },

  // Machine Learning
  {
    topicId: 8,
    topicName: 'Machine Learning',
    materialType: 'concept',
    title: 'Supervised vs Unsupervised Learning',
    content: 'Supervised learning uses labeled data to train models (classification, regression). Unsupervised learning finds patterns in unlabeled data (clustering, dimensionality reduction). Reinforcement learning learns through rewards.',
    difficulty: 'intermediate',
    keywords: ['machine learning', 'supervised', 'unsupervised', 'ai']
  },

  // Cloud Computing
  {
    topicId: 9,
    topicName: 'Cloud Computing',
    materialType: 'concept',
    title: 'IaaS, PaaS, SaaS',
    content: 'IaaS (Infrastructure as a Service) provides virtual machines and storage. PaaS (Platform as a Service) offers development platforms. SaaS (Software as a Service) delivers ready-to-use applications. Examples: AWS EC2 (IaaS), Heroku (PaaS), Gmail (SaaS).',
    difficulty: 'beginner',
    keywords: ['cloud', 'iaas', 'paas', 'saas', 'aws']
  }
];

async function seedLearningMaterials() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('\n📚 Seeding learning materials...');
    
    // Clear existing materials
    await LearningMaterial.deleteMany({});
    console.log('✓ Cleared existing materials');

    // Insert new materials
    await LearningMaterial.insertMany(learningMaterials);
    console.log(`✅ Inserted ${learningMaterials.length} learning materials`);

    // Display summary
    const topicCounts = await LearningMaterial.aggregate([
      { $group: { _id: '$topicName', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    console.log('\n📊 Materials by Topic:');
    topicCounts.forEach(t => {
      console.log(`  - ${t._id}: ${t.count} materials`);
    });

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedLearningMaterials();

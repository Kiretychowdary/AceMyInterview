// TEMPORARY LOCAL MCQ SERVICE - IMMEDIATE FIX FOR CORS ISSUE
// This provides immediate functionality while backend CORS is being fixed

export class LocalMCQService {
  static async generateMCQQuestions(topic, difficulty = 'medium', count = 5) {
    console.log('🔄 Using Local MCQ Service due to CORS issue');
    
    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const questionBank = {
      'algorithms': {
        medium: [
          {
            question: "What is the time complexity of binary search in a sorted array?",
            options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
            correctAnswer: 1,
            explanation: "Binary search divides the search space in half with each comparison, resulting in O(log n) time complexity."
          },
          {
            question: "Which sorting algorithm has the best average-case time complexity?",
            options: ["Bubble Sort", "Selection Sort", "Merge Sort", "Insertion Sort"],
            correctAnswer: 2,
            explanation: "Merge Sort has O(n log n) average-case time complexity, which is optimal for comparison-based sorting."
          },
          {
            question: "What data structure is best for implementing a queue?",
            options: ["Array", "Linked List", "Stack", "Hash Table"],
            correctAnswer: 1,
            explanation: "Linked Lists provide O(1) insertion and deletion at both ends, making them ideal for queue implementation."
          },
          {
            question: "Which algorithm is used to find the shortest path in a weighted graph?",
            options: ["DFS", "BFS", "Dijkstra's Algorithm", "Quick Sort"],
            correctAnswer: 2,
            explanation: "Dijkstra's Algorithm finds the shortest path from a source vertex to all other vertices in a weighted graph."
          },
          {
            question: "What is the space complexity of a recursive factorial function?",
            options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
            correctAnswer: 2,
            explanation: "Each recursive call uses stack space, and there are n recursive calls, resulting in O(n) space complexity."
          }
        ]
      },
      'javascript': {
        medium: [
          {
            question: "What is the output of: console.log(typeof null)?",
            options: ["null", "undefined", "object", "boolean"],
            correctAnswer: 2,
            explanation: "This is a well-known JavaScript quirk. typeof null returns 'object' due to a bug in the original JavaScript implementation."
          },
          {
            question: "Which method is used to create a new array with all elements that pass a test?",
            options: ["map()", "filter()", "reduce()", "forEach()"],
            correctAnswer: 1,
            explanation: "The filter() method creates a new array with all elements that pass the test implemented by the provided function."
          },
          {
            question: "What does the 'this' keyword refer to in an arrow function?",
            options: ["The function itself", "The global object", "The lexical scope", "undefined"],
            correctAnswer: 2,
            explanation: "Arrow functions don't have their own 'this' binding. They inherit 'this' from the enclosing lexical scope."
          },
          {
            question: "Which statement about closures is correct?",
            options: [
              "Closures can only access global variables",
              "Closures have access to outer function variables even after the outer function returns",
              "Closures automatically prevent memory leaks", 
              "Closures are only available in ES6+"
            ],
            correctAnswer: 1,
            explanation: "Closures allow inner functions to access variables from outer functions even after the outer function has returned."
          },
          {
            question: "What is the difference between '==' and '===' in JavaScript?",
            options: [
              "No difference",
              "'==' checks type and value, '===' checks only value",
              "'==' performs type coercion, '===' checks type and value strictly",
              "They work the same for all data types"
            ],
            correctAnswer: 2,
            explanation: "'==' performs type coercion before comparison, while '===' compares both type and value without coercion."
          }
        ]
      },
      'react': {
        medium: [
          {
            question: "What is the purpose of useEffect in React?",
            options: [
              "To create state variables",
              "To handle side effects in functional components", 
              "To render JSX elements",
              "To create context providers"
            ],
            correctAnswer: 1,
            explanation: "useEffect is used to perform side effects in functional components, such as data fetching, subscriptions, or manually changing the DOM."
          },
          {
            question: "Which hook is used for state management in functional components?",
            options: ["useContext", "useState", "useEffect", "useReducer"],
            correctAnswer: 1,
            explanation: "useState is the primary hook for adding state to functional components in React."
          },
          {
            question: "What is the correct way to update state in React?",
            options: [
              "Directly modify the state variable",
              "Use the setState function provided by useState",
              "Assign a new value to the state",
              "Use global variables"
            ],
            correctAnswer: 1,
            explanation: "React state should always be updated using the setState function returned by useState to ensure proper re-rendering."
          },
          {
            question: "What is the virtual DOM in React?",
            options: [
              "A copy of the real DOM stored in memory",
              "A JavaScript representation of the DOM for efficient updates",
              "A browser API for DOM manipulation", 
              "A debugging tool for React"
            ],
            correctAnswer: 1,
            explanation: "The virtual DOM is a JavaScript representation of the real DOM that React uses to optimize updates and improve performance."
          },
          {
            question: "When does a React component re-render?",
            options: [
              "Every second automatically",
              "When state or props change",
              "Only when manually triggered",
              "When the page refreshes"
            ],
            correctAnswer: 1,
            explanation: "React components re-render when their state changes, when their props change, or when their parent component re-renders."
          }
        ]
      }
    };

    // Get questions for the topic or use a default topic
    const topicLower = topic.toLowerCase();
    let selectedQuestions = questionBank[topicLower]?.[difficulty] || questionBank['algorithms'][difficulty];
    
    // If we don't have enough questions, create dynamic ones
    if (!selectedQuestions || selectedQuestions.length < count) {
      selectedQuestions = this.generateDynamicQuestions(topic, difficulty, count);
    }
    
    // Shuffle and select the requested number of questions
    const shuffled = [...selectedQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    
    return {
      success: true,
      questions: selected,
      source: 'local-service',
      message: 'Using local questions while backend connects'
    };
  }

  static generateDynamicQuestions(topic, difficulty, count) {
    const questions = [];
    const questionTemplates = [
      {
        question: `What is the most important concept to understand in ${topic}?`,
        options: [
          "Basic syntax and structure",
          "Core principles and best practices",
          "Advanced optimization techniques", 
          "Historical development"
        ],
        correctAnswer: 1,
        explanation: `Understanding core principles and best practices is fundamental to mastering ${topic}.`
      },
      {
        question: `Which approach is recommended for learning ${topic} effectively?`,
        options: [
          "Memorizing all syntax",
          "Reading documentation only",
          "Hands-on practice with projects",
          "Watching videos exclusively"
        ],
        correctAnswer: 2,
        explanation: `Hands-on practice with real projects is the most effective way to learn ${topic}.`
      },
      {
        question: `What should be prioritized when working with ${topic}?`,
        options: [
          "Writing code as fast as possible",
          "Code readability and maintainability",
          "Using the latest features only",
          "Avoiding all documentation"
        ],
        correctAnswer: 1,
        explanation: `Code readability and maintainability are crucial for successful ${topic} development.`
      },
      {
        question: `Which practice helps improve ${topic} development skills?`,
        options: [
          "Working in isolation",
          "Never asking questions", 
          "Regular code review and feedback",
          "Avoiding challenging problems"
        ],
        correctAnswer: 2,
        explanation: `Regular code review and feedback from peers significantly improves ${topic} development skills.`
      },
      {
        question: `What is a common mistake when learning ${topic}?`,
        options: [
          "Practicing too much",
          "Reading too much documentation",
          "Skipping fundamental concepts",
          "Asking too many questions"
        ],
        correctAnswer: 2,
        explanation: `Skipping fundamental concepts leads to gaps in understanding that can cause problems later in ${topic} development.`
      }
    ];

    for (let i = 0; i < count; i++) {
      questions.push({
        ...questionTemplates[i % questionTemplates.length],
        id: `local_${topic}_${i}`,
        topic: topic,
        difficulty: difficulty
      });
    }

    return questions;
  }
}

export default LocalMCQService;

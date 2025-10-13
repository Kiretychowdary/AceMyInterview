// MMKRSPVLIDATAPERMANENT
// ExploreSolutions.jsx
// This component displays your interview platform's solution cards in a modern grid UI with a button on each card.

 
// import { motion } from 'framer-motion';
// import image from '../assets/image.png';
// import { Link } from 'react-router-dom';

// const solutions = [
//   {
//     title: "Tech Interviews",
//     desc: "Land top dev jobs with AI-powered software mock interviews.",
//     img: "https://www.simplilearn.com/ice9/free_resources_article_thumb/What_is_System_Software.jpg",
//   },
//   {
//     title: "Management Interviews",
//     desc: "Sharpen your management skills with realistic interview scenarios.",
//     img: "https://www.thebalancemoney.com/thmb/L1afcW7tPZ63D1xMRKfTTWPBUBQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/manager-interview-questions-and-best-answers-2061211-edit-088ce7c034524e5cbdc0ad763a46f5b4.jpg",
//   },
//   {
//     title: "General Interviews",
//     desc: "Prepare for HR and general interviews with expert guidance.",
//     img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcd0Y8zVHxjvcUqPP6ZD828gPy8ykh_0urOxeA25jBkau-g5d4OiVez7x7aijzEFCSPFs&usqp=CAU",
//   },
//   {
//     title: "System Design",
//     desc: "Design better systems with a simplified approach.",
//     img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThyjZhmghu7ywaP2RLS1OJWqkN-OwG2hKW8A&s",
//   },
//   {
//     title: "CS Subjects",
//     desc: "Ace interviews with expert insights on core CS topics.",
//     img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgOfaiWs_QsM-VLpEe6l8XtaAVAS4JZ7KYlA&s",
//   },
//   {
//     title: "Interview Experience",
//     desc: "Learn from others' experiences to ace interviews.",
//     img: image,
//   },
// ];

// MMKRSPVLIDATAPERMANENT
// ExploreSolutions.jsx
// This component displays your interview platform's solution cards in a modern grid UI with a button on each card.

import React from 'react';
import { motion } from 'framer-motion';
import image from '../assets/image.png';
import { Link } from 'react-router-dom';

const solutions = [
  {
    title: "Technical Interviews",
    desc: "Master coding challenges with AI-powered mock interviews for software engineering roles.",
    img: "https://www.simplilearn.com/ice9/free_resources_article_thumb/What_is_System_Software.jpg",
    category: "Programming",
    difficulty: "Advanced"
  },
  {
    title: "Management Interviews", 
    desc: "Excel in leadership roles with behavioral and management scenario practice.",
    img: "https://www.thebalancemoney.com/thmb/L1afcW7tPZ63D1xMRKfTTWPBUBQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/manager-interview-questions-and-best-answers-2061211-edit-088ce7c034524e5cbdc0ad763a46f5b4.jpg",
    category: "Leadership",
    difficulty: "Intermediate"
  },
  {
    title: "HR & Behavioral",
    desc: "Prepare for HR rounds and behavioral questions with expert-curated scenarios.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcd0Y8zVHxjvcUqPP6ZD828gPy8ykh_0urOxeA25jBkau-g5d4OiVez7x7aijzEFCSPFs&usqp=CAU",
    category: "Soft Skills",
    difficulty: "Beginner"
  },
  {
    title: "System Design",
    desc: "Design scalable systems with our comprehensive system design interview preparation.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThyjZhmghu7ywaP2RLS1OJWqkN-OwG2hKW8A&s",
    category: "Architecture",
    difficulty: "Expert"
  },
  {
    title: "CS Fundamentals",
    desc: "Master core computer science concepts essential for technical interviews.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgOfaiWs_QsM-VLpEe6l8XtaAVAS4JZ7KYlA&s",
    category: "Theory",
    difficulty: "Intermediate"
  },
  {
    title: "Interview Experiences",
    desc: "Learn from real interview experiences and success stories from top companies.",
    img: image,
    category: "Insights",
    difficulty: "All Levels"
  },
];

const ExploreSolutions = () => (
  <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-16 sm:py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-6 py-3 mb-6">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          <span className="font-bold text-lg">@AceMyInterview Resources</span>
        </div>
        
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
          Learn & Master
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Interview Excellence
          </span>
        </h2>
        
        <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Comprehensive resources designed by industry experts to help you succeed in every type of interview. 
          <span className="text-blue-600 font-semibold"> Trusted by thousands of successful candidates worldwide.</span>
        </p>
      </motion.div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {solutions.map((sol, idx) => (
          <motion.div
            key={idx}
            className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ y: -8 }}
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-transparent rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
            
            {/* Category Badge */}
            <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm font-semibold mb-6">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              {sol.category}
            </div>

            {/* Icon */}
            <div className="relative w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <img 
                src={sol.img} 
                alt={sol.title} 
                className="w-10 h-10 object-contain rounded-lg" 
              />
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
              {sol.title}
            </h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              {sol.desc}
            </p>

            {/* Difficulty Badge */}
            <div className="flex items-center justify-between mb-6">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                sol.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                sol.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
                sol.difficulty === 'Advanced' ? 'bg-orange-100 text-orange-700' :
                sol.difficulty === 'Expert' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {sol.difficulty}
              </span>
            </div>

            {/* CTA Button */}
            <Link
              to="/mock-interviews"
              className="group/btn inline-flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <svg
                className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Start Learning
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Bottom CTA */}
      <motion.div
        className="text-center mt-16"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        viewport={{ once: true }}
      >
        <div className="bg-blue-600 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700"></div>
          <div className="relative z-10">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">
              Ready to Ace Your Next Interview?
            </h3>
            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
              Join thousands of successful candidates who used @AceMyInterview to land their dream jobs.
            </p>
            <Link
              to="/mock-interviews"
              className="inline-flex items-center gap-3 bg-white text-blue-600 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <svg
                height="20"
                width="20"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
              </svg>
              Get Started Now - It's Free!
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default ExploreSolutions;
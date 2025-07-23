// MMKRSPVLIDATAPERMANENT
// ExploreSolutions.jsx
// This component displays your interview platform's solution cards in a modern grid UI with a button on each card.

import React from 'react';
import { motion } from 'framer-motion';
import image from '../assets/image.png';
import { Link } from 'react-router-dom';

const solutions = [
  {
    title: "Tech Interviews",
    desc: "Land top dev jobs with AI-powered software mock interviews.",
    img: "https://www.simplilearn.com/ice9/free_resources_article_thumb/What_is_System_Software.jpg",
  },
  {
    title: "Management Interviews",
    desc: "Sharpen your management skills with realistic interview scenarios.",
    img: "https://www.thebalancemoney.com/thmb/L1afcW7tPZ63D1xMRKfTTWPBUBQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/manager-interview-questions-and-best-answers-2061211-edit-088ce7c034524e5cbdc0ad763a46f5b4.jpg",
  },
  {
    title: "General Interviews",
    desc: "Prepare for HR and general interviews with expert guidance.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcd0Y8zVHxjvcUqPP6ZD828gPy8ykh_0urOxeA25jBkau-g5d4OiVez7x7aijzEFCSPFs&usqp=CAU",
  },
  {
    title: "System Design",
    desc: "Design better systems with a simplified approach.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThyjZhmghu7ywaP2RLS1OJWqkN-OwG2hKW8A&s",
  },
  {
    title: "CS Subjects",
    desc: "Ace interviews with expert insights on core CS topics.",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgOfaiWs_QsM-VLpEe6l8XtaAVAS4JZ7KYlA&s",
  },
  {
    title: "Interview Experience",
    desc: "Learn from others' experiences to ace interviews.",
    img: image,
  },
];

const ExploreSolutions = () => (
  <section className="min-h-screen bg-white/95 border-b border-gray-200 shadow-lg py-8 sm:py-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-8 sm:mb-12 px-2">
      Resources to Learn & Ace Interviews
    </h2>
    <div className="max-w-6xl mx-auto grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 px-2 sm:px-4 pb-8">
      {solutions.map((sol, idx) => (
        <div
          key={idx}
          className="rounded-xl p-4 sm:p-6 md:p-8 flex flex-col items-center shadow-lg hover:scale-105 transition bg-white border border-gray-200 w-full"
        >
          <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center rounded-lg mb-3 sm:mb-4 md:mb-6 bg-blue-100 border border-blue-200">
            <img src={sol.img} alt={sol.title} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain" />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1 sm:mb-2 text-center">{sol.title}</h3>
          <p className="text-gray-600 text-center mb-2 sm:mb-4 text-xs sm:text-sm md:text-base">{sol.desc}</p>
          <motion.div
            className="mt-2 sm:mt-4 md:mt-6 w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/mock-interviews"
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 md:px-6 py-2 rounded-full bg-blue-700 text-white font-semibold shadow-lg hover:bg-blue-800 transition-all duration-300 text-xs sm:text-sm md:text-base"
              aria-label={`Explore ${sol.title}`}
            >
              <svg
                height="18"
                width="18"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
              </svg>
              Explore
            </Link>
          </motion.div>
        </div>
      ))}
    </div>
  </section>
);

export default ExploreSolutions;
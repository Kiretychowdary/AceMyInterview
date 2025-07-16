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
    img: image,
  },
  {
    title: "Management Interviews",
    desc: "Sharpen your management skills with realistic interview scenarios.",
    img: image,
  },
  {
    title: "General Interviews",
    desc: "Prepare for HR and general interviews with expert guidance.",
    img: image,
  },
  {
    title: "System Design",
    desc: "Design better systems with a simplified approach.",
    img: image,
  },
  {
    title: "CS Subjects",
    desc: "Ace interviews with expert insights on core CS topics.",
    img: image,
  },
  {
    title: "Interview Experience",
    desc: "Learn from others' experiences to ace interviews.",
    img: image,
  },
];

const ExploreSolutions = () => (
  <section className="min-h-screen bg-black py-12">
    <h2 className="text-4xl font-bold text-center text-white mb-12">
      Resources to Learn & Ace Interviews
    </h2>
    <div className="max-w-6xl h-screen mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 px-4">
      {solutions.map((sol, idx) => (
        <div
          key={idx}
          className="rounded-xl p-8  flex flex-col items-center shadow-lg hover:scale-105 transition bg-[#18191A]"
        >
          <div className="w-20 h-20 flex items-center justify-center rounded-lg mb-6 bg-gray-700">
            <img src={sol.img} alt={sol.title} className="w-12 h-12 object-contain" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 text-center">{sol.title}</h3>
          <p className="text-gray-200 text-center mb-4">{sol.desc}</p>
          <motion.div
            className="mt-6 w-full flex justify-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to="/mock-interviews"
              className="inline-flex items-center justify-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-base"
              aria-label={`Explore ${sol.title}`}
            >
              <svg
                height="22"
                width="22"
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
// NMKRSPVLIDATA
// NMKRSPVLIDATA

import React from 'react';
import image from '../assets/image.png';

const categories = [
  {
    name: 'Tech',
    cards: [{}, {}, {}],
  },
  {
    name: 'Management',
    cards: [{}, {}, {}],
  },
  {
    name: 'General',
    cards: [{}, {}, {}],
  },
];

const ExploreSolutions = () => (
  <section className="max-w-7xl mx-auto px-4 md:px-0 py-12">
    {/* NMKRSPVLIDATA */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl md:text-3xl font-bold">Explore our solutions</h2>
    </div>
    <div className="space-y-12">
      {categories.map((cat, idx) => (
        <div key={cat.name}>
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-2 text-lg font-semibold bg-blue-700 text-white px-5 py-1.5 rounded-full shadow">
              {cat.name}
            </span>
            <a
              href="mock-interviews"
              className="flex items-center gap-1 text-sm font-semibold px-4 py-2 rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700 transition"
            >
              Explore All <span aria-hidden>↗</span>
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {cat.cards.map((_, i) => (
              <div
                key={i}
                className="bg-[#232526] rounded-2xl shadow-xl border border-gray-800 overflow-hidden flex flex-col hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={image}
                  alt="Software Developer"
                  className="w-full h-40 object-cover"
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-1">
                    Software Developer
                  </h3>
                  <p className="text-gray-300 text-sm mb-4 flex-1">
                    Land top dev jobs with AI-powered software mock interview
                  </p>
                  <button className="mt-auto bg-blue-700 hover:bg-blue-800 text-white font-semibold px-4 py-2 rounded-full text-sm shadow transition">
                    Start interview
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ExploreSolutions;
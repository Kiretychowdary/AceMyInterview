// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import image from '../assets/image.png';

const mockData = [
    {
        title: 'Software Developer',
        desc: 'Land top dev jobs with AI-powered software mock interview',
        category: 'Tech',
        img: image,
        subTopics: [
            { name: 'DSA', desc: 'Data Structures & Algorithms' },
            { name: 'OOPS', desc: 'Object Oriented Programming' },
            { name: 'System Design', desc: 'System Design Concepts' },
        ],
    },
    {
        title: 'Cybersecurity',
        desc: 'Ace cybersecurity interviews with AI-powered practice',
        category: 'Tech',
        img: image,
        subTopics: [
            { name: 'Network Security', desc: 'Network Security Fundamentals' },
            { name: 'Ethical Hacking', desc: 'Ethical Hacking Concepts' },
            { name: 'Cryptography', desc: 'Cryptography Basics' },
        ],
    },
    {
        title: 'Data Analyst',
        desc: 'Nail your data analyst job with AI-powered mock interview',
        category: 'Tech',
        img: image,
    },
    {
        title: 'Product Manager',
        desc: 'Practice Product Manager interview, get job-ready with AI',
        category: 'Management',
        img: image,
    },
    {
        title: 'HR Interview',
        desc: 'Crack general HR interviews with mock practice',
        category: 'General',
        img: image,
    },
    {
        title: 'Project Coordinator',
        desc: 'Practice project-based management interview with AI',
        category: 'Management',
        img: image,
    },
    {
        title: 'System Admin',
        desc: 'System admin AI mock interview to secure infra jobs',
        category: 'Tech',
        img: image,
    },
];

// Helper to show only 2 cards per category on main grid
function getLimitedMockData(data, limitPerCategory = 2) {
    const grouped = {};
    data.forEach(item => {
        if (!grouped[item.category]) grouped[item.category] = [];
        if (grouped[item.category].length < limitPerCategory) {
            grouped[item.category].push(item);
        }
    });
    return Object.values(grouped).flat();
}

const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
};

const categories = ['All', 'Tech', 'Management', 'General'];

const MockInterviews = () => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showSubTopics, setShowSubTopics] = useState(false);
    const [selectedMock, setSelectedMock] = useState(null);
    const [selectedSubTopic, setSelectedSubTopic] = useState(null);
    const navigate = useNavigate();

    const limitedData =
        selectedCategory === 'All'
            ? getLimitedMockData(mockData)
            : mockData.filter((mock) => mock.category === selectedCategory);

    return (
        <div className="min-h-screen bg-white/95 border-b border-gray-200 shadow-lg text-gray-900 px-4 sm:px-10 md:px-16 py-10">
            {/* HEADER */}
            <motion.div
                className="max-w-3xl mb-10 mx-auto text-center"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-4xl font-extrabold mb-2 tracking-tight text-blue-700">AI-Powered Mock Interview</h2>
                <p className="mt-2 text-gray-700 text-lg">
                    Master your concepts with AI-Powered full-length mock tests for 360
                    <sup>o</sup> preparation!
                </p>
            </motion.div>

            {/* TAG FILTERS */}
            <div className="flex flex-wrap gap-3 mb-10 justify-center">
                {categories.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setSelectedCategory(tag)}
                        className={`px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow 
                            ${selectedCategory === tag
                                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                                : 'bg-white text-gray-800 hover:bg-gray-200'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* MOCK CARD GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                <AnimatePresence>
                    {limitedData.map((mock, idx) => (
                        <motion.div
                            key={mock.title + idx}
                            layout
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="bg-white border border-gray-200 text-gray-900 p-7 rounded-2xl shadow-lg hover:scale-105 transition min-h-[320px] flex flex-col justify-between"
                        >
                            <img
                                src={mock.img}
                                alt={mock.title}
                                className="rounded-lg h-32 w-full object-cover mb-4 border border-blue-100 bg-blue-50"
                            />
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <h3 className="text-xl font-bold mb-2 text-center text-blue-700">{mock.title}</h3>
                                <p className="text-base text-gray-700 text-center">{mock.desc}</p>
                            </div>
                            <div className="mt-6 text-center">
                                <button
                                    className="group relative bg-blue-700 border-none rounded-full px-6 py-2 text-white font-semibold shadow-lg hover:bg-blue-800 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    onClick={() => {
                                        setSelectedMock(mock);
                                        setShowSubTopics(true);
                                    }}
                                >
                                    Start Interview
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* SUB-TOPIC MODAL */}
            {showSubTopics && selectedMock && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    style={{ backdropFilter: 'blur(2px)' }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 40 }}
                        transition={{ duration: 0.35, type: 'spring' }}
                        className="relative rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 bg-gradient-to-br from-white to-purple-100 border border-purple-200"
                        style={{
                            minHeight: '340px',
                        }}
                    >
                        <button
                            className="absolute top-3 right-4 text-3xl text-gray-400 hover:text-red-500 transition"
                            onClick={() => setShowSubTopics(false)}
                            aria-label="Close"
                            style={{ fontWeight: 700, lineHeight: 1 }}
                        >
                            &times;
                        </button>
                        <div className="mb-4">
                            <h2 className="text-2xl font-extrabold text-center text-purple-700 mb-2">
                                Select Sub-Topic for {selectedMock.title}
                            </h2>
                            <p className="text-center text-gray-600 text-base">
                                Choose a sub-topic to start your personalized AI interview.
                            </p>
                        </div>
                        {/* SUB-TOPIC MODAL BUTTONS */}
                        <div className="flex flex-col gap-3">
                            {selectedMock.subTopics ? (
                                selectedMock.subTopics.map((sub) => (
                                    <button
                                        key={sub.name}
                                        className="w-full px-4 py-2 rounded-lg bg-blue-100 text-blue-900 font-semibold shadow hover:bg-blue-200 transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        onClick={() => {
                                            setShowSubTopics(false);
                                            navigate('/device-setup', { state: selectedMock.title });
                                        }}
                                    >
                                        {sub.name} <span className="text-xs text-gray-500">({sub.desc})</span>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-gray-500">No sub-topics available.</p>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MockInterviews;
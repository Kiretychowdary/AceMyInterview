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
        img: "https://www.simplilearn.com/ice9/free_resources_article_thumb/What_is_System_Software.jpg",
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
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_jvKBZOrTRmCR-BkOoZCVHuBm6UWhuOgFXg&s",
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
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT6EHMWSFxexj_Gh4nFO6gRciVeQ7fvPnNVgg&s",
    },
    {
        title: 'Product Manager',
        desc: 'Practice Product Manager interview, get job-ready with AI',
        category: 'Management',
        img: "https://www.thebalancemoney.com/thmb/L1afcW7tPZ63D1xMRKfTTWPBUBQ=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/manager-interview-questions-and-best-answers-2061211-edit-088ce7c034524e5cbdc0ad763a46f5b4.jpg",
    },
    {
        title: 'HR Interview',
        desc: 'Crack general HR interviews with mock practice',
        category: 'General',
        img: "data:image/jpeg;base64,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",
    },
    {
        title: 'Project Coordinator',
        desc: 'Practice project-based management interview with AI',
        category: 'Management',
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_HuYeAwQFJpPVLrczDUWbgV-SqCv8MJooxA&s",
    },
    {
        title: 'System Admin',
        desc: 'System admin AI mock interview to secure infra jobs',
        category: 'Tech',
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThyjZhmghu7ywaP2RLS1OJWqkN-OwG2hKW8A&s",
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
                                            // Navigate to InterviewModeSelect page, passing subject/sub-topic
                                            navigate('/interview-mode', { state: { subject: sub.name } });
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
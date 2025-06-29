// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import image from '../assets/image.png';
import InterviewCategoryFlow from '../components/InterviewCategoryFlow';

const mockData = [
    {
        title: 'Software Developer',
        desc: 'Land top dev jobs with AI-powered software mock interview',
        category: 'Tech',
        img: image,
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
    const [showCategoryFlow, setShowCategoryFlow] = useState(false);
    const [selectedMock, setSelectedMock] = useState(null);
    const navigate = useNavigate();

    const limitedData =
        selectedCategory === 'All'
            ? getLimitedMockData(mockData)
            : mockData.filter((mock) => mock.category === selectedCategory);

    return (
        <div className="min-h-screen bg-black text-white px-4 sm:px-10 md:px-16 py-10">
            {/* HEADER */}
            <motion.div
                className="text-white max-w-3xl mb-6"
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h2 className="text-3xl font-bold">AI-Powered Mock Interview</h2>
                <p className="mt-2 text-gray-300">
                    Master your concepts with AI-Powered full-length mock tests for 360
                    <sup>o</sup> preparation!
                </p>
            </motion.div>

            {/* TAG FILTERS */}
            <div className="flex flex-wrap gap-3 mb-8">
                {categories.map((tag) => (
                    <button
                        key={tag}
                        onClick={() => setSelectedCategory(tag)}
                        className={`px-4 py-1 rounded-full font-medium transition-all duration-200 ${
                            selectedCategory === tag
                                ? 'bg-purple-500 text-white'
                                : 'bg-white text-black hover:bg-gray-300'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* MOCK CARD GRID */}
            <div className="flex flex-col gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                <AnimatePresence>
                    {limitedData.map((mock, idx) => (
                        <motion.div
                            key={mock.title + idx}
                            layout
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="bg-white text-black p-4 rounded-xl shadow hover:shadow-2xl transition min-h-[300px] flex flex-col justify-between"
						>
                            <img
                                src={mock.img}
                                alt={mock.title}
                                className="rounded-md h-32 w-full object-cover mb-3"
                            />
                            <div className="flex-1">
                                <h3 className="text-base font-bold mb-1">{mock.title}</h3>
                                <p className="text-sm text-gray-700">{mock.desc}</p>
                            </div>

                            <div className="mt-4 text-right">
                                {/* Glowing Button */}
                                <button
                                    className="group relative bg-neutral-900 border border-pink-400 rounded-full p-[2px] overflow-hidden hover:scale-105 transition-transform"
                                    onClick={() => {
                                        setSelectedMock(mock);
                                        setShowCategoryFlow(true);
                                    }}
                                >
                                    <span className="flex items-center gap-2 px-5 py-2 bg-black rounded-full text-white relative z-10">
                                        <span className="text-sm font-semibold">Start Interview</span>
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* CATEGORY FLOW MODAL */}
            {showCategoryFlow && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
                    style={{ backdropFilter: 'blur(2px)' }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 40 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 40 }}
                        transition={{ duration: 0.35, type: 'spring' }}
                        className="relative rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4"
                        style={{
                            minHeight: '340px',
                            background: 'linear-gradient(135deg, #fff 60%, #e9d5ff 100%)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            border: '1px solid rgba(255,255,255,0.18)',
                        }}
                    >
                        <button
                            className="absolute top-3 right-4 text-3xl text-gray-400 hover:text-red-500 transition"
                            onClick={() => setShowCategoryFlow(false)}
                            aria-label="Close"
                            style={{ fontWeight: 700, lineHeight: 1 }}
                        >
                            &times;
                        </button>
                        <div className="mb-4">
                            <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-2">
                                Select Interview Category
                            </h2>
                            <p className="text-center text-gray-500 text-base">
                                Choose your path to start a personalized AI interview.
                            </p>
                        </div>
                        <InterviewCategoryFlow
                            mock={selectedMock}
                            onClose={() => setShowCategoryFlow(false)}
                        />
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default MockInterviews;
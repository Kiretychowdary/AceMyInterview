// NMKRSPVLIDATA

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tabData = [
	{
		name: 'About This Platform',
		features: [
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-emerald-400 text-2xl">
						{/* Info Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<circle cx="12" cy="12" r="10" stroke="currentColor" />
							<path d="M12 16v-4M12 8h.01" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Ace Your Interview Journey',
				desc: 'Our platform is designed to help you master interviews with AI-powered mock sessions, real-time feedback, and curated resources. Whether you\'re a fresher or an experienced professional, you\'ll find everything you need to succeed.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-purple-400 text-2xl">
						{/* Community Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<circle cx="9" cy="7" r="4" stroke="currentColor" />
							<path d="M17 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="currentColor" />
							<path d="M17 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Built for All Aspirants',
				desc: 'From coding interviews to system design and behavioral rounds, our tools and content are tailored for every stage of your interview preparation.',
				link: '#',
			},
		],
		image:
			'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
	},
	{
		name: 'Page Features',
		features: [
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-blue-400 text-2xl">
						{/* Feature Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" />
							<path d="M8 9h8M8 13h8M8 17h8" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'AI-Powered Mock Interviews',
				desc: 'Simulate real interview scenarios with instant feedback and analytics to improve your performance.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-pink-400 text-2xl">
						{/* Sheet Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<rect x="6" y="3" width="12" height="18" rx="2" stroke="currentColor" />
							<path d="M9 7h6M9 11h6M9 15h3" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Curated Question Bank',
				desc: 'Access a vast collection of coding, system design, and behavioral questions with detailed solutions.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-yellow-400 text-2xl">
						{/* Feedback Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Personalized Feedback',
				desc: 'Get actionable insights and improvement tips after every mock session.',
				link: '#',
			},
		],
		image:
			'https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=600&q=80',
	},
	{
		name: 'Skill Development',
		features: [
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-green-400 text-2xl">
						{/* Growth Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path d="M3 17l6-6 4 4 8-8" stroke="currentColor" />
							<path d="M14 7h7v7" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Track Your Progress',
				desc: 'Monitor your strengths and weaknesses with detailed analytics and progress tracking.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-indigo-400 text-2xl">
						{/* Learning Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path d="M12 20v-6M12 14l4-4M12 14l-4-4" stroke="currentColor" />
							<circle cx="12" cy="12" r="10" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Skill Enhancement',
				desc: 'Sharpen your coding, problem-solving, and communication skills with targeted practice.',
				link: '#',
			},
		],
		image:
			'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
	},
	{
		name: 'Interview Details',
		features: [
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-red-400 text-2xl">
						{/* Interview Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<circle cx="12" cy="8" r="4" stroke="currentColor" />
							<path d="M4 20c0-4 8-4 8-4s8 0 8 4" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Real Interview Experiences',
				desc: 'Read and share real interview stories, tips, and strategies from top companies.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-[#232526] text-orange-400 text-2xl">
						{/* Tips Icon */}
						<svg
							width="28"
							height="28"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" />
							<circle cx="12" cy="12" r="5" stroke="currentColor" />
						</svg>
					</span>
				),
				title: 'Interview Tips & Guidance',
				desc: 'Get expert advice on how to approach interviews, handle tricky questions, and leave a lasting impression.',
				link: '#',
			},
		],
		image:
			'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80',
	},
];

const tabContentVariants = {
	initial: { opacity: 0, y: 30 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -30 },
};

const PageFeatures = () => {
	const [activeTab, setActiveTab] = useState(0);

	const currentTab = tabData[activeTab];

	return (
        <section className="w-full bg-white/95 border border-gray-200 rounded-3xl p-4 sm:p-6 md:p-12 mt-6 sm:mt-10 max-w-7xl mx-auto shadow-lg">
            {/* Tabs */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 sm:mb-10 gap-4">
                <div className="flex flex-wrap gap-4 sm:gap-8 md:gap-16 w-full md:w-auto justify-center md:justify-start">
                    {tabData.map((tab, idx) => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(idx)}
                            className={`text-base sm:text-lg font-semibold px-4 sm:px-7 py-2 rounded border transition
                ${
									idx === activeTab
										? 'border-blue-600 text-blue-700 bg-blue-50 shadow-[0_0_0_2px_rgba(37,99,235,0.15)]'
										: 'border-transparent text-gray-700 hover:text-blue-700 hover:bg-blue-50'
								}`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </div>
            </div>
            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    variants={tabContentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                    className="flex flex-col md:flex-row gap-6 md:gap-10"
                >
                    {/* Left: Features */}
                    <div className="flex-1 flex flex-col gap-6 md:gap-8 justify-center">
                        {currentTab.features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i }}
                                className="flex items-start gap-4 sm:gap-5"
                            >
                                {f.icon}
                                <div>
                                    <h3 className="text-gray-900 text-base sm:text-xl font-bold mb-1">{f.title}</h3>
                                    <p className="text-gray-600 mb-2 text-sm sm:text-base">{f.desc}</p>
                                    <a
                                        href={f.link}
                                        className="text-blue-600 font-semibold hover:underline flex items-center gap-1 text-sm sm:text-base"
                                        aria-label={`Get Started with ${f.title}`}
                                    >
                                        Get Started <span aria-hidden>→</span>
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {/* Right: Image */}
                    <motion.div
                        className="flex-1 flex items-center justify-center mt-4 md:mt-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img
                            src={currentTab.image}
                            alt="Feature Preview"
                            className="rounded-2xl shadow-lg w-full max-w-xs sm:max-w-md md:max-w-xl border border-gray-200 bg-gray-100 object-contain"
                        />
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
};

export default PageFeatures;
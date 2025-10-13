// NMKRSPVLIDATA

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const tabData = [
	{
		name: 'Platform Overview',
		features: [
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				title: 'Master Your Interview Journey',
				desc: '@AceMyInterview is your complete interview preparation platform featuring AI-powered mock sessions, real-time feedback, and expert-curated resources. Designed for both freshers and experienced professionals to achieve interview success.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				title: 'Built for Every Candidate',
				desc: 'From technical coding interviews to system design and behavioral rounds, our comprehensive tools and resources are tailored for every stage of your interview preparation journey.',
				link: '#',
			},
		],
		image:
			'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
	},
	{
		name: 'Smart Features',
		features: [
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				desc: 'Experience realistic interview simulations with our advanced AI technology. Get instant feedback, performance analytics, and personalized improvement suggestions.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				title: 'Comprehensive Question Bank',
				desc: 'Access 500+ carefully curated questions covering coding algorithms, system design, behavioral scenarios, and technical deep-dives with detailed solutions.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				title: 'Real-Time Performance Analytics',
				desc: 'Receive detailed feedback on your communication skills, technical accuracy, and problem-solving approach with actionable improvement recommendations.',
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
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				title: 'Progress Tracking Dashboard',
				desc: 'Monitor your growth with comprehensive analytics tracking your strengths, improvement areas, and skill development over time with visual insights.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				title: 'Targeted Skill Enhancement',
				desc: 'Improve your coding proficiency, problem-solving abilities, and communication skills with personalized practice sessions and expert guidance.',
				link: '#',
			},
		],
		image:
			'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80',
	},
	{
		name: 'Success Resources',
		features: [
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				desc: 'Learn from 10K+ success stories and authentic interview experiences from candidates who landed roles at top tech companies worldwide.',
				link: '#',
			},
			{
				icon: (
					<span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-2xl shadow-lg">
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
				title: 'Expert Interview Strategies',
				desc: 'Access proven strategies, insider tips, and expert guidance on approaching different interview formats and making memorable impressions on hiring managers.',
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
        <section className="w-full bg-gradient-to-br from-blue-50 via-white to-blue-50 border border-blue-100 rounded-3xl p-6 sm:p-8 md:p-12 mt-8 sm:mt-12 max-w-7xl mx-auto shadow-xl relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100 to-transparent rounded-full transform translate-x-32 -translate-y-32 opacity-50"></div>
            
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-full px-6 py-3 mb-6">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-bold text-lg">@AceMyInterview Features</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                    Everything You Need to
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                        Succeed in Interviews
                    </span>
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Comprehensive tools and resources designed to help you excel in every aspect of the interview process.
                </p>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-center mb-10 gap-4">
                <div className="flex flex-wrap gap-3 sm:gap-4 w-full justify-center">
                    {tabData.map((tab, idx) => (
                        <motion.button
                            key={tab.name}
                            onClick={() => setActiveTab(idx)}
                            className={`text-sm sm:text-base font-semibold px-6 py-3 rounded-2xl transition-all duration-300 ${
								idx === activeTab
									? 'bg-blue-600 text-white shadow-lg transform scale-105'
									: 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200 hover:border-blue-200'
							}`}
                            whileHover={{ scale: idx === activeTab ? 1.05 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {tab.name}
                        </motion.button>
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
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-10"
                >
                    {/* Left: Features */}
                    <div className="flex-1 flex flex-col gap-8 justify-center">
                        {currentTab.features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * i, duration: 0.6 }}
                                className="flex items-start gap-5 p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200 group"
                            >
                                <div className="group-hover:scale-110 transition-transform duration-300">
                                    {f.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-blue-700 text-lg sm:text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300">
                                        {f.title}
                                    </h3>
                                    <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
                                        {f.desc}
                                    </p>
                                    <a
                                        href={f.link}
                                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300 text-sm sm:text-base group/link"
                                        aria-label={`Learn more about ${f.title}`}
                                    >
                                        <span>Learn More</span>
                                        <svg
                                            className="w-4 h-4 group-hover/link:translate-x-1 transition-transform duration-300"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </a>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Right: Image */}
                    <motion.div
                        className="flex-1 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                            <img
                                src={currentTab.image}
                                alt="Feature Preview"
                                className="relative rounded-3xl shadow-2xl w-full max-w-md lg:max-w-lg border-4 border-white object-cover h-80 sm:h-96 transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute -bottom-4 -right-4 bg-blue-600 text-white rounded-2xl px-4 py-2 font-bold shadow-lg">
                                @AceMyInterview
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        </section>
    );
};

export default PageFeatures;
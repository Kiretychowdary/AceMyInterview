// NMRKPSVLIDATAPERMANENET
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const techTopics = [
	{
		name: 'Software Developer',
		subtopics: [
			'Data Structures',
			'Algorithms',
			'OOP',
			'System Design',
			'Coding Languages (C++, Python, Java, etc.)',
		],
	},
	{
		name: 'Cybersecurity',
		subtopics: ['General', 'Network Security', 'Ethical Hacking', 'Cryptography'],
	},
	{
		name: 'Web Development',
		subtopics: ['Frontend', 'Backend', 'Fullstack', 'DevOps'],
	},
];

const managementTopics = [
	{
		name: 'Product Management',
		subtopics: ['Roadmapping', 'Stakeholder Management', 'Agile', 'Go-to-Market'],
	},
	{
		name: 'Project Coordination',
		subtopics: ['Scheduling', 'Resource Allocation', 'Risk Management', 'Team Communication'],
	},
	{
		name: 'HR Interview',
		subtopics: ['General HR', 'Behavioral', 'Situational', 'Company Culture'],
	},
];

const InterviewCategoryFlow = ({ mock, onClose }) => {
	const [step, setStep] = useState(1);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [selectedTopic, setSelectedTopic] = useState(null);
	const navigate = useNavigate();

	// Auto-select category/topic if mock is provided
	useEffect(() => {
		if (mock) {
			if (mock.category === 'Tech') {
				setSelectedCategory('Tech');
				setStep(2);
			} else if (mock.category === 'Management') {
				setSelectedCategory('Management');
				setStep(2);
			}
			// Optionally, auto-select topic if you want
			// setSelectedTopic(...);
		}
	}, [mock]);

	// Step 1: Category selection
	if (step === 1) {
		return (
			<div>
				<h2 className="text-2xl font-extrabold text-center text-purple-700 mb-6">Choose a Category</h2>
				<div className="flex flex-col sm:flex-row justify-center gap-4 mb-4">
					<button
						className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
						onClick={() => {
							setSelectedCategory('Tech');
							setStep(2);
							navigate('/device-setup');
						}}
					>
						Tech
					</button>
					<button
						className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200"
						onClick={() => {
							setSelectedCategory('Management');
							setStep(2);
							navigate('/device-setup');
						}}
					>
						Management
					</button>
				</div>
				{onClose && (
					<button className="text-red-500 font-semibold hover:underline mt-2" onClick={onClose}>
						Close
					</button>
				)}
			</div>
		);
	}

	// Step 2: Topic selection
	if (step === 2) {
		const topics = selectedCategory === 'Tech' ? techTopics : managementTopics;
		return (
			<div>
				<h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Choose a {selectedCategory} Topic</h2>
				<div className="flex flex-col items-center gap-4 mb-4">
					{topics.map((topic) => (
						<button
							key={topic.name}
							className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:from-purple-600 hover:to-blue-600 transition-all duration-200 w-64"
							onClick={() => {
								setSelectedTopic(topic);
								setStep(3);
							}}
						>
							{topic.name}
						</button>
					))}
				</div>
				{onClose && (
					<button className="text-red-500 font-semibold hover:underline mt-2" onClick={onClose}>
						Close
					</button>
				)}
			</div>
		);
	}

	// Step 3: Subtopic/language selection
	if (step === 3 && selectedTopic) {
		return (
			<div>
				<h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Choose a {selectedTopic.name} Subtopic</h2>
				<div className="flex flex-col items-center gap-4 mb-4">
					{selectedTopic.subtopics.map((sub) => (
						<button
							key={sub}
							className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold px-8 py-3 rounded-xl shadow-md hover:from-emerald-600 hover:to-green-600 transition-all duration-200 w-64"
							onClick={() => {
								navigate('/device-setup', {
									state: {
										category: selectedCategory,
										topic: selectedTopic.name,
										subtopic: sub,
									},
								});
							}}
						>
							{sub}
						</button>
					))}
				</div>
				{onClose && (
					<button className="text-red-500 font-semibold hover:underline mt-2" onClick={onClose}>
						Close
					</button>
				)}
			</div>
		);
	}

	return null;
};

export default InterviewCategoryFlow;
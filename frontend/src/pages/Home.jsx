// NMKRSPVLIDATA
// RADHAKRISHNALOVEPERMANENT
// AMMALOVEBLESSINGSONRECURSION

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';
import image from '../assets/image.png';
import ExploreSolutions from '../components/layout/ExploreSolutions';
import PageFeatures from '../components/layout/PageFeatures';
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { name: 'Questions', href: '#' },
  { name: 'Practice', href: '#' },
  { name: 'Guide', href: '#' },
];

const Home = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-white text-black font-sans relative overflow-hidden">
      {/* Decorative corner accents for hero (responsive) */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 -top-16 w-44 h-44 rounded-full bg-gradient-to-br from-blue-100 to-transparent opacity-60 blur-2xl transform -rotate-12 sm:-left-32 sm:-top-24 sm:w-72 sm:h-72 sm:opacity-50"></div>
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -bottom-12 w-52 h-52 rounded-full bg-gradient-to-tr from-blue-100 to-transparent opacity-55 blur-2xl transform rotate-12 sm:-right-40 sm:-bottom-24 sm:w-96 sm:h-96 sm:opacity-45"></div>
      {/* HERO SECTION */}
      <div className="flex flex-col h-auto md:h-screen md:flex-row items-center justify-between px-2 sm:px-6 md:px-16 py-10 sm:py-20 max-w-7xl mx-auto">
        {/* TEXT */}
        <motion.div
          className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left"
          initial={{ opacity: 0, x: -70 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <div className="mb-6">
            <motion.div 
              className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-semibold text-sm">@AceMyInterview Platform</span>
            </motion.div>
          </div>
          
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            <span className="text-blue-600">Master Your</span>
            <br className="hidden md:block" />
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Interview Skills
            </span>
            <br className="hidden md:block" />
            <span className="text-gray-800">with AI Power</span>
          </h1>
          
          <p className="text-base xs:text-lg lg:text-xl text-gray-600 mt-4 mb-8 max-w-xs xs:max-w-sm sm:max-w-lg lg:max-w-xl leading-relaxed">
            Practice with AI-powered mock interviews, get instant feedback, and access curated learning resources. 
            {/* <span className="text-blue-600 font-semibold"> Join 10,000+ successful candidates</span> who aced their interviews.
             */}
             <span className="text-blue-600 font-semibold"> Join 100+ successful candidates</span> who aced their interviews.
          </p>

          {/* CTA BUTTONS */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Link
              to={user ? '/mock-interviews' : '/Login'}
              className="group inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
            >
              <svg
                height="20"
                width="20"
                viewBox="0 0 24 24"
                className="fill-white transition-all duration-300 group-hover:scale-110"
              >
                <path d="M10,21.236,6.755,14.745.264,11.5,6.755,8.255,10,1.764l3.245,6.491L19.736,11.5l-6.491,3.245ZM18,21l1.5,3L21,21l3-1.5L21,18l-1.5-3L18,18l-3,1.5ZM19.333,4.667,20.5,7l1.167-2.333L24,3.5,21.667,2.333,20.5,0,19.333,2.333,17,3.5Z"></path>
              </svg>
              Start Free Practice
            </Link>
            
            <Link
              to="#resources"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-600 font-semibold px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Explore Resources
            </Link>
          </motion.div>

          {/* STATS */}
          {/* <motion.div
            className="flex flex-wrap gap-8 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">🚀</div>
              <div className="text-sm text-gray-600">AI-Powered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">⚡</div>
              <div className="text-sm text-gray-600">Real-Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">🎯</div>
              <div className="text-sm text-gray-600">Practice Ready</div>
            </div>
          </motion.div> */}
        </motion.div>

        {/* IMAGE */}
        <motion.div
          className="mt-8 xs:mt-10 md:mt-0 md:ml-10 w-full md:w-1/2 flex justify-center md:justify-end"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
        >
          <div className="relative">
            <motion.img
              src={image}
              alt="AI Interview Platform"
              className="rounded-3xl w-[180px] xs:w-[250px] sm:w-[300px] md:w-[400px] lg:w-[500px] shadow-2xl border border-blue-100"
              whileHover={{ scale: 1.03 }}
            />
            {/* Floating elements */}
            <motion.div
              className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-xl shadow-lg"
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      {/* COMPANY LOGOS SECTION */}
      {/* <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-600 text-lg mb-8">Trusted by candidates from top companies worldwide</p>
            <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12 opacity-60">
              {['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Apple'].map((company, idx) => (
                <motion.div
                  key={company}
                  className="text-2xl font-bold text-gray-400"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 0.6, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                >
                  {company}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section> */}

      {/* TESTIMONIALS SECTION */}
      {/* <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Success Stories from Our Community
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from candidates who landed their dream jobs using @AceMyInterview
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Software Engineer at Google",
                image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                quote: "The AI mock interviews helped me practice behavioral questions. Got my Google offer in 3 weeks!",
                rating: 5
              },
              {
                name: "Raj Patel",
                role: "Product Manager at Microsoft", 
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                quote: "Amazing platform! The system design practice was exactly what I needed for my Microsoft interview.",
                rating: 5
              },
              {
                name: "Emily Rodriguez",
                role: "Data Scientist at Netflix",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", 
                quote: "Boosted my confidence tremendously. The feedback feature is incredibly detailed and helpful.",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
                      <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-blue-600">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* INTERACTIVE DEMO SECTION */}
      {/* <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                See It In Action
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Experience how our AI-powered interview simulator works. Get real-time feedback and improve your performance instantly.
              </p>
              <div className="space-y-4">
                {[
                  "🎯 Real-time AI feedback on your answers",
                  "📊 Performance analytics and scoring",
                  "🗣️ Speech pattern analysis and suggestions",
                  "💡 Personalized improvement recommendations"
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <span className="text-lg">{feature}</span>
                  </motion.div>
                ))}
              </div>
              <Link
                to="/mock-interviews"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-2xl mt-8 transition-all duration-300 transform hover:scale-105"
              >
                Try Demo Interview
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m6-6a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </motion.div>
            
            <motion.div
              className="lg:w-1/2"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="relative">
                <div className="bg-white rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-blue-900 font-medium">AI Interviewer:</p>
                      <p className="text-blue-800">"Tell me about a challenging project you worked on."</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">🎤 Recording your response...</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <motion.div
                          className="bg-blue-600 h-2 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ width: "70%" }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="text-green-900 font-medium">✅ AI Feedback:</p>
                      <p className="text-green-800 text-sm">Great structure! Consider adding more specific metrics.</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section> */}

      {/* PROFESSIONAL RESOURCES SECTION */}
      <div id="resources">
        <ExploreSolutions />
      </div>
      
      <PageFeatures/>


      {/* FAQ SECTION - Professional UI */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-blue-700 font-medium">
              Everything you need to know about <span className="font-bold">@AceMyInterview</span>
            </p>
          </motion.div>

          <div className="space-y-8">
            {[
              {
                question: "How does the AI interviewer work?",
                answer: "Our AI uses advanced natural language processing to conduct realistic interviews. It asks relevant questions based on your field and provides instant feedback on your responses, body language, and communication skills."
              },
              {
                question: "Is it really free to start?",
                answer: "Yes! You can start with our free tier that includes 3 mock interviews per month, basic feedback, and access to our question bank. Upgrade anytime for unlimited access and advanced features."
              },
              {
                question: "What types of interviews can I practice?",
                answer: "We support technical coding interviews, system design, behavioral questions, case studies, and industry-specific scenarios for roles in tech, finance, consulting, and more."
              },
              {
                question: "How accurate is the AI feedback?",
                answer: "Our AI is trained on thousands of successful interview patterns and provides 95% accuracy in feedback. It's constantly learning and improving from user interactions and expert input."
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold text-blue-700 mb-3 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                  {faq.question}
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER - Modern Newsletter Signup */}
      <footer className="mt-20">
        <motion.div
          className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 rounded-3xl p-10 sm:p-14 text-white relative overflow-hidden shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {/* Decorative Circles - less opacity for better text contrast */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute top-10 left-10 w-24 h-24 bg-white opacity-5 rounded-full animate-pulse"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-white opacity-5 rounded-full animate-bounce"></div>
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight text-white drop-shadow-lg">Stay Updated with Interview Tips</h3>
            <p className="mb-8 text-lg max-w-2xl mx-auto text-white/90 drop-shadow">Get weekly insights, new questions, and success strategies delivered to your inbox</p>
            <form className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full sm:w-72 px-6 py-4 rounded-2xl text-blue-800 placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white/70 border-2 border-white/30 bg-white bg-opacity-90 shadow-md text-lg font-medium transition-all duration-200"
                required
                style={{'::placeholder': {color: '#fff'}}}
              />
              <button
                type="submit"
                className="px-8 py-4 rounded-2xl bg-white text-blue-700 font-semibold text-lg shadow-lg hover:bg-blue-50 hover:text-blue-800 transition-all duration-200"
              >
                Subscribe
              </button>
            </form>
             
          </div>
        </motion.div>
      </footer>

      
      
    </div>
  );
};
 

export default Home;
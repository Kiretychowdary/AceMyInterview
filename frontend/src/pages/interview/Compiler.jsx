// NMKRSPVLIDATAPERMAENENT
// AMMANANNAPERMANENENT
import React from 'react';
import { useLocation } from 'react-router-dom';
import CompilerPage from '../../components/interview/CompilerPage.jsx';

const Compiler = () => {
  const location = useLocation();
  const contest = location.state?.contest;
  
  // If contest has problems, pass the first problem as problemData
  const problemData = contest?.problems?.[0] || null;
  const contestId = contest?.id || contest?._id || null;
  
  return <CompilerPage problemData={problemData} contestId={contestId} contest={contest} />;
};

export default Compiler;
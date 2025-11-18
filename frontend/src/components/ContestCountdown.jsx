import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const ContestCountdown = ({ contest, onStatusChange }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [status, setStatus] = useState('calculating');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const startTime = new Date(contest.startTime).getTime();
      const endTime = new Date(contest.endTime).getTime();

      let newStatus = 'upcoming';
      let difference = 0;

      if (now < startTime) {
        // Contest hasn't started - show time until start
        newStatus = 'upcoming';
        difference = startTime - now;
      } else if (now >= startTime && now < endTime) {
        // Contest is ongoing - show time remaining
        newStatus = 'ongoing';
        difference = endTime - now;
      } else {
        // Contest has ended
        newStatus = 'completed';
        difference = 0;
      }

      // Notify parent if status changed
      if (status !== newStatus && onStatusChange) {
        onStatusChange(newStatus);
      }
      setStatus(newStatus);

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft(null);
      }
    };

    // Calculate immediately
    calculateTimeLeft();

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [contest.startTime, contest.endTime, status, onStatusChange]);

  const getStatusDisplay = () => {
    switch (status) {
      case 'upcoming':
        return {
          label: 'Starts in',
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200'
        };
      case 'ongoing':
        return {
          label: 'Time Remaining',
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200'
        };
      case 'completed':
        return {
          label: 'Contest Ended',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
      default:
        return {
          label: 'Loading...',
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-600',
          borderColor: 'border-gray-200'
        };
    }
  };

  const displayInfo = getStatusDisplay();

  if (status === 'completed') {
    return (
      <div className={`${displayInfo.bgColor} ${displayInfo.textColor} px-4 py-2 rounded-lg border ${displayInfo.borderColor} text-center`}>
        <div className="text-sm font-medium">✓ Contest Completed</div>
        <div className="text-xs mt-1">Available for Practice</div>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className={`${displayInfo.bgColor} ${displayInfo.textColor} px-4 py-2 rounded-lg border ${displayInfo.borderColor} text-center`}>
        <div className="text-sm font-medium">{displayInfo.label}</div>
      </div>
    );
  }

  return (
    <div className={`${displayInfo.bgColor} ${displayInfo.textColor} px-4 py-3 rounded-lg border ${displayInfo.borderColor}`}>
      <div className="text-xs font-medium mb-2 text-center">{displayInfo.label}</div>
      <div className="flex justify-center gap-2">
        {timeLeft.days > 0 && (
          <TimeUnit value={timeLeft.days} label="Days" color={displayInfo.textColor} />
        )}
        <TimeUnit value={timeLeft.hours} label="Hrs" color={displayInfo.textColor} />
        <TimeUnit value={timeLeft.minutes} label="Min" color={displayInfo.textColor} />
        <TimeUnit value={timeLeft.seconds} label="Sec" color={displayInfo.textColor} />
      </div>
    </div>
  );
};

const TimeUnit = ({ value, label, color }) => {
  return (
    <motion.div
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className={`${color} font-bold text-lg min-w-[40px] text-center bg-white rounded px-2 py-1 border border-current border-opacity-20`}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs mt-1 opacity-75">{label}</div>
    </motion.div>
  );
};

export default ContestCountdown;

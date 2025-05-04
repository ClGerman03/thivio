'use client';

import { useEffect, useState } from 'react';
import { useDebateContext } from '../DebateSession';

type TimerProps = {
  seconds: number;
  isPaused: boolean;
};

export default function Timer({ seconds, isPaused }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const { setRemainingTime } = useDebateContext();

  useEffect(() => {
    setTimeLeft(seconds);
  }, [seconds]);

  useEffect(() => {
    if (isPaused || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1;
        setRemainingTime(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, timeLeft, setRemainingTime]);

  // Format time as mm:ss
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{formatTime(timeLeft)}</span>
    </div>
  );
}

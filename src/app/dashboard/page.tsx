'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/dashboard/UserAvatar';
import LearningSection from '@/components/dashboard/LearningSection';

export default function Dashboard() {
  const router = useRouter();
  
  const handleLogout = () => {
    console.log('Logging out');
    // In a real app, this would handle logout logic
    router.push('/auth');
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <motion.div 
        className="w-full max-w-6xl mx-auto p-6 pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="max-w-[75%] sm:max-w-none">
            <h1 className="text-2xl font-light text-gray-800 dark:text-white leading-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your documents and access learning tools
            </p>
          </div>
          
          <div className="self-end sm:self-auto">
            <UserAvatar onLogout={handleLogout} />
          </div>
        </div>
        
        <LearningSection />
      </motion.div>
    </div>
  );
}

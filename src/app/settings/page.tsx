'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/dashboard/UserAvatar';
import SettingsMenu from '@/components/settings/SettingsMenu';
import ProfileSection from '@/components/settings/ProfileSection';
import BillingSection from '@/components/settings/BillingSection';

type SettingsSection = 'profile' | 'billing';

export default function Settings() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  
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
              Settings
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your account preferences and billing information
            </p>
          </div>
          
          <div className="self-end sm:self-auto">
            <UserAvatar onLogout={handleLogout} />
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-64 flex-shrink-0">
            <SettingsMenu 
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>
          
          <div className="flex-grow">
            {activeSection === 'profile' && <ProfileSection />}
            {activeSection === 'billing' && <BillingSection />}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

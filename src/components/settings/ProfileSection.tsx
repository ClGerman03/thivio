'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function ProfileSection() {
  const [name, setName] = useState('User Name');
  const [email, setEmail] = useState('user@example.com');
  const [language, setLanguage] = useState('english');
  const [theme, setTheme] = useState('system');
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically save the user profile
    console.log('Saving profile:', { name, email, language, theme });
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800/30 rounded-xl p-6"
    >
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-light text-gray-800 dark:text-white">
          Profile Settings
        </h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">{name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              />
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300">{email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Language
            </label>
            {isEditing ? (
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              >
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{language}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Theme
            </label>
            {isEditing ? (
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
              >
                <option value="system">System Default</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            ) : (
              <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{theme}</p>
            )}
          </div>
          
          {isEditing && (
            <div className="pt-3">
              <button
                type="submit"
                className="px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-full text-xs hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </form>
    </motion.div>
  );
}

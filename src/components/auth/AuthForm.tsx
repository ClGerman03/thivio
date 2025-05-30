'use client';

import { motion } from 'framer-motion';

type AuthFormProps = {
  onGoogleSignIn: () => void;
  onContinueWithoutSignIn: () => void;
};

export default function AuthForm({ onGoogleSignIn, onContinueWithoutSignIn }: AuthFormProps) {
  return (
    <motion.div
      className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-xl font-thin text-center text-gray-900 dark:text-white mb-6">
        Sign in to Thivio
      </h2>
      
      <div className="space-y-4">
        <motion.button
          className="flex items-center justify-center w-full px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 bg-opacity-60 dark:bg-opacity-50 hover:bg-opacity-80 dark:hover:bg-opacity-70 shadow-sm transition-all"
          onClick={onGoogleSignIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </motion.button>
        
        <div className="relative py-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-gray-400">or</span>
          </div>
        </div>
        
        <motion.button
          className="w-full px-4 py-2 bg-transparent rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 hover:bg-opacity-40 dark:hover:bg-gray-800 dark:hover:bg-opacity-30 transition-all"
          onClick={onContinueWithoutSignIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Continue without signing in
        </motion.button>
      </div>
      
      <p className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400">
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </motion.div>
  );
}

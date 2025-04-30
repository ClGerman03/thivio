'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import AuthForm from '@/components/auth/AuthForm';

export default function Auth() {
  const router = useRouter();
  
  // These functions would typically handle authentication
  const handleGoogleSignIn = () => {
    console.log('Google sign in');
    // Redirect to dashboard after successful sign in
    router.push('/dashboard');
  };
  
  const handleContinueWithoutSignIn = () => {
    console.log('Continue without signing in');
    // Redirect to dashboard when continuing without sign in
    router.push('/dashboard');
  };
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-gray-950">
      <motion.div 
        className="w-full max-w-md mx-auto px-4 py-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 flex justify-center"
        >
          <Image 
            src="/lexiroo-logo.svg" 
            alt="Lexiroo Logo" 
            width={60} 
            height={60}
            priority
          />
        </motion.div>
        
        <AuthForm 
          onGoogleSignIn={handleGoogleSignIn}
          onContinueWithoutSignIn={handleContinueWithoutSignIn}
        />
      </motion.div>
    </div>
  );
}

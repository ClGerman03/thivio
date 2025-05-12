'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

type SubscriptionPlan = 'free' | 'pro' | 'enterprise';

interface PlanDetails {
  name: string;
  price: string;
  features: string[];
  current: boolean;
}

export default function BillingSection() {
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan>('free');
  const [showChangePlan, setShowChangePlan] = useState(false);
  
  const plans: Record<SubscriptionPlan, PlanDetails> = {
    free: {
      name: 'Free Plan',
      price: '$0/month',
      features: [
        'Basic learning tools',
        '3 debate sessions per month',
        'Standard AI responses'
      ],
      current: currentPlan === 'free'
    },
    pro: {
      name: 'Pro Plan',
      price: '$9.99/month',
      features: [
        'Advanced learning tools',
        'Unlimited debate sessions',
        'Premium AI models',
        'Full context storage'
      ],
      current: currentPlan === 'pro'
    },
    enterprise: {
      name: 'Enterprise Plan',
      price: '$49.99/month',
      features: [
        'Team collaboration',
        'Custom AI training',
        'API access',
        'Dedicated support',
        'Advanced analytics'
      ],
      current: currentPlan === 'enterprise'
    }
  };

  const handleChangePlan = (plan: SubscriptionPlan) => {
    setCurrentPlan(plan);
    setShowChangePlan(false);
    // Here you would connect to a payment processor
    console.log(`Changed subscription to ${plan} plan`);
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
          Billing & Subscription
        </h2>
        <button
          onClick={() => setShowChangePlan(!showChangePlan)}
          className="text-xs px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          {showChangePlan ? 'Cancel' : 'Change Plan'}
        </button>
      </div>
      
      <div className="mb-6">
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800 dark:text-white">Current Plan</h3>
            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-full">
              {plans[currentPlan].name}
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Your subscription renews on January 1, 2026
          </p>
          <div className="text-xl font-normal text-gray-900 dark:text-white">
            {plans[currentPlan].price}
          </div>
        </div>
      </div>
      
      {showChangePlan && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Available Plans
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(plans).map(([planId, plan]) => (
              <div 
                key={planId}
                className={`border rounded-xl p-4 transition-all ${
                  plan.current 
                    ? 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-800 dark:text-white">{plan.name}</h4>
                  {plan.current && (
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                
                <div className="text-lg font-normal text-gray-900 dark:text-white mb-3">
                  {plan.price}
                </div>
                
                <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-2 mb-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                        className="mr-2 text-green-500 dark:text-green-400"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <button
                  onClick={() => handleChangePlan(planId as SubscriptionPlan)}
                  disabled={plan.current}
                  className={`w-full py-1.5 rounded-lg text-xs transition-colors ${
                    plan.current
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.current ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="border-t border-gray-100 dark:border-gray-800 mt-6 pt-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Payment Method
        </h3>
        
        <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-2 mr-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                className="text-gray-500 dark:text-gray-400"
              >
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Visa ending in 4242
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Expires 12/2025
              </p>
            </div>
          </div>
          
          <button className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  );
}

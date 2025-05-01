'use client';

import { motion } from 'framer-motion';

type UserRoleSelectionProps = {
  selectedRole: string;
  onSelectRole: (role: string) => void;
};

type Role = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const ParticipantIcon = ({ className = "" }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const ObserverIcon = ({ className = "" }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const ModeratorIcon = ({ className = "" }: { className?: string }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

export default function UserRoleSelection({
  selectedRole,
  onSelectRole,
}: UserRoleSelectionProps) {
  const roles: Role[] = [
    {
      id: 'participant',
      title: 'Participant',
      description: 'Directly interact in the debate, contributing your own arguments and perspectives',
      icon: <ParticipantIcon className="text-gray-500" />,
    },
    {
      id: 'observer',
      title: 'Observer',
      description: 'Watch the debate unfold without active participation, ideal for passive learning',
      icon: <ObserverIcon className="text-gray-500" />,
    },
    {
      id: 'moderator',
      title: 'Moderator',
      description: 'Guide the flow of the debate, suggest alternative viewpoints, and maintain focus',
      icon: <ModeratorIcon className="text-gray-500" />,
    },
  ];

  return (
    <div className="max-w-xl py-2">
      <div className="space-y-4">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            className={`
              transition-all cursor-pointer p-3
              border border-gray-100 dark:border-gray-800 rounded-md
              ${selectedRole === role.id 
                ? 'bg-gray-50 dark:bg-gray-800/50' 
                : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'}
            `}
            whileHover={{ x: 2 }}
            onClick={() => onSelectRole(role.id)}
          >
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 text-gray-400 dark:text-gray-500 mt-0.5 ${selectedRole === role.id ? 'text-gray-700 dark:text-gray-300' : ''}`}>
                {role.icon}
              </div>
              <div>
                <h3 className={`text-sm font-medium mb-1 text-gray-800 dark:text-gray-200`}>
                  {role.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {role.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

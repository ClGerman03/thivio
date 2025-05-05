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
  enabled?: boolean;
};

// Iconos eliminados según requerimiento

export default function UserRoleSelection({
  selectedRole,
  onSelectRole,
}: UserRoleSelectionProps) {
  // Función para manejar cuando se hace clic en una opción deshabilitada
  const handleDisabledClick = () => {
    // Opcional: podríamos mostrar un tooltip o mensaje
    console.log('This role will be available soon');
  };
  
  const roles: Role[] = [
    {
      id: 'participant',
      title: 'Participant',
      description: 'Directly interact in the debate, contributing your own arguments and perspectives',
      enabled: true,
    },
    {
      id: 'observer',
      title: 'Observer',
      description: 'Watch the debate unfold without active participation, ideal for passive learning',
      enabled: false,
    },
    {
      id: 'moderator',
      title: 'Moderator',
      description: 'Guide the flow of the debate, suggest alternative viewpoints, and maintain focus',
      enabled: false,
    },
  ];

  return (
    <div className="max-w-xl py-2">
      <div className="space-y-4">
        {roles.map((role) => (
          <motion.div
            key={role.id}
            className={`
              transition-all p-3
              border border-gray-100 dark:border-gray-800 rounded-md
              ${!role.enabled ? 'opacity-60' : ''}
              ${selectedRole === role.id && role.enabled 
                ? 'bg-gray-50 dark:bg-gray-800/50' 
                : role.enabled ? 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30 cursor-pointer' : 'cursor-default'}
            `}
            whileHover={role.enabled ? { x: 2 } : {}}
            onClick={() => role.enabled ? onSelectRole(role.id) : handleDisabledClick()}
          >
            <div className="flex items-start">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm font-medium mb-1 text-gray-800 dark:text-gray-200`}>
                    {role.title}
                  </h3>
                  {!role.enabled && (
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
                      Coming soon
                    </span>
                  )}
                </div>
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

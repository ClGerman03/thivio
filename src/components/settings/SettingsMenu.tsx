'use client';

// motion no se está utilizando en este componente

type SettingsSection = 'profile' | 'billing';

interface SettingsMenuProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export default function SettingsMenu({ activeSection, onSectionChange }: SettingsMenuProps) {
  const menuItems: { id: SettingsSection; label: string }[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'billing', label: 'Billing' }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-2">
      <nav>
        <ul>
          {menuItems.map(item => (
            <li key={item.id} className="mb-1">
              <button
                onClick={() => onSectionChange(item.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-normal transition-colors
                  ${activeSection === item.id
                    ? 'bg-white dark:bg-gray-700/50 shadow-sm text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-white/70 dark:hover:bg-gray-700/30'
                  }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

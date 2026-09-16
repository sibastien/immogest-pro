import React from 'react';
import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

interface MobileNavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: number;
}

interface MobileNavProps {
  items: MobileNavItem[];
}

export const MobileNav: React.FC<MobileNavProps> = ({ items }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-xl transition-colors min-w-0 flex-1',
                isActive ? 'text-primary' : 'text-gray-400',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <item.icon
                    size={22}
                    className={isActive ? 'text-primary' : 'text-gray-400'}
                    strokeWidth={isActive ? 2.5 : 1.75}
                  />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export interface MenuIcon {
  name: string;
  color: string;
  size?: string;
}

export interface MenuItem {
  path: string;
  label: string;
  icon: MenuIcon;
  tooltip?: string;
  authRequired?: boolean;
}

export const menuIcons: Record<string, MenuIcon> = {
  dashboard: {
    name: 'dashboard',
    color: 'text-blue-400'
  },
  progress: {
    name: 'trending_up', 
    color: 'text-green-400'
  },
  plans: {
    name: 'event_note',
    color: 'text-yellow-400'
  },
  profile: {
    name: 'account_circle',
    color: 'text-purple-400'
  },
  settings: {
    name: 'settings',
    color: 'text-gray-400'
  },
  analytics: {
    name: 'analytics',
    color: 'text-indigo-400'
  },
  calculator: {
    name: 'calculate',
    color: 'text-emerald-400'
  },
  reports: {
    name: 'assessment',
    color: 'text-orange-400'
  },
  help: {
    name: 'help_outline',
    color: 'text-cyan-400'
  },
  logout: {
    name: 'logout',
    color: 'text-red-400'
  }
};

export const menuItems: MenuItem[] = [
  {
    path: '/',
    label: 'Dashboard',
    icon: menuIcons.dashboard,
    tooltip: 'Main dashboard'
  },
  {
    path: '/progress',
    label: 'Progress',
    icon: menuIcons.progress,
    tooltip: 'View your financial progress'
  },
  {
    path: '/plans',
    label: 'Plans',
    icon: menuIcons.plans,
    tooltip: 'Financial plans'
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: menuIcons.profile,
    tooltip: 'User profile'
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: menuIcons.settings,
    tooltip: 'Application settings'
  }
];
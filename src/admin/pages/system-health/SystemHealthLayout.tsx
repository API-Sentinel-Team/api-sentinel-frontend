import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { TabNav } from '@/components/layout/TabNav';

const SystemHealthLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const segments = location.pathname.split('/').filter(Boolean);
  // /admin/system-health[/tab] — tab is segment[2]
  const activeTab = segments[2] || 'controllers';

  const tabs = [
    { key: 'controllers', label: 'Controller Health' },
    { key: 'sensors', label: 'Sensor Health' },
    { key: 'enforcers', label: 'Enforcer Health' },
  ];

  const handleTabChange = (key: string) => {
    navigate(`/admin/system-health/${key}`);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in w-full pb-10">
      <div className="border-b border-border-subtle -mx-6 mb-6">
        <TabNav tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      <div className="flex-1 w-full overflow-visible">
        <Outlet />
      </div>
    </div>
  );
};

export default SystemHealthLayout;

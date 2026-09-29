import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/lib/auth-context';
import StatusPulse from '@/components/ui/StatusPulse';
import { useLayout } from '@/components/layout/layout-context';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useLiveTraffic } from '@/lib/realtime';
import type { WorkspaceConfig } from '@/components/layout/workspaces';

function getInitials(user: { login: string; name?: string } | null): string {
  if (!user) return '??';
  const name = user.name || user.login;
  const parts = name.split(/[@.\s]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const Sidebar: React.FC<{ workspace: WorkspaceConfig }> = ({ workspace }) => {
  const { user } = useAuth();
  const { connected: streamConnected } = useLiveTraffic();
  const { isSidebarCollapsed, isMobileSidebarOpen, toggleSidebar, closeMobileSidebar } = useLayout();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const initials = getInitials(user);
  const collapsed = isDesktop ? isSidebarCollapsed : false;
  const location = useLocation();

  // Auto-close mobile sidebar on route change
  useEffect(() => {
    if (!isDesktop && isMobileSidebarOpen) {
      closeMobileSidebar();
    }
  }, [location.pathname]);

  const visibleNav = workspace.navItems;
  const visibleBottom = workspace.bottomItems;

  const desktopWidth = collapsed ? 'lg:w-[84px]' : 'lg:w-[228px]';

  const navClass = ({ isActive }: { isActive: boolean }) =>
    twMerge(clsx(
      'rail-link group mx-1',
      collapsed ? 'rail-link--collapsed' : 'py-2 px-3',
      isActive && 'rail-active',
    ));

  // Group items by section for expanded mode
  let lastSection = '';

  const handleItemClick = () => {
    if (!isDesktop) {
      closeMobileSidebar();
    }
  };

  return (
    <>
      {isMobileSidebarOpen && (
        <button
          aria-label="Close navigation"
          onClick={closeMobileSidebar}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      <nav
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex min-h-screen w-[85vw] max-w-[280px] shrink-0 -translate-x-full flex-col sidebar-rail transition-all duration-300 ease-in-out lg:static lg:z-10 lg:translate-x-0',
          desktopWidth,
          isMobileSidebarOpen && 'translate-x-0'
        )}
      >
      {/* Logo */}
      <div className="w-full border-b border-border-subtle px-3 py-4 sidebar-brand-block">
        <div className={clsx('flex items-center', collapsed ? 'justify-center' : 'justify-between gap-3')}>
          <div className={clsx('flex items-center gap-3', collapsed && 'justify-center')}>
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0"
              style={{ background: 'var(--rail)', border: '1px solid var(--rail-line)' }}
              aria-hidden
            >
              <div className="brand-bars">
                <i />
                <i />
                <i />
              </div>
            </div>
            {!collapsed && (
              <div className="animate-fade-in min-w-0">
                <div className="text-sm font-bold text-white leading-none">API Sentinel</div>
                <div className="text-[11px] rail-meta mt-0.5">{workspace.label}</div>
              </div>
            )}
          </div>

          {!isDesktop && (
            <button
              onClick={closeMobileSidebar}
              className="rail-chip w-9 h-9 rounded-xl border flex items-center justify-center hover:text-brand transition-all"
              aria-label="Close navigation"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-[68px] hidden h-6 w-6 rounded-full bg-bg-elevated border border-border-subtle items-center justify-center text-text-muted hover:text-brand hover:border-brand/30 transition-all z-20 shadow-md lg:flex"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {/* Main Nav */}
      <div className="flex flex-col w-full flex-1 pt-2 overflow-y-auto no-scrollbar">
        {visibleNav.map((item) => {
          const showSection = !collapsed && item.section && item.section !== lastSection;
          if (item.section) lastSection = item.section;

          return (
            <React.Fragment key={item.path}>
              {showSection && (
                <div className="px-4 pt-4 pb-1.5">
                  <span className="rail-section">
                    {item.section}
                  </span>
                </div>
              )}
              <NavLink
                to={item.path}
                className={navClass}
                title={collapsed ? item.label : undefined}
                onClick={handleItemClick}
              >
                {({ isActive }) => (
                  <>
                    <div className={clsx(
                      'rounded-lg flex items-center justify-center transition-all duration-200 relative shrink-0',
                      collapsed ? 'w-10 h-10' : 'w-8 h-8',
                      isActive
                        ? 'bg-white/10 text-[#ffd9a8]'
                        : 'text-[#c2b29f] group-hover:text-white'
                    )}>
                      <item.icon size={collapsed ? 19 : 17} strokeWidth={isActive ? 2.2 : 1.8} />
                      {item.live && (
                        <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-green-400">
                          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75" />
                        </span>
                      )}
                    </div>
                    {collapsed ? null : (
                      <span className={clsx(
                        'text-[13px] font-medium truncate animate-fade-in',
                        isActive ? 'text-[#ffd9a8]' : 'text-[#e7e0d9]'
                      )}>{item.label}</span>
                    )}
                  </>
                )}
              </NavLink>
            </React.Fragment>
          );
        })}
      </div>

      {/* Bottom Nav */}
      <div className="flex flex-col w-full pb-4 border-t border-border-subtle pt-3">
        {/* System status */}
        <div className={clsx('flex items-center px-3 mb-2', collapsed ? 'justify-center' : 'gap-2')}>
          <StatusPulse variant={streamConnected ? 'online' : 'warning'} size="sm" />
          {!collapsed && (
            <span className={clsx('rail-meta text-[11px] animate-fade-in', streamConnected ? 'text-emerald-400' : 'text-amber-400')}>
              {streamConnected ? 'Live stream' : 'Reconnecting'} · {workspace.badge}
            </span>
          )}
        </div>

        {visibleBottom.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={navClass}
            title={collapsed ? item.label : undefined}
            onClick={handleItemClick}
          >
            {({ isActive }) => (
              <>
                <div className={clsx(
                  'rounded-lg flex items-center justify-center transition-all duration-200 shrink-0',
                  collapsed ? 'w-10 h-10' : 'w-8 h-8',
                  isActive ? 'bg-white/10 text-[#ffd9a8]' : 'text-[#c2b29f] group-hover:text-white'
                )}>
                  <item.icon size={collapsed ? 19 : 17} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                {collapsed ? null : (
                  <span className={clsx(
                    'text-[13px] font-medium animate-fade-in',
                    isActive ? 'text-[#ffd9a8]' : 'text-[#e7e0d9]'
                  )}>{item.label}</span>
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* Avatar */}
        <div className={clsx('mt-3 flex px-3', collapsed ? 'justify-center' : 'items-center gap-2.5')}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-md bg-gradient-to-br from-brand to-accent-teal shrink-0 ring-2 ring-brand/20">
            {initials}
          </div>
          {!collapsed && user && (
            <div className="animate-fade-in min-w-0">
              <div className="text-xs font-medium text-white truncate">
                {user.name || user.login?.split('@')[0]}
              </div>
              <div className="text-[11px] rail-meta truncate">{user.login}</div>
            </div>
          )}
        </div>
      </div>
      </nav>
    </>
  );
};

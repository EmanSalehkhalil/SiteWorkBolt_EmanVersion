import { Bell, CircleAlert, FileText, Flag, FolderKanban, History, LayoutDashboard, LogOut, Menu, Search, Settings2, ShieldCheck, Users, Wrench } from 'lucide-react';
import { getMainNavigationTarget, type MainNavigationTarget } from '@/navigation';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Submittals', icon: FileText },
  { label: 'HSE', icon: ShieldCheck, active: true },
  { label: 'Issues', icon: CircleAlert },
  { label: 'Checklist', icon: FolderKanban },
  { label: 'Milestones', icon: Flag },
  { label: 'Reports', icon: FileText },
  { label: 'Personas', icon: Users },
  { label: 'Assets & Equipment', icon: Wrench },
  { label: 'Change Log', icon: History },
];

function Hse({ onBackToProject, onNavigate, onSignOut }: { onBackToProject: () => void; onNavigate: (destination: MainNavigationTarget) => void; onSignOut: () => void }) {
  return (
    <div className="project-dashboard-screen">
      <aside className="project-dashboard-sidebar">
        <button className="project-dashboard-brand" onClick={onBackToProject}><span className="project-dashboard-mark"><span /></span><strong>SiteSphere</strong></button>
        <div className="project-sidebar-label">MAIN NAVIGATION</div>
        <nav className="project-dashboard-nav">
          {navItems.map(({ label, icon: Icon, active }) => <button className={active ? 'active' : ''} key={label} onClick={() => onNavigate(getMainNavigationTarget(label))}><Icon size={16} /><span>{label}</span></button>)}
        </nav>
        <div className="project-sidebar-bottom"><button><Settings2 size={16} /> Switch Project</button><button className="project-signout" onClick={onSignOut}><LogOut size={16} /> Sign Out</button></div>
      </aside>
      <div className="project-dashboard-main">
        <header className="project-dashboard-topbar">
          <button className="project-dashboard-menu" aria-label="Open navigation"><Menu size={19} /></button>
          <button className="project-dashboard-crumb" onClick={onBackToProject}><span><FolderKanban size={13} /> Data Center Alpha</span><b>›</b><strong>HSE</strong></button>
          <label className="project-dashboard-search"><Search size={14} /><input placeholder="Search site data..." /></label>
          <div className="project-dashboard-user"><button className="project-dashboard-bell" aria-label="Notifications"><Bell size={17} /><i /></button><span className="project-user-divider" /><span className="project-user-copy"><strong>Alex Construction</strong><small>Project Manager</small></span><span className="project-user-avatar">AC</span></div>
        </header>
        <main className="project-dashboard-content" />
        <footer className="project-dashboard-footer"><span>© 2024 SiteSphere Construction Systems. All rights reserved.</span><div><a>Documentation</a><a>Support</a><a>Privacy Policy</a></div></footer>
      </div>
    </div>
  );
}

export default Hse;
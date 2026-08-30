import { useMemo, useState } from 'react';
import {
  Bell,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  EllipsisVertical,
  ExternalLink,
  Filter,
  Grid2X2,
  LayoutList,
  MapPin,
  Plus,
  Search,
  Settings2,
  TrendingUp,
  Users,
  X,
} from 'lucide-react';

type ProjectStatus = 'On Track' | 'Delayed' | 'Planning' | 'Critical';
type Project = {
  name: string;
  location: string;
  status: ProjectStatus;
  progress: number;
  issues: number;
  tests: number;
  image: string;
  archived?: boolean;
};

const projects: Project[] = [
  { name: 'Skyline Financial Center', location: 'Downtown, Metro City', status: 'On Track', progress: 78, issues: 12, tests: 45, image: 'https://images.pexels.com/photos/14577907/pexels-photo-14577907.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Harbor View Data Center', location: 'Port District, North Cove', status: 'Delayed', progress: 42, issues: 24, tests: 88, image: 'https://images.pexels.com/photos/18740807/pexels-photo-18740807.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Greenfield Residential Phase II', location: 'East Hills Development', status: 'Planning', progress: 15, issues: 4, tests: 12, image: 'https://images.pexels.com/photos/11960186/pexels-photo-11960186.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Nexus Industrial Park', location: 'Tech Corridor, Zone 4', status: 'On Track', progress: 92, issues: 2, tests: 8, image: 'https://images.pexels.com/photos/5884385/pexels-photo-5884385.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Mercy General Hospital Wing', location: 'Central Healthcare Hub', status: 'Critical', progress: 89, issues: 18, tests: 34, image: 'https://images.pexels.com/photos/18328706/pexels-photo-18328706.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { name: 'Summit Ridge Shopping Mall', location: 'Western Uplands', status: 'On Track', progress: 55, issues: 7, tests: 22, image: 'https://images.pexels.com/photos/1441009/pexels-photo-1441009.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

const archivedProjects: Project[] = [
  { name: 'Old Town Renovation', location: 'Historic District', status: 'On Track', progress: 100, issues: 0, tests: 0, image: 'https://images.pexels.com/photos/1366944/pexels-photo-1366944.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', archived: true },
  { name: 'Bridge Expansion X-14', location: 'River Crossing', status: 'On Track', progress: 100, issues: 0, tests: 0, image: 'https://images.pexels.com/photos/1105766/pexels-photo-1105766.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', archived: true },
  { name: 'Solar Farm Alpha', location: 'Desert Edge', status: 'On Track', progress: 100, issues: 0, tests: 0, image: 'https://images.pexels.com/photos/433308/pexels-photo-433308.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', archived: true },
];

const statusClass: Record<ProjectStatus, string> = { 'On Track': 'status-track', Delayed: 'status-delayed', Planning: 'status-planning', Critical: 'status-critical' };

function ProjectCard({ project, onOpenDashboard }: { project: Project; onOpenDashboard: () => void }) {
  return (
    <article className={`project-card ${project.archived ? 'archived-card' : ''}`}>
      <div className="project-image-wrap">
        <img src={project.image} alt="" className="project-image" />
        <span className={`project-status ${statusClass[project.status]}`}>{project.status}</span>
      </div>
      <div className="project-body">
        <div className="project-heading"><div><h3>{project.name}</h3><p><MapPin size={11} /> {project.location}</p></div><button className="icon-button" aria-label={`More options for ${project.name}`}><EllipsisVertical size={16} /></button></div>
        <div className="project-label-row"><span>OVERALL COMPLETION</span><strong>{project.progress}%</strong></div>
        <div className="progress-track"><span style={{ width: `${project.progress}%` }} /></div>
        <div className="metric-row">
          <div><small>OPEN ISSUES</small><span className={project.issues > 10 ? 'metric-danger' : 'metric-warning'}><CircleAlert size={12} /> {project.issues}</span></div>
          <div><small>TESTS PENDING</small><span className="metric-blue"><Clock3 size={12} /> {project.tests}</span></div>
        </div>
        <button className={`dashboard-button ${project.archived ? 'archive-button' : ''}`} onClick={project.archived ? undefined : onOpenDashboard}>{project.archived ? 'View Archive' : 'Open Dashboard'} <ExternalLink size={13} /></button>
      </div>
    </article>
  );
}

function Projects({ onSignOut, onOpenDashboard }: { onSignOut: () => void; onOpenDashboard: () => void }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'All' | ProjectStatus>('All');
  const [showArchived, setShowArchived] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesQuery = `${project.name} ${project.location}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (status === 'All' || project.status === status);
  }), [query, status]);

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="topbar-inner"><div className="site-logo"><span className="logo-mark"><span /></span><strong>SiteSphere</strong></div><label className="global-search"><Search size={14} /><input placeholder="Search site data, logs, or reports..." /></label><div className="top-actions"><button className="bell-button" aria-label="Notifications"><Bell size={16} /><i /></button><span className="top-divider" /><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span><strong>Alex Construction</strong><small>Project Manager</small></span><span className="avatar">AC</span><ChevronDown size={13} /></button>{profileOpen && <div className="profile-menu"><strong>Alex Construction</strong><button>Account settings</button><button onClick={onSignOut}>Sign out</button></div>}</div></div>
      </header>
      <main className="content">
        <div className="page-header"><div><h1>Projects Portfolio <span className="header-count">12</span></h1><p>Welcome back, Alex. You have oversight of <b>12 active job sites</b> across the region.</p></div><div className="header-buttons"><button className="secondary-button"><Clock3 size={14} /> Recent History</button><button className="primary-button"><Plus size={15} /> New Project</button></div></div>
        <section className="overview-grid">
          <div className="overview-card"><span className="overview-icon"><Building2 size={17} /></span><div><small>ACTIVE PROJECTS</small><strong>12</strong><p><TrendingUp size={11} /> <b>+2</b> this month</p></div></div>
          <div className="overview-card"><span className="overview-icon"><CircleAlert size={17} /></span><div><small>CRITICAL ISSUES</small><strong>08</strong><p><TrendingUp size={11} /> <b>+15%</b> from last week</p></div></div>
          <div className="overview-card"><span className="overview-icon"><TrendingUp size={17} /></span><div><small>AVG. PROGRESS</small><strong>64%</strong><p>Ahead of schedule</p></div></div>
          <div className="overview-card"><span className="overview-icon"><Users size={17} /></span><div><small>PERSONNEL ONSITE</small><strong>245</strong><p>Across all sites</p></div></div>
        </section>
        <section className="toolbar"><label className="project-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects by name, location, or manager..." />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}</label><div className="toolbar-actions"><label className="select-control"><Filter size={13} /><select value={status} onChange={(event) => setStatus(event.target.value as 'All' | ProjectStatus)}><option value="All">Status: All</option><option value="On Track">On Track</option><option value="Delayed">Delayed</option><option value="Planning">Planning</option><option value="Critical">Critical</option></select><ChevronDown size={13} /></label><button className="sort-button"><Settings2 size={13} /> Sort: Newest <ChevronDown size={13} /></button><button className={`view-button ${gridView ? 'active' : ''}`} onClick={() => setGridView(true)} aria-label="Grid view"><Grid2X2 size={15} /></button><button className={`view-button ${!gridView ? 'active' : ''}`} onClick={() => setGridView(false)} aria-label="List view"><LayoutList size={15} /></button></div></section>
        <section className="project-section"><div className="section-heading"><div><h2>Active Projects <span>{filteredProjects.length}</span></h2><p>Ongoing construction and development projects currently in progress.</p></div></div><div className={`projects-grid ${gridView ? '' : 'list-view'}`}>{filteredProjects.map((project) => <ProjectCard key={project.name} project={project} onOpenDashboard={onOpenDashboard} />)}</div>{filteredProjects.length === 0 && <div className="empty-state">No projects match your search.</div>}</section>
        <button className="archive-toggle" onClick={() => setShowArchived(!showArchived)}><span />{showArchived ? 'Hide' : 'Show'} Archived Projects <span className="archive-count">3</span><ChevronDown size={13} className={showArchived ? 'rotated' : ''} /><span /></button>
        {showArchived && <section className="project-section archived-section"><div className="section-heading"><div><h2>Archived Projects <span>3</span></h2><p>Historical projects that have been completed or indefinitely paused.</p></div></div><div className="projects-grid">{archivedProjects.map((project) => <ProjectCard key={project.name} project={project} onOpenDashboard={onOpenDashboard} />)}</div></section>}
        <div className="pagination"><span>Showing <b>{Math.min(filteredProjects.length, 6)}</b> of 12 active projects</span><div><button disabled><ChevronLeft size={14} /> Previous</button><button className="page-active">1</button><button>2</button><button>3</button><button>Next <ChevronRight size={14} /></button></div></div>
      </main>
      <footer className="footer"><div className="footer-inner"><div><div className="site-logo"><span className="logo-mark"><span /></span><strong>SiteSphere</strong></div><p>© 2024 SiteSphere Construction Systems. All rights reserved.<br />Professional Grade Construction Management for Enterprise.</p></div><div className="footer-links"><div><b>RESOURCES</b><a>Documentation</a><a>API Reference</a><a>Safety Protocols</a></div><div><b>SUPPORT</b><a>Help Center</a><a>Contact Support</a><a>Training Hub</a></div><div><b>LEGAL</b><a>Privacy Policy</a><a>Terms of Service</a><a>Cookie Settings</a></div></div></div></footer>
    </div>
  );
}

export default Projects;

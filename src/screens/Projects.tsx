import { useEffect, useMemo, useState } from 'react';
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

type ApiProject = {
  projectId: string;
  projectName: string;
  isArchived: boolean;
  startDate: string | null;
  endDate: string | null;
  projectImage: string | null;
  city: string | null;
  country: string | null;
  numberOfIssues: number;
  numberOfTestsPending: number;
};

type ApiResponse = {
  data: ApiProject[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

type Project = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  issues: number;
  tests: number;
  image: string;
  archived: boolean;
};

const FALLBACK_IMAGE = 'https://images.pexels.com/photos/5884385/pexels-photo-5884385.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function buildLocation(city: string | null, country: string | null): string {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return 'Location not set';
}

function ProjectCard({ project, onOpenDashboard }: { project: Project; onOpenDashboard: () => void }) {
  return (
    <article className={`project-card ${project.archived ? 'archived-card' : ''}`}>
      <div className="project-image-wrap">
        <img src={project.image} alt="" className="project-image" />
      </div>
      <div className="project-body">
        <div className="project-heading"><div><h3>{project.name}</h3><p><MapPin size={11} /> {project.location}</p></div><button className="icon-button" aria-label={`More options for ${project.name}`}><EllipsisVertical size={16} /></button></div>
        <div className="project-date-row"><div><small>START DATE</small><span>{project.startDate}</span></div><div><small>END DATE</small><span>{project.endDate}</span></div></div>
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
  const [showArchived, setShowArchived] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalActive, setTotalActive] = useState(0);
  const [totalArchived, setTotalArchived] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [totalTests, setTotalTests] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('http://localhost:4000/projects/');
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json: ApiResponse = await res.json();
        if (cancelled) return;
        const mapped: Project[] = json.data.map((p) => ({
          id: p.projectId,
          name: p.projectName,
          location: buildLocation(p.city, p.country),
          startDate: formatDate(p.startDate),
          endDate: formatDate(p.endDate),
          issues: p.numberOfIssues,
          tests: p.numberOfTestsPending,
          image: p.projectImage || FALLBACK_IMAGE,
          archived: p.isArchived,
        }));
        setProjects(mapped);
        setTotalActive(mapped.filter((p) => !p.archived).length);
        setTotalArchived(mapped.filter((p) => p.archived).length);
        setTotalIssues(mapped.reduce((s, p) => s + p.issues, 0));
        setTotalTests(mapped.reduce((s, p) => s + p.tests, 0));
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load projects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const activeProjects = useMemo(() => projects.filter((p) => !p.archived), [projects]);
  const archivedProjects = useMemo(() => projects.filter((p) => p.archived), [projects]);

  const filteredProjects = useMemo(() => activeProjects.filter((project) => {
    return `${project.name} ${project.location}`.toLowerCase().includes(query.toLowerCase());
  }), [activeProjects, query]);

  return (
    <div className="app-frame">
      <header className="topbar">
        <div className="topbar-inner"><div className="site-logo"><span className="logo-mark"><span /></span><strong>SiteSphere</strong></div><label className="global-search"><Search size={14} /><input placeholder="Search site data, logs, or reports..." /></label><div className="top-actions"><button className="bell-button" aria-label="Notifications"><Bell size={16} /><i /></button><span className="top-divider" /><button className="profile-button" onClick={() => setProfileOpen(!profileOpen)}><span><strong>Alex Construction</strong><small>Project Manager</small></span><span className="avatar">AC</span><ChevronDown size={13} /></button>{profileOpen && <div className="profile-menu"><strong>Alex Construction</strong><button>Account settings</button><button onClick={onSignOut}>Sign out</button></div>}</div></div>
      </header>
      <main className="content">
        <div className="page-header"><div><h1>Projects Portfolio <span className="header-count">{totalActive}</span></h1><p>Welcome back, Alex. You have oversight of <b>{totalActive} active job sites</b> across the region.</p></div><div className="header-buttons"><button className="secondary-button"><Clock3 size={14} /> Recent History</button><button className="primary-button"><Plus size={15} /> New Project</button></div></div>
        <section className="overview-grid">
          <div className="overview-card"><span className="overview-icon"><Building2 size={17} /></span><div><small>ACTIVE PROJECTS</small><strong>{totalActive}</strong><p><TrendingUp size={11} /> <b>+2</b> this month</p></div></div>
          <div className="overview-card"><span className="overview-icon"><CircleAlert size={17} /></span><div><small>OPEN ISSUES</small><strong>{String(totalIssues).padStart(2, '0')}</strong><p><TrendingUp size={11} /> Across all sites</p></div></div>
          <div className="overview-card"><span className="overview-icon"><Clock3 size={17} /></span><div><small>TESTS PENDING</small><strong>{totalTests}</strong><p>Awaiting results</p></div></div>
          <div className="overview-card"><span className="overview-icon"><Users size={17} /></span><div><small>PERSONNEL ONSITE</small><strong>245</strong><p>Across all sites</p></div></div>
        </section>
        <section className="toolbar"><label className="project-search"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects by name, location, or manager..." />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={13} /></button>}</label><div className="toolbar-actions"><button className="sort-button"><Settings2 size={13} /> Sort: Newest <ChevronDown size={13} /></button><button className={`view-button ${gridView ? 'active' : ''}`} onClick={() => setGridView(true)} aria-label="Grid view"><Grid2X2 size={15} /></button><button className={`view-button ${!gridView ? 'active' : ''}`} onClick={() => setGridView(false)} aria-label="List view"><LayoutList size={15} /></button></div></section>
        {loading && <div className="empty-state">Loading projects…</div>}
        {error && <div className="empty-state">Unable to load projects: {error}</div>}
        {!loading && !error && (
          <section className="project-section"><div className="section-heading"><div><h2>Active Projects <span>{filteredProjects.length}</span></h2><p>Ongoing construction and development projects currently in progress.</p></div></div><div className={`projects-grid ${gridView ? '' : 'list-view'}`}>{filteredProjects.map((project) => <ProjectCard key={project.id} project={project} onOpenDashboard={onOpenDashboard} />)}</div>{filteredProjects.length === 0 && <div className="empty-state">No projects match your search.</div>}</section>
        )}
        {!loading && !error && totalArchived > 0 && (
          <>
            <button className="archive-toggle" onClick={() => setShowArchived(!showArchived)}><span />{showArchived ? 'Hide' : 'Show'} Archived Projects <span className="archive-count">{totalArchived}</span><ChevronDown size={13} className={showArchived ? 'rotated' : ''} /><span /></button>
            {showArchived && <section className="project-section archived-section"><div className="section-heading"><div><h2>Archived Projects <span>{totalArchived}</span></h2><p>Historical projects that have been completed or indefinitely paused.</p></div></div><div className="projects-grid">{archivedProjects.map((project) => <ProjectCard key={project.id} project={project} onOpenDashboard={onOpenDashboard} />)}</div></section>}
          </>
        )}
      </main>
      <footer className="footer"><div className="footer-inner"><div><div className="site-logo"><span className="logo-mark"><span /></span><strong>SiteSphere</strong></div><p>© 2024 SiteSphere Construction Systems. All rights reserved.<br />Professional Grade Construction Management for Enterprise.</p></div><div className="footer-links"><div><b>RESOURCES</b><a>Documentation</a><a>API Reference</a><a>Safety Protocols</a></div><div><b>SUPPORT</b><a>Help Center</a><a>Contact Support</a><a>Training Hub</a></div><div><b>LEGAL</b><a>Privacy Policy</a><a>Terms of Service</a><a>Cookie Settings</a></div></div></div></footer>
    </div>
  );
}

export default Projects;

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Bell, Building2, CalendarDays, ChartNoAxesColumnIncreasing, CircleAlert, Clock3, ExternalLink, FolderKanban, MapPin, Search, TestTube2, Users } from 'lucide-react';

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

type ApiResponse = { data: ApiProject[] };
type ProjectScope = 'Active' | 'Archived' | 'All Projects';

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function projectLocation(project: ApiProject): string {
  const location = [project.city, project.country].filter(Boolean).join(', ');
  return location || 'Location not set';
}

function PortfolioDashboard({ onBackToProjects, onSignOut }: { onBackToProjects: () => void; onSignOut: () => void }) {
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<ProjectScope>('Active');

  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch('http://localhost:4000/projects/');
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const result: ApiResponse = await response.json();
        setProjects(result.data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    }

    void loadProjects();
  }, []);

  const activeProjects = useMemo(() => projects.filter((project) => !project.isArchived), [projects]);
  const archivedCount = projects.length - activeProjects.length;
  const totalIssues = activeProjects.reduce((total, project) => total + project.numberOfIssues, 0);
  const totalTests = activeProjects.reduce((total, project) => total + project.numberOfTestsPending, 0);

  const filteredProjects = useMemo(() => projects.filter((project) => {
    const matchesScope = scope === 'All Projects' || project.isArchived === (scope === 'Archived');
    const matchesQuery = `${project.projectName} ${projectLocation(project)}`.toLowerCase().includes(query.toLowerCase());
    return matchesScope && matchesQuery;
  }), [projects, query, scope]);

  const highestIssueProjects = useMemo(() => [...activeProjects].sort((a, b) => b.numberOfIssues - a.numberOfIssues).slice(0, 5), [activeProjects]);
  const highestTestProjects = useMemo(() => [...activeProjects].sort((a, b) => b.numberOfTestsPending - a.numberOfTestsPending).slice(0, 5), [activeProjects]);
  const maximumIssues = Math.max(1, ...highestIssueProjects.map((project) => project.numberOfIssues));
  const maximumTests = Math.max(1, ...highestTestProjects.map((project) => project.numberOfTestsPending));

  return (
    <div className="portfolio-dashboard">
      <header className="portfolio-topbar">
        <button className="portfolio-brand" onClick={onBackToProjects}><span className="portfolio-brand-mark"><FolderKanban size={17} /></span><strong>SiteSphere</strong></button>
        <span className="portfolio-topbar-divider" />
        <span className="portfolio-workspace-label">PROJECT PORTFOLIO</span>
        <div className="portfolio-user-actions"><button className="portfolio-notifications" aria-label="Notifications"><Bell size={17} /><i /></button><span className="portfolio-avatar">AC</span><button className="portfolio-signout" onClick={onSignOut}>Sign out</button></div>
      </header>

      <main className="portfolio-content">
        <button className="portfolio-back" onClick={onBackToProjects}><ArrowLeft size={14} /> Projects</button>
        <div className="portfolio-heading"><div><span className="portfolio-eyebrow">CROSS-PROJECT OVERVIEW</span><h1>Portfolio Dashboard</h1><p>Performance and workload across your construction projects.</p></div><span className="portfolio-updated"><Clock3 size={13} /> Live project data</span></div>

        <section className="portfolio-metrics" aria-label="Portfolio metrics">
          <article><span className="portfolio-metric-icon blue"><Building2 size={17} /></span><div><small>ACTIVE PROJECTS</small><strong>{activeProjects.length}</strong><span>Across the portfolio</span></div></article>
          <article><span className="portfolio-metric-icon red"><CircleAlert size={17} /></span><div><small>OPEN ISSUES</small><strong>{totalIssues.toLocaleString()}</strong><span>Active projects</span></div></article>
          <article><span className="portfolio-metric-icon teal"><TestTube2 size={17} /></span><div><small>TESTS PENDING</small><strong>{totalTests.toLocaleString()}</strong><span>Awaiting results</span></div></article>
          <article><span className="portfolio-metric-icon amber"><FolderKanban size={17} /></span><div><small>ARCHIVED PROJECTS</small><strong>{archivedCount}</strong><span>Historical records</span></div></article>
        </section>

        <section className="portfolio-workload-grid">
          <article className="portfolio-panel workload-panel">
            <div className="portfolio-panel-heading"><div><span className="portfolio-section-icon red"><ChartNoAxesColumnIncreasing size={16} /></span><div><h2>Open issue load</h2><p>Active projects with the most reported issues</p></div></div><span className="portfolio-panel-tag">TOP 5</span></div>
            {loading ? <div className="portfolio-panel-state">Loading project data…</div> : highestIssueProjects.length ? <div className="portfolio-bars">{highestIssueProjects.map((project) => <div className="portfolio-bar-row" key={project.projectId}><div className="portfolio-bar-label"><strong>{project.projectName}</strong><span>{project.numberOfIssues}</span></div><div className="portfolio-bar-track"><i style={{ width: `${Math.max(3, (project.numberOfIssues / maximumIssues) * 100)}%` }} /></div></div>)}</div> : <div className="portfolio-panel-state">No active project issue data available.</div>}
          </article>
          <article className="portfolio-panel workload-panel tests-panel">
            <div className="portfolio-panel-heading"><div><span className="portfolio-section-icon teal"><TestTube2 size={16} /></span><div><h2>Tests awaiting results</h2><p>Pending tests across active project sites</p></div></div><span className="portfolio-panel-tag">TOP 5</span></div>
            {loading ? <div className="portfolio-panel-state">Loading project data…</div> : highestTestProjects.length ? <div className="portfolio-bars">{highestTestProjects.map((project) => <div className="portfolio-bar-row" key={project.projectId}><div className="portfolio-bar-label"><strong>{project.projectName}</strong><span>{project.numberOfTestsPending}</span></div><div className="portfolio-bar-track teal"><i style={{ width: `${Math.max(3, (project.numberOfTestsPending / maximumTests) * 100)}%` }} /></div></div>)}</div> : <div className="portfolio-panel-state">No active project test data available.</div>}
          </article>
        </section>

        <section className="portfolio-projects-section">
          <div className="portfolio-projects-heading"><div><span className="portfolio-eyebrow">PROJECT REGISTER</span><h2>All projects <span>{filteredProjects.length}</span></h2><p>Search project sites and compare current workloads.</p></div></div>
          <div className="portfolio-project-toolbar"><label className="portfolio-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name or location" /></label><div className="portfolio-scope" role="group" aria-label="Project scope">{(['Active', 'Archived', 'All Projects'] as ProjectScope[]).map((option) => <button className={scope === option ? 'active' : ''} key={option} onClick={() => setScope(option)}>{option}</button>)}</div></div>
          {loading ? <div className="portfolio-table-state">Loading projects…</div> : error ? <div className="portfolio-table-state error">Could not load projects: {error}</div> : filteredProjects.length ? <div className="portfolio-table-wrap"><table className="portfolio-table"><thead><tr><th>PROJECT</th><th>LOCATION</th><th>START DATE</th><th>END DATE</th><th>OPEN ISSUES</th><th>TESTS PENDING</th><th>STATUS</th></tr></thead><tbody>{filteredProjects.map((project) => <tr key={project.projectId}><td><strong>{project.projectName}</strong><small>{project.projectId}</small></td><td><span className="portfolio-location"><MapPin size={12} />{projectLocation(project)}</span></td><td><span className="portfolio-date"><CalendarDays size={12} />{formatDate(project.startDate)}</span></td><td><span className="portfolio-date"><CalendarDays size={12} />{formatDate(project.endDate)}</span></td><td><span className={`portfolio-count ${project.numberOfIssues > 10 ? 'warning' : ''}`}><CircleAlert size={12} />{project.numberOfIssues}</span></td><td><span className="portfolio-count test-count"><TestTube2 size={12} />{project.numberOfTestsPending}</span></td><td><span className={`portfolio-status ${project.isArchived ? 'archived' : 'active'}`}>{project.isArchived ? 'Archived' : 'Active'}</span></td></tr>)}</tbody></table></div> : <div className="portfolio-table-state">No projects match your search.</div>}
          {error && <button className="portfolio-retry" onClick={() => window.location.reload()}><ExternalLink size={13} /> Reload dashboard</button>}
        </section>
        <footer className="portfolio-footer"><span><Users size={13} /> Portfolio access for Alex Construction</span><span>Data shown reflects the latest project records</span></footer>
      </main>
    </div>
  );
}

export default PortfolioDashboard;
import { useState } from 'react';
import SignIn from '@/screens/SignIn';
import Projects from '@/screens/Projects';
import Dashboard from '@/screens/Dashboard';
import ChecklistDashboard from '@/screens/ChecklistDashboard';
import CompanyChecklists from '@/screens/CompanyChecklists';
import Issues from '@/screens/Issues';
import NewIssue from '@/screens/NewIssue';
import Reports from '@/screens/Reports';
import Testing from '@/screens/Testing';
import Submittals from '@/screens/Submittals';

type Screen = 'signin' | 'projects' | 'dashboard' | 'checklist' | 'company' | 'issues' | 'new-issue' | 'reports' | 'testing' | 'submittals';

function App() {
  const [screen, setScreen] = useState<Screen>('signin');

  if (screen === 'projects') {
    return <Projects onSignOut={() => setScreen('signin')} onOpenDashboard={() => setScreen('dashboard')} />;
  }
  if (screen === 'dashboard') {
    return <Dashboard onBackToProjects={() => setScreen('projects')} onOpenChecklist={() => setScreen('checklist')} onOpenCompanyChecklists={() => setScreen('company')} onOpenIssues={() => setScreen('issues')} onOpenReports={() => setScreen('reports')} onOpenTesting={() => setScreen('testing')} onOpenSubmittals={() => setScreen('submittals')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'checklist') {
    return <ChecklistDashboard onBackToProject={() => setScreen('dashboard')} onOpenReports={() => setScreen('reports')} onOpenSubmittals={() => setScreen('submittals')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'company') {
    return <CompanyChecklists onBackToProject={() => setScreen('dashboard')} onOpenReports={() => setScreen('reports')} onOpenSubmittals={() => setScreen('submittals')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'issues') {
    return <Issues onBackToProject={() => setScreen('dashboard')} onOpenReports={() => setScreen('reports')} onOpenSubmittals={() => setScreen('submittals')} onSignOut={() => setScreen('signin')} onReportIssue={() => setScreen('new-issue')} />;
  }
  if (screen === 'new-issue') {
    return <NewIssue onBackToIssues={() => setScreen('issues')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'reports') {
    return <Reports onBackToProject={() => setScreen('dashboard')} onOpenSubmittals={() => setScreen('submittals')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'testing') {
    return <Testing onBackToProject={() => setScreen('dashboard')} onOpenReports={() => setScreen('reports')} onOpenSubmittals={() => setScreen('submittals')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'submittals') {
    return <Submittals onBackToProject={() => setScreen('dashboard')} onSignOut={() => setScreen('signin')} />;
  }
  return <SignIn onSignIn={() => setScreen('projects')} />;
}

export default App;

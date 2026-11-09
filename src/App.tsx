import { useState } from 'react';
import SignIn from '@/screens/SignIn';
import Projects from '@/screens/Projects';
import Dashboard from '@/screens/Dashboard';
import PortfolioDashboard from '@/screens/PortfolioDashboard';
import ChecklistDashboard from '@/screens/ChecklistDashboard';
import CompanyChecklists from '@/screens/CompanyChecklists';
import Issues from '@/screens/Issues';
import NewIssue from '@/screens/NewIssue';
import Reports from '@/screens/Reports';
import Testing from '@/screens/Testing';
import Submittals from '@/screens/Submittals';
import HSE from '@/screens/HSE';
import Milestones from '@/screens/Milestones';
import NewMilestone from '@/screens/NewMilestone';
import Personas from '@/screens/Personas';
import AssetsEquip from '@/screens/AssetsEquip';
import ChangeLog from '@/screens/ChangeLog';
import type { MainNavigationTarget } from '@/navigation';

type Screen = 'signin' | 'projects' | 'portfolio' | 'dashboard' | 'checklist' | 'company' | 'issues' | 'new-issue' | 'reports' | 'testing' | 'submittals' | 'hse' | 'personas' | 'assets' | 'milestones' | 'new-milestone' | 'changelog';

function App() {
  const [screen, setScreen] = useState<Screen>('signin');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const navigateMain = (destination: MainNavigationTarget) => setScreen(destination);

  if (screen === 'projects') {
    return <Projects onSignOut={() => setScreen('signin')} onOpenDashboard={(projectId) => { setSelectedProjectId(projectId); setScreen('dashboard'); }} onOpenPortfolioDashboard={() => setScreen('portfolio')} />;
  }
  if (screen === 'portfolio') {
    return <PortfolioDashboard onBackToProjects={() => setScreen('projects')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'dashboard') {
    return <Dashboard projectId={selectedProjectId} onBackToProjects={() => setScreen('projects')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  // if (screen === 'checklist') {
  //   return <ChecklistDashboard onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  // }
  if (screen === 'company') {
    return <CompanyChecklists projectId={selectedProjectId} onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'issues') {
    return <Issues onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} onReportIssue={() => setScreen('new-issue')} />;
  }
  if (screen === 'new-issue') {
    return <NewIssue onBackToIssues={() => setScreen('issues')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'reports') {
    return <Reports onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'testing') {
    return <Testing onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'personas') {
    return <Personas projectId={selectedProjectId} onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'assets') {
    return <AssetsEquip projectId={selectedProjectId} onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'submittals') {
    return <Submittals onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'hse') {
    return <HSE onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'milestones') {
    return <Milestones onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} onOpenNewMilestone={() => setScreen('new-milestone')} />;
  }
  if (screen === 'new-milestone') {
    return <NewMilestone onBackToMilestones={() => setScreen('milestones')} onBackToProject={() => setScreen('dashboard')} onNavigate={navigateMain} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'changelog') {
    return <ChangeLog onBackToProject={() => setScreen('dashboard')} onSignOut={() => setScreen('signin')} />;
  }
  return <SignIn onSignIn={() => setScreen('projects')} />;
}

export default App;

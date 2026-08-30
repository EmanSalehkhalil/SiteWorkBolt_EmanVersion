import { useState } from 'react';
import SignIn from '@/screens/SignIn';
import Projects from '@/screens/Projects';
import Dashboard from '@/screens/Dashboard';
import ChecklistDashboard from '@/screens/ChecklistDashboard';
import CompanyChecklists from '@/screens/CompanyChecklists';
import Issues from '@/screens/Issues';

type Screen = 'signin' | 'projects' | 'dashboard' | 'checklist' | 'company' | 'issues';

function App() {
  const [screen, setScreen] = useState<Screen>('signin');

  if (screen === 'projects') {
    return <Projects onSignOut={() => setScreen('signin')} onOpenDashboard={() => setScreen('dashboard')} />;
  }
  if (screen === 'dashboard') {
    return <Dashboard onBackToProjects={() => setScreen('projects')} onOpenChecklist={() => setScreen('checklist')} onOpenCompanyChecklists={() => setScreen('company')} onOpenIssues={() => setScreen('issues')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'checklist') {
    return <ChecklistDashboard onBackToProject={() => setScreen('dashboard')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'company') {
    return <CompanyChecklists onBackToProject={() => setScreen('dashboard')} onSignOut={() => setScreen('signin')} />;
  }
  if (screen === 'issues') {
    return <Issues onBackToProject={() => setScreen('dashboard')} onSignOut={() => setScreen('signin')} />;
  }
  return <SignIn onSignIn={() => setScreen('projects')} />;
}

export default App;

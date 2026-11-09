export type MainNavigationTarget =
  | 'dashboard'
  | 'submittals'
  | 'hse'
  | 'issues'
  | 'checklist'
  | 'company'
  // | 'testing'
  | 'milestones'
  | 'reports'
  | 'personas'
  | 'assets'
  | 'changelog';

const navigationTargets: Record<string, MainNavigationTarget> = {
  Dashboard: 'dashboard',
  Submittals: 'submittals',
  HSE: 'hse',
  Issues: 'issues',
  'Checklist Stats': 'checklist',
  Checklist: 'company',
  // 'Testing Workflow': 'testing',
  Milestones: 'milestones',
  Reports: 'reports',
  Personas: 'personas',
  'Assets & Equipment': 'assets',
  'Change Log': 'changelog',
};

export function getMainNavigationTarget(label: string): MainNavigationTarget {
  const target = navigationTargets[label];
  if (!target) {
    throw new Error(`No route configured for main navigation item "${label}".`);
  }
  return target;
}

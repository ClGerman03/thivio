export { default as DebateWorkflow, type StepInfo, type DebateConfig } from './DebateWorkflow';

// Exportación explícita de los componentes de pasos
export { default as TopicSelection } from './steps/TopicSelection';
export { default as DebateTypeSelection } from './steps/DebateTypeSelection';
export { default as UserRoleSelection } from './steps/UserRoleSelection';

export { default as DebateWorkflow, type StepInfo, type DebateConfig } from './DebateWorkflow';

// Exportación explícita de los componentes de pasos
export { default as TopicSelection } from './steps/TopicSelection';
export { default as InitialPositionSelection } from './steps/InitialPositionSelection';
export { default as OpponentSelection } from './steps/OpponentSelection';
export { default as DebateFormatSelection } from './steps/DebateFormatSelection';

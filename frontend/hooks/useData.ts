// Re-export hooks from their new locations for backward compatibility

// Extracted in this refactor
export { useBabies } from '@/hooks/useBabies';
export { useRecords } from '@/hooks/useRecords';
export { useFamilySettings, useFamilyMembers } from '@/hooks/useFamily';

// Previously extracted
export { useContractions } from '@/hooks/useContraction';
export { useSleeps } from '@/hooks/useSleep';
export { useDiapers } from '@/hooks/useDiaper';
export { useGrowths } from '@/hooks/useGrowth';
export { useMilestoneTimeline } from '@/hooks/useMilestone';
export { useVaccinations } from '@/hooks/useVaccination';

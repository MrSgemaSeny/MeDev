/**
 * Centralized React Query key registry.
 * All query keys must be defined here to prevent silent cache key drift during refactoring.
 *
 * Convention: use tuple form ['domain', ...params] — React Query matches by structural equality.
 */
export const queryKeys = {
  jobApplications: {
    all: ['job-applications'] as const,
  },
  ai: {
    match: (jobDescription: string) => ['ai', 'match', jobDescription] as const,
  },
} as const;

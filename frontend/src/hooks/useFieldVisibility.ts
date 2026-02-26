import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { FieldVisibilityLevel } from '../backend';

export function useGetFieldVisibilityConfig() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, FieldVisibilityLevel]>>({
    queryKey: ['fieldVisibilityConfig'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFieldVisibilityConfig();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPublicFieldVisibility() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, FieldVisibilityLevel]>>({
    queryKey: ['publicFieldVisibility'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPublicFieldVisibility();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetFieldVisibility() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ field, level }: { field: string; level: FieldVisibilityLevel }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setFieldVisibility(field, level);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fieldVisibilityConfig'] });
      queryClient.invalidateQueries({ queryKey: ['publicFieldVisibility'] });
    },
  });
}

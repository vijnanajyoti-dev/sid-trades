import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole } from '../backend';
import type { Principal } from '@icp-sdk/core/principal';

export function useGetCallerUserRole() {
  const { actor, isFetching } = useActor();

  return useQuery<UserRole>({
    queryKey: ['callerUserRole'],
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getUserRole();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListUsers() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[Principal, UserRole]>>({
    queryKey: ['listUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetUserRole() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ user, role }: { user: Principal; role: UserRole }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setUserRole(user, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listUsers'] });
    },
  });
}

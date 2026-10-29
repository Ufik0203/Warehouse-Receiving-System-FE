import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 30000 }, mutations: { retry: false } } });
}

import { useState } from "react";
import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "../config/query-client";
import { AuthProvider } from "../features/auth/hooks/use-auth";

export function Providers({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}

import React from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";

export function renderWithProviders(
  ui: React.ReactElement,
  { route = "/" } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        {/* Add your app-specific providers here (e.g., ThemeProvider, ToastProvider) */}
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

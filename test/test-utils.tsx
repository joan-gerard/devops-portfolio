import { AuthSessionProvider } from "@/components/providers/AuthSessionProvider";
import { render, type RenderOptions } from "@testing-library/react";
import { type Session } from "next-auth";
import type { ReactElement, ReactNode } from "react";

/**
 * Default session for tests: unauthenticated.
 * Override when testing authenticated UI.
 */
const defaultSession: Session | null = null;

interface AllTheProvidersProps {
  children: ReactNode;
  session?: Session | null;
}

function AllTheProviders({ children, session = defaultSession }: AllTheProvidersProps) {
  return <AuthSessionProvider session={session}>{children}</AuthSessionProvider>;
}

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  session?: Session | null;
}

/**
 * Renders a React tree with app providers (e.g. AuthSessionProvider).
 * Use this instead of @testing-library/react's render when the component
 * under test depends on Next-Auth session context.
 */
function customRender(ui: ReactElement, options: CustomRenderOptions = {}) {
  const { session = defaultSession, ...renderOptions } = options;
  return render(ui, {
    wrapper: ({ children }) => <AllTheProviders session={session}>{children}</AllTheProviders>,
    ...renderOptions,
  });
}

export * from "@testing-library/react";
export { customRender as render };

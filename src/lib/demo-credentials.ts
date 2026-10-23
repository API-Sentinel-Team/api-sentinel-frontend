export type DemoCredentials = { email: string; password: string };

export function pickDemoCredentials(email?: string, password?: string): DemoCredentials | null {
  if (!email?.trim() || !password) return null;
  return { email: email.trim(), password };
}

// Dev-only convenience for the login form. The DEV ternary is replaced with `false` in production
// builds, so the minifier drops the env lookups and no credential string ever reaches the bundle.
// Set VITE_DEMO_ADMIN_EMAIL / VITE_DEMO_ADMIN_PASSWORD in .env.development.local to enable it.
export const DEMO_CREDENTIALS: DemoCredentials | null = import.meta.env.DEV
  ? pickDemoCredentials(import.meta.env.VITE_DEMO_ADMIN_EMAIL, import.meta.env.VITE_DEMO_ADMIN_PASSWORD)
  : null;

import { useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="app-shell relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-base">
      <div className="app-aurora" aria-hidden />
      <div className="text-center animate-fade-in">
        {/* Glitch 404 */}
        <div className="relative mb-6">
          <h1 className="text-[120px] font-extrabold leading-none text-gradient-brand opacity-20">404</h1>
          <h1 className="absolute inset-0 text-[120px] font-extrabold leading-none text-gradient-brand flex items-center justify-center">
            404
          </h1>
        </div>

        <div className="glass-card-premium rounded-2xl p-8 max-w-md mx-auto">
          <h2 className="text-xl font-bold text-text-primary mb-2">Page Not Found</h2>
          <p className="text-sm text-text-secondary mb-6">
            The page <code className="text-brand text-xs font-mono bg-brand/10 px-1.5 py-0.5 rounded">{location.pathname}</code> doesn't exist.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-text-secondary border border-border-subtle hover:border-brand/30 hover:text-text-primary transition-all"
            >
              <ArrowLeft size={14} />
              Go Back
            </button>
            <Link
              to="/app/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-brand hover:bg-brand-light transition-all shadow-[0_0_20px_var(--brand-glow)]"
            >
              <Home size={14} />
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

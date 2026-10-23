import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import { Logo } from '../components/layout/Logo';
import { useAcademy } from '../context/AcademyContext';

export default function NotFoundPage() {
  const { base } = useAcademy();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <Logo size={56} />
      <Ghost size={40} className="mt-8 text-dim" />
      <h1 className="mt-4 font-mono text-2xl font-bold">404 — component not found</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        This route does not exist in the academy. Maybe the activity was never exported?
      </p>
      <div className="mt-6 flex gap-3">
        <Link to={`${base}/dashboard`} className="btn-primary">
          Dashboard
        </Link>
        <Link to={`${base}/path`} className="btn-ghost">
          Learning path
        </Link>
      </div>
    </div>
  );
}

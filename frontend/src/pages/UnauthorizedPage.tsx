import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <Card glass className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center ring-8 ring-rose-500/5">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-600 dark:text-rose-400">
            403 • Restricted Access
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Administrator Privilege Required
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            You do not have administrative authorization to view this HR management portal section.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/dashboard')}
            className="gap-2 text-xs"
          >
            <Home className="w-4 h-4" /> My Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

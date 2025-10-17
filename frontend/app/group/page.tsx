'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GroupRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /groups (plural)
    router.replace('/groups');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600 dark:text-slate-400">Redirecting to groups...</p>
      </div>
    </div>
  );
}

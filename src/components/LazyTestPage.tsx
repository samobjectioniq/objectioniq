'use client';

import { Suspense, lazy } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const TestPage = lazy(() => import('@/app/test/page'));

export default function LazyTestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" message="Loading Test Suite..." />
        </div>
      </div>
    }>
      <TestPage />
    </Suspense>
  );
} 
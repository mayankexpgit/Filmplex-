
'use client';

import dynamic from 'next/dynamic';
import FilmpilexLoader from '@/components/ui/filmplex-loader';

const ManagementManager = dynamic(
  () => import('@/components/admin/management-manager'),
  {
    loading: () => (
        <div className="flex justify-center items-center h-64">
            <FilmpilexLoader />
        </div>
    ),
    ssr: false // Ensure it's only rendered on the client side
  }
);

export default function ManagementPage() {
  return (
    <div className="container mx-auto py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <ManagementManager />
      </div>
    </div>
  );
}

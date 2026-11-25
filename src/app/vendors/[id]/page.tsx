import { Suspense } from 'react';
import { VendorDetailClient } from './VendorDetailClient';

async function VendorDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VendorDetailClient vendorId={id} />;
}

export default function VendorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 text-xs text-slate-500">Loading vendor...</div>}>
      <VendorDetailContent params={params} />
    </Suspense>
  );
}

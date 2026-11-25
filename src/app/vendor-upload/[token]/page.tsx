import { Suspense } from 'react';
import { VendorUploadClient } from './VendorUploadClient';

async function VendorUploadContent({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <VendorUploadClient token={token} />;
}

export default function VendorUploadPortalPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 text-xs text-slate-500">Loading upload portal...</div>}>
      <VendorUploadContent params={params} />
    </Suspense>
  );
}

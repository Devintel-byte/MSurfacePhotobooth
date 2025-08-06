'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const RatioSelection = () =>{
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter_id');
  const router = useRouter();

  useEffect(() => {
    if (!filterId) {
      router.push('/filter');
      return;
    }

    // Auto-redirect to gender page with portrait settings
    router.push(`/gender?filter_id=${filterId}&ratio=portrait&width=768&height=1152`);
  }, [filterId, router]);

  return (
    <div className="min-h-screen bg-orange-500 py-12 px-4 sm:px-6 lg:px-8">
      <p className="text-center uppercase mt-5 mb-10 text-lg text-white">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Loading...</h1>
        <p className="text-center text-white">Setting portrait mode (768 × 1152px)...</p>
      </div>
    </div>
  );
}

/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { retrieveImage } from '../../lib/api';
import { useEdgeStore } from '../../lib/edgestore';
import QRCodeModal from '../components/QRCodeModal';

type RetrievalResponse = {
  id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  output?: { images: string[] };
  error?: string;
};

export const ResultPage = () => {
  const searchParams = useSearchParams();
  const [imageLoading, setImageLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [compositeImage, setCompositeImage] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const jobId = searchParams.get('job_id');
  const filterId = searchParams.get('filter_id');
  const [result, setResult] = useState<RetrievalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { edgestore } = useEdgeStore();

  // Dimensions and overlay image
  const width = Number(searchParams.get('width')) || 768;
  const height = Number(searchParams.get('height')) || 1152;
  const OVERLAY_IMAGE = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/Booth_overlay_PRE.png`;
  useEffect(() => {
    if (!jobId || !filterId) {
      setError('Missing required parameters.');
      router.push('/filter');
      return;
    }

    const fetchResult = async () => {
      try {
        const data = await retrieveImage(jobId);
        setResult(data);

        if (data.status === 'COMPLETED' && data.output?.images?.[0]) {
          const fullImageUrl = formatBase64(data.output.images[0]);
          setImageUrl(fullImageUrl);
          await createCompositeImage(fullImageUrl);
        }
      } catch (err) {
        setError('Failed to retrieve image. Please try again.');
        console.error('Result fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [jobId, filterId, router]);

  const createCompositeImage = async (imageUrl: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Load the generated image
      const generatedImg = new window.Image();
      generatedImg.src = imageUrl;
      await new Promise((resolve) => {
        generatedImg.onload = resolve;
      });

      // Load the overlay image
      const overlayImg = new window.Image();
      overlayImg.src = OVERLAY_IMAGE;
      await new Promise((resolve) => {
        overlayImg.onload = resolve;
      });

      // Draw the composite image
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(generatedImg, 0, 0, width, height);
      ctx.drawImage(overlayImg, 0, 0, width, height);

      // Convert to data URL
      const compositeDataUrl = canvas.toDataURL('image/png');
      setCompositeImage(compositeDataUrl);

      // Upload to edgestore
      await uploadToEdgestore(compositeDataUrl);
    } catch (err) {
      console.error('Error creating composite image:', err);
      setCompositeImage(imageUrl); // Fallback to original image
    }
  };

  const uploadToEdgestore = async (imageDataUrl: string) => {
    try {
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `ai-photobooth-${jobId}.png`, { type: 'image/png' });

      const uploadResult = await edgestore.publicFiles.upload({
        file,
        options: { temporary: false },
      });
      
      console.log('Composite image uploaded to edgestore:', uploadResult.url);
      setImageUrl(uploadResult.url);
    } catch (err) {
      console.error('Error uploading to edgestore:', err);
    }
  };

  const handleDownload = async () => {
    if (!compositeImage) return;
    
    setDownloading(true);
    try {
      const link = document.createElement('a');
      link.href = compositeImage;
      link.download = `ai-photobooth-${jobId}.png`;
      link.click();
    } finally {
      setDownloading(false);
    }
  };

const handleShowQRCode = () => {
  const urlToShare = imageUrl || compositeImage;
  if (urlToShare) {
    setShowQRModal(true);
  }
  };

  // Format base64 string for proper display
  const formatBase64 = (base64: string) => {
    if (!base64.startsWith('data:image')) {
      return `data:image/png;base64,${base64}`;
    }
    return base64;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-500 p-4 md:p-8">
        <p className="text-center uppercase mt-5 mb-10 text-lg text-gray-900">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg
                className="animate-spin h-6 w-6 text-orange-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <p className="text-gray-600">Loading result...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-orange-500 p-4 md:p-8">
        <p className="text-center uppercase mt-5 mb-10 text-lg text-white">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Failed</h2>
            <p className="text-gray-600 mb-6">{error || 'An unknown error occurred.'}</p>
            <Link
              href="/filters"
              className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Start Over
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-500 p-4 md:p-8">
      {/* Hidden canvas for image composition */}
      <canvas ref={canvasRef} className="hidden" />
      <p className="text-center uppercase mt-5 mb-5 text-lg text-white">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6 md:p-8">
        <div className="text-center">
           {result.status === 'COMPLETED' && (compositeImage || result.output?.images?.[0]) && (
              <div className="mb-5 flex justify-center">
                <div className="relative" style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%', maxHeight: '60vh' }}>
                  <Image
                    src={compositeImage || formatBase64(result.output?.images?.[0] ?? '')}
                    alt="Generated Photo with Brand Overlay"
                    layout="fill"
                    objectFit="contain"
                    className={`rounded-lg ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
                    onLoadingComplete={() => setImageLoading(false)}
                  />
                </div>
              </div>
            )}
        </div>
        <div className="flex justify-center gap-4 mt-8 mb-3 bottom-0">
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors cursor-pointer ${
                    downloading ? 'opacity-75' : ''
                  }`}
                >
                  {downloading ? 'Downloading...' : 'Download'}
                </button>
                <button
                  onClick={handleShowQRCode}
                  disabled={!imageUrl}
                  className={`px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors ${
                    !imageUrl ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  Get QR Code
                </button>
                <Link
                  href="/filter"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  New Photo
                </Link>
              </div>
      </div>

      {showQRModal && (imageUrl || compositeImage) && (
        <QRCodeModal 
          downloadUrl={imageUrl || compositeImage || ''}
          onClose={() => setShowQRModal(false)}
        />
      )}
    </div>
  );
}
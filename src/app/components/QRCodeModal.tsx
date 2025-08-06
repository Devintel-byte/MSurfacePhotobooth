'use client';

import { useEffect } from 'react';
import QRCode from 'react-qr-code';

export default function QRCodeModal({
  downloadUrl,
  onClose,
}: {
  downloadUrl: string;
  onClose: () => void;
}) {
  // Close modal when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if ((e.target as HTMLElement).id === 'modal-backdrop') {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Add URL validation
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Get the appropriate URL for display
  const displayUrl = isValidUrl(downloadUrl) 
    ? downloadUrl 
    : 'Image download available';

  return (
    <div
      id="modal-backdrop"
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl p-6 max-w-sm w-full">
        <h3 className="text-xl font-bold text-center mb-4">Scan to Download</h3>
        <div className="flex justify-center mb-6 p-4 bg-white">
          <QRCode 
            value={downloadUrl}
            size={200}
            level="H"
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>
        <div className="text-center text-sm text-gray-600 mb-4">
          Scan this QR code with your phone to download the image
        </div>
        <div className="text-center text-xs text-gray-500 mb-4 break-all">
          {displayUrl.length > 40 
            ? `${displayUrl.substring(0, 40)}...` 
            : displayUrl}
        </div>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
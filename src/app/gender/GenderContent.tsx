'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GENDER_OPTIONS = [
  { value: 0, label: 'Male' },
  { value: 1, label: 'Female' },
  { value: 2, label: 'Boy' },
  { value: 3, label: 'Girl' },
];

export const GenderSelection = () => {
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter_id');
  const ratio = searchParams.get('ratio');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const [selectedGender, setSelectedGender] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!filterId || !ratio || !width || !height) {
      setError('Missing required parameters. Please start over.');
      router.push('/filters');
    }
  }, [filterId, ratio, width, height, router]);

  const handleNext = () => {
    if (selectedGender !== null && filterId && ratio && width && height) {
      router.push(
        `/capture-mode?filter_id=${filterId}&ratio=${ratio}&gender=${selectedGender}&width=${width}&height=${height}`
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-orange-500 px-4 sm:px-6 lg:px-8">
        <p className="text-center uppercase mt-5 mb-5 text-lg text-white">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-500 py-12 px-4 sm:px-6 lg:px-8">
      <p className="text-center uppercase mt-5 mb-5 text-lg text-white">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Select Gender/Age Group</h1>
        <div className="grid grid-cols-2 gap-4">
          {GENDER_OPTIONS.map((gender) => (
            <motion.div
              key={gender.value}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedGender === gender.value
                  ? 'bg-orange-200 text-gray-900 border-2 border-orange-300'
                  : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-900'
              }`}
              onClick={() => setSelectedGender(gender.value)}
            >
              <p className="text-center font-medium">{gender.label}</p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleNext}
            disabled={selectedGender === null}
            className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedGender !== null ? 'bg-white hover:bg-orange-200 shadow-md text-gray-900' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWorkflows } from '../../lib/api';

interface Workflow {
  id: number;
  name: string;
  capture_mode: number;
  description: string;
}

const DEFAULT_WORKFLOWS: Workflow[] = [
  { id: 30, name: 'Quick Animated Single (V4)', capture_mode: 1, description: 'Fast processing animated style' },
  // { id: 25, name: 'HD Realistic Single (V4)', capture_mode: 3, description: 'High quality balanced speed' },
];

export const CaptureModeSelection = () => {
  const searchParams = useSearchParams();
  const filterId = searchParams.get('filter_id');
  const ratio = searchParams.get('ratio');
  const gender = searchParams.get('gender');
  const width = searchParams.get('width');
  const height = searchParams.get('height');
  const [workflows, setWorkflows] = useState<Workflow[]>(DEFAULT_WORKFLOWS);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!filterId || !ratio || !gender || !width || !height) {
      setError('Missing required parameters. Please start over.');
      router.push('/filters');
      return;
    }

    const fetchWorkflows = async () => {
      try {
        const apiWorkflows = await getWorkflows();
        const mappedWorkflows = apiWorkflows.map((w) => ({
          id: w.id,
          name: w.name,
          capture_mode: getCaptureModeFromId(w.id),
          description: getDescriptionFromId(w.id),
        }));
        const desiredWorkflowIds = [30];
        const filteredWorkflows = mappedWorkflows.filter((w) => desiredWorkflowIds.includes(w.id));
        setWorkflows(filteredWorkflows.length > 0 ? filteredWorkflows : DEFAULT_WORKFLOWS);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError('Failed to load capture modes. Using defaults.');
        setWorkflows(DEFAULT_WORKFLOWS);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkflows();
  }, [filterId, ratio, gender, width, height, router]);

  const getCaptureModeFromId = (id: number): number => {
    switch (id) {
      case 30:
        return 1; // Quick
      // case 25:
      //   return 3; // HD
      default:
        return 1; // Default to quick
    }
  };

  const getDescriptionFromId = (id: number): string => {
    switch (id) {
      case 30:
        return 'Fast processing animated style';
      // case 25:
      //   return 'High quality balanced speed';
      default:
        return 'Standard processing mode';
    }
  };

  const handleNext = () => {
    if (selectedWorkflow && filterId && ratio && gender && width && height) {
      router.push(
        `/camera?filter_id=${filterId}&ratio=${ratio}&gender=${gender}&capture_mode=${selectedWorkflow.capture_mode}&width=${width}&height=${height}`
      );
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-orange-500 py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center uppercase mt-5 mb-5 text-lg text-white">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-orange-500 py-12 px-4 sm:px-6 lg:px-8">
        <p className="text-center uppercase mt-5 mb-5 text-lg text-white">AI PHOTOBOOTH</p>
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl font-bold text-center text-white mb-8">Loading Capture Modes...</h1>
          <div className="space-y-4">
            {DEFAULT_WORKFLOWS.map((_, index) => (
              <div key={index} className="p-4 rounded-lg bg-white border border-gray-200">
                <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-500 py-12 px-4 sm:px-6 lg:px-8">
      <p className="text-center uppercase mt-5 mb-5 text-lg text-white">AI PHOTOBOOTH</p>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center text-white mb-8">Select Capture Mode</h1>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <motion.div
              key={workflow.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedWorkflow?.id === workflow.id
                  ? 'bg-orange-200 text-gray-900 border-2 border-orange-300'
                  : 'bg-white hover:bg-gray-100 border border-gray-200 text-gray-900'
              }`}
              onClick={() => setSelectedWorkflow(workflow)}
            >
              <p className="text-center font-medium">{workflow.name}</p>
              <p className="text-center text-sm mt-1 opacity-80">{workflow.description}</p>
              <p className="text-center text-xs mt-1">
                {workflow.id === 30
                  ? 'Quick Processing'
                  : 'High Quality'}
              </p>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleNext}
            disabled={selectedWorkflow === null}
            className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
              selectedWorkflow !== null ? 'bg-white hover:bg-orange-200 shadow-md' : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Continue to Camera
          </button>
        </div>
      </div>
    </div>
  );
}

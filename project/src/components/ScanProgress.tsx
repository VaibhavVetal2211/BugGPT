import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ScanProgressProps {
  progress: number;
  currentTask: string;
}

export default function ScanProgress({ progress, currentTask }: ScanProgressProps) {
  const data = {
    datasets: [
      {
        data: [progress, 100 - progress],
        backgroundColor: [
          'rgb(34, 197, 94)',
          'rgb(229, 231, 235)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    cutout: '70%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Scan Progress</h3>
        <p className="text-sm text-gray-500">{currentTask}</p>
      </div>
      <div className="relative h-48 w-48 mx-auto">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{progress}%</span>
        </div>
      </div>
    </div>
  );
}
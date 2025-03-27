import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SecurityMetrics {
  authentication: number;
  authorization: number;
  dataProtection: number;
  configuration: number;
  encryption: number;
  inputValidation: number;
}

interface RadarChartProps {
  metrics: SecurityMetrics;
}

export default function RadarChart({ metrics }: RadarChartProps) {
  const data = {
    labels: [
      'Authentication',
      'Authorization',
      'Data Protection',
      'Configuration',
      'Encryption',
      'Input Validation',
    ],
    datasets: [
      {
        label: 'Security Score',
        data: [
          metrics.authentication,
          metrics.authorization,
          metrics.dataProtection,
          metrics.configuration,
          metrics.encryption,
          metrics.inputValidation,
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(54, 162, 235)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(54, 162, 235)',
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Metrics</h3>
      <Radar data={data} options={options} />
    </div>
  );
}
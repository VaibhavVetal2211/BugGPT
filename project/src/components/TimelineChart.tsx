import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface TimelineChartProps {
  scanEvents: {
    timestamp: string;
    event: string;
    progress: number;
  }[];
}

export default function TimelineChart({ scanEvents }: TimelineChartProps) {
  const data = {
    labels: scanEvents.map(event => new Date(event.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Scan Progress',
        data: scanEvents.map(event => event.progress),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Scan Timeline',
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const event = scanEvents[context.dataIndex];
            return `${event.event} (${event.progress}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: number) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <Line options={options} data={data} />
    </div>
  );
}
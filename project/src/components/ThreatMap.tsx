import React from 'react';
import { Doughnut } from 'react-chartjs-2';

interface ThreatMapProps {
  threats: {
    category: string;
    count: number;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }[];
}

const ThreatMap: React.FC<ThreatMapProps> = ({ threats }) => {
  const data = {
    labels: threats.map(t => t.category),
    datasets: [
      {
        data: threats.map(t => t.count),
        backgroundColor: threats.map(t => {
          switch (t.severity) {
            case 'critical': return '#EF4444';
            case 'high': return '#F97316';
            case 'medium': return '#EAB308';
            case 'low': return '#22C55E';
            default: return '#6B7280';
          }
        }),
        borderColor: threats.map(t => {
          switch (t.severity) {
            case 'critical': return '#DC2626';
            case 'high': return '#EA580C';
            case 'medium': return '#CA8A04';
            case 'low': return '#16A34A';
            default: return '#4B5563';
          }
        }),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          generateLabels: (chart: any) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label: string, i: number) => ({
                text: `${label} (${threats[i].count})`,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor[i],
                lineWidth: 1,
                hidden: false,
                index: i,
              }));
            }
            return [];
          },
        },
      },
      title: {
        display: true,
        text: 'Threat Distribution',
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Threat Map</h3>
      <Doughnut data={data} options={options} />
      <div className="mt-4 grid grid-cols-2 gap-4">
        {threats.map((threat, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                threat.severity === 'critical'
                  ? 'bg-red-500'
                  : threat.severity === 'high'
                  ? 'bg-orange-500'
                  : threat.severity === 'medium'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
            />
            <span className="text-sm text-gray-600">
              {threat.category}: {threat.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ThreatMap;
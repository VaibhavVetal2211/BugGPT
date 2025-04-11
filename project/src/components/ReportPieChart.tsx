import React from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

import { Bar } from "react-chartjs-2";

import {
  vulnerabilities as vulnMap,
  misconfigurations as misconfigMap,
  severityColorMap,
} from "./ReportTable"; // adjust the path as needed

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
);

ChartJS.register(ArcElement, Tooltip, Legend);

type Severity = "severe" | "medium" | "low";

type SeverityData = Record<Severity, number>;

interface Props {
  vulnerabilities?: string[];
  misconfigs?: string[];
}

const getSeverity = (
  name: string,
  categoryMap: Record<Severity, string[]>
): Severity => {
  const lowerName = name.toLowerCase();
  for (const severity of Object.keys(categoryMap) as Severity[]) {
    if (
      categoryMap[severity].some((pattern) =>
        lowerName.includes(pattern.toLowerCase())
      )
    ) {
      return severity;
    }
  }
  return "low"; // default fallback
};

const countSeveritiesByCategory = (
  items: string[] = [],
  categoryMap: Record<Severity, string[]>
): SeverityData => {
  return items.reduce(
    (acc, item) => {
      if (!item) return acc;
      const severity = getSeverity(item, categoryMap);
      acc[severity]++;
      return acc;
    },
    { severe: 0, medium: 0, low: 0 }
  );
};

const generateChartData = (severityData: SeverityData) => {
  const entries = Object.entries(severityData).filter(
    ([, value]) => value > 0
  ) as [Severity, number][];

  const labels = entries.map(
    ([key]) => key.charAt(0).toUpperCase() + key.slice(1)
  );
  const data = entries.map(([, value]) => value);
  const backgroundColor = entries.map(([key]) => {
    const color = severityColorMap[key];
    return color?.split(" ")[0].replace("bg-", "#") || "#ccc"; // fallback color
  });

  return {
    labels,
    datasets: [
      {
        label: "Count",
        data,
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };
};

const options: ChartOptions<"pie"> = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
    },
  },
};

const barOptions: ChartOptions<"bar"> = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
  },
};

const ReportPieCharts = ({ vulnerabilities = [], misconfigs = [] }: Props) => {
  const totalVuln = vulnerabilities.length;
  const totalMisconfig = misconfigs.length;

  const vulnSeverity = countSeveritiesByCategory(vulnerabilities, vulnMap);
  const misconfigSeverity = countSeveritiesByCategory(misconfigs, misconfigMap);

  const barChartData: ChartData<"bar"> = {
    labels: ["Vulnerabilities", "Misconfigurations"],
    datasets: [
      {
        label: "Total Count",
        data: [totalVuln, totalMisconfig],
        backgroundColor: ["#ef4444", "#f97316"], // red + orange
        borderWidth: 1,
      },
    ],
  };

  if (
    Object.values(vulnSeverity).every((count) => count === 0) &&
    Object.values(misconfigSeverity).every((count) => count === 0)
  ) {
    return null; // Nothing to show
  }

  return (
    <div className="mt-8 max-w-4xl mx-auto">
      <div className="p-4 shadow rounded-lg bg-white mb-6">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Vulnerabilities vs Misconfigurations
        </h2>
        <Bar data={barChartData} options={barOptions} />
      </div>

      <div className="p-4 shadow rounded-lg bg-white">
        <h2 className="text-lg font-semibold mb-4 text-center">
          Severity Breakdown
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <h3 className="font-medium mb-2">Vulnerabilities</h3>
            <Pie data={generateChartData(vulnSeverity)} options={options} />
          </div>
          <div className="flex flex-col items-center">
            <h3 className="font-medium mb-2">Misconfigurations</h3>
            <Pie
              data={generateChartData(misconfigSeverity)}
              options={options}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPieCharts;

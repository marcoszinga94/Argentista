import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const InflationGraph = () => {
  const [inflationData, setInflationData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInflationData = async () => {
      try {
        const response = await fetch(
          "https://api.argentinadatos.com/v1/finanzas/indices/inflacion"
        );
        if (!response.ok) {
          throw new Error("No se pudo obtener la información de inflación");
        }
        const data = await response.json();
        setInflationData(
          data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        );
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchInflationData();
  }, []);

  useEffect(() => {
    if (inflationData.length > 0) {
      setStartDate(inflationData[0].fecha);
      setEndDate(inflationData[inflationData.length - 1].fecha);
    }
  }, [inflationData]);

  useEffect(() => {
    if (startDate && endDate) {
      updateChart();
    }
  }, [startDate, endDate]); // Removed unnecessary dependency: inflationData

  const updateChart = () => {
    const filteredData = inflationData.filter(
      (item) => item.fecha >= startDate && item.fecha <= endDate
    );

    const labels = filteredData.map((item) => item.fecha);
    const values = filteredData.map((item) => item.valor);

    setChartData({
      labels,
      datasets: [
        {
          label: "Inflación Mensual (%)",
          data: values,
          borderColor: "rgb(59, 130, 246)", // blue-500
          backgroundColor: "rgba(59, 130, 246, 0.1)", // blue-500 with opacity
          tension: 0.1,
        },
      ],
    });
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Inflación (%)",
          color: "#4B5563", // text-gray-600
        },
        ticks: {
          color: "#4B5563", // text-gray-600
        },
      },
      x: {
        title: {
          display: true,
          text: "Fecha",
          color: "#4B5563", // text-gray-600
        },
        ticks: {
          color: "#4B5563", // text-gray-600
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: "#4B5563", // text-gray-600
        },
      },
    },
  };

  const inputStyles =
    "w-full p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Gráfico de Evolución de la Inflación
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label
            htmlFor="startDate"
            className="block mb-2 text-lg text-gray-600"
          >
            Fecha Inicial:
          </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputStyles}
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block mb-2 text-lg text-gray-600">
            Fecha Final:
          </label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputStyles}
          />
        </div>
      </div>
      <div className="h-96 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <span>Cargando...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="flex items-center gap-2 text-red-500">
              <span className="text-lg">Error: {error}</span>
            </div>
          </div>
        )}
        {chartData && <Line data={chartData} options={chartOptions} />}
      </div>
    </div>
  );
};

export default InflationGraph;

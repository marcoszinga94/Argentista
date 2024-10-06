import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
        const response = await fetch("https://api.argentinadatos.com/v1/finanzas/indices/inflacion");
        if (!response.ok) {
          throw new Error("No se pudo obtener la información de inflación");
        }
        const data = await response.json();
        setInflationData(data.sort((a, b) => new Date(a.fecha) - new Date(b.fecha)));
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
  }, [startDate, endDate, inflationData]);

  const updateChart = () => {
    const filteredData = inflationData.filter((item) => item.fecha >= startDate && item.fecha <= endDate);

    const labels = filteredData.map((item) => item.fecha);
    const values = filteredData.map((item) => item.valor);

    setChartData({
      labels,
      datasets: [
        {
          label: "Inflación Mensual (%)",
          data: values,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    });
  };

  if (isLoading) {
    return <div className="text-center">Cargando datos de inflación...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-auto">
      <h2 className="text-2xl font-semibold mb-4">Gráfico de Evolución de la Inflación</h2>
      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="startDate" className="block mb-1">
            Fecha Inicial:
          </label>
          <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2 border rounded" />
        </div>
        <div>
          <label htmlFor="endDate" className="block mb-1">
            Fecha Final:
          </label>
          <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2 border rounded" />
        </div>
      </div>
      {chartData && (
        <div className="h-96">
          <Line data={chartData} options={{ maintainAspectRatio: false }} />
        </div>
      )}
    </div>
  );
};

export default InflationGraph;

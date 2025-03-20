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
import { format, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: false,
      title: {
        display: true,
        text: "Precio en ARS",
        color: "#4B5563",
      },
      ticks: {
        color: "#4B5563",
      },
    },
    x: {
      title: {
        display: true,
        text: "Fecha",
        color: "#4B5563",
      },
      ticks: {
        color: "#4B5563",
      },
    },
  },
  plugins: {
    legend: {
      labels: {
        color: "#4B5563",
      },
    },
  },
};

const DollarHistoryChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCasas, setSelectedCasas] = useState([
    "oficial",
    "blue",
    "bolsa",
    "cripto",
    "mayorista",
  ]);
  const [timeRange, setTimeRange] = useState(0.25);

  const casaColors = [
    "rgba(75, 192, 192, 0.8)", // Oficial
    "rgba(255, 99, 132, 0.8)", // Blue
    "rgba(54, 162, 235, 0.8)", // Bolsa
    "rgba(255, 206, 86, 0.8)", // Cripto
    "rgba(153, 102, 255, 0.8)", // Mayorista
  ];

  useEffect(() => {
    fetchDollarData();
  }, [selectedCasas, timeRange]);

  const fetchDollarData = async () => {
    setIsLoading(true);
    setError(null);

    const endDate = new Date();
    const startDate =
      timeRange === "all"
        ? new Date(2000, 0, 1)
        : timeRange >= 1
          ? subMonths(endDate, timeRange)
          : subWeeks(endDate, Math.floor(timeRange * 4));

    try {
      const allData = await fetchDataForDateRange(startDate, endDate);

      // Process each dataset to fill missing data
      const filledData = allData.map((data) => fillMissingData(data));

      const preparedData = prepareChartData(filledData);
      setChartData(preparedData);
    } catch (error) {
      setError(error.message || "Error al obtener los datos del dólar");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataForDateRange = async (startDate, endDate) => {
    const dates = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      dates.push(format(currentDate, "yyyy/MM/dd"));
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Fetch data for each selected casa
    const allDataPromises = selectedCasas.map((casa) =>
      Promise.all(
        dates.map(async (date) => {
          try {
            const response = await fetch(
              `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}/${date}`
            );
            if (response.ok) {
              const jsonData = await response.json();
              return { date, ...jsonData };
            } else {
              console.warn(`No hay datos disponibles para la fecha: ${date}`);
              return { date, venta: null };
            }
          } catch (error) {
            console.error(
              `Error al obtener datos para la fecha ${date}:`,
              error
            );
            return { date, venta: null };
          }
        })
      )
    );

    const allData = await Promise.all(allDataPromises);
    return allData;
  };

  const fillMissingData = (data) => {
    let lastValidValue = null;
    return data.map((item) => {
      if (item.venta === null) {
        // Si el valor es nulo, usa el último valor válido
        item.venta = lastValidValue;
      } else {
        // Si el valor es válido, actualiza el último valor válido
        lastValidValue = item.venta;
      }
      return item;
    });
  };

  const prepareChartData = (data) => {
    const labels = data[0].map((item) =>
      format(new Date(item.date), "d MMM", { locale: es })
    );

    const datasets = selectedCasas.map((casa, index) => ({
      label: `Dólar ${casa.charAt(0).toUpperCase() + casa.slice(1)}`,
      data: data[index].map((item) => item.venta),
      borderColor: casaColors[index % casaColors.length],
      backgroundColor: casaColors[index % casaColors.length].replace(
        "0.8",
        "0.2"
      ),
      tension: 0.1,
    }));

    return {
      labels,
      datasets,
    };
  };

  const timeRangeOptions = [
    { value: 0.25, label: "1 semana" },
    { value: 1, label: "1 mes" },
    { value: 3, label: "3 meses" },
    { value: 6, label: "6 meses" },
    { value: 12, label: "1 año" },
    { value: "all", label: "Todo el historial" },
  ];

  const selectStyles =
    "p-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 bg-white hover:bg-gray-50";

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 w-full m-auto">
      <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Histórico del Dólar
      </h2>
      <div className="h-96 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="flex items-center gap-2 text-blue-500">
              <span className="text-lg">Cargando datos...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
            <div className="flex items-center gap-2 text-red-500">
              <span className="text-lg">Error: {error}</span>
            </div>
          </div>
        )}
        <Line data={chartData} options={chartOptions} />
      </div>
      <div className="mb-6 flex flex-wrap gap-4 justify-center mt-4">
        <div className="flex flex-row items-center gap-4">
          <label
            htmlFor="time-range-select"
            className="block mb-2 text-lg text-gray-600"
          >
            Rango de Tiempo:
          </label>
          <select
            id="time-range-select"
            value={timeRange}
            onChange={(e) =>
              setTimeRange(
                e.target.value === "all"
                  ? "all"
                  : Number.parseFloat(e.target.value)
              )
            }
            className={selectStyles}
          >
            {timeRangeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default DollarHistoryChart;

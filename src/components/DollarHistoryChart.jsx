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
  const [selectedCasa, setSelectedCasa] = useState("oficial");
  const [timeRange, setTimeRange] = useState(0.25);

  useEffect(() => {
    fetchDollarData();
  }, [selectedCasa, timeRange]); //This line was already correct

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
      const data = await fetchDataForDateRange(startDate, endDate);
      if (!data.length) {
        throw new Error(
          "No se encontraron datos en el rango de fechas seleccionado."
        );
      }
      setChartData(prepareChartData(data));
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

    const data = await Promise.all(
      dates.map(async (date) => {
        try {
          const response = await fetch(
            `https://api.argentinadatos.com/v1/cotizaciones/dolares/${selectedCasa}/${date}`
          );

          if (response.ok) {
            return { date, ...(await response.json()) };
          } else {
            console.warn(`No hay datos disponibles para la fecha: ${date}`);
            return null;
          }
        } catch (error) {
          console.error(`Error al obtener datos para la fecha ${date}:`, error);
          return null;
        }
      })
    );

    return data.filter((item) => item); // Filtrar valores nulos
  };

  const prepareChartData = (data) => {
    const labels = data.map((item) =>
      format(new Date(item.date), "d MMM", { locale: es })
    );
    const values = data.map((item) => item.venta);

    return {
      labels,
      datasets: [
        {
          label: `Dólar ${selectedCasa.charAt(0).toUpperCase() + selectedCasa.slice(1)}`,
          data: values,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    };
  };

  const casasOptions = [
    { value: "oficial", label: "Oficial" },
    { value: "blue", label: "Blue" },
    { value: "bolsa", label: "Bolsa" },
    { value: "cripto", label: "Cripto" },
    { value: "mayorista", label: "Mayorista" },
    { value: "solidario", label: "Solidario" },
    { value: "turista", label: "Turista" },
  ];

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
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <div>
          <label
            htmlFor="casa-select"
            className="block mb-2 text-lg text-gray-600"
          >
            Tipo de Dólar:
          </label>
          <select
            id="casa-select"
            value={selectedCasa}
            onChange={(e) => setSelectedCasa(e.target.value)}
            className={selectStyles}
          >
            {casasOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
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
    </div>
  );
};

export default DollarHistoryChart;

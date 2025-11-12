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

const DollarHistoryChart = () => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCasas, setSelectedCasas] = useState([
    "oficial",
    "blue",
    "bolsa",
    "contadoconliqui",
    "mayorista",
    "cripto",
    "tarjeta",
  ]);
  const [timeRange, setTimeRange] = useState(0.25);

  const casaColors = [
    "rgba(75, 192, 192, 0.8)", // Oficial
    "rgba(255, 99, 132, 0.8)", // Blue
    "rgba(255, 159, 64, 0.8)", // Bolsa
    "rgba(255, 159, 64, 0.8)", // Contado con liqui
    "rgba(54, 162, 235, 0.8)", // Mayorista
    "rgba(255, 206, 86, 0.8)", // Cripto
    "rgba(153, 102, 255, 0.8)", // Tarjeta
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
    try {
      const results = await Promise.all(
        selectedCasas.map((casa) =>
          fetch(
            `https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`
          )
            .then((res) => (res.ok ? res.json() : []))
            .catch((error) => {
              console.error(`Error fetching ${casa}:`, error);
              return [];
            })
        )
      );

      // Filter and sort data by date range
      return results.map((casaData) =>
        casaData
          .filter((entry) => {
            const entryDate = new Date(entry.fecha);
            return entryDate >= startDate && entryDate <= endDate;
          })
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .map((entry) => ({
            date: entry.fecha,
            venta: parseFloat(entry.venta) || null,
          }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
      return [];
    }
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

  const getTicksConfig = (timeRange) => {
    if (timeRange === "all") return { maxTicksLimit: 12 };
    if (timeRange == 12) return { maxTicksLimit: 12 }; // 1 año
    if (timeRange == 6) return { maxTicksLimit: 12 }; // 6 meses
    if (timeRange == 3) return { maxTicksLimit: 6 }; // 3 meses
    if (timeRange == 1) return { maxTicksLimit: 30 }; // 1 mes
    return { maxTicksLimit: 7 }; // 1 semana
  };

  const getPointConfig = (timeRange) => {
    if (timeRange === "all") return { radius: 0, hitRadius: 10 };
    if (timeRange == 12) return { radius: 1, hitRadius: 10 };
    if (timeRange == 6) return { radius: 2, hitRadius: 8 };
    if (timeRange == 3) return { radius: 3, hitRadius: 6 };
    if (timeRange == 1) return { radius: 4, hitRadius: 6 };
    return { radius: 5, hitRadius: 6 };
  };

  const getDataPointFrequency = (timeRange, totalPoints) => {
    if (timeRange === "all") return Math.ceil(totalPoints / 1000); // 48 puntos en total
    if (timeRange == 12) return Math.ceil(totalPoints / 365); // 24 puntos para 1 año
    if (timeRange == 6) return Math.ceil(totalPoints / 180); // 12 puntos para 6 meses
    if (timeRange == 3) return Math.ceil(totalPoints / 90); // 8 puntos para 3 meses
    if (timeRange == 1) return Math.ceil(totalPoints / 30); // 6 puntos para 1 mes
    return 1; // Todos los puntos para 1 semana
  };

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
          ...getTicksConfig(timeRange),
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
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

  const prepareChartData = (data) => {
    if (!data[0] || data[0].length === 0) {
      return { labels: [], datasets: [] };
    }

    const allDates = [...new Set(data.flat().map((item) => item.date))].sort(
      (a, b) => new Date(a) - new Date(b)
    );

    // Calcular la frecuencia de los puntos
    const frequency = getDataPointFrequency(timeRange, allDates.length);
    const filteredDates = allDates.filter(
      (_, index) => index % frequency === 0
    );

    const dataByDate = selectedCasas.map((_, index) => {
      const casaData = data[index];
      return Object.fromEntries(
        casaData.map((item) => [item.date, item.venta])
      );
    });

    const pointConfig = getPointConfig(timeRange);

    const datasets = selectedCasas.map((casa, index) => ({
      label: `Dólar ${casa.charAt(0).toUpperCase() + casa.slice(1)}`,
      data: filteredDates.map((date) => dataByDate[index][date] || null),
      borderColor: casaColors[index % casaColors.length],
      backgroundColor: casaColors[index % casaColors.length].replace(
        "0.8",
        "0.2"
      ),
      tension: 0.1,
      spanGaps: true,
      pointRadius: pointConfig.radius,
      pointHitRadius: pointConfig.hitRadius,
      pointHoverRadius: pointConfig.radius + 3,
    }));

    return {
      labels: filteredDates.map((date) =>
        format(
          new Date(date),
          timeRange == "all"
            ? "MMM-yyyy"
            : timeRange >= 12
              ? "MMM-yy"
              : timeRange >= 3
                ? "d-M-yy"
                : "d-M-yy",
          { locale: es }
        )
      ),
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
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100 w-full m-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center bg-linear-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Histórico del Dólar
      </h2>
      <div className="h-72 sm:h-96 relative">
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
      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 justify-center">
        <label
          htmlFor="time-range-select"
          className="text-sm sm:text-base text-gray-600"
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
          className={`w-full sm:w-auto text-sm sm:text-base ${selectStyles}`}
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DollarHistoryChart;

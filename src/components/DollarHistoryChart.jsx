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
    "rgba(14, 165, 233, 1)", // Sky 500 - Oficial
    "rgba(239, 68, 68, 1)", // Red 500 - Blue
    "rgba(249, 115, 22, 1)", // Orange 500 - Bolsa
    "rgba(168, 85, 247, 1)", // Purple 500 - Contado con liqui
    "rgba(59, 130, 246, 1)", // Blue 500 - Mayorista
    "rgba(234, 179, 8, 1)", // Yellow 500 - Cripto
    "rgba(16, 185, 129, 1)", // Emerald 500 - Tarjeta
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
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        title: {
          display: true,
          text: "Precio en ARS",
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          }
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
          }
        },
      },
      x: {
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: "Fecha",
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          }
        },
        ticks: {
          color: "#6B7280",
          font: {
            family: "'Inter', sans-serif",
          },
          ...getTicksConfig(timeRange),
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: "#374151",
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500',
          }
        },
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#111827',
        bodyColor: '#374151',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        titleFont: {
          family: "'Inter', sans-serif",
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 13,
        },
      }
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
      backgroundColor: casaColors[index % casaColors.length],
      tension: 0.3,
      borderWidth: 2,
      spanGaps: true,
      pointRadius: pointConfig.radius,
      pointHitRadius: pointConfig.hitRadius,
      pointHoverRadius: pointConfig.radius + 3,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
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
    "w-full sm:w-auto p-2.5 pr-8 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 cursor-pointer hover:bg-gray-100 text-sm sm:text-base";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full m-auto transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight">
          Histórico del Dólar
        </h2>
        
        <div className="flex items-center gap-3">
          <label
            htmlFor="time-range-select"
            className="text-sm font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
          >
            Rango:
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

      <div className="h-72 sm:h-96 relative w-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-gray-500">Cargando datos...</span>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-10 rounded-2xl">
            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center">
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default DollarHistoryChart;

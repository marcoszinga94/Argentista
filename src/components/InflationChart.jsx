import { useState, useEffect } from "react";

const InflationChart = () => {
  const [inflationData, setInflationData] = useState({});
  const [openItems, setOpenItems] = useState({});
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
        const groupedData = groupDataByDecadeAndYear(data);
        setInflationData(groupedData);

        const lastDecade = Object.keys(groupedData).sort().pop();
        const initialOpenItems = {
          [lastDecade]: true,
          [`${lastDecade}-${Object.keys(groupedData[lastDecade]).sort().pop()}`]: true,
        };
        setOpenItems(initialOpenItems);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchInflationData();
  }, []);

  const groupDataByDecadeAndYear = (data) => {
    return data.reduce((acc, item) => {
      const [year, month] = item.fecha.split("-");
      const decade = `${Math.floor(year / 10) * 10}s`;

      if (!acc[decade]) {
        acc[decade] = {};
      }
      if (!acc[decade][year]) {
        acc[decade][year] = {
          months: {},
          min: Number.POSITIVE_INFINITY,
          max: Number.NEGATIVE_INFINITY,
          total: 0,
          count: 0,
        };
      }
      acc[decade][year].months[month] = item.valor;
      acc[decade][year].min = Math.min(acc[decade][year].min, item.valor);
      acc[decade][year].max = Math.max(acc[decade][year].max, item.valor);
      acc[decade][year].total += item.valor;
      acc[decade][year].count += 1;
      return acc;
    }, {});
  };

  const formatDate = (year, month) => {
    const date = new Date(year, Number.parseInt(month) - 1);
    return date.toLocaleString("es-AR", { month: "long", year: "numeric" });
  };

  const toggleItem = (itemKey) => {
    setOpenItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-blue-600 p-8">
        <span className="text-lg">Cargando datos de inflación...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 text-red-500 p-8">
        <span className="text-lg">Error: {error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Índices de Inflación Mensual
      </h2>
      {Object.entries(inflationData)
        .sort(([decadeA], [decadeB]) => decadeB.localeCompare(decadeA))
        .map(([decade, years]) => (
          <div key={decade} className="mb-6">
            <button
              onClick={() => toggleItem(decade)}
              className="w-full text-left text-xl font-semibold mb-2 flex justify-between items-center bg-blue-50 p-4 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <span>{decade}</span>
              {openItems[decade] ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="32" width="32">
                <path
                  d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
              </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height="32" width="32">
                  <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
                </svg>
              )}
            </button>
            {openItems[decade] && (
              <div className="space-y-4 ml-4">
                {Object.entries(years)
                  .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                  .map(([year, data]) => (
                    <div
                      key={year}
                      className="bg-white rounded-lg shadow-sm border border-gray-200"
                    >
                      <button
                        onClick={() => toggleItem(`${decade}-${year}`)}
                        className="w-full text-left text-lg font-medium p-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span>{year}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-normal text-gray-600">
                            Min: {data.min.toFixed(1)}% | Max:{" "}
                            {data.max.toFixed(1)}% | Promedio:{" "}
                            {(data.total / data.count).toFixed(1)}%
                          </span>
                          {openItems[`${decade}-${year}`] ? (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height="32" width="32">
                            <path
                              d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
                          </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" height="32" width="32">
  <path
    d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z" />
</svg>
                          )}
                        </div>
                      </button>
                      {openItems[`${decade}-${year}`] && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="p-3 text-gray-600">Mes</th>
                                <th className="p-3 text-gray-600">Valor (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(data.months)
                                .sort(([monthA], [monthB]) =>
                                  monthB.localeCompare(monthA)
                                )
                                .map(([month, value]) => (
                                  <tr
                                    key={`${year}-${month}`}
                                    className="border-t border-gray-100"
                                  >
                                    <td className="p-3">
                                      {formatDate(year, month)}
                                    </td>
                                    <td className="p-3 font-medium">
                                      {value.toFixed(1)}%
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default InflationChart;

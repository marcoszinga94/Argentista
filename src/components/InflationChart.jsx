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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-center">
        <span className="font-medium">Error: {error}</span>
      </div>
    );
  }

  return (
    <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full mb-0 flex-1">
      <h2 className="text-3xl font-black mb-8 text-center text-blue-600 tracking-tight">
        Índices de Inflación Mensual
      </h2>
      {Object.entries(inflationData)
        .sort(([decadeA], [decadeB]) => decadeB.localeCompare(decadeA))
        .map(([decade, years]) => (
          <div key={decade} className="mb-4 last:mb-0">
            <button
              onClick={() => toggleItem(decade)}
              className={`w-full text-left text-lg font-bold p-4 rounded-xl transition-all duration-200 flex justify-between items-center ${
                openItems[decade]
                  ? "bg-blue-50 text-blue-700"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span>Década de {decade}</span>
              {openItems[decade] ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              )}
            </button>
            
            {openItems[decade] && (
              <div className="mt-3 space-y-3 pl-2 sm:pl-4 border-l-2 border-blue-100 ml-4">
                {Object.entries(years)
                  .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                  .map(([year, data]) => (
                    <div
                      key={year}
                      className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(`${decade}-${year}`)}
                        className="w-full text-left p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <span className="font-bold text-gray-800">{year}</span>
                        <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                            Min: {data.min.toFixed(1)}%
                          </span>
                          <span className="px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium">
                            Max: {data.max.toFixed(1)}%
                          </span>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            Prom: {(data.total / data.count).toFixed(1)}%
                          </span>
                          {openItems[`${decade}-${year}`] ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          )}
                        </div>
                      </button>
                      
                      {openItems[`${decade}-${year}`] && (
                        <div className="overflow-x-auto border-t border-gray-100">
                          <table className="w-full text-left text-sm">
                            <thead>
                              <tr className="bg-gray-50/50">
                                <th className="p-3 font-semibold text-gray-600">Mes</th>
                                <th className="p-3 font-semibold text-gray-600 text-right">Inflación</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                              {Object.entries(data.months)
                                .sort(([monthA], [monthB]) =>
                                  monthB.localeCompare(monthA)
                                )
                                .map(([month, value]) => (
                                  <tr
                                    key={`${year}-${month}`}
                                    className="hover:bg-gray-50/50 transition-colors"
                                  >
                                    <td className="p-3 text-gray-700 capitalize">
                                      {formatDate(year, month).split(" ")[0]}
                                    </td>
                                    <td className="p-3 font-medium text-right">
                                      <span className={`px-2 py-1 rounded-md ${value > 10 ? 'bg-red-50 text-red-700' : value > 5 ? 'bg-orange-50 text-orange-700' : 'bg-green-50 text-green-700'}`}>
                                        {value.toFixed(1)}%
                                      </span>
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
    </section>
  );
};

export default InflationChart;

import { useState, useEffect } from "react";

const InflationChart = () => {
  const [inflationData, setInflationData] = useState({});
  const [openDecades, setOpenDecades] = useState({});
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
        setOpenDecades(
          Object.keys(groupedData).reduce((acc, decade) => {
            acc[decade] = decade === lastDecade;
            return acc;
          }, {})
        );
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
          min: Infinity,
          max: -Infinity,
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
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString("es-AR", { month: "long", year: "numeric" });
  };

  const toggleDecade = (decade) => {
    setOpenDecades((prev) => ({ ...prev, [decade]: !prev[decade] }));
  };

  if (isLoading) {
    return <div className="text-center">Cargando datos de inflación...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">
        Índices de Inflación Mensual
      </h2>
      {Object.entries(inflationData)
        .sort(([decadeA], [decadeB]) => decadeB.localeCompare(decadeA))
        .map(([decade, years]) => (
          <div key={decade} className="mb-6">
            <button
              onClick={() => toggleDecade(decade)}
              className="w-full text-left text-xl font-semibold mb-2 flex justify-between items-center bg-gray-200 p-2 rounded"
            >
              <span>{decade}</span>
              <span>{openDecades[decade] ? "▼" : "▶"}</span>
            </button>
            {openDecades[decade] && (
              <div>
                {Object.entries(years)
                  .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
                  .map(([year, data]) => (
                    <div key={year} className="mb-4">
                      <button
                        onClick={() => toggleDecade(`${decade}-${year}`)}
                        className="w-full text-left text-lg font-medium mb-2 flex justify-between items-center bg-gray-100 p-2 rounded"
                      >
                        <span>{year}</span>
                        <span className="text-sm font-normal">
                          Min: {data.min.toFixed(1)}% | Max:{" "}
                          {data.max.toFixed(1)}% | Promedio:{" "}
                          {(data.total / data.count).toFixed(1)}%
                        </span>
                      </button>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-2">Mes</th>
                              <th className="p-2">Valor (%)</th>
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
                                  className="border-b"
                                >
                                  <td className="p-2">
                                    {formatDate(year, month)}
                                  </td>
                                  <td className="p-2">{value.toFixed(1)}%</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
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

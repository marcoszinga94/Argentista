import React, { useState, useEffect } from "react";

const InflationChart = () => {
  const [inflationData, setInflationData] = useState({});
  const [openYears, setOpenYears] = useState({});
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
        const groupedData = groupDataByYear(data);
        setInflationData(groupedData);

        const lastYear = Object.keys(groupedData).sort().pop();
        setOpenYears(
          Object.keys(groupedData).reduce((acc, year) => {
            acc[year] = year === lastYear;
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

  const groupDataByYear = (data) => {
    return data.reduce((acc, item) => {
      const [year, month] = item.fecha.split("-");
      if (!acc[year]) {
        acc[year] = {
          months: {},
          min: Infinity,
          max: -Infinity,
          total: 0,
          count: 0,
        };
      }
      acc[year].months[month] = item.valor;
      acc[year].min = Math.min(acc[year].min, item.valor);
      acc[year].max = Math.max(acc[year].max, item.valor);
      acc[year].total += item.valor;
      acc[year].count += 1;
      return acc;
    }, {});
  };

  const formatDate = (year, month) => {
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleString("es-AR", { month: "long", year: "numeric" });
  };

  const toggleYear = (year) => {
    setOpenYears((prev) => ({ ...prev, [year]: !prev[year] }));
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
        .sort(([yearA], [yearB]) => yearB.localeCompare(yearA))
        .map(([year, data]) => (
          <div key={year} className="mb-6">
            <button
              onClick={() => toggleYear(year)}
              className="w-full text-left text-xl font-semibold mb-2 flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span>{year}</span>
              <span className="text-sm font-normal">
                Min: {data.min.toFixed(1)}% | Max: {data.max.toFixed(1)}% |
                Promedio: {(data.total / data.count).toFixed(1)}%
              </span>
              <span>{openYears[year] ? "▼" : "▶"}</span>
            </button>
            {openYears[year] && (
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
                        <tr key={`${year}-${month}`} className="border-b">
                          <td className="p-2">{formatDate(year, month)}</td>
                          <td className="p-2">{value.toFixed(1)}%</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default InflationChart;

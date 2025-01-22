import { useState, useEffect } from "react";

const InflationCalculator = () => {
  const [inflationData, setInflationData] = useState([]);
  const [amount, setAmount] = useState("1000");
  const [startMonth, setStartMonth] = useState("");
  const [startYear, setStartYear] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [endYear, setEndYear] = useState("");
  const [result, setResult] = useState(null);
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
      const latestDate = new Date(
        inflationData[inflationData.length - 1].fecha
      );
      setEndMonth((latestDate.getMonth() + 1).toString().padStart(2, "0"));
      setEndYear(latestDate.getFullYear().toString());

      const oneYearBefore = new Date(latestDate);
      oneYearBefore.setFullYear(oneYearBefore.getFullYear() - 1);

      setStartMonth((oneYearBefore.getMonth() + 1).toString().padStart(2, "0"));
      setStartYear(oneYearBefore.getFullYear().toString());
    }
  }, [inflationData]);

  useEffect(() => {
    if (amount && startMonth && startYear && endMonth && endYear) {
      calculateInflation();
    }
  }, [amount, startMonth, startYear, endMonth, endYear]);

  const calculateInflation = () => {
    if (!amount || !startMonth || !startYear || !endMonth || !endYear) {
      alert("Por favor, complete todos los campos");
      return;
    }

    const startDate = `${startYear}-${startMonth}-01`;
    const endDate = `${endYear}-${endMonth}-01`;

    const startIndex = inflationData.findIndex(
      (item) => item.fecha >= startDate
    );
    const endIndex = inflationData.findIndex((item) => item.fecha > endDate);

    if (startIndex === -1 || endIndex === -1) {
      alert("No hay datos suficientes para este rango de fechas");
      return;
    }

    const relevantData = inflationData.slice(startIndex, endIndex);
    const inflationFactor = relevantData.reduce(
      (acc, item) => acc * (1 + item.valor / 100),
      1
    );
    const adjustedAmount = Number.parseFloat(amount) * inflationFactor;

    const totalInflation =
      (adjustedAmount / Number.parseFloat(amount) - 1) * 100;
    const monthsDiff = endIndex - startIndex;
    const annualizedInflation =
      (1 + totalInflation / 100) ** (12 / monthsDiff) - 1;
    const averageMonthlyInflation =
      ((1 + annualizedInflation) ** (1 / 12) - 1) * 100;

    setResult({
      adjustedAmount: adjustedAmount.toFixed(2),
      totalInflation: totalInflation.toFixed(2),
      averageMonthlyInflation: averageMonthlyInflation.toFixed(2),
      annualizedInflation: (annualizedInflation * 100).toFixed(2),
    });
  };

  const months = [
    { value: "01", label: "enero" },
    { value: "02", label: "febrero" },
    { value: "03", label: "marzo" },
    { value: "04", label: "abril" },
    { value: "05", label: "mayo" },
    { value: "06", label: "junio" },
    { value: "07", label: "julio" },
    { value: "08", label: "agosto" },
    { value: "09", label: "septiembre" },
    { value: "10", label: "octubre" },
    { value: "11", label: "noviembre" },
    { value: "12", label: "diciembre" },
  ];

  const years = Array.from({ length: 30 }, (_, i) =>
    (new Date().getFullYear() - 29 + i).toString()
  ).reverse();

  if (isLoading) {
    return <div className="text-center">Cargando datos de inflación...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center">
        Calculadora de Inflación
      </h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 m-auto">
          <span className="text-xl">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-32 p-2 border rounded"
          />
          <span className="text-xl">en</span>
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Mes</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <span className="text-xl">de</span>
          <select
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Año</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center m-auto">
          <span className="text-xl">es aproximadamente equivalente a</span>
        </div>
        <div className="flex items-center gap-2 m-auto">
          <span className="text-xl">$</span>
          <input
            type="text"
            value={result ? result.adjustedAmount : ""}
            readOnly
            className="w-32 p-2 border rounded bg-gray-100"
          />
          <span className="text-xl">en</span>
          <select
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className="p-2 border rounded"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <span className="text-xl">de</span>
          <select
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            className="p-2 border rounded"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <p className="text-center text-pretty max-w-[400px]">
              Esto representa un incremento del{" "}
              <strong>{result.totalInflation}%</strong>, es decir, un incremento
              promedio del <strong>{result.averageMonthlyInflation}%</strong>{" "}
              por mes (<strong>{result.annualizedInflation}%</strong>{" "}
              anualizado).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InflationCalculator;

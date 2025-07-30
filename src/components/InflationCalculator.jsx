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

  const inputStyles =
    "w-22 p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200";
  const selectStyles =
    "p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 bg-white hover:bg-gray-50";
  const labelStyles = "text-lg text-gray-600";

  return (
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100 w-full m-auto">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Calculadora de Inflación
      </h2>

      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 m-auto flex-wrap justify-center">
          <span className="text-xl font-medium text-blue-600">$</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={`${inputStyles} font-medium`}
            min="0"
            placeholder="0.00"
          />
          <span className={labelStyles}>en</span>
          <select
            value={startMonth}
            onChange={(e) => setStartMonth(e.target.value)}
            className={selectStyles}
          >
            <option value="">Mes</option>
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <span className={labelStyles}>de</span>
          <select
            value={startYear}
            onChange={(e) => setStartYear(e.target.value)}
            className={selectStyles}
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
          <span className="text-lg text-gray-500 italic">
            es aproximadamente equivalente a
          </span>
        </div>

        <div className="flex items-center gap-2 m-auto flex-wrap justify-center">
          <span className="text-xl font-medium text-blue-600">$</span>
          <input
            type="text"
            value={result ? result.adjustedAmount : ""}
            readOnly
            className={`${inputStyles} font-medium`}
            placeholder="0.00"
          />
          <span className={labelStyles}>en</span>
          <select
            value={endMonth}
            onChange={(e) => setEndMonth(e.target.value)}
            className={selectStyles}
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
          <span className={labelStyles}>de</span>
          <select
            value={endYear}
            onChange={(e) => setEndYear(e.target.value)}
            className={selectStyles}
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {result && (
          <div className="mt-2 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
            <p className="text-center text-pretty max-w-[400px] mx-auto text-gray-700 leading-relaxed">
              Esto representa un incremento del{" "}
              <strong className="text-blue-700">
                {result.totalInflation}%
              </strong>
              , es decir, un incremento promedio del{" "}
              <strong className="text-blue-700">
                {result.averageMonthlyInflation}%
              </strong>{" "}
              por mes (
              <strong className="text-blue-700">
                {result.annualizedInflation}%
              </strong>{" "}
              anualizado).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InflationCalculator;

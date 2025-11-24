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
      return;
    }

    const startDate = `${startYear}-${startMonth}-01`;
    const endDate = `${endYear}-${endMonth}-01`;

    const startIndex = inflationData.findIndex(
      (item) => item.fecha >= startDate
    );
    const endIndex = inflationData.findIndex((item) => item.fecha > endDate);

    if (startIndex === -1 || endIndex === -1) {
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
    { value: "01", label: "Enero" },
    { value: "02", label: "Febrero" },
    { value: "03", label: "Marzo" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Mayo" },
    { value: "06", label: "Junio" },
    { value: "07", label: "Julio" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const years = Array.from({ length: 30 }, (_, i) =>
    (new Date().getFullYear() - 29 + i).toString()
  ).reverse();

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

  const inputStyles =
    "w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 text-right";
  const selectStyles =
    "w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 cursor-pointer hover:bg-gray-100";
  const labelStyles = "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full m-auto h-full">
      <h2 className="text-3xl font-black mb-8 text-center text-blue-600 tracking-tight">
        Calculadora de Inflación
      </h2>

      <div className="flex flex-col gap-8">
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-center">
            <div className="md:col-span-4">
              <label className={labelStyles}>Monto Inicial</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`${inputStyles} pl-8 text-lg`}
                  min="0"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <label className={labelStyles}>Mes Inicio</label>
              <select
                value={startMonth}
                onChange={(e) => setStartMonth(e.target.value)}
                className={selectStyles}
              >
                <option value="">Seleccionar Mes</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className={labelStyles}>Año Inicio</label>
              <select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                className={selectStyles}
              >
                <option value="">Seleccionar Año</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center -my-4 z-10">
          <div className="bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
            </svg>
          </div>
        </div>

        {/* Result Section */}
        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start text-center">
            <div className="md:col-span-4">
              <label className="text-sm font-semibold text-blue-600 uppercase tracking-wider mb-2 block">Monto Final</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400 font-semibold">$</span>
                <input
                  type="text"
                  value={result ? result.adjustedAmount : ""}
                  readOnly
                  className={`${inputStyles} pl-8 text-lg bg-white border-blue-200 text-blue-900 font-bold`}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="md:col-span-4">
              <label className={labelStyles}>Mes Final</label>
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
            </div>
            <div className="md:col-span-4">
              <label className={labelStyles}>Año Final</label>
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
          </div>

          {result && (
            <div className="mt-6 pt-6 border-t border-blue-200/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center align-center">
                <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-gray-500 mb-1">Inflación Total</p>
                  <p className="text-2xl font-bold text-blue-600">{result.totalInflation}%</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-gray-500 mb-1">Promedio Mensual</p>
                  <p className="text-2xl font-bold text-blue-600">{result.averageMonthlyInflation}%</p>
                </div>
                <div className="bg-white/60 p-4 rounded-xl backdrop-blur-sm">
                  <p className="text-sm text-gray-500 mb-1">Anualizado</p>
                  <p className="text-2xl font-bold text-blue-600">{result.annualizedInflation}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InflationCalculator;

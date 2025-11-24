import { useState, useEffect } from "react";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState("");
  const [selectedRate, setSelectedRate] = useState(0);
  const [dollarTypes, setDollarTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReverse, setIsReverse] = useState(false);

  useEffect(() => {
    const fetchDollarPrices = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares");
        if (!response.ok) throw new Error("Error al obtener datos");
        const data = await response.json();

        const formattedData = data.map((item) => ({
          name: `Dólar ${item.nombre}`,
          rate: item.venta,
        }));

        setDollarTypes(formattedData);
        setIsLoading(false);
      } catch (err) {
        setError("Error al cargar los precios");
        setIsLoading(false);
      }
    };

    fetchDollarPrices();
  }, []);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const handleRateChange = (e) => {
    setSelectedRate(Number(e.target.value));
  };

  const toggleDirection = () => {
    setIsReverse(!isReverse);
    setAmount("");
  };

  const convertedAmount =
    amount && selectedRate
      ? isReverse
        ? (Number(amount) * selectedRate).toFixed(2)
        : (Number(amount) / selectedRate).toFixed(2)
      : "0.00";

  const inputStyles =
    "w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 placeholder-gray-400";
  const selectStyles =
    "w-full p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 font-medium text-gray-700 cursor-pointer hover:bg-gray-100";
  const labelStyles = "text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2 block";

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 w-full transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
      <h2 className="text-3xl font-black mb-8 text-center text-blue-600 tracking-tight">
        Conversor de Moneda
      </h2>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-center mb-6">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="space-y-6">
          <div className="relative">
             <button
              onClick={toggleDirection}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white border border-gray-200 rounded-full shadow-lg hover:scale-110 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 group"
              title="Invertir conversión"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={2} 
                stroke="currentColor" 
                className={`w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-transform duration-300 ${isReverse ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
              </svg>
            </button>

            <div className="space-y-6">
              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                <label className={labelStyles}>
                  {isReverse ? "Dólares (USD)" : "Pesos Argentinos (ARS)"}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={handleAmountChange}
                    className={`${inputStyles} pl-8`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 hover:border-blue-100 transition-colors">
                <label className={labelStyles}>
                  Tipo de Cambio
                </label>
                <select
                  onChange={handleRateChange}
                  className={selectStyles}
                  defaultValue=""
                >
                  <option value="" disabled>
                    Seleccione tipo de dólar
                  </option>
                  {dollarTypes.map((type) => (
                    <option key={type.name} value={type.rate}>
                      {type.name} - ${type.rate}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-500/20 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-blue-100 text-sm font-medium mb-1 uppercase tracking-wider">Resultado Estimado</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-light opacity-80">{isReverse ? "ARS" : "USD"}</span>
                <span className="text-4xl sm:text-5xl font-bold tracking-tight">
                  ${convertedAmount}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;

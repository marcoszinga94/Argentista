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
    "w-22 p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200";
  const selectStyles =
    "p-2.5 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all duration-200 bg-white hover:bg-gray-50";
  const labelStyles = "text-lg text-gray-600";

  return (
    <div className="bg-white p-4 sm:p-8 rounded-2xl shadow-lg border border-gray-100 w-full">
      <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Conversor de Moneda
      </h2>

      {isLoading && (
        <div className="text-center text-gray-600">Cargando precios...</div>
      )}

      {error && <div className="text-center text-red-500 mb-4">{error}</div>}

      {!isLoading && !error && (
        <div className="space-y-4 m-auto">
          <button
            onClick={toggleDirection}
            className="w-full p-2 sm:p-3 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 transition-colors duration-200 text-sm sm:text-base"
          >
            {isReverse ? "USD → ARS" : "ARS → USD"}
          </button>
          <div>
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              className={`${inputStyles} w-full text-sm sm:text-base`}
              placeholder={`Ingrese monto en ${isReverse ? "dólares" : "pesos"}`}
            />
          </div>
          <div>
            <select
              onChange={handleRateChange}
              className={`${selectStyles} w-full text-sm sm:text-base`}
              defaultValue=""
            >
              <option value="" disabled>
                Seleccione tipo de dólar
              </option>
              {dollarTypes.map((type) => (
                <option key={type.name} value={type.rate}>
                  {type.name} (${type.rate})
                </option>
              ))}
            </select>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border border-blue-200">
            <p className={`${labelStyles}`}>Resultado:</p>
            <p className="text-xl sm:text-3xl font-bold text-blue-800 text-center">
              {isReverse ? "ARS $" : "USD $"}
              {convertedAmount}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrencyConverter;

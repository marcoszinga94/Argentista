import { useState, useEffect } from "react";

const DollarPrices = () => {
  const [dollarPrices, setDollarPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDollarPrices = async () => {
      try {
        const response = await fetch("https://dolarapi.com/v1/dolares");
        if (!response.ok) {
          throw new Error("No se pudo obtener la información del dólar");
        }
        const data = await response.json();
        setDollarPrices(data);
        setIsLoading(false);
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
      }
    };

    fetchDollarPrices();
  }, []);

  const renderPriceCard = (price) => (
    <div
      key={price.casa}
      className="p-6 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <h3 className="text-xl font-semibold mb-4 text-blue-700">
        {price.nombre || "Cargando..."}
      </h3>
      <ul className="space-y-2">
        <li className="flex justify-between">
          <span className="text-gray-600">Compra:</span>
          <span className="font-medium">
            ${price.compra?.toFixed(2) ?? "N/A"}
          </span>
        </li>
        <li className="flex justify-between">
          <span className="text-gray-600">Venta:</span>
          <span className="font-medium">
            ${price.venta?.toFixed(2) ?? "N/A"}
          </span>
        </li>
        <li className="text-sm text-gray-500 mt-4">
          Última actualización:{" "}
          {price.fechaActualizacion
            ? new Date(price.fechaActualizacion).toLocaleString()
            : "Cargando..."}
        </li>
      </ul>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return Array(6)
        .fill(null)
        .map((_, index) => renderPriceCard({ casa: `loading-${index}` }));
    }

    if (error) {
      return (
        <div className="col-span-full flex items-center justify-center gap-2 text-red-500 p-8">
          <span className="text-lg">Error: {error}</span>
        </div>
      );
    }

    return dollarPrices.map(renderPriceCard);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
      <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-transparent bg-clip-text">
        Precios del Dólar
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default DollarPrices;

import React, { useState, useEffect } from "react";

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

  if (isLoading) {
    return <div className="text-center">Cargando precios del dólar...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h2 className="text-2xl font-semibold mb-4">Precios del Dólar</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {dollarPrices.map((price) => (
          <div key={price.casa} className="mb-4 p-4 border rounded-md">
            <h3 className="text-xl font-medium mb-2">{price.nombre}</h3>
            <ul>
              <li className="mb-1">
                <span className="font-medium">Compra:</span> ${price.compra?.toFixed(2) ?? "N/A"}
              </li>
              <li className="mb-1">
                <span className="font-medium">Venta:</span> ${price.venta?.toFixed(2) ?? "N/A"}
              </li>
              <li className="text-sm text-gray-600">Última actualización: {new Date(price.fechaActualizacion).toLocaleString()}</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DollarPrices;

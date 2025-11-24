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
      className="group p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
    >
      <h3 className="text-xl text-center font-bold mb-2 text-gray-800 group-hover:text-blue-600 transition-colors z-10 capitalize">
        {price.nombre || "Cargando..."}
      </h3>
      
      <div className="space-y-3 z-10">
        <div className="flex justify-between items-end border-b border-gray-50">
          <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Compra</span>
          <span className="text-xs md:text-xl font-bold text-gray-900">
            ${price.compra?.toFixed(2) ?? "N/A"}
          </span>
        </div>
        <div className="flex justify-between items-end">
          <span className="text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wide">Venta</span>
          <span className="text-xs md:text-xl font-bold text-blue-600">
            ${price.venta?.toFixed(2) ?? "N/A"}
          </span>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <p className="text-xs font-medium text-gray-400">
          Actualizado:{" "}
          {price.fechaActualizacion
            ? new Date(price.fechaActualizacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : "..."}
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return Array(6)
        .fill(null)
        .map((_, index) => (
          <div key={`loading-${index}`} className="animate-pulse p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          </div>
        ));
    }

    if (error) {
      return (
        <div className="col-span-full flex items-center justify-center p-8 bg-red-50 rounded-2xl border border-red-100">
          <span className="text-red-600 font-medium">Error: {error}</span>
        </div>
      );
    }

    return dollarPrices.map(renderPriceCard);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
      <h2 className="text-3xl font-black mb-8 text-center text-blue-600 tracking-tight">
        Precios del Dólar
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default DollarPrices;

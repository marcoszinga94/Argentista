import { writeFileSync } from "fs";

interface DolarCotizacion {
  casa: string;
  nombre: string;
  compra: number;
  venta: number;
  fecha: string;
}

async function fetchDolarData(): Promise<void> {
  try {
    const response = await fetch(
      "https://api.argentinadatos.com/v1/cotizaciones/dolares/"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DolarCotizacion[] = await response.json();

    const outputData = {
      fecha_consulta: new Date().toISOString(),
      cotizaciones: data,
    };

    writeFileSync(
      "cotizaciones_dolar.json",
      JSON.stringify(outputData, null, 2),
      "utf-8"
    );

    console.log("Datos guardados exitosamente en cotizaciones_dolar.json");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error al obtener los datos:", error.message);
    } else {
      console.error("Error inesperado:", error);
    }
  }
}

fetchDolarData();

import fs from 'fs/promises';
import path from 'path';

const casas = [
  "oficial",
  "blue",
  "contadoconliqui",
  "mayorista",
  "cripto",
  "tarjeta",
];

export async function fetchDolarData() {
  try {
    const results = await Promise.all(
      casas.map(async (casa) => {
        const response = await fetch(`https://api.argentinadatos.com/v1/cotizaciones/dolares/${casa}`);
        if (!response.ok) {
          throw new Error(`HTTP error for ${casa}! status: ${response.status}`);
        }
        const data = await response.json();
        return { casa, data };
      })
    );

    const formattedData = Object.fromEntries(
      results.map(({ casa, data }) => [casa, data])
    );

    await fs.mkdir(path.join(process.cwd(), 'src/data'), { recursive: true });

    await fs.writeFile(
      path.join(process.cwd(), 'src/data', 'dolar.json'),
      JSON.stringify(formattedData, null, 2),
      'utf-8'
    );

    return formattedData;
  } catch (error) {
    console.error('Error fetching or saving data:', error);
    return null;
  }
}

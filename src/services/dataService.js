import fs from 'node:fs';
import path from 'node:path';
import { fetchData } from './APIservices';

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

const dataFilePath = path.join(__dirname, 'data.json');

async function fetchAndSaveData(url) {
  try {
    const newData = await fetchData(url);

    let existingData = [];
    if (fs.existsSync(dataFilePath)) {
      const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
      existingData = JSON.parse(fileContent);
    }

    if (JSON.stringify(existingData) !== JSON.stringify(newData)) {
      fs.writeFileSync(dataFilePath, JSON.stringify(newData, null, 2));
      console.log('Datos actualizados y guardados en data.json');
    } else {
      console.log('No hay cambios en los datos; no se actualiza el archivo.');
    }
  } catch (error) {
    console.error('Error al obtener y guardar datos:', error);
  }
}

export { fetchAndSaveData };

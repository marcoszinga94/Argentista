import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/api/data', async (req, res) => {
  try {
    const response = await fetch('https://datosestadistica.cba.gov.ar/api/action/datastore_search?resource_id=05541347-e05d-4088-a2b8-a802a26f6777');
    const data = await response.json();
    res.json(data); // Envía los datos al cliente
  } catch (error) {
    res.status(500).json({ error: 'Error fetching data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

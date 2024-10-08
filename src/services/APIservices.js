const cache = {};
const cacheTTL = 300000; // 5 minutos

async function fetchData(url) {
  const now = Date.now();

  if (cache[url] && (now - cache[url].timestamp < cacheTTL)) {
    console.log('Datos desde cache');
    return cache[url].data;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error en la solicitud: ${response.statusText}`);
  }

  const data = await response.json();

  cache[url] = {
    data: data,
    timestamp: now
  };
  console.log('Datos desde API');

  return data;
}

export { fetchData };
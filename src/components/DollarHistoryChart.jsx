import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { format, subWeeks, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import { fetchAndSaveData } from "../services/dataService"; // Importa la función para fetch y save

ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
);

const DollarHistoryChart = () => {
	const [chartData, setChartData] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedCasa, setSelectedCasa] = useState("blue");
	const [timeRange, setTimeRange] = useState(0.25);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		fetchDollarData();
	}, [selectedCasa, timeRange]);

	const fetchDollarData = async () => {
		setIsLoading(true);
		setError(null);

		const endDate = new Date();
		const startDate =
			timeRange >= 1
				? subMonths(endDate, timeRange)
				: subWeeks(endDate, Math.floor(timeRange * 4));

		const data = []; // Almacena los datos a obtener
		let currentDate = startDate;

		while (currentDate <= endDate) {
			const formattedDate = format(currentDate, "yyyy/MM/dd");

			const url = `https://api.argentinadatos.com/v1/cotizaciones/dolares/${selectedCasa}/${formattedDate}`;
			await fetchAndSaveData(url); // Llama a la función para fetch y save

			// Agrega el URL de los datos para la comparación
			data.push(url);

			currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
		}

		// Aquí puedes cargar los datos desde el archivo JSON después de hacer el fetch
		const existingData = JSON.parse(fs.readFileSync(dataFilePath, "utf-8"));
		const chartData = prepareChartData(existingData);
		setChartData(chartData);
		setIsLoading(false);
	};

	const fetchDataForDateRange = async (startDate, endDate) => {
		const data = [];
		let currentDate = startDate;

		while (currentDate <= endDate) {
			const formattedDate = format(currentDate, "yyyy/MM/dd");

			try {
				const url = `https://api.argentinadatos.com/v1/cotizaciones/dolares/${selectedCasa}/${formattedDate}`;
				const dayData = await fetchData(url);
				data.push({ date: formattedDate, ...dayData });
			} catch (error) {
				console.error(
					`Error al obtener datos para la fecha ${formattedDate}:`,
					error,
				);
			}

			currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
		}

		return data;
	};

	const prepareChartData = (data) => {
		if (data.length === 0) {
			throw new Error(
				"No se encontraron datos en el rango de fechas seleccionado.",
			);
		}

		const labels = data.map((item) =>
			format(new Date(item.date), "d MMM", { locale: es }),
		);
		const values = data.map((item) => item.venta);

		return {
			labels,
			datasets: [
				{
					label: `Dólar ${selectedCasa.charAt(0).toUpperCase() + selectedCasa.slice(1)}`,
					data: values,
					borderColor: "rgb(75, 192, 192)",
					tension: 0.1,
				},
			],
		};
	};

	const casasOptions = [
		{ value: "oficial", label: "Oficial" },
		{ value: "blue", label: "Blue" },
		{ value: "bolsa", label: "Bolsa" },
		{ value: "cripto", label: "Cripto" },
		{ value: "mayorista", label: "Mayorista" },
		{ value: "solidario", label: "Solidario" },
		{ value: "turista", label: "Turista" },
	];

	const timeRangeOptions = [
		{ value: 0.25, label: "1 semana" },
		{ value: 1, label: "1 mes" },
		{ value: 3, label: "3 meses" },
		{ value: 6, label: "6 meses" },
		{ value: 12, label: "1 año" },
		{ value: "all", label: "Todo el historial" },
	];

	if (isLoading) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md w-full">
				<div className="text-center">Cargando datos del dólar...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md w-full">
				<div className="text-center text-red-500">Error: {error}</div>
			</div>
		);
	}

	if (!chartData || chartData?.datasets[0]?.data.length === 0) {
		return (
			<div className="bg-white p-6 rounded-lg shadow-md w-full">
				<div className="text-center">
					No hay datos disponibles para el rango seleccionado.
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white p-6 rounded-lg shadow-md w-full">
			<h2 className="text-2xl font-semibold mb-4">
				Comparar Históricos del Dólar
			</h2>
			<div className="mb-4 flex space-x-4">
				<div>
					<label htmlFor="casa-select" className="block mb-1">
						Tipo de Dólar:
					</label>
					<select
						id="casa-select"
						multiple
						value={selectedCasas}
						onChange={(e) =>
							setSelectedCasas(
								Array.from(e.target.selectedOptions, (option) => option.value),
							)
						}
						className="p-2 border rounded"
					>
						{casasOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="time-range-select" className="block mb-1">
						Rango de Tiempo:
					</label>
					<select
						id="time-range-select"
						value={timeRange}
						onChange={(e) => setTimeRange(Number.parseFloat(e.target.value))}
						className="p-2 border rounded"
					>
						{timeRangeOptions.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
				</div>
			</div>
			<div className="h-96">
				<Line
					data={chartData}
					options={{
						responsive: true,
						maintainAspectRatio: false,
						scales: {
							y: {
								beginAtZero: false,
								title: {
									display: true,
									text: "Precio en ARS",
								},
							},
							x: {
								title: {
									display: true,
									text: "Fecha",
								},
							},
						},
					}}
				/>
			</div>
		</div>
	);
};

export default DollarHistoryChart;

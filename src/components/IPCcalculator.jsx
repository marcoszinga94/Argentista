import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
} from "chart.js";

// Registering the required Chart.js components
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Tooltip,
	Legend,
);

const IPCcalculator = () => {
	const [initialAmount, setInitialAmount] = useState(10000);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [result, setResult] = useState(null);
	const [rentalData, setRentalData] = useState(null);
	const [chartData, setChartData] = useState({ labels: [], datasets: [] });

	// Fetching data from the API
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("http://localhost:5000/api/data");
				const data = await response.json();
				setRentalData(data.result.records[0]);
				console.log(data.result.records[0]);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		// Establecer las fechas por defecto
		const now = new Date();
		const yearAgo = new Date(now);
		yearAgo.setFullYear(now.getFullYear() - 1);

		// Formatear fechas a 'YYYY-MM'
		const formatDate = (date) => {
			const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses son de 0 a 11
			const year = date.getFullYear();
			return `${year}-${month}`;
		};

		setStartDate(formatDate(yearAgo));
		setEndDate(formatDate(now));
	}, []);

	useEffect(() => {
		if (rentalData) {
			// Calcular los datos para la gráfica de los últimos 3 años
			const lastThreeYearsData = {};
			const currentYear = new Date().getFullYear();

			for (let year = currentYear - 2; year <= currentYear - 1; year++) {
				for (const month of [
					"ene",
					"feb",
					"mar",
					"abr",
					"may",
					"jun",
					"jul",
					"ago",
					"sep",
					"oct",
					"nov",
					"dic",
				]) {
					const key = `${month}-${year}`;
					if (rentalData[key]) {
						const value = Number.parseFloat(rentalData[key].replace(",", "."));
						// Guardar los datos para el gráfico
						if (!lastThreeYearsData[month]) {
							lastThreeYearsData[month] = 0;
						}
						lastThreeYearsData[month] += value;
					}
				}
			}

			// Configurar los datos para la gráfica
			const labels = Object.keys(lastThreeYearsData);
			const dataValues = labels.map((month) => lastThreeYearsData[month]);

			setChartData({
				labels,
				datasets: [
					{
						label: "Incremento Mensual (2 años)",
						data: dataValues,
						borderColor: "rgba(75, 192, 192, 1)",
						backgroundColor: "rgba(75, 192, 192, 0.2)",
						borderWidth: 2,
						fill: true,
					},
				],
			});
		}
	}, [rentalData]); // Ejecutar el efecto cuando los datos de alquiler cambien

	// CALCULO DE INCREMENTO EN IPC
	const handleCalculate = () => {
		if (!rentalData) {
			console.error("No rental data available");
			return;
		}

		let totalIncrement = 0;

		const startYear = Number.parseInt(startDate.split("-")[0]);
		const endYear = Number.parseInt(endDate.split("-")[0]);

		for (let year = startYear; year <= endYear; year++) {
			for (const month of [
				"ene",
				"feb",
				"mar",
				"abr",
				"may",
				"jun",
				"jul",
				"ago",
				"sep",
				"oct",
				"nov",
				"dic",
			]) {
				const key = `${month}-${year}`;
				if (rentalData[key]) {
					const value = Number.parseFloat(rentalData[key].replace(",", "."));
					totalIncrement += value;
				}
			}
		}

		const finalAmount = initialAmount + totalIncrement;
		setResult(finalAmount.toFixed(0));
	};

	return (
		<div className="flex flex-col items-center justify-center bg-gray-100">
			<div className="bg-white p-6 rounded-lg shadow-lg w-96 mb-6">
				<h1 className="text-2xl font-bold text-center mb-4">
					Calculadora de Alquiler
				</h1>
				<input
					type="number"
					placeholder="Monto Inicial"
					value={initialAmount}
					onChange={(e) => setInitialAmount(Number.parseFloat(e.target.value))}
					className="w-full p-2 border border-gray-300 rounded-md mb-4"
				/>
				<input
					type="month"
					placeholder="Fecha de Inicio"
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded-md mb-4"
				/>
				<input
					type="month"
					placeholder="Fecha de Fin"
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className="w-full p-2 border border-gray-300 rounded-md mb-4"
				/>
				<button
					type="button"
					onClick={handleCalculate}
					className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition duration-200"
				>
					Calcular
				</button>
				{result !== null && (
					<h2 className="text-lg font-semibold text-center mt-4">
						El monto final es: ${result}
					</h2>
				)}
			</div>

			<div className="bg-white p-6 rounded-lg shadow-lg w-96">
				<h2 className="text-xl font-bold text-center mb-4">
					Incremento Mensual de los Últimos 2 Años
				</h2>
				{chartData.labels.length > 0 ? (
					<Line data={chartData} options={{ responsive: true }} />
				) : (
					<p className="text-center">Cargando datos para el gráfico...</p>
				)}
			</div>
		</div>
	);
};

export default IPCcalculator;

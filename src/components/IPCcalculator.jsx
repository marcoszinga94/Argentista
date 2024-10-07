import React, { useEffect, useState } from "react";

const DataFetcher = () => {
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetch(
			"https://datosestadistica.cba.gov.ar/api/action/datastore_search?resource_id=05541347-e05d-4088-a2b8-a802a26f6777",
		)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((data) => {
				setData(data.result.records);
				setLoading(false);
			})
			.catch((error) => {
				setError(error);
				setLoading(false);
			});
	}, []);

	if (loading) {
		return <div className="text-center py-4">Cargando...</div>;
	}

	if (error) {
		return <div className="text-red-500">Error: {error.message}</div>;
	}

	return (
		<div className="overflow-x-auto p-4">
			{data.length > 0 ? (
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Descripción
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Nivel
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Dic-20
							</th>
							<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
								Dic-23
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{data.map((record, index) => (
							<tr key={record.id}>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{record.Descripción}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{record.NIVEL}
								</td>
								{/* Muestra más datos según tus datos */}
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{record["dic-20"]}
								</td>
								<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
									{record["dic-23"]}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			) : (
				<div>No hay datos disponibles</div>
			)}
		</div>
	);
};

export default DataFetcher;

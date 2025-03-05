/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				azulClaro: '#EFF6FF',
				azul: '#3B82F6',
				azulOscuro: '#1E40AF',
				grisClaro: '#F9FAFB',
				gris: '#6B7280',
				grisOscuro: '#374151',
				rojo: '#EF4444',
			},
		},
	},
	plugins: [],
	future: {
		hoverOnlyWhenSupported: true,
		respectDefaultRingColorOpacity: true,
		disableColorOpacityUtilitiesByDefault: true,
	},
	experimental: {
		optimizeUniversalDefaults: true,
	},
}

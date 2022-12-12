import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	base: './',
	resolve: {
		alias: {
			'@': '/src/',
		},
	},
	build: {
		rollupOptions: {
			input: {
				app: './index.html',
				devtool: './devtool.html',
			},
		},
	},
});

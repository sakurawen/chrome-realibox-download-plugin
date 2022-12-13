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
				devtool: './devtools.html',
				content: './src/extension/content.ts',
				background: './src/extension/background.ts',
			},
			output: {
				assetFileNames: '[ext]/[name][extname]',
				chunkFileNames: 'js/chunk/[name]-[hash].js',
				entryFileNames: 'js/[name].js',
			},
		},
	},
});

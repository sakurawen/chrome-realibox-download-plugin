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
		emptyOutDir: false,
		outDir: 'extension',
		rollupOptions: {
			input: {
				app: './index.html',
				devtool: './devtools.html',
				background: './src/background/index.ts',
			},
			output: {
				assetFileNames: '[ext]/[name][extname]',
				chunkFileNames: 'js/chunk/[name]-[hash].js',
				entryFileNames: 'js/[name].js',
			},
		},
	},
});

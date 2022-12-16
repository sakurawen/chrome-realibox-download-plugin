import { defineConfig } from 'vite';
// https://vitejs.dev/config/
export default defineConfig({
	base: './',
	resolve: {
		alias: {
			'@': '/src/',
		},
	},
  publicDir:false,
	build: {
    emptyOutDir:false,
    lib: {
      entry:'./src/content/index.ts',
      name: 'content',
      formats: ['iife']
    },
    outDir:"extension/content",
		rollupOptions: {
			output: {
				entryFileNames: 'index.js',
			},
		},
	},
});

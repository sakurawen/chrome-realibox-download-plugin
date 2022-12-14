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
      entry:'./src/extension/content.ts',
      name: 'content',
      formats: ['iife']
    },
    outDir:"extension_dist/content",
		rollupOptions: {
			output: {
				entryFileNames: 'index.js',
			},
		},
	},
});

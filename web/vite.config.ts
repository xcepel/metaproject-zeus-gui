import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react(), tsconfigPaths()],
	resolve: {
		// avoids a duplicate React copy from the linked design-system package
		dedupe: ['react', 'react-dom']
	},
	server: {
		host: '0.0.0.0',
		hmr: {
			clientPort: 5137
		},
		port: 5137,
		watch: {
			usePolling: true
		},
		fs: {
			allow: ['..', '../..']
		}
	}
});

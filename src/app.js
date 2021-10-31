import express from 'express';
import { getPackage } from './package.js';

/**
 * Bootstrap the application framework
 */
const createApp = () => {
	const app = express();

	app.use(express.json());

	app.get('/package/:name/:version', getPackage);

	return app;
};

export { createApp };

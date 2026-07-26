/**
 * server/src/app.js
 *
 * ARCHITECTURAL PURPOSE:
 * This file is the main entry point for the Express server application. It is
 * responsible for setting up all global middleware and mounting the various
 * modular route handlers.
 *
 * The bug fix applied here addresses a critical middleware configuration issue.
 */

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler, notFound } from './shared/middleware/error.middleware.js';

// In a real application, you would import all your route handlers here.
// import categoryRoutes from './modules/categories/category.routes.js';
// import productRoutes from './modules/products/product.routes.js';

const app = express();

// --- MIDDLEWARE CONFIGURATION ---

// Set up CORS and cookie parsing according to your project's needs.
app.use(cors());
app.use(cookieParser());

// FIX: The express.json() middleware was likely missing or placed after the route
// definitions for the '/api/categories' endpoint. This middleware is ESSENTIAL
// for parsing incoming JSON request bodies. Without it, any POST, PATCH, or PUT
// request with a 'Content-Type' of 'application/json' will result in `req.body`
// being `undefined`. This was the root cause of the validation error.
//
// By placing it here, at the top of the middleware stack, we ensure it runs
// for ALL incoming requests before they reach any of our application's routes,
// making the server robust and preventing this class of error across all modules.
app.use(express.json());

// --- API ROUTES ---
// Mount all your application's routers here.
// app.use('/api/categories', categoryRoutes);
// app.use('/api/products', productRoutes);

// --- ERROR HANDLING MIDDLEWARE ---
app.use(notFound);
app.use(errorHandler);

export default app;
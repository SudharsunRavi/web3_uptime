import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import connectDb  from './database.js';
import authRoutes from './routes/auth.routes.js';
import endpointsRoutes from './routes/endpoints.routes.js';

const app= express();
dotenv.config();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors(
    {
        origin: "http://localhost:5173",
        credentials: true,
    }
));

app.use('/auth', authRoutes);
app.use('/endpoints', endpointsRoutes);

connectDb().then(() => {
    app.listen(7777, () => {
        console.log('Server is running on port 7777');
    });
}).catch((error) => {
    console.error('Error starting server:', error);
});
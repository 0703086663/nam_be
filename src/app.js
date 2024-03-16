import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cors from 'cors';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/error.controller.js';
import morgan from 'morgan';
import { rootname } from './utils/path.js';
import surveyRoutes from './router/survey.route.js';
import campaignRoutes from './router/campaign.route.js';
import responseRoutes from './router/response.route.js';
import fieldRoutes from './router/field.route.js';
import userRoutes from './router/user.route.js';

const app = express();

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});

app.use(cors());
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  })
);

// 1) GLOBAL MIDDLEWARES
// set security HTTP headers
app.use(helmet());

// development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
console.log('Env currently running on: ' + process.env.NODE_ENV);

// limit the number of requests from the same IP
// in this case, 100 requests per hour
const timeWindow = 60 * 60 * 1000; // 1 hour
const maxRequest = 100;

const limiter = rateLimit({
  max: maxRequest,
  windowMs: timeWindow,
  message: 'Too many requests from this IP, please try again in an hour!'
});

// apply the limiter to all routes that start with /api
// app.use('/api', limiter);

// middleware to parse the body of the request into json
// limit the size of the body to 10mb
app.use(express.json({ limit: '10mb' }));

// middleware to parse the urlencoded body
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// data sanitization against NoSQL query injection
app.use(mongoSanitize());

const whitelist = [''];
// hpp - html param pollution will remove the duplicate parameter
app.use(
  hpp({
    whitelist: whitelist
  })
);

// middleware to serve static files
app.use(express.static(`${rootname}/public`));

// 2) ROUTES
app.use('/api/survey', surveyRoutes);
app.use('/api/campaign', campaignRoutes);
app.use('/api/response', responseRoutes);
app.use('/api/field', fieldRoutes);
app.use('/api/user', userRoutes);

// 3) ERROR HANDLING
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

export default app;

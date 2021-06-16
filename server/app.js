const morgan = require('morgan');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cors = require('cors');

//* **** CUstom Modules***** */
  const AppError = require('./utils/appError');
  

const globalErrorHandler = require('./controllers/errorController');

// ********* ROUTES IMPORTS ************

const app = express();

// ********** GLOBAL MIDDLEWARES ******
// Allow cross acces resourse sharing
app.use(cors());
app.options('*', cors());

// Set Security HTTP Headers
app.use(helmet());

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Compress requests from the sever
app.use(compression());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request per IP
const limiter = rateLimit({
  max: 500,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// HANDLING ALL UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Sorry, 😢. Can't find ${req.originalUrl} on this server 💥!`,
      404,
    ),
  );
});

// *
// *
// *
// *
// *
// *
// *
//   ******** Global Error Handler ******
app.use(globalErrorHandler);

module.exports = app;

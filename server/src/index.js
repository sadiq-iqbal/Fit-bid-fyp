require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Attach io to app so routes can access it
app.set('io', io);

// Connect Database
connectDB();

// Security
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limiter for bid submissions
const bidLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Bid submission limit reached. Try again in an hour.' },
});

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/bids', bidLimiter, require('./routes/bids'));
app.use('/api/engagements', require('./routes/engagements'));
app.use('/api/workouts', require('./routes/workouts'));
app.use('/api/meals', require('./routes/meals'));
app.use('/api/progress', require('./routes/progress'));
app.use('/api/checkins', require('./routes/checkins'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/directory', require('./routes/directory'));

app.get('/api/healthz', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// Socket.io — real-time messaging
require('./config/socket')(io);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`FitBid server running on port ${PORT}`));

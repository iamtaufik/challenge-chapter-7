require('dotenv').config();
const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const Sentry = require('@sentry/node');

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
io.on('connection', (socket) => {
  console.log('a user connected');
});

Sentry.init({
  desn: process.env.SENTRY_DSN,
  integrations: [new Sentry.Integrations.Http({ tracing: true }), new Sentry.Integrations.Express({ app })],
  tracesSampleRate: 1.0,
  environment: process.env.ENV,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

app.use(require('./routes/auth.route')(io));

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

app.use(Sentry.Handlers.errorHandler());

server.listen(port, () => {
  console.log(`Server listening at port ${port}`);
});

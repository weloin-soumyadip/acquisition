import logger from '#config/logger.js';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRouter from './routes/auth.routes.js';
import securityMiddleware from './middleware/security.middleware.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  morgan('combined', {
    stream: {
      write: message => logger.info(message.trim()),
    },
  })
);
app.use(cookieParser());
// app.use(securityMiddleware);

app.get('/', securityMiddleware, (req, res) => {
  logger.info('Hello fro Acquisition!'); // using winston logger package
  res.status(200).send('Hello from Acquisition!');
});

// health check
app.get("/health", securityMiddleware, (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get("/api", securityMiddleware, (req, res) => {
  res.status(200).json({
    message: "Acquisition api is running..."
  });
});

app.use("/api/auth", authRouter);
// app.use("/api", securityMiddleware);

export default app;
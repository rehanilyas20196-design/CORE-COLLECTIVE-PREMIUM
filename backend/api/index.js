"use strict";
require("reflect-metadata");
const path = require("path");

let cachedHandler = null;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    const express = require("express");
    const { NestFactory } = require("@nestjs/core");
    const { ExpressAdapter } = require("@nestjs/platform-express");
    const { ValidationPipe } = require("@nestjs/common");
    const helmet = require("helmet");
    const { AppModule } = require(path.join(__dirname, "..", "dist", "app.module"));

    const expressApp = express();

    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }));

    const devOrigins = ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"];
    const configuredOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
      : [];
    app.enableCors({
      origin: (origin, callback) => {
        if (!origin || devOrigins.includes(origin) || configuredOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
    });

    app.setGlobalPrefix("api");

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    await app.init();

    cachedHandler = (req2, res2) => {
      expressApp(req2, res2);
    };
  }

  cachedHandler(req, res);
};

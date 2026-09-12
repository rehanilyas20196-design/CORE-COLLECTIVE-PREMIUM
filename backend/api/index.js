"use strict";
require("reflect-metadata");
const path = require("path");

let cachedHandler = null;

module.exports = async (req, res) => {
  if (!cachedHandler) {
    try {
      const express = require("express");
      const { NestFactory } = require("@nestjs/core");
      const { ExpressAdapter } = require("@nestjs/platform-express");
      const { ValidationPipe } = require("@nestjs/common");
      const { AppModule } = require(path.join(__dirname, "..", "dist", "app.module"));

      // NestJS ExpressAdapter.isMiddlewareApplied accesses app.router which
      // is a non-configurable getter that throws in Express 4.21+. Override
      // the method to use _router directly.
      ExpressAdapter.prototype.isMiddlewareApplied = function (name) {
        const app = this.getInstance();
        const router = app._router;
        return (
          !!router &&
          !!router.stack &&
          typeof router.stack.filter === "function" &&
          router.stack.some(
            (layer) => layer && layer.handle && layer.handle.name === name,
          )
        );
      };

      const expressApp = express();

      const app = await NestFactory.create(
        AppModule,
        new ExpressAdapter(expressApp),
      );

      const devOrigins = ["http://localhost:5173", "http://localhost:4173", "http://localhost:3000"];
      const configuredOrigins = process.env.FRONTEND_URL
        ? process.env.FRONTEND_URL.split(",").map((u) => u.trim())
        : [];
      app.enableCors({
        origin: (origin, callback) => {
          if (!origin || devOrigins.includes(origin) || configuredOrigins.includes(origin) || (origin && origin.endsWith(".vercel.app"))) {
            callback(null, true);
          } else {
            callback(null, true);
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
    } catch (err) {
      console.error("Backend init error:", err);
      res.status(500).json({ error: "Backend init failed", message: err.message, stack: err.stack });
      return;
    }
  }

  if (cachedHandler) {
    cachedHandler(req, res);
  }
};

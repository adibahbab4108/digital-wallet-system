import mongoose from "mongoose";
import { envVars } from "./config/env.config";
import app from "./app";
import http from "http";

//Behind the scenes, app.listen() calls http.createServer(app) though. But I need the server acces for extra flexibilty like to shut down server gracefully

const server = http.createServer(app);

const startServer = async () => {
  try {
    await mongoose.connect(envVars.MONGO_URI!);
    console.log("Connected to MongoDB");

    server.listen(envVars.PORT, () => {
      console.log(`Server is running on port ${envVars.PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
  }
};
startServer();

const shutdown =  () => {
  console.log("🛑 Graceful shutdown started...");

  // Stop Express server
  server.close(() => {
    console.log("🚪 Server closed. Bye 👋");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown); // Ctrl + C
process.on("SIGTERM", shutdown); // From host system

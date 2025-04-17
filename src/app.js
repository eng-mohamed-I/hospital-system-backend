import express from "express";
import env from "dotenv";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import routes from "./routes/index.js";
import handleGlobalError from "./middlewares/error.middleware.js";
import catchRoutes from "./middlewares/catchRoutes.middleware.js";
// ===========================================
const app = express();
env.config();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
//============================================
app.use(cors());
app.use(express.json({ limit: "10mb" })); // stream recived 10kb of chunk
//============================================
//Routes

app.use("/api/v1", routes);
//============================================
// soket io

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});
//============================================
//Handle errors

app.all("*", catchRoutes);

app.use(handleGlobalError);

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception: ", err);
  process.exit(1); //turn of app
});

process.on("Unhandled Rejection", (reason) => {
  console.log("Unhandled Rejection ");
  throw reason;
});
//============================================
export default app;

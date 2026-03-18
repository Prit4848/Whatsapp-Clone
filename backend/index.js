import express from "express";
import http from "http";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import "dotenv/config";
import ratelimit from "express-rate-limit";
import dbconnect from "./src/config/dbConnection.js";

const app = express();
const port = process.env.PORT || 5000;

// Trust first proxy (needed for secure cookies behind Render/NGINX)
app.set("trust proxy", 1);

const limit = ratelimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});

import indexRouter from "./src/routes/index.routes.js";
import initializeSocket from "./src/service/socketService.js";



app.set("trust proxy", 1);

app.use(
  cors({
    origin:true,
    credentials: true
  })
);
// app.use(limit)

app.use(morgan("dev"));
app.use(express.json()); // parse body data
app.use(cookieParser()); // parse token every requiest
app.use(bodyParser.urlencoded({ extended: true }));

const server = http.createServer(app);

let io = initializeSocket(server);
app.set("io", io);
app.use((req, res, next) => {
  ((req.io = app.get("io")), (req.socketUserMap = req.io?.socketUserMap));
  next();
});
//database connection
dbconnect();

//routes
app.use("/api/v1", indexRouter);
app.get("/", (req, res) => {
  res.json({ message: "backend server started" });
});

server.listen(port, () => {
  console.log(`server started on PORT: ${port}`);
});

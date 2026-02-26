import express from "express";
import http from 'http'
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import "dotenv/config";
import ratelimit from 'express-rate-limit'
import dbconnect from "./src/config/dbConnection.js";


const app = express();
const port = process.env.PORT || 5000;

const limit = ratelimit({
  windowMs: 15 * 60 * 1000,
  max:100,
  message: "Too many requests, please try again later."
})

import indexRouter from './src/routes/index.routes.js'
import initializeSocket from "./src/service/socketService.js";

//middleware
// app.use(
//   cors({
//     origin:[process.env.FRONTEND_URL,process.env.FRONTEND_URL1] ,
//     credentials:true
//   }),
// );

app.use(cors({ origin: 'https://whatsapp-clone-frontend-gamma.vercel.app', credentials: true }));

// app.use(limit)
app.use((req,res,next)=>{
    console.log(req.body);
    next()
})
app.use(morgan('dev'))
app.use(express.json()); // parse body data
app.use(cookieParser()); // parse token every requiest
app.use(bodyParser.urlencoded({ extended: true }));


const server = http.createServer(app)

let io = initializeSocket(server)
app.set("io", io);
app.use((req,res,next)=>{
  req.io = app.get("io"),
  req.socketUserMap = req.io?.socketUserMap
  next()
})
//database connection
dbconnect();

//routes
app.use("/api/v1",indexRouter);
app.get("/",(req,res)=>{
  res.json({res,message:"backend server started"})
})


server.listen(port, () => {
  console.log(`server started on PORT: ${port}`);
});

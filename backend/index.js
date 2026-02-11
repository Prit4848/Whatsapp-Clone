import express from "express";
import http from 'http'
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import "dotenv/config";
import dbconnect from "./src/config/dbConnection.js";


const app = express();
const port = process.env.PORT || 5000;

import indexRouter from './src/routes/index.routes.js'
import initializeSocket from "./src/service/socketService.js";

//middleware
app.use(
  cors({
    origin:[process.env.FRONTEND_URL,process.env.FRONTEND_URL1] ,
    credentials:true
  }),
);
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
  console.log(req.io?.socketUserMap);
  
  next()
})
//database connection
dbconnect();

//routes
app.use("/api/v1",indexRouter);


server.listen(port, () => {
  console.log(`server started on PORT: ${port}`);
});

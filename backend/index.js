import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import "dotenv/config";
import dbconnect from "./src/config/dbConnection.js";


const app = express();
const port = process.env.PORT || 5000;

morgan('dev')
import indexRouter from './src/routes/index.router.js'

//middleware
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json()); // parse body data
app.use(cookieParser()); // parse token every requiest
app.use(bodyParser.urlencoded({ extended: true }));

//database connection
dbconnect();

//routes
app.use("/api/v1",indexRouter);


app.listen(port, () => {
  console.log(`server started on PORT: ${port}`);
});

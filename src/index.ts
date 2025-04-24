import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import serviceRouter from "./routes/service.routes.js";
import bookingRouter from "./routes/booking.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cors());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/service", serviceRouter);
app.use("/api/v1/booking", bookingRouter);

app.listen(port, () => {
  connectDB();
  console.log(`Server is running at http://localhost:${port}`);
});

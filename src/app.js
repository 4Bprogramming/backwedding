import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import userRoute from './routes/user.routes.js'
import videoRoute from './routes/videos.routes.js'
import photoRoute from './routes/photo.routes.js'
import cloudinaryRouter from "./routes/cloudinary.routes.js";
import mediaRouter from "./routes/media.routes.js";

const app = express();

app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(express.json({ limit: "50mb" }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(userRoute);
app.use(videoRoute);
app.use(photoRoute);
app.use(cloudinaryRouter)
app.use(mediaRouter);



export default app;

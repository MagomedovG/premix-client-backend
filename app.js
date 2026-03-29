import express from "express";
import userRoutes from "./routes/user.route.js";
import orderRoutes from "./routes/order.route.js";
import cors from "cors";

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.json());

app.use("/api/user", userRoutes);
app.use("/api/order", orderRoutes);

export default app;
import express from "express";
import cors from "cors";
import productsRouter from "./routes/products.routes";
import usersRouter from "./routes/users.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Server running 🚀");
});

app.use(productsRouter);
app.use(usersRouter);

export default app;

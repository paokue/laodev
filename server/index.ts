import express from "express";
import cors from "cors";
import { authRouter } from "./auth";

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

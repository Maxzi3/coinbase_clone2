import express, { Express } from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes";

dotenv.config({ path: "./config.env" });

const app: Express = express();
const PORT: number = 5000;

// Serve frontend dist folder
const __dirnamePath = path.resolve(); // node 18+
const frontendPath = path.join(__dirnamePath, "./dist");
app.use(express.static(frontendPath));

// Catch-all route to serve index.html for Vue Router
app.get("*", (_, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.use(cors());
app.use(express.json());
app.use(router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

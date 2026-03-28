import app from "./app.js";
import "./bot/bot.js";
import { connectDB } from "./db.js";

await connectDB();

app.listen(3000, () => {
  console.log("🚀 Server running on 3000");
});
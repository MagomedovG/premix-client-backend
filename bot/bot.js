import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";
import fetch from "node-fetch";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

dotenv.config();

export const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
});

export const ADMIN_ID = process.env.ADMIN_ID;

// simple in-memory state for onboarding
const userStates = {};

// START → onboarding flow
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const res = await fetch(`${BASE_URL}/api/user/${chatId}`);

    if (res.status === 200) {
      const data = await res.json();
      console.log("User found:", data);

      return bot.sendMessage(chatId, "С возвращением!", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Сделать заказ",
                web_app: {
                  url: process.env.FRONTEND_URL || "",
                },
              },
            ],
          ],
        },
      });
    }
  } catch (e) {
    console.log("User not found, starting onboarding");
  }

  console.log("User not found or error, starting onboarding");

  // user not found → start onboarding
  userStates[chatId] = { step: "name" };

  bot.sendMessage(chatId, "Введите название заведения:");
});

// Handle onboarding steps
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // ignore commands (so /start isn't reprocessed here)
  if (msg.text && msg.text.startsWith("/")) return;

  const state = userStates[chatId];
  if (!state) return;

  // 1) name
  if (state.step === "name") {
    state.name = msg.text;
    state.step = "phone";

    return bot.sendMessage(chatId, "Введите номер телефона:");
  }

  // 2) phone
  if (state.step === "phone") {
    state.phone = msg.text;
    state.step = "address";

    return bot.sendMessage(chatId, "Введите адрес заведения:");
  }

  // 3) address
  if (state.step === "address") {
    state.address = msg.text;

    try {
      await fetch(`${BASE_URL}/api/user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tgId: chatId,
          name: state.name,
          address: state.address,
          phone: state.phone,
        }),
      });
    } catch (e) {
      console.error("Failed to save user:", e);
      await bot.sendMessage(chatId, "Ошибка сохранения, попробуйте ещё раз");
      return;
    }

    delete userStates[chatId];

    return bot.sendMessage(chatId, "✅ Данные сохранены!", {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Сделать заказ",
              web_app: {
                url: process.env.FRONTEND_URL || "",
              },
            },
          ],
        ],
      },
    });
  }
});

// optional: command to edit data later
bot.onText(/\/edit/, (msg) => {
  const chatId = msg.chat.id;

  userStates[chatId] = { step: "name" };

  bot.sendMessage(chatId, "Редактирование. Введите название заведения:");
});
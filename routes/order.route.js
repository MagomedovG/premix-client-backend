import { Router } from "express";
import { users } from "../store/users.store.js";
import { bot, ADMIN_ID } from "../bot/bot.js";
import { Order } from "../models/order.model.js";

const router = Router();

router.post("/", async (req, res) => {
  const { tgId, date, items, username, comment } = req.body;

  const user = users[tgId];

  if (!user) {
    return res.status(400).json({ error: "Нет пользователя" });
  }

  const total = items.reduce((s, i) => s + i.price * i.qty, 0);
  await Order.create({
    tgId,
    name: user.name,
    address: user.address,
    phone: user.phone,
    date,
    items,
    total,
    comment,
  });
  const itemsText = items
    .map((i) => `${i.name}: ${i.qty}`)
    .join("\n");

  const message = `
🔥 Новая заявка!

Заявка на ${date} для ${user.name} на ${user.address} (${user.phone})

${itemsText}

Сумма: ${total} руб.

@${username || "без username"}
`;

  await bot.sendMessage(ADMIN_ID, message);

  // сообщение клиенту
  const clientMessage = `
 Ваша заявка оформлена

 Дата: ${date}
 Имя: ${user.name}

${itemsText}

 Сумма: ${total} руб.
`;

  await bot.sendMessage(tgId, clientMessage);

  res.json({ ok: true });
});

router.get("/:tgId", async (req, res) => {
  try {
    const orders = await Order.find({ tgId: req.params.tgId }).sort({ createdAt: -1 });

    res.json(orders);
  } catch (e) {
    res.status(500).json({ error: "Ошибка получения заказов" });
  }
});

export default router;
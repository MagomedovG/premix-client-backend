import { Router } from "express";
import { users } from "../store/users.store.js";

const router = Router();

router.get("/", (req, res) => {
    res.json(users);
  });
  
router.get("/:tgId", (req, res) => {
  const user = users[req.params.tgId];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(user);
});
  
router.post("/", (req, res) => {
  const { tgId, name, address, phone } = req.body;

  users[tgId] = { name, address, phone };

  res.json({ ok: true });
});

export default router;
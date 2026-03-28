import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  tgId: String,
  name: String,
  address: String,
  phone: String,
  date: String,
  items: [
    {
      name: String,
      qty: Number,
      price: Number,
    },
  ],
  total: Number,
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Order = mongoose.model("Order", orderSchema);
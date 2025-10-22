// routes/orderRoutes.js
import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  searchOrders,
  updateOrderProperties,
} from "../Controllers/OrdersController.js";

const OrdersRout = express.Router();

OrdersRout.patch("/:id", updateOrderProperties);
OrdersRout.get("/search", searchOrders);
OrdersRout.post("/", createOrder);
OrdersRout.get("/", getOrders);
OrdersRout.get("/:id", getOrderById);
OrdersRout.put("/:id", updateOrder);
OrdersRout.delete("/:id", deleteOrder);
export default OrdersRout;

import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderPayment,
  updateOrderDeliveryStatus,
  markOrderAsPaid,
  updateOrder,
} from "../Controllers/OrdersController.js";

const OrderRoute = express.Router();

OrderRoute.post("/isDelivered/:id", updateOrderDeliveryStatus);
OrderRoute.post("/", createOrder);
OrderRoute.post("/markPaied/:id", markOrderAsPaid);
OrderRoute.post("/pay/:id", updateOrderPayment);
OrderRoute.get("/", getOrders);
OrderRoute.put("/:id", updateOrder);
OrderRoute.get("/:id", getOrderById);

export default OrderRoute;

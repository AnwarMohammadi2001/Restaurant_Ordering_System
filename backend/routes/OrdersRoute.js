import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderPayment,
} from "../Controllers/OrdersController.js";

const OrderRoute = express.Router();

OrderRoute.post("/", createOrder);
OrderRoute.post("/pay/:id", updateOrderPayment);
OrderRoute.get("/", getOrders);
OrderRoute.get("/:id", getOrderById);

export default OrderRoute;

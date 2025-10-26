import express from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
} from "../Controllers/OrdersController.js";

const OrderRoute = express.Router();

OrderRoute.post("/", createOrder);
OrderRoute.get("/", getOrders);
OrderRoute.get("/:id", getOrderById);

export default OrderRoute;

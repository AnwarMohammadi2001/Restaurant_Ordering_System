import Order from "../Models/Order.js";
import OrderItem from "../Models/orderItems.js";

// Define associations hereOrder.hasMany(OrderItem, {
Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  onDelete: "CASCADE",
});
OrderItem.belongsTo(Order, { foreignKey: "orderId", onDelete: "CASCADE" });


export { Order, OrderItem };

import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";
import OrderItem from "./orderItems.js";

const Order = sequelize.define("Order", {
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0, // will update after items are created
  },
  isDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // default is false
  },
});


Order.hasMany(OrderItem, {
  foreignKey: "orderId",
  as: "items",
  onDelete: "CASCADE",
});

export default Order;

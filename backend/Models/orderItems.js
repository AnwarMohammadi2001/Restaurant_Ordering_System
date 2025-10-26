import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";
import Order from "./Order.js";

const OrderItem = sequelize.define("OrderItem", {
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  menuItem: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});



export default OrderItem;

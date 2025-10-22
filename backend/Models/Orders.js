import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";

export const Order = sequelize.define(
  "Order",
  {
    customer: {
      // JSON field for customer info
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}, // default empty object
    },
    recip: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    remained: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    total: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    total_money_digital: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    total_money_Offset: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    isDelivered: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
  }
);

// Digital model
export const Digital = sequelize.define(
  "Digital",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    quantity: DataTypes.INTEGER,
    price_per_unit: DataTypes.FLOAT,
    money: DataTypes.FLOAT,
    height: DataTypes.FLOAT,
    area: DataTypes.FLOAT,
    weight: DataTypes.FLOAT,
  },
  { tableName: "digitals", timestamps: true }
);

// Offset model
export const Offset = sequelize.define(
  "Offset",
  {
    name: { type: DataTypes.STRING, allowNull: false },
    quantity: DataTypes.INTEGER,
    money: DataTypes.FLOAT,
    price_per_unit: DataTypes.FLOAT,
  },
  { tableName: "offsets", timestamps: true }
);

// Associations
Order.hasMany(Digital, { as: "digital", foreignKey: "orderId" });
Digital.belongsTo(Order, { foreignKey: "orderId" });

Order.hasMany(Offset, { as: "offset", foreignKey: "orderId" });
Offset.belongsTo(Order, { foreignKey: "orderId" });

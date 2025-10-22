import { DataTypes } from "sequelize";
import sequelize from "../dbconnection.js";

const MenuItem = sequelize.define("MenuItem", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  category: {
    type: DataTypes.ENUM("Main Dish", "Appetizer", "Drink", "Dessert", "Other"),
    allowNull: false,
    defaultValue: "Other",
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, // store filename or URL of the menu image
  },
  available: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

export default MenuItem;

// routes/menuRoute.js
import express from "express";
import multer from "multer";
import path from "path";
import {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} from "../Controllers/menuController.js"

const menuRouter = express.Router();

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/menu");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// Routes
menuRouter.post("/", upload.single("image"), createMenuItem);
menuRouter.get("/", getAllMenuItems);
menuRouter.get("/:id", getMenuItemById);
menuRouter.put("/:id", upload.single("image"), updateMenuItem);
menuRouter.delete("/:id", deleteMenuItem);

export default menuRouter;

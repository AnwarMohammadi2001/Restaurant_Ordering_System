// controllers/menuController.js
import MenuItem from "../Models/menuItems.js";

// ✅ Create a new menu item
export const createMenuItem = async (req, res) => {
  try {
    const { name, category, description, price, available } = req.body;
    let image = null;

    if (req.file) {
      image = req.file.filename;
    }

    const menuItem = await MenuItem.create({
      name,
      category,
      description,
      price,
      image,
      available,
    });

    res
      .status(201)
      .json({ message: "Menu item created successfully", menuItem });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ message: "Server error while creating menu item" });
  }
};

// ✅ Get all menu items
export const getAllMenuItems = async (req, res) => {
  try {
    const items = await MenuItem.findAll({ order: [["id", "DESC"]] });
    res.json(items);
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({ message: "Server error while fetching menu items" });
  }
};

// ✅ Get a single menu item by ID
export const getMenuItemById = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.json(menuItem);
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({ message: "Server error while fetching menu item" });
  }
};

// ✅ Update menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, price, available } = req.body;

    const menuItem = await MenuItem.findByPk(id);
    if (!menuItem)
      return res.status(404).json({ message: "Menu item not found" });

    // Update image if uploaded
    let image = menuItem.image;
    if (req.file) image = req.file.filename;

    await menuItem.update({
      name,
      category,
      description,
      price,
      available,
      image,
    });

    res.json({ message: "Menu item updated successfully", menuItem });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ message: "Server error while updating menu item" });
  }
};

// ✅ Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const { id } = req.params;
    const menuItem = await MenuItem.findByPk(id);

    if (!menuItem) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    await menuItem.destroy();
    res.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({ message: "Server error while deleting menu item" });
  }
};

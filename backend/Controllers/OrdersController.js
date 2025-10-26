import { Order, OrderItem } from "../Models/associations.js";

export const createOrder = async (req, res) => {
  try {
    const { customerName, orders } = req.body;

    // 1️⃣ Create the main order with total = 0
    const order = await Order.create({ customerName });

    // 2️⃣ Prepare the order items
    const itemsData = orders.map((item) => ({
      orderId: order.id,
      category: item.category,
      menuItemId: item.menuItemId,
      menuItem: item.menuItem,
      amount: item.amount,
      price: item.price,
      note: item.note,
    }));

    // 3️⃣ Bulk create items
    await OrderItem.bulkCreate(itemsData);

    // 4️⃣ Calculate total
    const total = itemsData.reduce(
      (sum, item) => sum + parseFloat(item.price) * parseInt(item.amount),
      0
    );

    // 5️⃣ Update the order with total
    await order.update({ total });

    // 6️⃣ Fetch the order with items
    const result = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    res.status(201).json(result); // total is now stored in DB and included
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem, as: "items" }],
      order: [["createdAt", "DESC"]],
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderItem, as: "items" }],
    });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

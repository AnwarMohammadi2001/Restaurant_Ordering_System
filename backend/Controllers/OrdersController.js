import { Order, OrderItem } from "../Models/associations.js";
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params; // Order ID from URL
    const { recip, orders } = req.body; // recip and optional new items

    // 1️⃣ Find existing order
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Update order items if new ones are provided
    if (orders && Array.isArray(orders)) {
      // Delete old items
      await OrderItem.destroy({ where: { orderId: id } });

      // Recreate new items
      const itemsData = orders.map((item) => ({
        orderId: id,
        category: item.category,
        menuItemId: item.menuItemId,
        menuItem: item.menuItem,
        amount: item.amount,
        price: item.price,
        note: item.note,
      }));

      await OrderItem.bulkCreate(itemsData);
    }

    // 3️⃣ Fetch updated items
    const updatedItems = await OrderItem.findAll({ where: { orderId: id } });

    // 4️⃣ Recalculate total and remained
    const total = updatedItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.amount),
      0
    );

    const updatedRecip = recip !== undefined ? recip : order.recip;
    const remained = total - updatedRecip;

    // 5️⃣ Update the main order
    await order.update({ total, recip: updatedRecip, remained });

    // 6️⃣ Return full updated order with items
    const updatedOrder = await Order.findByPk(id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    res.status(200).json({
      message: "Order updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error("Error updating order:", err);
    res
      .status(500)
      .json({ message: "Failed to update order", error: err.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { customerName, orders } = req.body;

    // 1️⃣ Create the main order with total = 0, recip = 0, remained = 0
    const order = await Order.create({
      customerName,
      total: 0,
      recip: 0,
      remained: 0,
    });

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

    // 5️⃣ Calculate remained (total - recip)
    const recip = 0; // default received amount
    const remained = total - recip;

    // 6️⃣ Update the order with total, recip, and remained
    await order.update({ total, recip, remained });

    // 7️⃣ Fetch the order with items
    const result = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, as: "items" }],
    });

    res.status(201).json(result);
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

export const updateOrderPayment = async (req, res) => {
  try {
    // Extract id and body values
    const { id } = req.params;
    const { recip, total } = req.body;

    // Log received data
    console.log("🧾 Payment update called:");
    console.log("➡️ Order ID:", id);
    console.log("➡️ New Recip Value:", recip);
    console.log("➡️ Provided Total:", total);

    // Find the order by ID
    const order = await Order.findByPk(id);
    if (!order) {
      console.log("❌ Order not found for ID:", id);
      return res.status(404).json({ message: "Order not found" });
    }

    // Calculate remained automatically
    const remained = (total ?? order.total) - (recip ?? order.recip);
    console.log("🧮 Calculated Remained:", remained);

    // Update the order
    await order.update({
      total: total ?? order.total,
      recip: recip ?? order.recip,
      remained,
    });

    console.log("✅ Order updated successfully!");
    res.status(200).json({ message: "Order updated successfully", order });
  } catch (err) {
    console.error("🔥 Error updating order payment:", err);
    res.status(500).json({
      message: "Failed to update order",
      error: err.message,
    });
  }
};

export const updateOrderDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isDelivered } = req.body;

    // Basic validation
    if (typeof isDelivered !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Invalid value for isDelivered. It must be true or false.",
      });
    }

    // Find the order
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    // Update the delivery status
    order.isDelivered = isDelivered;
    await order.save();

    res.status(200).json({
      success: true,
      message: `Order marked as ${
        isDelivered ? "delivered" : "not delivered"
      }.`,
      data: order,
    });
  } catch (error) {
    console.error("Error updating order delivery status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order delivery status.",
      error: error.message,
    });
  }
};
export const markOrderAsPaid = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the order
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Calculate the new values
    const total = parseFloat(order.total) || 0;

    // Update recip and remained
    await order.update({
      recip: total,
      remained: 0,
      // Optionally also mark as delivered:
      // isDelivered: true
    });

    res.status(200).json({
      message: "Order marked as fully paid successfully",
      order,
    });
  } catch (error) {
    console.error("Error in markOrderAsPaid:", error);
    res.status(500).json({
      message: "Failed to mark order as fully paid",
      error: error.message,
    });
  }
};
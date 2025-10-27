import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ✅ Helper function for showing Swal messages
const showAlert = (title, text, icon = "success") => {
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "تایید",
    timer: icon === "success" ? 1500 : null,
  });
};

// ✅ Get all orders with pagination
export const getOrders = async (page = 1, limit = 20) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/orders?page=${page}&limit=${limit}`
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    showAlert("خطا", "بارگذاری بیل‌ها موفقیت‌آمیز نبود", "error");
    throw error;
  }
};

// ✅ Get a single order by ID
export const getOrderById = async (id) => {
  try {
    const res = await axios.get(`${BASE_URL}/orders/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    showAlert("خطا", "بیل موردنظر یافت نشد", "error");
    throw error;
  }
};

// ✅ Create a new order
export const createOrder = async (orderData) => {
  try {
    if (!orderData.customerName || orderData.customerName.trim() === "") {
      showAlert("خطا", "نام مشتری نمی‌تواند خالی باشد", "error");
      return;
    }
    console.log(orderData);

    const res = await axios.post(`${BASE_URL}/orders`, orderData);
    showAlert("موفق", "بیل با موفقیت ثبت شد ✅", "success");
    return res.data;
  } catch (error) {
    console.error(error);
    showAlert("خطا", "خطا در ثبت بیل 😢", "error");
    throw error;
  }
};

// ✅ Update an existing order
export const updateOrder = async (id, orderData) => {
  try {
    const res = await axios.put(`${BASE_URL}/orders/${id}`, orderData);
    showAlert("موفق", "بیل با موفقیت ویرایش شد ✏️", "success");
    return res.data;
  } catch (error) {
    console.error(error);
    showAlert("خطا", "خطا در ویرایش بیل 😢", "error");
    throw error;
  }
};

// ✅ Delete an order
export const deleteOrder = async (id) => {
  try {
    await axios.delete(`${BASE_URL}/orders/${id}`);
    showAlert("حذف شد", "بیل با موفقیت حذف شد 🗑️", "success");
  } catch (error) {
    console.error(error);
    showAlert("خطا", "خطا در حذف بیل 😢", "error");
    throw error;
  }
};

export const toggleDelivery = async (orderId, currentStatus) => {
  try {
    // Send PATCH request to toggle the boolean
    const res = await axios.patch(`${BASE_URL}/orders/${orderId}`, {
      isDelivered: !currentStatus,
    });

    Swal.fire("موفق", `وضعیت تحویل تغییر کرد ✅`, "success");
    return res.data;
    // Optionally, refresh your order list or update state
    getOrders(); // if you have a fetch function
  } catch (error) {
    console.error(error);
    Swal.fire("خطا", "تغییر وضعیت تحویل انجام نشد 😢", "error");
  }
};
export const payRemaining = async (order) => {
  try {
    console.log(order);
    
    const payload = {
      recip: order.recip + order.remained, // add remaining to received
      total: order.total, // optional: keep total consistent
    };

    const response = await axios.patch(
      `${BASE_URL}/orders/pay/${order.id}`,
      payload
    );
    return response.data; // return updated order
  } catch (err) {
    console.error("❌ Error paying remaining:", err);
    throw err;
  }
};
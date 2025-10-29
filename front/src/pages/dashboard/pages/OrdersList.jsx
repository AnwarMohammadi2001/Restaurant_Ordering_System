import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

import BillSummary from "./BillSummary.jsx";
import PrintOrderBill from "./PrintOrderBill.jsx";
import {

  FaCheck,
  FaUndo,
} from "react-icons/fa";
import { ImCross } from "react-icons/im";
import Pagination from "../pagination/Pagination.jsx";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  toggleDelivery,
  payRemaining,
} from "../services/ServiceManager.js";
import {
  FaUser,
  FaPhone,
  FaMoneyBillWave,
  FaFileInvoice,
  FaSave,
  FaEye,
  FaPrint,
  FaLayerGroup,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import SearchBar from "../searching/SearchBar.jsx";
const OrdersList = () => {
  const [record, setRecord] = useState({
    customer: { name: "", phone_number: "" },
    digital: [],
    offset: [],
    total_money_digital: 0,
    total_money_offset: 0,
    total: 0,
    recip: 0,
    remained: 0,
  });
  const searchRef = useRef();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orders, setOrders] = useState([]);
  const [searchResult, setSearchResult] = useState([]);
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeSection, setActiveSection] = useState("digital");
  const [editMode, setEditMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  const fetchOrders = async (page = 1) => {
    const data = await getOrders(page, 20);
    setOrders(data.orders);
    setCurrentPage(data.currentPage);
    setTotalPages(data.totalPages);
  };

  const onPageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      fetchOrders(pageNumber);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage);
  }, []);

  useEffect(() => {
    if (!record) return;

    const totalDigital = (record.digital || []).reduce(
      (sum, d) => sum + Number(d.money || 0),
      0
    );
    const totalOffset = (record.offset || []).reduce(
      (sum, o) => sum + Number(o.money || 0),
      0
    );
    const total = totalDigital + totalOffset;

    setRecord((prev) => ({
      ...prev,
      total_money_digital: Number(totalDigital.toFixed(2)),
      total_money_offset: Number(totalOffset.toFixed(2)),
      total: Number(total.toFixed(2)),
      remained: Number((total - Number(prev.recip || 0)).toFixed(2)),
    }));
  }, [record?.digital, record?.offset, record?.recip]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    setRecord({
      ...record,
      customer: { ...record.customer, [name]: value },
    });
  };

  const handleRecipChange = (e) => {
    const value = Number(e.target.value || 0);
    setRecord({
      ...record,
      recip: value,
    });
  };

  const saveRecord = async () => {
    try {
      if (editMode) {
        // Update existing order
        await updateOrder(editingOrderId, record);
      } else {
        // Create new order
        await createOrder(record);
      }

      fetchOrders(currentPage);
      resetForm();
    } catch (err) {
      Swal.fire(
        "خطا",
        editMode ? "ویرایش بیل موفقیت‌آمیز نبود" : "ثبت بیل موفقیت‌آمیز نبود",
        "error"
      );
    }
  };

  const resetForm = () => {
    setRecord({
      customer: { name: "", phone_number: "" },
      digital: [],
      offset: [],
      total_money_digital: 0,
      total_money_offset: 0,
      total: 0,
      recip: 0,
      remained: 0,
    });
    setEditMode(false);
    setEditingOrderId(null);
    setActiveSection("digital");
  };

  const handleEditOrder = (order) => {
    // Transform the order data to match the record structure
    setRecord({
      customer: {
        name: order.customer?.name || order.name || "",
        phone_number: order.customer?.phone_number || order.phone_number || "",
      },
      digital: order.digital || [],
      offset: order.offset || [],
      total_money_digital: order.total_money_digital || 0,
      total_money_offset: order.total_money_offset || 0,
      total: order.total || 0,
      recip: order.recip || 0,
      remained: order.remained || 0,
    });
    setEditMode(true);
    setEditingOrderId(order.id);

    // Scroll to the top of the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleViewBill = (order) => {
    setSelectedOrder(order);
    setIsBillOpen(true);
  };

  const handleCloseBill = () => {
    setIsBillOpen(false);
    setSelectedOrder(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          مدیریت سفارشات
        </h1>
        <p className="text-gray-600">مدیریت سفارش‌های مشتریان و خدمات چاپی</p>
        {editMode && (
          <div className="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded-xl">
            <div className="flex items-center justify-center gap-2 text-yellow-800">
              <FaEdit className="text-lg" />
              <span className="font-semibold">
                حالت ویرایش - در حال ویرایش سفارش #{editingOrderId}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}

      <div className="bg-white rounded-lg shadow-lgborder border-gray-100">
        <div className="flex bg-gray-200 items-center justify-between gap-3 rounded-t-md  p-6 ">
          <div className="flex items-center gap-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <FaFileInvoice className="text-cyan-800 text-xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">لیست سفارشات</h2>
          </div>
          <div className="flex justify-center gap-2">
            <SearchBar ref={searchRef} onResults={setSearchResult} />
            <button
              onClick={() => searchRef.current?.reset()}
              className="flex items-center gap-2 text-gray-50 border border-cayn-800 cursor-pointer bg-cyan-800 rounded-lg px-2  transition-colors"
            >
              <FaUndo className="text-lg" />
              پاک کردن جستجو
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center  border border-gray-300">
            <thead className="bg-cyan-800 text-gray-50">
              <tr>
                <th className="border border-gray-100 px-4 py-2"> شماره بیل</th>
                <th className="border border-gray-300 px-4 py-2">نام مشتری</th>
                <th className="border border-gray-300 px-4 py-2">شماره تماس</th>
                <th className="border border-gray-300 px-4 py-2">مجموع</th>
                <th className="border border-gray-300 px-4 py-2">دریافتی</th>
                <th className="border border-gray-300 px-4 py-2">باقیمانده</th>
                <th className="border border-gray-300 px-4 py-2">تاریخ</th>
                <th className="border border-gray-300 px-4 py-2">تحویلی</th>
                <th className="border border-gray-300 px-4 py-2">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {(searchResult && searchResult.length > 0
                ? searchResult
                : orders
              ).map((order, index) => (
                <tr
                  key={order.id || index}
                  className={`hover:bg-gray-50 ${
                    order.isDelivered && order.remained === 0 && "bg-blue-100"
                  } `}
                >
                  <td className="border border-gray-300 px-4 py-2">
                    {order.id || "#"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.customer?.name || order.name}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {order.customer?.phone_number || order.phone_number}
                  </td>
                  <td className="border font-semibold border-gray-300 px-4 py-2">
                    {order.total}
                  </td>
                  <td className="border font-semibold text-green-600 border-gray-300 px-4 py-2">
                    {order.recip}
                  </td>
                  <td
                    className={`border font-semibold border-gray-300 px-4 py-2 ${
                      order.remained === 0 ? "text-black" : "text-red-500"
                    }`}
                  >
                    {order.remained}
                  </td>

                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(order.createdAt).toLocaleDateString("fa-AF")}
                  </td>
                  <td className="border border-gray-300  py-2 ">
                    <div className="flex justify-center gap-x-2 items-center">
                      {/* Toggle delivery */}
                      <button
                        onClick={async () => {
                          try {
                            const updated = await toggleDelivery(
                              order.id,
                              order.isDelivered
                            );

                            // Update main orders
                            setOrders((prev) =>
                              prev.map((o) => (o.id === order.id ? updated : o))
                            );

                            // Update search result if it exists
                            setSearchResult((prev) =>
                              prev?.length
                                ? prev.map((o) =>
                                    o.id === order.id ? updated : o
                                  )
                                : prev
                            );
                          } catch (err) {
                            console.error("Error toggling delivery:", err);
                          }
                        }}
                        className="p-2 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        <div className="w-full flex items-center gap-x-2 justify-center text-cyan-800">
                          {order.isDelivered ? <FaCheck /> : <ImCross />}
                        </div>
                      </button>

                      {/* Pay remaining */}
                      <button
                        onClick={async () => {
                          try {
                            const updated = await payRemaining(order);

                            // Update main orders
                            setOrders((prev) =>
                              prev.map((o) => (o.id === order.id ? updated : o))
                            );

                            // Update search result if it exists
                            setSearchResult((prev) =>
                              prev?.length
                                ? prev.map((o) =>
                                    o.id === order.id ? updated : o
                                  )
                                : prev
                            );
                          } catch (err) {
                            console.error("Error paying remaining:", err);
                          }
                        }}
                        className="px-3 py-1 bg-cyan-800 text-white rounded hover:bg-blue-600"
                      >
                        تصفیه باقیداری
                      </button>
                    </div>
                  </td>

                  <td className="border-b border-gray-300 flex items-center justify-center py-2">
                    <div className="flex  gap-x-2">
                      <button
                        onClick={() => handleViewBill(order)}
                        className="flex items-center justify-center h-8 w-8 cursor-pointer  border border-cyan-800  rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl "
                      >
                        <FaEye className="text-cyan-800" size={20} />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const updated = await handleEditOrder(order);
                            setOrders((prev) =>
                              prev.map((o) => (o.id === order.id ? updated : o))
                            );
                          } catch (err) {
                            console.error("Error editing order:", err);
                          }
                        }}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl w-full"
                      >
                        <FaEdit className="text-sm" />
                        ویرایش
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await deleteOrder(order.id);
                            setOrders((prev) =>
                              prev.filter((o) => o.id !== order.id)
                            );
                          } catch (err) {
                            console.error("Error deleting order:", err);
                          }
                        }}
                        className="flex items-center justify-center h-8 w-8 cursor-pointer  border border-cyan-800  rounded-md font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl "
                      >
                        <FaTimes className="text-red-600" size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {(!orders || orders.length === 0) &&
                (!searchResult || searchResult.length === 0) && (
                  <tr>
                    <td colSpan="9" className="text-gray-500 py-4">
                      هیچ سفارشی وجود ندارد
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      </div>

      {/* Print Bill Modal */}
      {isBillOpen && (
        <PrintOrderBill
          isOpen={isBillOpen}
          onClose={handleCloseBill}
          order={selectedOrder}
        />
      )}
    </div>
  );
};

export default OrdersList;

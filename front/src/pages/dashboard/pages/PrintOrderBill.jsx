import React, { useEffect } from "react";
import moment from "moment-jalaali";
import { FaPhone, FaPrint, FaTimes } from "react-icons/fa";

const PrintOrderBill = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;


  const formatCurrency = (num) => {
    const number = Number(num || 0);
    return number.toLocaleString("fa-AF") + " افغانی";
  };

  const handlePrint = () => {
    window.print();
  };

  const today = moment(order.createdAt).format("jYYYY/jMM/jDD");
  const billNumber = order.id
    ? `ORD-${order.id}`
    : `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 print:bg-transparent print:p-0">
      <div>
        <div
          id="printable-area"
          className="bg-white shadow-2xl rounded-lg overflow-hidden flex flex-col print:shadow-none print:rounded-none"
          style={{
            width: "148mm",
            height: "210mm",
            direction: "rtl",
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-l from-amber-800 to-amber-600 text-white p-4 text-center border-b-4 border-amber-900">
            <h1 className="text-xl font-bold mb-1">رستورانت کابل</h1>
            <p className="text-sm opacity-90">Kabul Restaurant</p>
            <div className="flex justify-between items-center mt-2 text-xs">
              <span>شماره فاکتور: {billNumber}</span>
              <span>تاریخ: {today}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-3 border-b border-gray-200">
            <h2 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1 border-gray-300">
              معلومات مشتری
            </h2>
            <div className="text-xs">
              <span className="font-semibold">نام:</span>{" "}
              {order.customerName || "—"}
            </div>
          </div>

          {/* Items Table */}
          <div className="flex-1 p-3 overflow-auto">
            {order.items?.length > 0 ? (
              <div>
                <h3 className="text-sm font-bold text-amber-700 mb-2 bg-amber-50 p-2 rounded border-r-4 border-amber-500">
                  جزئیات سفارش
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 p-1 text-center w-6">
                          #
                        </th>
                        <th className="border border-gray-300 p-1 text-center">
                          دسته‌بندی
                        </th>
                        <th className="border border-gray-300 p-1 text-center">
                          نام غذا
                        </th>
                        <th className="border border-gray-300 p-1 text-center w-12">
                          تعداد
                        </th>
                        <th className="border border-gray-300 p-1 text-center w-20">
                          قیمت
                        </th>
                        <th className="border border-gray-300 p-1 text-center w-20">
                          مجموع
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="border border-gray-300 p-1 text-center">
                            {i + 1}
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            {item.category}
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            {item.menuItem}
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            {item.amount}
                          </td>
                          <td className="border border-gray-300 p-1 text-center">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="border border-gray-300 p-1 text-center font-semibold">
                            {formatCurrency(item.price * item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
                هیچ سفارشی ثبت نشده است
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="border-t border-gray-300 bg-gray-50 p-3">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>مجموع کل:</span>
                <span className="font-bold text-amber-700">
                  {formatCurrency(order.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>مقدار پرداختی:</span>
                <span className="text-green-600">
                  {formatCurrency(order.recip)}
                </span>
              </div>
              <div className="flex justify-between font-bold border-t border-gray-300 pt-1">
                <span
                  className={
                    order.remained > 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  باقیمانده:
                </span>
                <span
                  className={
                    order.remained > 0 ? "text-red-600" : "text-green-600"
                  }
                >
                  {formatCurrency(order.remained)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-800 text-white p-3 text-center text-xs">
            <div className="flex items-center justify-center gap-2 mb-1">
              <FaPhone className="text-amber-300" />
              <span>تماس: ۰۷۹۳ـــ۰۰۰۰۰۰</span>
            </div>
            <p className="text-amber-200">
              از انتخاب رستورانت کابل سپاس‌گزاریم!
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {(
        <div className="absolute bottom-6 left-6 flex gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          >
            <FaTimes size={14} /> بستن
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-2 shadow-lg transition-colors"
          >
            <FaPrint size={14} /> چاپ فاکتور
          </button>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #printable-area,
          #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 148mm !important;
            height: 210mm !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrintOrderBill;

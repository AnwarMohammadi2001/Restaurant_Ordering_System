import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaMoneyBillWave,
  FaTruck,
  FaClock,
  FaCheckCircle,
  FaChartLine,
  FaCalendarAlt,
  FaSync,
  FaBoxOpen,
  FaWallet,
  FaExclamationTriangle,
  FaDownload,
  FaFilter,
  FaFileExcel,
  FaFilePdf,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const DashboardHome = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [reportType, setReportType] = useState("all"); // all, delivered, pending

  const fetchReportData = async (start = null, end = null, type = "all") => {
    try {
      setLoading(true);
      const params = {};
      if (start) params.startDate = start.toISOString().split("T")[0];
      if (end) params.endDate = end.toISOString().split("T")[0];
      if (type !== "all") params.type = type;

      const response = await axios.get(`${BASE_URL}/report`, { params });
      setReportData(response.data.data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError("خطا در دریافت اطلاعات");
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const handleFilter = () => {
    fetchReportData(startDate, endDate, reportType);
  };

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
    setReportType("all");
    fetchReportData();
  };

  const downloadReport = async (format) => {
    try {
      const params = {
        format,
        download: true,
      };
      if (startDate) params.startDate = startDate.toISOString().split("T")[0];
      if (endDate) params.endDate = endDate.toISOString().split("T")[0];
      if (reportType !== "all") params.type = reportType;

      const response = await axios.get(`${BASE_URL}/report`, {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `report-${timestamp}.${format}`;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading report:", err);
      alert("خطا در دانلود گزارش");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-AF").format(amount) + " افغانی";
  };

  const formatNumber = (number) => {
    return new Intl.NumberFormat("fa-AF").format(number);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">در حال دریافت اطلاعات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => fetchReportData()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
          >
            <FaSync />
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  const {
    totalIncome,
    totalRemainedMoney,
    deliveredOrdersCount,
    notDeliveredOrdersCount,
    totalReceivedMoney,
    totalPendingMoney,
    totalOrdersCount,
    timeRange,
  } = reportData;

  const deliveryRate =
    totalOrdersCount > 0 ? (deliveredOrdersCount / totalOrdersCount) * 100 : 0;

  const statsCards = [
    {
      title: "مجموع پول همه سفارشات",
      value: formatCurrency(totalIncome),
      icon: FaMoneyBillWave,
      color: "bg-cyan-800",
      description: "کل پول از سفارشات",
    },
    {
      title: "مجموع پول دریافتی",
      value: formatCurrency(totalReceivedMoney),
      icon: FaWallet,
      color: "bg-emerald-600",
      description: "کل مبالغ دریافت شده",
    },
    {
      title: "مجموع پول باقیمانده",
      value: formatCurrency(totalPendingMoney),
      icon: FaMoneyBillWave,
      color: "bg-cyan-800",
      description: "کل مبلغ باقیمانده از سفارشات",
    },
    {
      title: "تعداد کل سفارشات",
      value: formatNumber(totalOrdersCount),
      icon: FaBoxOpen,
      color: "bg-purple-600",
      description: "تعداد کل سفارشات",
    },
    {
      title: "وضعیت سفارشات",
      value: `${formatNumber(deliveredOrdersCount + notDeliveredOrdersCount)} `,
      icon: FaBoxOpen,
      color: "bg-gradient-to-r from-blue-600 to-purple-600",
      description: "تحویل شده / در انتظار",
      isCombined: true,
      delivered: deliveredOrdersCount,
      pending: notDeliveredOrdersCount,
    },

    {
      title: "درصد تحویل",
      value: `${deliveryRate.toFixed(1)}%`,
      icon: FaChartLine,
      color: "bg-cyan-600",
      description: "نرخ تحویل سفارشات",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              داشبورد مدیریت
            </h1>
            <p className="text-gray-600">
              خلاصه وضعیت سفارشات و مالی  رستورانت
            </p>
          </div>

          <div className="flex items-center gap-4">
            {lastUpdated && (
              <div className="text-sm text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200">
                آخرین بروزرسانی: {lastUpdated.toLocaleTimeString("fa-AF")}
              </div>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200"
            >
              <FaFilter />
              فیلترها
            </button>
            <button
              onClick={() => fetchReportData()}
              className="flex items-center gap-2 bg-white text-cyan-600 hover:bg-cyan-50 border border-cyan-200 px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:shadow-lg"
            >
              <FaSync className={`${loading ? "animate-spin" : ""}`} />
              بروزرسانی
            </button>
          </div>
        </div>

        {/* Filter Section */}
        {showFilters && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  از تاریخ
                </label>
                <DatePicker
                  selected={startDate}
                  onChange={setStartDate}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholderText="انتخاب تاریخ شروع"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تا تاریخ
                </label>
                <DatePicker
                  selected={endDate}
                  onChange={setEndDate}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  placeholderText="انتخاب تاریخ پایان"
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع گزارش
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                  <option value="all">همه سفارشات</option>
                  <option value="delivered">فقط تحویل شده</option>
                  <option value="pending">فقط در انتظار</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  onClick={handleFilter}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  اعمال فیلتر
                </button>
                <button
                  onClick={handleResetFilter}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  بازنشانی
                </button>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => downloadReport("pdf")}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <FaFilePdf />
                دانلود PDF
              </button>
              <button
                onClick={() => downloadReport("excel")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <FaFileExcel />
                دانلود Excel
              </button>
            </div>
          </div>
        )}

        {/* Time Range Info */}
        {timeRange.hasTimeRange && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 inline-flex items-center gap-2">
            <FaCalendarAlt className="text-blue-500" />
            <span className="text-blue-700 font-medium">
              {timeRange.startDate && timeRange.endDate
                ? `داده‌ها از ${new Date(
                    timeRange.startDate
                  ).toLocaleDateString("fa-AF")} تا ${new Date(
                    timeRange.endDate
                  ).toLocaleDateString("fa-AF")}`
                : "کل داده‌های تاریخی"}
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden"
          >
            <div className={`${card.color} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <card.icon className="text-2xl opacity-90" />
                <span className="text-sm font-semibold">{card.title}</span>
              </div>
            </div>
            <div className="p-6">
              {card.isCombined ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <FaCheckCircle className="text-green-600 text-xl mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-700">
                        {formatNumber(card.delivered)}
                      </div>
                      <div className="text-green-600 text-xs">تحویل شده</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <FaClock className="text-orange-600 text-xl mx-auto mb-1" />
                      <div className="text-lg font-bold text-orange-700">
                        {formatNumber(card.pending)}
                      </div>
                      <div className="text-orange-600 text-xs">در انتظار</div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    {card.value}
                  </div>
                  <p className="text-gray-600 text-sm">{card.description}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Financial Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-cyan-800 rounded-xl">
              <FaMoneyBillWave className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">خلاصه مالی</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">مجموع دریافتی:</span>
              <span className="font-bold text-green-600 text-lg">
                {formatCurrency(totalReceivedMoney)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">مجموع باقیمانده:</span>
              <span className="font-bold text-blue-600 text-lg">
                {formatCurrency(totalRemainedMoney)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">مانده در انتظار:</span>
              <span className="font-bold text-orange-600 text-lg">
                {formatCurrency(totalPendingMoney)}
              </span>
            </div>

            <div className="flex justify-between items-center py-3 bg-cyan-50 rounded-lg px-4">
              <span className="text-gray-800 font-semibold">مجموع کل:</span>
              <span className="font-bold text-cyan-800 text-lg">
                {formatCurrency(totalRemainedMoney + totalReceivedMoney)}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
              <FaTruck className="text-white text-xl" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">وضعیت تحویل</h2>
          </div>

          <div className="space-y-6">
            {/* Delivery Progress */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>نرخ تحویل</span>
                <span>{deliveryRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${deliveryRate}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                <FaCheckCircle className="text-green-600 text-2xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">
                  {formatNumber(deliveredOrdersCount)}
                </div>
                <div className="text-green-600 text-sm">تحویل شده</div>
              </div>

              <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                <FaClock className="text-orange-600 text-2xl mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">
                  {formatNumber(notDeliveredOrdersCount)}
                </div>
                <div className="text-orange-600 text-sm">در انتظار</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;

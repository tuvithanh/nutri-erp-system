import { useEffect, useState } from "react";
import MainLayout from "../components/MainLayout";
import axiosClient from "../api/axiosClient";

export default function StockAuditPage() {
  const [audits, setAudits] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  // Form State Tạo Phiếu Kiểm
  const [auditNote, setAuditNote] = useState("");
  const [auditItems, setAuditItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ type: "", msg: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [auditRes, invRes] = await Promise.all([
        axiosClient.get("/stock-audits"),
        axiosClient.get("/inventory"),
      ]);
      setAudits(auditRes.data);
      setInventoryList(invRes.data);
    } catch (err) {
      setNotification({ type: "error", msg: "Không thể nạp dữ liệu kiểm kê" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Mở Modal Kiểm Kê & Chuẩn bị danh sách lô để đếm
  const handleOpenCreateModal = () => {
    const initialItems = inventoryList.map((inv) => ({
      inventoryId: inv._id,
      productName: inv.product?.name || "N/A",
      sku: inv.product?.sku || "N/A",
      lotNumber: inv.lotNumber,
      expDate: inv.expDate,
      systemQty: inv.quantity,
      actualQty: inv.quantity, // Mặc định bằng số lượng hệ thống
      diffQty: 0,
      reason: "",
    }));
    setAuditItems(initialItems);
    setAuditNote("");
    setShowCreateModal(true);
  };

  // Thay đổi số lượng đếm thực tế
  const handleActualQtyChange = (index, value) => {
    const updated = [...auditItems];
    const actual = Math.max(0, Number(value) || 0);
    updated[index].actualQty = actual;
    updated[index].diffQty = actual - updated[index].systemQty;
    setAuditItems(updated);
  };

  // Thay đổi lý do chênh lệch
  const handleReasonChange = (index, value) => {
    const updated = [...auditItems];
    updated[index].reason = value;
    setAuditItems(updated);
  };

  // Submit Lưu Phiếu Kiểm Kê
  const handleSubmitAudit = async (e) => {
    e.preventDefault();
    try {
      // Chỉ gửi những dòng có kiểm kê
      const res = await axiosClient.post("/stock-audits", {
        note: auditNote,
        items: auditItems,
      });

      setNotification({ type: "success", msg: res.data.message });
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi tạo phiếu kiểm kê");
    }
  };

  // Lọc tìm kiếm lô hàng trong Modal Đếm
  const filteredAuditItems = auditItems.filter(
    (item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Kiểm Kê & Điều Chỉnh Tồn Kho
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Đối soát hàng tồn kho thực tế, xử lý chênh lệch hao hụt / hết hạn và
            cân bằng CSDL.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-all"
        >
          + Tạo Phiếu Kiểm Kê Kho Mới
        </button>
      </div>

      {notification.msg && (
        <div
          className={`mb-6 p-3.5 rounded-xl text-sm flex justify-between items-center ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          <span>{notification.msg}</span>
          <button
            onClick={() => setNotification({ type: "", msg: "" })}
            className="font-bold"
          >
            &times;
          </button>
        </div>
      )}

      {/* DANH SÁCH PHIẾU KIỂM KÊ ĐÃ TẠO */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-xs text-slate-400 uppercase border-b">
            <tr>
              <th className="py-3.5 px-4">Mã Phiếu Kiểm</th>
              <th className="py-3.5 px-4">Ngày Thực Hiện</th>
              <th className="py-3.5 px-4">Người Kiểm Kê</th>
              <th className="py-3.5 px-4">Tổng Số Lô Đã Kiểm</th>
              <th className="py-3.5 px-4">Ghi Chú</th>
              <th className="py-3.5 px-4 text-right">Chi Tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Đang tải danh sách phiếu kiểm kê...
                </td>
              </tr>
            ) : audits.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  Chưa có đợt kiểm kê nào
                </td>
              </tr>
            ) : (
              audits.map((a) => (
                <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    {a.auditCode}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {new Date(a.createdAt).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {a.auditedBy?.fullName || "Thủ kho"}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                    {a.items?.length || 0} Lô
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-500">
                    {a.note || "---"}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedAudit(a)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-300"
                    >
                      Đối Soát
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: TẠO PHIẾU KIỂM KÊ & ĐẾM THỰC TẾ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl my-8">
            <div className="flex justify-between items-center pb-3 border-b mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Lập Phiếu Kiểm Kê Kho Real-time
                </h3>
                <p className="text-xs text-slate-500">
                  Nhập số lượng đếm thực tế tại kho để cân bằng lại dữ liệu tồn
                  kho.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAudit} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-end">
                <div className="w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="Tìm theo Mã SKU, Tên SP, Lô..."
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="w-full sm:w-96">
                  <input
                    type="text"
                    placeholder="Ghi chú đợt kiểm kê (Ví dụ: Kiểm kê định kỳ tháng 11)..."
                    className="w-full px-3 py-1.5 border rounded-lg text-xs"
                    value={auditNote}
                    onChange={(e) => setAuditNote(e.target.value)}
                  />
                </div>
              </div>

              {/* BẢNG ĐẾM SỐ LƯỢNG */}
              <div className="max-h-96 overflow-y-auto border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-bold sticky top-0 border-b">
                    <tr>
                      <th className="py-2.5 px-3">Mã SKU / Tên SP</th>
                      <th className="py-2.5 px-3">Số Lô (LOT)</th>
                      <th className="py-2.5 px-3 text-right">
                        Tồn Máy (Hệ thống)
                      </th>
                      <th className="py-2.5 px-3 text-right w-32">Thực Đếm</th>
                      <th className="py-2.5 px-3 text-right">Chênh Lệch</th>
                      <th className="py-2.5 px-3 w-48">Lý Do Chênh Lệch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAuditItems.map((item, idx) => {
                      const realIndex = auditItems.findIndex(
                        (i) => i.inventoryId === item.inventoryId,
                      );

                      return (
                        <tr
                          key={item.inventoryId}
                          className="hover:bg-slate-50"
                        >
                          <td className="py-2 px-3">
                            <p className="font-bold text-slate-900">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-indigo-600 font-mono">
                              {item.sku}
                            </p>
                          </td>
                          <td className="py-2 px-3 font-mono font-medium">
                            {item.lotNumber}
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-slate-700">
                            {item.systemQty}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <input
                              type="number"
                              min="0"
                              className="w-24 px-2 py-1 border rounded text-right font-bold focus:ring-2 focus:ring-indigo-500"
                              value={item.actualQty}
                              onChange={(e) =>
                                handleActualQtyChange(realIndex, e.target.value)
                              }
                            />
                          </td>
                          <td className="py-2 px-3 text-right font-bold">
                            {item.diffQty === 0 ? (
                              <span className="text-slate-400">0</span>
                            ) : item.diffQty > 0 ? (
                              <span className="text-emerald-600">
                                +{item.diffQty}
                              </span>
                            ) : (
                              <span className="text-rose-600">
                                {item.diffQty}
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="Hỏng, Hết hạn, Mất..."
                              className="w-full px-2 py-1 border rounded text-xs"
                              value={item.reason}
                              onChange={(e) =>
                                handleReasonChange(realIndex, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow"
                >
                  Xác Nhận & Điều Chỉnh Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: XEM PHIẾU ĐỐI SOÁT KIỂM KÊ */}
      {selectedAudit && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border">
            <div className="flex justify-between items-start pb-3 border-b mb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  CHỨNG TỪ KHO
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  PHIẾU KIỂM KÊ: {selectedAudit.auditCode}
                </h3>
                <p className="text-xs text-slate-500">
                  Thời gian:{" "}
                  {new Date(selectedAudit.createdAt).toLocaleString("vi-VN")} |
                  Người lập: {selectedAudit.auditedBy?.fullName || "Thủ kho"}
                </p>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            {selectedAudit.note && (
              <div className="p-3 bg-slate-50 rounded-lg border text-xs mb-4">
                <span className="font-bold text-slate-700">Ghi chú: </span>
                <span className="text-slate-600 italic">
                  {selectedAudit.note}
                </span>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto border rounded-lg mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                  <tr>
                    <th className="py-2.5 px-3">Sản Phẩm</th>
                    <th className="py-2.5 px-3">Số Lô (LOT)</th>
                    <th className="py-2.5 px-3 text-right">Tồn Máy</th>
                    <th className="py-2.5 px-3 text-right">Thực Đếm</th>
                    <th className="py-2.5 px-3 text-right">Chênh Lệch</th>
                    <th className="py-2.5 px-3">Lý Do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAudit.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 px-3 font-bold text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-2 px-3 font-mono">{item.lotNumber}</td>
                      <td className="py-2 px-3 text-right">{item.systemQty}</td>
                      <td className="py-2 px-3 text-right font-bold">
                        {item.actualQty}
                      </td>
                      <td className="py-2 px-3 text-right font-bold">
                        {item.diffQty === 0 ? (
                          <span className="text-slate-400">0</span>
                        ) : item.diffQty > 0 ? (
                          <span className="text-emerald-600">
                            +{item.diffQty}
                          </span>
                        ) : (
                          <span className="text-rose-600">{item.diffQty}</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-slate-500">
                        {item.reason || "---"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end border-t pt-3">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

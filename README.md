# 🌿 NutriERP — Hệ Thống Hoạch Định Nguồn Lực Doanh Nghiệp Ngành Thực Phẩm Bổ Sung

**NutriERP** là hệ thống quản trị doanh nghiệp (ERP) toàn diện được thiết kế chuyên biệt cho các doanh nghiệp phân phối và kinh doanh thực phẩm chức năng, dinh dưỡng thể thao và dược phẩm. Hệ thống giải quyết triệt để bài toán quản lý hạn sử dụng theo lô bằng thuật toán xuất kho **FEFO (First-Expired, First-Out)** kết hợp với giao dịch nguyên tử **MongoDB Transactions** và phân quyền chặt chẽ **RBAC**.

---

## 🚀 Tính Năng Cốt Lõi

### 1. Quản Lý Kho Vận & Thuật Toán FEFO

- **Quản lý theo lô & Hạn sử dụng (Lot & Expiry Tracking):** Theo dõi chi tiết từng lô hàng nhập kho (`lotNumber`, `expDate`, giá nhập, số lượng tồn).
- **Xuất kho thông minh FEFO:** Tự động ưu tiên xuất kho các lô hàng có hạn sử dụng gần nhất trước khi xuất các lô có hạn xa hơn, giảm thiểu tối đa rủi ro hàng cận date/hết hạn.
- **Nhập kho đa dòng & Import Excel:** Hỗ trợ lập phiếu nhập nhiều mặt hàng/lô hàng cùng lúc hoặc nhập dữ liệu hàng loạt từ file Excel (`.xlsx`).
- **Kiểm kê & Điều chỉnh tồn kho:** Đối soát tồn kho thực tế, ghi nhận chênh lệch hao hụt/hết hạn và tự động cân bằng cơ sở dữ liệu.
- **Cảnh báo tự động:** Cron job quét định kỳ các lô hàng sắp hết hạn hoặc dưới định mức tồn kho tối thiểu.

### 2. Quản Lý Kinh Doanh & Khách Hàng (Sales & CRM)

- **Xử lý đơn hàng nguyên tử (Atomic Orders):** Tạo đơn bán hàng tự động trừ tồn kho theo thuật toán FEFO trong một phiên giao dịch (`mongoose.startSession()`), đảm bảo toàn vẹn dữ liệu 100%.
- **Hủy đơn hoàn kho tự động:** Khi hủy đơn hàng, hệ thống tự động hoàn trả chính xác số lượng về đúng các lô hàng đã xuất trước đó.
- **Quản lý Khách hàng & Nhà cung cấp:** Lưu trữ lịch sử giao dịch, công nợ, thông tin liên hệ và hỗ trợ thêm nhanh (Quick-add) ngay trong lúc lập phiếu.

### 3. Quản Trị Nhân Sự & Bảo Mật Hệ Thống (HRM & Security)

- **Phân quyền đa vai trò (RBAC):** Phân tách rõ ràng quyền hạn giữa các vai trò: `admin`, `warehouse` (Kho), `sales` (Kinh doanh), `hr` (Nhân sự).
- **Quản lý nhân sự & Nghỉ phép:** Cấp phát tài khoản nhân viên, gửi đơn xin nghỉ phép và phê duyệt trực tuyến.
- **Nhật ký hệ thống (Audit Logs):** Truy vết toàn bộ thao tác nhạy cảm (nhập kho, xuất bán, điều chỉnh kiểm kê, thay đổi trạng thái đơn hàng) kèm thông tin người thực hiện và thời gian.

### 4. Báo Cáo & Thống Kê Trực Quan

- **Dashboard tổng quan:** Theo dõi doanh thu, giá trị tồn kho, cảnh báo lô cận date và hiệu suất kinh doanh theo thời gian thực.
- **API Documentation:** Tích hợp sẵn **Swagger UI** tại `/api-docs` phục vụ tra cứu và kiểm thử API.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

| Phân hệ                 | Công nghệ & Thư viện                                                                       |
| :---------------------- | :----------------------------------------------------------------------------------------- |
| **Frontend**            | React 19, Vite 8, Tailwind CSS v4, React Router DOM, Axios, Lucide React, SheetJS (`xlsx`) |
| **Backend**             | Node.js, Express.js (CommonJS), Mongoose ODM, Zod Validation, Node-Cron                    |
| **Database**            | MongoDB (Replica Set hỗ trợ Multi-Document ACID Transactions)                              |
| **Bảo mật**             | JWT (Access Token & Refresh Token qua HTTP-Only Cookie), Bcryptjs, CORS                    |
| **Tài liệu & Kiểm thử** | Swagger UI (`swagger-ui-express`), End-to-End Integration Test Script (`test-e2e.js`)      |

---

## 📂 Cấu Trúc Thư Mục Dự Án

    nutri-erp-system/
    ├── client/                     # Ứng dụng Frontend (React + Vite + Tailwind v4)
    │   ├── public/                 # Tài nguyên tĩnh (Favicon, Icons)
    │   ├── src/
    │   │   ├── api/                # Cấu hình Axios & Interceptors tự động Refresh Token
    │   │   ├── assets/             # Hình ảnh, SVG logo hệ thống
    │   │   ├── components/         # Các UI Component dùng chung (Modals, Tables, Badges)
    │   │   ├── context/            # AuthContext quản lý phiên đăng nhập & phân quyền
    │   │   ├── features/           # Kiến trúc Feature-based (Auth, Dashboard, Inventory, Orders, HRM, Reports)
    │   │   ├── layouts/            # MainLayout (Sidebar, Header, Navigation)
    │   │   ├── routes/             # Định tuyến tập trung & ProtectedRoute theo Role
    │   │   └── utils/              # Các hàm tiện ích định dạng tiền tệ, ngày tháng, xuất Excel
    │   └── vite.config.js          # Cấu hình Vite & Path Alias (@/)
    │
    ├── server/                     # Ứng dụng Backend (Node.js + Express)
    │   ├── config/                 # Kết nối MongoDB & cấu hình Swagger
    │   ├── controllers/            # Xử lý request/response cho từng phân hệ
    │   ├── jobs/                   # Tác vụ chạy ngầm định kỳ (Cron jobs cảnh báo date)
    │   ├── middlewares/            # Xác thực JWT, phân quyền RBAC, validate Zod, bắt lỗi tập trung
    │   ├── models/                 # Mongoose Schemas (User, Product, InventoryBatch, Order, AuditLog...)
    │   ├── routes/                 # Định nghĩa RESTful API Endpoints
    │   ├── services/               # Tầng nghiệp vụ cốt lõi (FEFO Allocation, Transactions)
    │   ├── validations/            # Schema kiểm tra dữ liệu đầu vào bằng Zod
    │   ├── app.js                  # Khởi tạo Express App & Middlewares
    │   ├── server.js               # Entry point khởi chạy server
    │   └── test-e2e.js             # Kịch bản kiểm thử tự động tích hợp toàn luồng
    │
    ├── .gitignore                  # Cấu hình loại trừ file nhạy cảm & build artifacts
    └── README.md                   # Tài liệu tổng quan dự án

---

## ⚙️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu môi trường

- **Node.js:** v20.x trở lên (khuyến nghị v22/v24).
- **MongoDB:** v6.0+ chạy ở chế độ **Replica Set** (bắt buộc để sử dụng tính năng MongoDB Transactions) hoặc sử dụng **MongoDB Atlas**.

### 2. Cài đặt Backend (`server`)

    cd server
    npm install

Tạo file `.env` trong thư mục `server/` với các biến môi trường sau:

    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/nutri_erp?replicaSet=rs0
    JWT_ACCESS_SECRET=your_access_token_secret_key
    JWT_REFRESH_SECRET=your_refresh_token_secret_key
    CLIENT_URL=http://localhost:5173

Khởi chạy server ở chế độ phát triển:

    npm run dev

> Truy cập tài liệu API Swagger tại: `http://localhost:5000/api-docs`

### 3. Cài đặt Frontend (`client`)

Mở một cửa sổ terminal mới:

    cd client
    npm install
    npm run dev

> Truy cập giao diện hệ thống tại: `http://localhost:5173`

---

## 🧪 Kiểm Thử Tự Động (End-to-End Test)

Dự án đi kèm kịch bản kiểm thử tự động `server/test-e2e.js` để xác thực toàn bộ 6 luồng nghiệp vụ cốt lõi (Đăng nhập → Tạo danh mục → Nhập kho đa lô → Xuất bán trừ tồn FEFO → Hủy đơn hoàn kho → Ghi nhận Audit Log):

    cd server
    node test-e2e.js

---

## 📦 Build Production

Để đóng gói mã nguồn Frontend tối ưu cho môi trường Production:

    cd client
    npm run build

Tệp tin sau khi biên dịch sẽ được xuất ra thư mục `client/dist/`.

---

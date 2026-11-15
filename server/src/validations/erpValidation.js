const { z } = require("zod");

// 1. Validate Phiếu Nhập Kho Đa Dòng
const createGoodsReceiptSchema = z.object({
  body: z.object({
    supplier: z
      .string()
      .min(1, "Vui lòng chọn hoặc nhập nhà cung cấp")
      .optional(),
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          product: z.string().min(1, "Thiếu ID sản phẩm"),
          lotNumber: z
            .string()
            .trim()
            .min(1, "Mã lô (LOT) không được để trống"),
          mfgDate: z.string().optional().nullable(),
          expDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
            message: "Hạn sử dụng (EXP) không hợp lệ",
          }),
          quantity: z.coerce
            .number()
            .int()
            .positive("Số lượng nhập phải lớn hơn 0"),
          importPrice: z.coerce
            .number()
            .min(0, "Giá nhập không được âm")
            .optional(),
        }),
      )
      .min(1, "Phiếu nhập kho phải có ít nhất 1 dòng sản phẩm"),
  }),
});

// 2. Validate Tạo Đơn Hàng FEFO
const createOrderSchema = z.object({
  body: z.object({
    customerName: z.string().trim().min(2, "Tên khách hàng tối thiểu 2 ký tự"),
    customerPhone: z
      .string()
      .trim()
      .min(8, "Số điện thoại khách hàng không hợp lệ"),
    customerAddress: z.string().optional(),
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          productId: z.string().min(1, "Thiếu ID sản phẩm"),
          quantity: z.coerce
            .number()
            .int()
            .positive("Số lượng đặt mua phải lớn hơn 0"),
          price: z.coerce.number().min(0, "Đơn giá không hợp lệ").optional(),
        }),
      )
      .min(1, "Đơn hàng phải có ít nhất 1 sản phẩm"),
  }),
});

// 3. Validate Phiếu Kiểm Kê Kho
const createStockAuditSchema = z.object({
  body: z.object({
    note: z.string().optional(),
    items: z
      .array(
        z.object({
          inventoryId: z.string().min(1, "Thiếu ID lô hàng kiểm kê"),
          actualQty: z.coerce
            .number()
            .min(0, "Số lượng tồn thực tế không được âm"),
        }),
      )
      .min(1, "Phiếu kiểm kê phải có ít nhất 1 lô hàng"),
  }),
});

module.exports = {
  createGoodsReceiptSchema,
  createOrderSchema,
  createStockAuditSchema,
};

// Mirrors the server's transition map so the UI only offers legal actions.
export const STATUS_TONE = {
  pending: "amber",
  accepted: "brand",
  processing: "brand",
  shipped: "brand",
  delivered: "brand",
  cancelled: "neutral",
  rejected: "red",
};

export const ORDER_FLOW = ["pending", "accepted", "processing", "shipped", "delivered"];

export const ORDER_STATUS = [...ORDER_FLOW, "cancelled", "rejected"];

export const PAYMENT_STATUS = ["pending", "paid", "failed", "refunded"];

// server/services/orderService.js TRANSITIONS — keep these two in sync
export const ALLOWED = {
  pending: ["accepted", "rejected", "cancelled"],
  accepted: ["processing", "cancelled"],
  processing: ["shipped"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
  rejected: [],
};

export const nextStatuses = (order) => ALLOWED[order?.orderStatus] ?? [];

// sellers never cancel — that is the buyer's or the admin's call
export const sellerNextStatuses = (order) => nextStatuses(order).filter((s) => s !== "cancelled");

export const ACTION_LABEL = {
  accepted: "Accept",
  rejected: "Reject",
  cancelled: "Cancel order",
  processing: "Start processing",
  shipped: "Mark shipped",
  delivered: "Mark delivered",
};

export const canBuyerCancel = (order) =>
  ["pending", "accepted"].includes(order.orderStatus) && order.paymentStatus !== "refunded";
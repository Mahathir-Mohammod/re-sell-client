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

export const canBuyerCancel = (order) =>
  ["pending", "accepted"].includes(order.orderStatus) && order.paymentStatus !== "refunded";
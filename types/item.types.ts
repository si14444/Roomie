export interface Item {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  priority: ItemPriority;
  estimatedPrice: number;
  store: string;
  status: ItemStatus;
  requestedBy: string;
  requestedAt: Date;
  purchasedBy?: string;
  purchasedAt?: Date;
  purchasePrice?: number;
  receiptUrl?: string;
}

export type ItemCategory = "food" | "household" | "personal" | "electronics" | "other";

export type ItemPriority = "low" | "medium" | "high";

export type ItemStatus = "requested" | "shopping" | "purchased" | "delivered" | "cancelled";

export interface NewItemInput {
  name: string;
  description: string;
  category: ItemCategory;
  priority: ItemPriority;
  estimatedPrice: string;
  store: string;
}

export interface ItemRequest {
  id: string;
  itemId: string;
  requestedBy: string;
  requestedAt: Date;
  message?: string;
  urgency: ItemPriority;
  status: "pending" | "accepted" | "declined" | "fulfilled";
}

export interface ShoppingList {
  id: string;
  name: string;
  items: Item[];
  assignedTo?: string;
  dueDate?: Date;
  status: "active" | "completed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface ItemFilter {
  category?: ItemCategory;
  priority?: ItemPriority;
  status?: ItemStatus;
  assignedTo?: string;
  store?: string;
}

export interface ItemStats {
  totalRequested: number;
  totalPurchased: number;
  totalSpent: number;
  avgPrice: number;
  categoryCounts: Record<ItemCategory, number>;
  priorityCounts: Record<ItemPriority, number>;
}
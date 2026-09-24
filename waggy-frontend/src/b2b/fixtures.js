/**
 * SYNTHETIC / DEMO ONLY.
 * Class A client raw data for the Wagtopia Demo tenant.
 * No PII, no credentials, no scientific corpus.
 */

export const TENANT_WAGTOPIA = "tenant_wagtopia";
export const TENANT_OTHER = "tenant_client_002";

export const PRODUCTS_CSV = [
  "product_id,name,price,category",
  "joint_supplement,Joint Supplement,28,supplement",
  "dental_care,Dental Care,16,dental",
  "dry_food,Dry Food,42,food",
  "missing_cat,Unlabeled Chew,9,",
].join("\n");

export const CUSTOMERS_CSV = [
  "customer_id,segment",
  "c1,adult_maintenance",
  "c2,senior",
  "c3,adult_maintenance",
].join("\n");

export const ORDERS_CSV = [
  "order_id,customer_id,order_date",
  "o1,c1,2026-08-01",
  "o2,c2,2026-08-12",
  "o3,c1,2026-09-02",
].join("\n");

export const ORDER_ITEMS_CSV = [
  "order_id,product_id,quantity,revenue",
  "o1,joint_supplement,1,28",
  "o2,dental_care,2,32",
  "o3,dry_food,1,42",
].join("\n");

export const INVENTORY_CSV = [
  "product_id,on_hand",
  "joint_supplement,40",
  "dental_care,12",
  "dry_food,80",
].join("\n");

export const DEMO_CSV_FILES = Object.freeze({
  "customers.csv": CUSTOMERS_CSV,
  "products.csv": PRODUCTS_CSV,
  "orders.csv": ORDERS_CSV,
  "order_items.csv": ORDER_ITEMS_CSV,
  "inventory.csv": INVENTORY_CSV,
});

export const SQL_TABLES = Object.freeze([
  { name: "customers", selected: true },
  { name: "products", selected: true },
  { name: "orders", selected: true },
  { name: "order_items", selected: true },
  { name: "employees", selected: false },
  { name: "payments", selected: false },
]);

export const R_DATASETS = Object.freeze([
  { filename: "catalog.rds", format: "rds", record_count: 12 },
  { filename: "orders.RData", format: "rdata", record_count: 3 },
]);

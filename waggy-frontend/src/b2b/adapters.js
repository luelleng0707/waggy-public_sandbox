/**
 * DataSource adapters. Prototype only.
 * SQL passwords are never stored or returned.
 * .R source files are not datasets.
 *
 * Class A rows stay inside the tenant that ingested them.
 */

import { SQL_TABLES } from "./fixtures.js";

var COLUMN_CHECKS = {
  "products.csv": ["product_id", "price", "category"],
  "customers.csv": ["customer_id", "segment"],
  "orders.csv": ["order_id", "customer_id"],
  "order_items.csv": ["order_id", "product_id"],
  "inventory.csv": ["product_id", "on_hand"],
};

export function parseCsv(text) {
  var lines = String(text || "").split(/\r?\n/).map(function (line) { return line.trim(); }).filter(Boolean);
  if (!lines.length) return { columns: [], rows: [] };
  var columns = lines[0].split(",").map(function (cell) { return cell.trim(); });
  var rows = lines.slice(1).map(function (line) {
    var cells = line.split(",");
    var row = {};
    columns.forEach(function (column, index) {
      row[column] = cells[index] == null ? "" : String(cells[index]).trim();
    });
    return row;
  });
  return { columns: columns, rows: rows };
}

export function profileCsv(filename, text) {
  var parsed = parseCsv(text);
  var expected = COLUMN_CHECKS[filename] || [];
  var warnings = [];
  expected.forEach(function (column) {
    if (parsed.columns.indexOf(column) < 0) warnings.push("missing column " + column);
  });
  if (filename === "products.csv") {
    var missingCategory = parsed.rows.filter(function (row) { return !row.category; }).length;
    if (missingCategory) warnings.push(missingCategory + " products missing category");
  }
  if (filename === "orders.csv" && parsed.columns.indexOf("customer_id") >= 0) {
    /* relationship column is present; no extra warning */
  }
  return datasetRecord({
    source_type: "csv",
    source_name: filename,
    schema: parsed.columns,
    rows: parsed.rows,
    warnings: warnings,
  });
}

export function testSqlConnection(form) {
  var input = form || {};
  if (!input.host || !input.database || !input.username || !input.password) {
    return { ok: false, message: "Host, database, username, and password are required to test. They are not saved." };
  }
  return {
    ok: true,
    message: "Mock connection succeeded. Credentials were not stored.",
    tables: SQL_TABLES.map(function (table) { return { name: table.name, selected: table.selected }; }),
  };
}

export function profileSql(tables) {
  var selected = (tables || SQL_TABLES).filter(function (table) { return table.selected; });
  return selected.map(function (table) {
    return datasetRecord({
      source_type: "sql",
      source_name: table.name,
      schema: ["id"],
      rows: [],
      record_count: table.name === "products" ? 1284 : table.name === "orders" ? 183221 : 40,
      warnings: [],
    });
  });
}

export function profileRDataset(filename) {
  var name = String(filename || "");
  var lower = name.toLowerCase();
  if (lower.endsWith(".r") && !lower.endsWith(".rdata")) {
    return { ok: false, message: "R source code is not a dataset. Provide .rds or .RData." };
  }
  if (!lower.endsWith(".rds") && !lower.endsWith(".rdata")) {
    return { ok: false, message: "R Dataset accepts .rds or .RData only." };
  }
  return {
    ok: true,
    dataset: datasetRecord({
      source_type: "r_dataset",
      source_name: name,
      schema: ["record"],
      rows: [],
      record_count: lower.endsWith(".rds") ? 12 : 3,
      warnings: [],
    }),
  };
}

function datasetRecord(input) {
  var rows = input.rows || [];
  return {
    dataset_id: input.source_type + ":" + input.source_name,
    source_type: input.source_type,
    source_name: input.source_name,
    version: "v1",
    schema: input.schema || [],
    rows: rows,
    record_count: input.record_count != null ? input.record_count : rows.length,
    status: (input.warnings || []).length ? "warning" : "valid",
    quality_summary: { warnings: input.warnings || [] },
    data_class: "client_raw",
  };
}

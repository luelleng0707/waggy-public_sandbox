/**
 * Class B generated analytics. Demo / Simulated.
 * Not scientific evidence. Not inferred without an explicit outcome event.
 *
 * Raw Class A rows are never copied into another tenant.
 * Benchmarks, if added later, must use anonymized aggregates only.
 */

export var DEMO_LABEL = "Demo / Simulated";

export function packagePurchaseEvents(tenantId) {
  return [
    { tenant_id: tenantId, package_id: "essential", package_version: "demo-v1", purchase_date: "2026-09-01", quantity: 163, revenue: 4890, customer_segment_id: "adult_maintenance", recommended: 428 },
    { tenant_id: tenantId, package_id: "balanced", package_version: "demo-v1", purchase_date: "2026-09-01", quantity: 141, revenue: 8460, customer_segment_id: "adult_maintenance", recommended: 312 },
    { tenant_id: tenantId, package_id: "optimal", package_version: "demo-v1", purchase_date: "2026-09-01", quantity: 31, revenue: 3100, customer_segment_id: "senior", recommended: 94 },
  ];
}

export function recommendationOutcomeEvents(tenantId) {
  return [
    { tenant_id: tenantId, customer_segment_id: "adult_maintenance", recommendation_id: "rec-fresh-1", product_id: "fresh_frozen_nutrition", catalog_status: "not_in_catalog", outcome: "recommended", timestamp: "2026-09-10" },
    { tenant_id: tenantId, customer_segment_id: "adult_maintenance", recommendation_id: "rec-fresh-1", product_id: "fresh_frozen_nutrition", catalog_status: "not_in_catalog", outcome: "purchased", timestamp: "2026-09-18" },
  ];
}

export function packagePerformance(events) {
  return (events || []).map(function (event) {
    var recommended = event.recommended || 0;
    var purchased = event.quantity || 0;
    return {
      tenant_id: event.tenant_id,
      package_id: event.package_id,
      recommended: recommended,
      purchased: purchased,
      conversion: recommended ? Math.round((purchased / recommended) * 1000) / 10 : 0,
      revenue: event.revenue,
      label: DEMO_LABEL,
    };
  });
}

export function catalogGaps(catalogProductIds, outcomes) {
  var catalog = {};
  (catalogProductIds || []).forEach(function (id) { if (id) catalog[id] = true; });
  var grouped = {};
  (outcomes || []).forEach(function (event) {
    if (event.catalog_status !== "not_in_catalog") return;
    if (catalog[event.product_id]) return;
    var bucket = grouped[event.product_id] || { product_id: event.product_id, exposed: 0, purchased: 0, tenant_id: event.tenant_id };
    if (event.outcome === "recommended" || event.outcome === "viewed") bucket.exposed += 1;
    if (event.outcome === "purchased") bucket.purchased += 1;
    grouped[event.product_id] = bucket;
  });
  return Object.keys(grouped).map(function (id) {
    var row = grouped[id];
    return {
      tenant_id: row.tenant_id,
      product_id: id,
      display_name: id === "fresh_frozen_nutrition" ? "Fresh Frozen Nutrition" : id,
      catalog_status: "not_in_catalog",
      customers_exposed: row.exposed === 1 ? 127 : row.exposed,
      reported_purchases: row.purchased === 1 ? 34 : row.purchased,
      demand_signal: row.purchased > 0 ? "HIGH" : "LOW",
      source: "Recommendation outcome data",
      label: DEMO_LABEL,
    };
  });
}

export function rowsForTenant(datasets, tenantId) {
  return (datasets || []).filter(function (dataset) { return dataset.tenant_id === tenantId; });
}

/**
 * Prototype tenant store. Not a database.
 * Passwords are rejected if a caller tries to persist them.
 * Class A rows are readable only for the same tenant_id.
 */

var memory = { datasets: [], runs: [] };

export function resetDemo() {
  memory = { datasets: [], runs: [] };
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem("waggy.b2b.demo.v1");
  } catch (_err) { /* private mode */ }
}

export function saveDatasets(tenantId, datasets) {
  var stamped = (datasets || []).map(function (dataset) {
    var copy = Object.assign({}, dataset, { tenant_id: tenantId, created_at: new Date().toISOString() });
    delete copy.password;
    delete copy.credentials;
    return copy;
  });
  memory.datasets = memory.datasets.filter(function (dataset) { return dataset.tenant_id !== tenantId; }).concat(stamped);
  return stamped;
}

export function datasetsFor(tenantId) {
  return memory.datasets.filter(function (dataset) { return dataset.tenant_id === tenantId; }).map(function (dataset) {
    var copy = Object.assign({}, dataset);
    delete copy.password;
    return copy;
  });
}

export function saveRun(run) {
  var copy = Object.assign({}, run);
  delete copy.password;
  memory.runs.push(copy);
  return copy;
}

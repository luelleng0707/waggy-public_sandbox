/**
 * Prototype pipeline statuses. Not the 44-system platform.
 * Analysis completion is recorded only after the Waggy API responds.
 */

var STAGES = ["received", "profiled", "quality_checked", "normalized", "sent_to_waggy", "analysis_complete"];

export function startPipeline(datasets) {
  var now = new Date().toISOString();
  var count = (datasets || []).reduce(function (sum, dataset) { return sum + (dataset.record_count || 0); }, 0);
  var warnings = [];
  (datasets || []).forEach(function (dataset) {
    ((dataset.quality_summary && dataset.quality_summary.warnings) || []).forEach(function (warning) {
      warnings.push(dataset.source_name + ": " + warning);
    });
  });
  return {
    dataset_version: "demo-v1",
    record_count: count,
    warnings: warnings,
    stages: STAGES.map(function (name, index) {
      var done = index < 4;
      return {
        name: name,
        status: done ? "complete" : "pending",
        timestamp: done ? now : null,
        record_count: count,
        warnings: name === "quality_checked" ? warnings : [],
      };
    }),
  };
}

export function markSent(pipeline) {
  return setStage(pipeline, "sent_to_waggy", "complete");
}

export function markAnalysis(pipeline, ok) {
  return setStage(pipeline, "analysis_complete", ok ? "complete" : "failed");
}

function setStage(pipeline, name, status) {
  var next = Object.assign({}, pipeline, { stages: (pipeline.stages || []).map(function (stage) { return Object.assign({}, stage); }) });
  next.stages.forEach(function (stage) {
    if (stage.name === name) {
      stage.status = status;
      stage.timestamp = new Date().toISOString();
    }
  });
  return next;
}

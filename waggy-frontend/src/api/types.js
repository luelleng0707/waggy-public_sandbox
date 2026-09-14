/**
 * Frontend-consumable API contracts. These describe HTTP JSON, not Python classes.
 *
 * @typedef {object} DogProfile
 * @property {string} [dog_id]
 * @property {string} [name]
 * @property {string} [primary_breed]
 * @property {string} [secondary_breed]
 * @property {string} [birthday]
 * @property {number} [age_years]
 * @property {number} [weight]
 * @property {number} [weight_kg]
 * @property {string} [sex]
 * @property {string} [activity_level]
 * @property {string} [current_environment]
 * @property {string[]} [observed_conditions]
 * @property {number} [monthly_budget]
 *
 * @typedef {object} HealthAnalysis
 * @property {object[]} [findings]
 * @property {object} [warehouse_status]
 *
 * @typedef {object} NutritionAnalysis
 * @property {object[]} [nutrient_targets]
 * @property {object[]} [nutrition_facts]
 *
 * @typedef {object} Product
 * @property {string} [product_id]
 * @property {string} [product_name]
 * @property {string} [name]
 *
 * @typedef {object} PackageOption
 * @property {string} [bundle_id]
 * @property {string} [tier]
 * @property {number} [monthly_cost]
 * @property {Product[]} [products]
 *
 * @typedef {object} RecalculationExplanation
 * @property {string} [schema]
 * @property {boolean} [scientific]
 * @property {boolean} [llm_used]
 * @property {boolean} [science_changed]
 * @property {object[]} [causes]
 * @property {string[]} [summary_facts]
 *
 * @typedef {object} AnalysisComparison
 * @property {string} [schema]
 * @property {boolean} [engine_ran]
 * @property {RecalculationExplanation} [explanation]
 *
 * @typedef {object} Provenance
 * @property {string} [engine_version]
 * @property {string} [warehouse_version]
 * @property {string} [analysis_signature]
 * @property {object} [optimizer]
 * @property {object[]} [evidence]
 *
 * @typedef {object} ApiErrorBody
 * @property {{code?: string, message?: string, field?: string}} [error]
 */

export const SCHEMA_NAMES = Object.freeze({
  workbenchPresentation: "workbench_presentation.v1",
  recalculationExplanation: "waggy_recalculation_explanation.v1",
  analysisCompare: "analysis_compare.v1",
});

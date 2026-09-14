/**
 * SYNTHETIC / DEMO ONLY.
 * Not a production customer. Not partner catalog. Not warehouse evidence.
 * Load Demo fills the form; it does not persist a dog and does not run the engine.
 */

export const DEMO_DOG_DOLLY = Object.freeze({
  name: "Dolly",
  pet_name: "Dolly",
  breeds: ["Labrador Retriever", "Golden Retriever"],
  primary_breed: "Labrador Retriever",
  secondary_breed: "Golden Retriever",
  birthday: "2021-04-15",
  weight: 30,
  sex: "Female",
  activity_level: "Moderate",
  current_environment: "Temperate Outdoor",
  observed_conditions: ["joint_stiffness", "itching"],
});

export const WORKBENCH_EXAMPLE_REQUEST = Object.freeze({
  name: "Dolly",
  pet_name: "Dolly",
  primary_breed: "Labrador Retriever",
  secondary_breed: "Golden Retriever",
  breeds: ["Labrador Retriever", "Golden Retriever"],
  birthday: "2021-04-15",
  as_of_date: "2026-09-09",
  weight: 30,
  sex: "Female",
  activity_level: "Moderate",
  current_environment: "Temperate Outdoor",
  observed_conditions: ["joint_stiffness", "itching"],
  correlation_id: "omega16-example-001",
});

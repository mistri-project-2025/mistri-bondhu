// src/utils/categories.js

export const CATEGORIES = [
  { id: "civil_contractor", en: "Civil Contractor", type: "contractor" },
  { id: "residential_building_contractor", en: "Residential Building Contractor", type: "contractor" },
  { id: "commercial_building_contractor", en: "Commercial Building Contractor", type: "contractor" },
  { id: "home_renovation_contractor", en: "Home Renovation Contractor", type: "contractor" },
  { id: "marble_contractor", en: "Marble Contractor", type: "contractor" },
  { id: "tile_contractor", en: "Tile Contractor", type: "contractor" },
  { id: "flooring_contractor", en: "Flooring Contractor", type: "contractor" },
  { id: "mason_brick_contractor", en: "Mason / Brick Contractor", type: "contractor" },
  { id: "plastering_contractor", en: "Plastering Contractor", type: "contractor" },
  { id: "rcc_contractor", en: "RCC Contractor", type: "contractor" },
  { id: "paint_contractor", en: "Paint Contractor", type: "contractor" },
  { id: "waterproofing_contractor", en: "Waterproofing Contractor", type: "contractor" },
  { id: "interior_contractor", en: "Interior Contractor", type: "contractor" },
  { id: "exterior_contractor", en: "Exterior Contractor", type: "contractor" },
  { id: "road_paver_contractor", en: "Road / Paver Contractor", type: "contractor" },
  { id: "plumbing_contractor", en: "Plumbing Contractor", type: "contractor" },
  { id: "electrical_contractor", en: "Electrical Contractor", type: "contractor" },
  { id: "hvac_contractor", en: "HVAC Contractor", type: "contractor" },
  { id: "steel_fabrication_contractor", en: "Steel / Fabrication Contractor", type: "contractor" },
  { id: "furniture_cabinetry_contractor", en: "Furniture / Cabinetry Contractor", type: "contractor" },
  { id: "tile_granite_stone_contractor", en: "Tile / Granite / Stone Contractor", type: "contractor" },
  { id: "modular_kitchen_contractor", en: "Modular Kitchen Contractor", type: "contractor" },
  { id: "false_ceiling_contractor", en: "False Ceiling Contractor", type: "contractor" },
  { id: "balcony_deck_contractor", en: "Balcony / Deck Contractor", type: "contractor" },
  { id: "civil_engineering_consultant", en: "Civil Engineering Consultant", type: "contractor" },
  { id: "structural_consultant", en: "Structural Consultant", type: "contractor" },
  { id: "building_demolition_contractor", en: "Building Demolition Contractor", type: "contractor" },
  { id: "concrete_contractor", en: "Concrete Contractor", type: "contractor" },
  { id: "brickwork_contractor", en: "Brickwork Contractor", type: "contractor" },
  { id: "roofing_contractor", en: "Roofing Contractor", type: "contractor" },
  { id: "glass_aluminum_contractor", en: "Glass / Aluminum Contractor", type: "contractor" },
  { id: "exterior_wall_facade_contractor", en: "Exterior Wall / Facade Contractor", type: "contractor" },
  { id: "waterproofing_consultant", en: "Waterproofing Consultant", type: "contractor" },
  { id: "landscape_contractor", en: "Landscape Contractor", type: "contractor" },
  { id: "septic_drainage_contractor", en: "Septic / Drainage Contractor", type: "contractor" },
  { id: "elevator_lift_contractor", en: "Elevator / Lift Contractor", type: "contractor" },
  { id: "solar_panel_renewable_energy_contractor", en: "Solar Panel / Renewable Energy Contractor", type: "contractor" },
  { id: "security_cctv_contractor", en: "Security / CCTV Contractor", type: "contractor" },
  { id: "fire_safety_contractor", en: "Fire Safety Contractor", type: "contractor" },
];

// Helper function to get label by id
export const getCategoryLabel = (categoryId) => {
  const cat = CATEGORIES.find(c => c.id === categoryId);
  return cat ? cat.en : categoryId;
};

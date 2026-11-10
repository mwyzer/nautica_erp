export type ERPModule =
  | 'vessel'
  | 'crew'
  | 'maintenance'
  | 'inventory'
  | 'procurement'
  | 'finance'
  | 'voyage'
  | 'documents'
  | 'ais'
  | 'cii'
  | 'chartering'
  | 'noon_report'
  | 'hseq'
  | 'drydock'
  | 'copilot';

// --- IMO CII & Decarbonization Types ---
export interface CIIRatingData {
  vessel_id: number;
  vessel_name: string;
  vessel_type: string;
  dwt: number;
  total_distance_nm: number;
  total_vlsfo_mt: number;
  total_mgo_mt: number;
  total_co2_emissions_mt: number;
  attained_cii: number; // g CO2 / DWT.NM
  required_cii: number;
  cii_ratio: number;
  rating_band: 'A' | 'B' | 'C' | 'D' | 'E';
  seemp_plan_required: boolean;
  eu_ets_allowance_eur: number;
}

// --- Chartering & Demurrage / Laytime Types ---
export interface CharterpartyContract {
  id: number;
  contract_number: string;
  charterer_name: string;
  contract_type: 'TIME_CHARTER' | 'VOYAGE_CHARTER' | 'BAREBOAT';
  vessel_name: string;
  cargo_description: string;
  rate_amount_usd: number; // per day or per MT
  allowed_laytime_hours: number;
  demurrage_rate_per_day_usd: number;
  despatch_rate_per_day_usd: number;
  laycan_start: string;
  laycan_end: string;
  status: 'NEGOTIATION' | 'FIXED_ACTIVE' | 'COMPLETED';
}

export interface LaytimeCalculation {
  contract_id: number;
  port_name: string;
  laytime_allowed_hours: number;
  actual_laytime_used_hours: number;
  time_difference_hours: number;
  result_type: 'DEMURRAGE' | 'DESPATCH' | 'ON_TIME';
  settlement_amount_usd: number;
}

// --- Daily Noon Report & Vessel Telemetry Types ---
export interface NoonReportSubmission {
  id: number;
  vessel_name: string;
  report_date: string;
  report_time_utc: string;
  latitude: number;
  longitude: number;
  distance_last_24h_nm: number;
  avg_speed_knots: number;
  engine_rpm: number;
  propeller_slip_pct: number;
  fuel_burn_24h_mt: number;
  fuel_rob_vlsfo_mt: number;
  fuel_rob_mgo_mt: number;
  fresh_water_rob_mt: number;
  weather_beaufort: number;
  sea_state: string;
  hull_fouling_index: 'CLEAN' | 'SLIGHT_GROWTH' | 'MODERATE_FOULING' | 'CRITICAL_CLEANING_REQUIRED';
}

// --- HSEQ & Safety Inspection Types ---
export interface HSEQIncident {
  id: number;
  incident_number: string;
  vessel_name: string;
  severity: 'NEAR_MISS' | 'MINOR' | 'SERIOUS' | 'CRITICAL';
  category: 'NAVIGATION' | 'OCCUPATIONAL_SAFETY' | 'POLLUTION_PREVENTION' | 'CARGO_DAMAGE';
  description: string;
  date_occurred: string;
  corrective_action: string;
  status: 'INVESTIGATING' | 'ACTION_TAKEN' | 'CLOSED';
}

export interface PSCInspectionChecklist {
  id: number;
  mou_regime: 'TOKYO_MOU' | 'PARIS_MOU' | 'USCG' | 'DITJEN_HUBLA';
  vessel_name: string;
  target_port: string;
  inspection_date: string;
  detention_risk_level: 'LOW_RISK' | 'MEDIUM_RISK' | 'HIGH_RISK';
  deficiencies_found: number;
  solas_ready: boolean;
  marpol_ready: boolean;
  stcw_ready: boolean;
  mlc_2006_ready: boolean;
}

// --- Drydocking & Shipyard Project Types ---
export interface DrydockProject {
  id: number;
  project_code: string;
  vessel_name: string;
  survey_type: 'SPECIAL_SURVEY_5YR' | 'INTERMEDIATE_SURVEY' | 'EMERGENCY_REPAIR';
  classification_society: string;
  planned_start: string;
  planned_duration_days: number;
  budget_estimate_usd: number;
  actual_spent_usd: number;
  selected_shipyard: string;
  status: 'PLANNING_SPECS' | 'TENDERING' | 'IN_DOCK' | 'COMPLETED_DELIVERED';
  key_jobs: string[];
}

export interface AISWeather {
  sea_state: string;
  wave_height_m: number;
  wind_knots: number;
  wind_dir: string;
  air_temp_c: number;
  barometer_hpa: number;
}

export interface AISVesselData {
  vessel_id: number;
  imo_number: string;
  mmsi: string;
  call_sign: string;
  name: string;
  vessel_type: string;
  flag: string;
  lat: number;
  lng: number;
  heading: number;
  sog_knots: number;
  cog_degrees: number;
  nav_status: string;
  destination_port: string;
  eta: string;
  departure_port: string;
  cargo: string;
  draft_meters: number;
  main_engine_rpm: number;
  fuel_burn_mt_day: number;
  weather: AISWeather;
}

export interface SeaLane {
  id: string;
  name: string;
  coordinates: [number, number][];
  type: string;
  color: string;
}

export interface Vessel {
  id: number;
  imo_number: string;
  name: string;
  vessel_type: string;
  dwt: number;
  flag_state: string;
  status: string;
  current_port: string;
  avg_speed_knots: number;
  fuel_burn_rate_mt_per_day: number;
  created_at?: string;
  updated_at?: string;
}

export interface CrewCertification {
  id: number;
  crew_id: number;
  cert_type: string;
  cert_number: string;
  issue_date: string;
  expiry_date: string;
  is_valid: boolean;
}

export interface CrewMember {
  id: number;
  seafarer_id: string;
  full_name: string;
  rank: string;
  assigned_vessel_id: number | null;
  status: string;
  created_at?: string;
  certifications?: CrewCertification[];
}

export interface MaintenanceTicket {
  id: number;
  vessel_id: number;
  equipment_name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  description: string;
  reported_at: string;
  prevents_clearance: boolean;
}

export interface InventoryItem {
  id: number;
  item_code: string;
  name: string;
  category: 'SPARE_PARTS' | 'BUNKER_FUEL' | 'LUBRICANTS' | 'SAFETY_EQUIPMENT';
  quantity: number;
  unit: string;
  min_stock_level: number;
  unit_price_usd: number;
  location: string;
  status: 'OPTIMAL' | 'REORDER_NOW' | 'CRITICAL_LOW';
}

export interface ProcurementOrder {
  id: number;
  po_number: string;
  vendor_name: string;
  category: 'BUNKER_SUPPLY' | 'ENGINE_SPARES' | 'PROVISIONS' | 'SAFETY_GEAR';
  total_amount_usd: number;
  order_date: string;
  expected_delivery: string;
  status: 'PENDING_APPROVAL' | 'APPROVED' | 'IN_TRANSIT' | 'DELIVERED';
  target_vessel: string;
}

export interface FinanceSummary {
  total_opex_mtd_usd: number;
  fuel_expenses_usd: number;
  crew_payroll_usd: number;
  port_disbursements_usd: number;
  maintenance_costs_usd: number;
  projected_savings_ai_usd: number;
}

export interface MaritimeDocument {
  id: number;
  doc_number: string;
  title: string;
  doc_type: 'STATUTORY_VESSEL' | 'CREW_STCW' | 'PORT_CLEARANCE' | 'CLASS_SURVEY';
  issuing_authority: string;
  vessel_or_seafarer: string;
  issue_date: string;
  expiry_date: string;
  status: 'VALID' | 'EXPIRING_SOON' | 'EXPIRED';
}

export interface Voyage {
  id: number;
  voyage_number: string;
  vessel_id: number;
  origin_port: string;
  destination_port: string;
  distance_nm: number;
  departure_time: string;
  estimated_arrival: string;
  cargo_type: string;
  cargo_weight_mt: number;
  status: string;
  clearance_status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
  clearance_notes?: string;
  vessel?: Vessel;
}

export interface BunkerLog {
  id: number;
  vessel_id: number;
  voyage_id?: number;
  fuel_type: string;
  current_rob_mt: number;
  daily_consumption_mt: number;
  speed_knots: number;
  recorded_at: string;
  anomaly_flag: boolean;
  anomaly_reason?: string;
}

export interface FuelCheckMetrics {
  distance_nm: number;
  cruising_speed_knots: number;
  estimated_steaming_hours: number;
  base_fuel_required_mt: number;
  safe_fuel_required_mt: number;
  safety_buffer_percent: number;
  current_rob_mt: number;
  fuel_sufficiency_score: number;
  is_sufficient: boolean;
}

export interface CrewComplianceMetrics {
  total_crew_onboard: number;
  missing_mandatory_officers: string[];
  expired_or_expiring_certificates: Array<{
    seafarer: string;
    rank: string;
    cert_type: string;
    cert_number: string;
    expiry_date: string;
    reason: string;
  }>;
  is_compliant: boolean;
}

export interface MaintenanceStatusMetrics {
  open_tickets_count: number;
  blocking_defects: Array<{
    ticket_id: number;
    equipment: string;
    severity: string;
    description: string;
    prevents_clearance: boolean;
  }>;
  is_seaworthy: boolean;
}

export interface ClearanceAuditResult {
  voyage_id: number;
  voyage_number: string;
  vessel_name: string;
  decision: 'APPROVED' | 'REJECTED' | 'CONDITIONAL';
  fuel_check: FuelCheckMetrics;
  crew_compliance: CrewComplianceMetrics;
  maintenance_status: MaintenanceStatusMetrics;
  ai_summary: string;
  recommended_actions: string[];
  audited_at: string;
}

export interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  toolExecuted?: string;
}

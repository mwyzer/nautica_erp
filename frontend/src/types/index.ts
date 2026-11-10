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
  | 'weather_routing'
  | 'spb_generator'
  | 'cargo_stowage'
  | 'crew_payroll'
  | 'emergency_alarms'
  | 'ballast_stability'
  | 'iot_engine'
  | 'port_call_jit'
  | 'piracy_security'
  | 'copilot';

// --- AI Weather Routing & Eco Speed Types ---
export interface WeatherRoutingScenario {
  speed_knots: number;
  duration_hours: number;
  fuel_burn_total_mt: number;
  bunker_cost_usd: number;
  fuel_saved_mt: number;
  cost_saved_usd: number;
  co2_avoided_mt: number;
  extra_hours_at_sea?: number;
  eta: string;
  is_within_laycan: boolean;
  max_wave_height_m: number;
  route_description: string;
  waypoints: { name: string; lat: number; lng: number; wind_beaufort: number }[];
}

// --- Digital SPB / Port Clearance & IMO FAL Forms Types ---
export interface DigitalSPBRecord {
  id: number;
  spb_number: string;
  vessel_name: string;
  call_sign: string;
  imo_number: string;
  flag: string;
  master_name: string;
  origin_port_name: string;
  destination_port_name: string;
  issued_at: string;
  valid_until: string;
  syahbandar_authority: string;
  qr_code_hash: string;
  seaworthiness_status: 'LAIK_LAUT_APPROVED' | 'SUSPENDED';
  fal_form_1_summary: string;
  fal_form_2_cargo: string;
  fal_form_3_stores: string;
  fal_form_5_crew_count: number;
}

// --- Cargo Stowage & Container Bay Plan Types ---
export interface ContainerBaySlot {
  bay_id: string; // e.g. "Bay 04"
  row: number;
  tier: number;
  container_number: string;
  size_teu: 20 | 40;
  weight_mt: number;
  cargo_name: string;
  is_reefer: boolean;
  temperature_celsius?: number;
  temp_setpoint_celsius?: number;
  temp_status?: 'NORMAL' | 'WARNING_HIGH' | 'CRITICAL_ALARM';
  imdg_class?: string; // e.g. "Class 3 (Flammable Liquid)"
  slot_position: 'ON_DECK' | 'UNDER_DECK';
}

// --- Maritime Crew Payroll & Remittance Types ---
export interface CrewPayrollRecord {
  id: number;
  crew_id: string;
  seafarer_name: string;
  rank: string;
  assigned_vessel: string;
  basic_salary_usd: number;
  overtime_hours: number;
  overtime_pay_usd: number;
  leave_pay_usd: number;
  family_allotment_usd: number; // Remittance sent home
  family_recipient_name: string;
  net_payable_usd: number;
  payroll_month: string;
  mlc_2006_compliant: boolean;
  payment_status: 'PAID' | 'PROCESSING' | 'PENDING_APPROVAL';
}

// --- Maritime Emergency & Alarm Center Types ---
export interface MaritimeAlarmItem {
  id: number;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  category: 'DISTRESS_SOS' | 'BUNKER_SHORTAGE' | 'STCW_BLOCKER' | 'TYPHOON_WEATHER' | 'MACHINERY_TRIP';
  vessel_name: string;
  timestamp: string;
  acknowledged: boolean;
  recommended_action: string;
}

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

// --- Ballast Water Management & Ship Stability (IMO D-2) Types ---
export interface BallastTank {
  tank_id: string;
  tank_name: string;
  capacity_mt: number;
  current_mt: number;
  lcg_m: number;
  tcg_m: number;
  vcg_m: number;
}

export interface StabilityCalculationResult {
  vessel_id: number;
  total_displacement_mt: number;
  gm_solid_m: number;
  gm_fluid_m: number;
  is_gm_compliant: boolean;
  gm_status: string;
  trim_m: number;
  trim_direction: 'BY_STERN' | 'BY_BOW' | 'EVEN_KEEL';
  is_trim_safe: boolean;
  list_deg: number;
  list_direction: 'STARBOARD' | 'PORT' | 'UPRIGHT';
  is_list_safe: boolean;
  bending_moment_percent: number;
  shear_force_percent: number;
  stress_status: 'SAFE' | 'HIGH_STRESS' | 'STRUCTURAL_OVERLOAD';
  imo_compliance: boolean;
  recommendations: string[];
}

export interface BallastExchangeLog {
  id: number;
  vessel_name: string;
  log_date: string;
  exchange_method: string;
  tank_operated: string;
  volume_pumped_m3: number;
  start_lat: number;
  start_lng: number;
  distance_offshore_nm: number;
  water_depth_m: number;
  bwms_active: boolean;
  tro_residual_ppm: number;
  uv_reactor_power_kw: number;
  compliance_standard: string;
  port_inspector_status: string;
}

// --- IoT Engine Room Telemetry & CBM Types ---
export interface CylinderTelemetry {
  cylinder_num: number;
  exhaust_temp_c: number;
  exhaust_deviation_c: number;
  p_max_bar: number;
  p_comp_bar: number;
  piston_ring_wear_percent: number;
  status: 'NORMAL' | 'WARNING_DEVIATION' | 'CRITICAL_SCAVENGE_FIRE_RISK';
}

export interface TurbochargerTelemetry {
  turbo_id: string;
  rpm: number;
  scavenge_air_pressure_bar: number;
  air_cooler_dp_bar: number;
  turbine_inlet_temp_c: number;
  turbine_outlet_temp_c: number;
  vibration_rms_mm_s: number;
  status: 'HEALTHY' | 'COOLER_FOULING' | 'SURGE_RISK';
}

export interface LubeOilTelemetry {
  main_bearing_pressure_bar: number;
  oil_temp_c: number;
  viscosity_cst: number;
  water_in_oil_percent: number;
  filter_dp_bar: number;
  status: 'NORMAL' | 'HIGH_TEMP' | 'WATER_CONTAMINATION';
}

export interface EngineVibrationTelemetry {
  crankshaft_vibration_rms: number;
  bearing_vibration_rms: number;
  iso_10816_class_threshold: number;
  dominant_frequency_hz: number;
  bearing_health_score: number;
  status: 'NORMAL' | 'ELEVATED_VIBRATION' | 'STRUCTURAL_RISK';
}

export interface EngineRoomLiveSnapshot {
  vessel_id: number;
  vessel_name: string;
  engine_model: string;
  timestamp: string;
  is_engine_running: boolean;
  engine_rpm: number;
  shaft_power_kw: number;
  shaft_torque_knm: number;
  sfoc_g_kwh: number;
  sfoc_deviation_percent: number;
  mean_indicated_pressure_bar: number;
  cylinders: CylinderTelemetry[];
  turbocharger: TurbochargerTelemetry;
  lube_oil: LubeOilTelemetry;
  vibration: EngineVibrationTelemetry;
  cbm_health_grade: string;
  alerts: string[];
  maintenance_recommendations: string[];
}

// --- Port Call JIT Arrival Types ---
export interface PortCallSchedule {
  id: number;
  vessel_id: number;
  vessel_name: string;
  voyage_number: string;
  destination_port: string;
  terminal_berth: string;
  original_eta: string;
  berth_readiness_time: string;
  jit_adjusted_eta: string;
  distance_remaining_nm: number;
  full_ahead_speed_knots: number;
  jit_recommended_speed_knots: number;
  anchorage_waiting_hours_saved: number;
  fuel_saved_mt: number;
  cost_saved_usd: number;
  co2_reduction_mt: number;
  vts_slot_status: string;
  pilot_booked: boolean;
  tugs_allocated: number;
}

export interface OptimizeJITResponse {
  vessel_id: number;
  distance_nm: number;
  full_speed_knots: number;
  jit_speed_knots: number;
  transit_hours_full: number;
  transit_hours_jit: number;
  anchorage_hours_eliminated: number;
  fuel_full_mt: number;
  fuel_jit_mt: number;
  fuel_saved_mt: number;
  cost_saved_usd: number;
  co2_saved_mt: number;
  recommendation: string;
}

// --- Piracy & HRA Security Intelligence Types ---
export interface HighRiskZone {
  zone_id: string;
  zone_name: string;
  ocean_basin: string;
  risk_level: string;
  description: string;
  recommended_min_speed_knots: number;
  irtc_corridor_active: boolean;
  ukmto_contact: string;
}

export interface PiracyIncident {
  id: number;
  incident_date: string;
  location_name: string;
  latitude: number;
  longitude: number;
  vessel_type: string;
  attack_type: string;
  countermeasure_applied: string;
  outcome: string;
}

export interface VesselSecurityReadiness {
  vessel_id: number;
  vessel_name: string;
  current_threat_zone: string;
  bmp5_compliance_percent: number;
  razor_wire_installed: boolean;
  water_cannons_pressurized: boolean;
  citadel_locked_and_provisioned: boolean;
  citadel_days_provisions: number;
  armed_security_onboard: boolean;
  pcasp_guard_count: number;
  ais_silent_mode_authorized: boolean;
  ukmto_transit_registered: boolean;
  security_drill_last_date: string;
  overall_security_status: string;
}

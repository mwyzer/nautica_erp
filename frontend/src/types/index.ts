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

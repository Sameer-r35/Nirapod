export type ReportType =
  | 'delayed_delivery'
  | 'fake_product'
  | 'took_money_blocked'
  | 'wrong_item'
  | 'other'

export type ReportStatus = 'pending' | 'verified' | 'rejected' | 'expired'

export interface Entity {
  id: string
  fb_url: string | null
  canonical_id: string
  bkash_numbers: string[]
  trust_score: number
  total_reports: number
  created_at: string
}

export interface IncidentReport {
  id: string
  entity_id: string
  reporter_id: string
  report_type: ReportType
  description: string
  proof_urls: string[]
  status: ReportStatus
  created_at: string
}

export interface UserProfile {
  id: string
  phone: string
  karma_score: number
}

export interface TrustScoreBreakdown {
  score: number
  level: 'safe' | 'caution' | 'danger'
  penaltyBreakdown: {
    took_money_blocked: number
    fake_product: number
    delayed_delivery: number
    other: number
  }
}
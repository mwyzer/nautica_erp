from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/payroll", tags=["Maritime Crew Payroll & MLC 2006"])

CREW_PAYROLL: List[Dict[str, Any]] = [
    {
        "id": 1,
        "crew_id": "SID-ID-9011",
        "seafarer_name": "Capt. Hendra Gunawan",
        "rank": "MASTER",
        "assigned_vessel": "MV Nusantara Pioneer",
        "basic_salary_usd": 7200.0,
        "overtime_hours": 42.0,
        "overtime_pay_usd": 1850.0,
        "leave_pay_usd": 650.0,
        "family_allotment_usd": 5500.0,  # 70% allotment to family
        "family_recipient_name": "Siti Rahmawati (BCA Cab. Kelapa Gading)",
        "net_payable_usd": 4200.0,
        "payroll_month": "November 2026",
        "mlc_2006_compliant": True,
        "payment_status": "PAID",
    },
    {
        "id": 2,
        "crew_id": "SID-ID-9012",
        "seafarer_name": "Bambang Supriyanto",
        "rank": "CHIEF_ENGINEER",
        "assigned_vessel": "MV Nusantara Pioneer",
        "basic_salary_usd": 6800.0,
        "overtime_hours": 38.0,
        "overtime_pay_usd": 1620.0,
        "leave_pay_usd": 600.0,
        "family_allotment_usd": 5000.0,
        "family_recipient_name": "Endang Lestari (Mandiri Cab. Tanjung Perak)",
        "net_payable_usd": 4020.0,
        "payroll_month": "November 2026",
        "mlc_2006_compliant": True,
        "payment_status": "PAID",
    },
    {
        "id": 3,
        "crew_id": "SID-ID-7810",
        "seafarer_name": "Capt. Agus Pratama",
        "rank": "MASTER",
        "assigned_vessel": "MV Barito Leader",
        "basic_salary_usd": 6500.0,
        "overtime_hours": 40.0,
        "overtime_pay_usd": 1500.0,
        "leave_pay_usd": 580.0,
        "family_allotment_usd": 4800.0,
        "family_recipient_name": "Dewi Sartika (BRI Cab. Banjarmasin)",
        "net_payable_usd": 3780.0,
        "payroll_month": "November 2026",
        "mlc_2006_compliant": True,
        "payment_status": "PROCESSING",
    },
    {
        "id": 4,
        "crew_id": "SID-ID-9014",
        "seafarer_name": "Rian Hidayat",
        "rank": "ABLE_SEAMAN",
        "assigned_vessel": "MV Nusantara Pioneer",
        "basic_salary_usd": 1850.0,
        "overtime_hours": 55.0,
        "overtime_pay_usd": 620.0,
        "leave_pay_usd": 220.0,
        "family_allotment_usd": 1600.0,
        "family_recipient_name": "Nurhasanah (BNI Cab. Cirebon)",
        "net_payable_usd": 1090.0,
        "payroll_month": "November 2026",
        "mlc_2006_compliant": True,
        "payment_status": "PENDING_APPROVAL",
    },
]


@router.get("/slips", response_model=List[Dict[str, Any]])
async def list_payroll_slips():
    """Retrieve crew monthly payroll sheets, overtime breakdown, and family remittance allotments."""
    return CREW_PAYROLL

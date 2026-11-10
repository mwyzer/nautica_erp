from typing import List, Dict, Any
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/chartering", tags=["Chartering & Commercial Laytime"])

CHARTER_CONTRACTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "contract_number": "CP-2026-NYPE-088",
        "charterer_name": "Glencore Marine Singapore Pte Ltd",
        "contract_type": "TIME_CHARTER",
        "vessel_name": "MV Nusantara Pioneer",
        "cargo_description": "Clean TEU Containers & General Cargo",
        "rate_amount_usd": 18500.0,  # $18,500/day
        "allowed_laytime_hours": 72.0,
        "demurrage_rate_per_day_usd": 15000.0,
        "despatch_rate_per_day_usd": 7500.0,
        "laycan_start": "2026-11-01",
        "laycan_end": "2026-12-31",
        "status": "FIXED_ACTIVE",
    },
    {
        "id": 2,
        "contract_number": "CP-2026-GENCON-104",
        "charterer_name": "PT Adaro Energy Logistik",
        "contract_type": "VOYAGE_CHARTER",
        "vessel_name": "MV Barito Leader",
        "cargo_description": "Steam Coal in Bulk (55,000 MT +/- 5%)",
        "rate_amount_usd": 32.50,  # $32.50 per MT
        "allowed_laytime_hours": 96.0,
        "demurrage_rate_per_day_usd": 22000.0,
        "despatch_rate_per_day_usd": 11000.0,
        "laycan_start": "2026-11-05",
        "laycan_end": "2026-11-20",
        "status": "FIXED_ACTIVE",
    },
    {
        "id": 3,
        "contract_number": "CP-2026-ASBATANK-221",
        "charterer_name": "Trafigura Marine Fuels BV",
        "contract_type": "VOYAGE_CHARTER",
        "vessel_name": "MT Samudra Jaya",
        "cargo_description": "Clean Petroleum Products (Gas Oil 0.001%)",
        "rate_amount_usd": 38.00,  # $38.00 per MT
        "allowed_laytime_hours": 60.0,
        "demurrage_rate_per_day_usd": 28000.0,
        "despatch_rate_per_day_usd": 14000.0,
        "laycan_start": "2026-11-12",
        "laycan_end": "2026-11-28",
        "status": "NEGOTIATION",
    },
]


class LaytimeRequest(BaseModel):
    allowed_hours: float
    used_hours: float
    demurrage_rate_per_day: float
    despatch_rate_per_day: float


@router.get("/contracts", response_model=List[Dict[str, Any]])
async def list_charter_contracts():
    """Retrieve active and negotiated charterparty contracts."""
    return CHARTER_CONTRACTS


@router.post("/calculate-laytime")
async def calculate_laytime(req: LaytimeRequest):
    """Calculates Demurrage (penalty) or Despatch (bonus) based on laytime consumed."""
    diff_hours = req.used_hours - req.allowed_hours

    if diff_hours > 0:
        # Demurrage incurred
        days = diff_hours / 24.0
        amount = round(days * req.demurrage_rate_per_day, 2)
        return {
            "result_type": "DEMURRAGE",
            "hours_exceeded": round(diff_hours, 2),
            "days_exceeded": round(days, 3),
            "settlement_amount_usd": amount,
            "description": f"Kapal terlambat {round(diff_hours, 1)} jam dari laytime yang diizinkan. Denda demurrage: ${amount:,.2f} USD.",
        }
    elif diff_hours < 0:
        # Despatch earned
        saved_hours = abs(diff_hours)
        days = saved_hours / 24.0
        amount = round(days * req.despatch_rate_per_day, 2)
        return {
            "result_type": "DESPATCH",
            "hours_saved": round(saved_hours, 2),
            "days_saved": round(days, 3),
            "settlement_amount_usd": amount,
            "description": f"Kapal selesai bongkar muat lebih cepat {round(saved_hours, 1)} jam. Bonus despatch: ${amount:,.2f} USD.",
        }
    else:
        return {
            "result_type": "ON_TIME",
            "hours_difference": 0,
            "settlement_amount_usd": 0.0,
            "description": "Bongkar muat selesai tepat waktu sesuai batas laytime (0 jam deviasi).",
        }

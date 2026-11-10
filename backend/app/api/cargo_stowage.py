from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/stowage", tags=["Cargo Stowage & Container Bay Plan"])

BAY_SLOTS: List[Dict[str, Any]] = [
    # Bay 04 - On Deck
    {
        "bay_id": "Bay 04",
        "row": 1,
        "tier": 82,
        "container_number": "MSKU-981240-1",
        "size_teu": 40,
        "weight_mt": 24.5,
        "cargo_name": "Garments & Textiles (Export to Singapore)",
        "is_reefer": False,
        "slot_position": "ON_DECK",
    },
    {
        "bay_id": "Bay 04",
        "row": 2,
        "tier": 82,
        "container_number": "SUDU-772190-4",
        "size_teu": 40,
        "weight_mt": 28.0,
        "cargo_name": "Refrigerated Shrimp & Tuna (Deep Frozen)",
        "is_reefer": True,
        "temperature_celsius": -20.5,
        "temp_setpoint_celsius": -21.0,
        "temp_status": "NORMAL",
        "slot_position": "ON_DECK",
    },
    {
        "bay_id": "Bay 04",
        "row": 3,
        "tier": 82,
        "container_number": "HLXU-441209-8",
        "size_teu": 20,
        "weight_mt": 18.2,
        "cargo_name": "Organic Chemical Resins",
        "is_reefer": False,
        "imdg_class": "Class 3 (Flammable Liquids)",
        "slot_position": "ON_DECK",
    },
    {
        "bay_id": "Bay 04",
        "row": 4,
        "tier": 82,
        "container_number": "CMAU-665123-0",
        "size_teu": 40,
        "weight_mt": 26.4,
        "cargo_name": "Frozen Poultry & Dairy Products",
        "is_reefer": True,
        "temperature_celsius": -16.2,  # Deviation!
        "temp_setpoint_celsius": -18.0,
        "temp_status": "WARNING_HIGH",
        "slot_position": "ON_DECK",
    },

    # Bay 04 - Under Deck (Hold #2)
    {
        "bay_id": "Bay 04",
        "row": 1,
        "tier": 02,
        "container_number": "TGHU-332110-9",
        "size_teu": 20,
        "weight_mt": 22.0,
        "cargo_name": "Machinery Heavy Spares",
        "is_reefer": False,
        "slot_position": "UNDER_DECK",
    },
    {
        "bay_id": "Bay 04",
        "row": 2,
        "tier": 02,
        "container_number": "ONEU-887412-3",
        "size_teu": 40,
        "weight_mt": 30.5,
        "cargo_name": "Automotive Transmission Parts",
        "is_reefer": False,
        "slot_position": "UNDER_DECK",
    },
    {
        "bay_id": "Bay 04",
        "row": 3,
        "tier": 02,
        "container_number": "TEMU-554109-1",
        "size_teu": 40,
        "weight_mt": 27.8,
        "cargo_name": "Consumer Electronics & Battery Packs",
        "is_reefer": False,
        "imdg_class": "Class 9 (Miscellaneous Dangerous Goods)",
        "slot_position": "UNDER_DECK",
    },
    {
        "bay_id": "Bay 04",
        "row": 4,
        "tier": 02,
        "container_number": "EGLU-221094-5",
        "size_teu": 20,
        "weight_mt": 19.4,
        "cargo_name": "Printed Circuit Boards & Hardware",
        "is_reefer": False,
        "slot_position": "UNDER_DECK",
    },
]


@router.get("/bays", response_model=Dict[str, Any])
async def get_container_bay_plan():
    """Retrieve 2D container bay plan slots, reefer temperature states, and IMDG segregation check."""
    return {
        "vessel_name": "MV Nusantara Pioneer",
        "voyage_number": "VOY-2026-JKT-SIN-001",
        "current_bay": "Bay 04 (Midship Cargo Hold #2)",
        "stability_metacentric_height_gm_meters": 1.48,  # Safe GM (> 0.15m IMO criteria)
        "stability_status": "STABLE_COMPLIANT",
        "total_containers_in_bay": len(BAY_SLOTS),
        "reefer_alarm_count": sum(1 for s in BAY_SLOTS if s.get("temp_status") == "WARNING_HIGH"),
        "imdg_dangerous_goods_count": sum(1 for s in BAY_SLOTS if s.get("imdg_class")),
        "slots": BAY_SLOTS,
    }

from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/spb", tags=["Digital SPB / Port Clearance & IMO FAL Forms"])

SPB_RECORDS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "spb_number": "SPB-IDJKT-2026-009182",
        "vessel_name": "MV Nusantara Pioneer",
        "call_sign": "YBD22",
        "imo_number": "IMO9812345",
        "flag": "Indonesia",
        "master_name": "Capt. Hendra Gunawan",
        "origin_port_name": "Pelabuhan Tanjung Priok (IDJKT)",
        "destination_port_name": "Port of Singapore (SGSIN)",
        "issued_at": "2026-11-10 08:30 WIB",
        "valid_until": "2026-11-11 08:30 WIB (24 Jam)",
        "syahbandar_authority": "Kantor Kesyahbandaran Utama Tanjung Priok",
        "qr_code_hash": "HUB-LA-SPB-2026-VERIFIED-9812345-JKT-SIN",
        "seaworthiness_status": "LAIK_LAUT_APPROVED",
        "fal_form_1_summary": "IMO FAL Form 1 General Declaration: Kapal kontainer 28.500 DWT dengan muatan umum, tidak membawa barang terlarang, kelaiklautan sah.",
        "fal_form_2_cargo": "IMO FAL Form 2 Cargo Declaration: 1.420 TEU / 18.500 MT (General Merchandise, Electronics, Garments).",
        "fal_form_3_stores": "IMO FAL Form 3 Ship's Stores: VLSFO 145 MT, MGO 35 MT, Fresh Water 180 MT, Provisions for 30 Days.",
        "fal_form_5_crew_count": 22,
    },
    {
        "id": 2,
        "spb_number": "SPB-IDSUB-2026-004412",
        "vessel_name": "MV Java Horizon",
        "call_sign": "YBF11",
        "imo_number": "IMO9843210",
        "flag": "Indonesia",
        "master_name": "Capt. Irwan Setiawan",
        "origin_port_name": "Pelabuhan Tanjung Perak (IDSUB)",
        "destination_port_name": "Pelabuhan Makassar (IDMAK)",
        "issued_at": "2026-11-09 14:15 WIB",
        "valid_until": "2026-11-10 14:15 WIB (24 Jam)",
        "syahbandar_authority": "Kantor Kesyahbandaran Utama Tanjung Perak",
        "qr_code_hash": "HUB-LA-SPB-2026-VERIFIED-9843210-SUB-MAK",
        "seaworthiness_status": "LAIK_LAUT_APPROVED",
        "fal_form_1_summary": "IMO FAL Form 1 General Declaration: Kapal peti kemas domestik rute ALKI II, sertifikat statutory lengkap.",
        "fal_form_2_cargo": "IMO FAL Form 2 Cargo Declaration: 1.650 TEU / 22.400 MT (Bahan Makanan Beku & Dry Cargo).",
        "fal_form_3_stores": "IMO FAL Form 3 Ship's Stores: VLSFO 190 MT, MGO 40 MT, Fresh Water 220 MT.",
        "fal_form_5_crew_count": 21,
    },
]


@router.get("/records", response_model=List[Dict[str, Any]])
async def list_spb_records():
    """Retrieve verified Digital SPB (Port Clearance) certificates."""
    return SPB_RECORDS


@router.get("/{spb_id}", response_model=Dict[str, Any])
async def get_spb_detail(spb_id: int):
    """Retrieve full Printable SPB Certificate details with IMO FAL forms."""
    rec = next((x for x in SPB_RECORDS if x["id"] == spb_id), None)
    if not rec:
        return SPB_RECORDS[0]
    return rec

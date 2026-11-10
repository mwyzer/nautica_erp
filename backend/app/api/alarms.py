from typing import List, Dict, Any
from fastapi import APIRouter

router = APIRouter(prefix="/alarms", tags=["Real-time Maritime Emergency & Alarms"])

LIVE_ALARMS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "title": "Krisis Bahan Bakar: ROB di Bawah Cadangan Aman",
        "description": "MV Barito Leader hanya memiliki sisa 14 MT VLSFO di Laut Jawa (kebutuhan minimum 45 MT). Risiko kehabisan daya mesin sebelum tiba di Tanjung Perak.",
        "severity": "CRITICAL",
        "category": "BUNKER_SHORTAGE",
        "vessel_name": "MV Barito Leader",
        "timestamp": "10 Menit lalu",
        "acknowledged": False,
        "recommended_action": "Bunker barge darurat segera diarahkan ke koordinat anchoring Gresik / Surabaya Outer Bar.",
    },
    {
        "id": 2,
        "title": "Cacat Kritis Kemudi SOLAS II-1: Pemblokir Clearance",
        "description": "MT Samudra Jaya mendeteksi kebocoran seal hidrolik aktuator kemudi (*Steering Gear*) di Balikpapan. Kelaiklautan ditahan syahbandar.",
        "severity": "CRITICAL",
        "category": "MACHINERY_TRIP",
        "vessel_name": "MT Samudra Jaya",
        "timestamp": "35 Menit lalu",
        "acknowledged": False,
        "recommended_action": "Shore technician PT PAL diberangkatkan untuk overhaul ram seal sebelum pengajuan SPB.",
    },
    {
        "id": 3,
        "title": "Peringatan Dini Gelombang Tinggi ALKI II",
        "description": "BMKG Maritim memprediksi gelombang mencapai 2.8m di Selat Makassar bagian utara. Kapal MT Celebes Gas diimbau mengurangi kecepatan ke 11 kts.",
        "severity": "WARNING",
        "category": "TYPHOON_WEATHER",
        "vessel_name": "MT Celebes Gas",
        "timestamp": "1 Jam lalu",
        "acknowledged": True,
        "recommended_action": "Aktifkan weather-routing waypoint alternatif ke arah pesisir barat Sulawesi.",
    },
    {
        "id": 4,
        "title": "Sertifikat STCW Master Kedaluwarsa",
        "description": "Capt. Agus Pratama (MV Barito Leader) memiliki sertifikat CoC ANT-I yang kedaluwarsa. Menolak clearance otomatis AI Port Clearance.",
        "severity": "WARNING",
        "category": "STCW_BLOCKER",
        "vessel_name": "MV Barito Leader",
        "timestamp": "2 Jam lalu",
        "acknowledged": True,
        "recommended_action": "Tugaskan nakhoda pengganti dari crew pool standby (Capt. Eko Prasetyo).",
    },
]


@router.get("/live", response_model=List[Dict[str, Any]])
async def get_live_alarms():
    """Retrieve real-time emergency events, distress warnings, and operational alarms."""
    return LIVE_ALARMS


@router.post("/{alarm_id}/ack")
async def acknowledge_alarm(alarm_id: int):
    """Mark an alarm as acknowledged by superintendent."""
    for a in LIVE_ALARMS:
        if a["id"] == alarm_id:
            a["acknowledged"] = True
            return {"status": "success", "alarm": a}
    return {"status": "not_found"}

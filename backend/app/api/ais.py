from typing import List, Dict, Any
from fastapi import APIRouter
from datetime import datetime, timezone

router = APIRouter(prefix="/ais", tags=["AIS & Maritime GIS Tracking"])

# Sea Lane Corridors across Indonesian Archipelago & Southeast Asia
SEA_LANES = [
    {
        "id": "ALKI-1",
        "name": "ALKI I (Selat Sunda — Selat Karimata — Laut Natuna)",
        "coordinates": [
            [-5.92, 105.85],  # Sunda Strait
            [-3.10, 106.80],  # Bangka Belitung East
            [-0.50, 107.50],  # Karimata
            [2.50, 108.50],   # Natuna Sea
        ],
        "type": "ARCHIPELAGIC_SEA_LANE",
        "color": "#00e5ff",
    },
    {
        "id": "ALKI-2",
        "name": "ALKI II (Selat Lombok — Selat Makassar — Laut Sulawesi)",
        "coordinates": [
            [-8.75, 115.75],  # Lombok Strait
            [-4.50, 117.50],  # South Makassar Strait
            [-1.25, 117.20],  # Balikpapan Offing
            [1.00, 119.50],   # North Makassar Strait
            [3.50, 122.00],   # Celebes Sea
        ],
        "type": "ARCHIPELAGIC_SEA_LANE",
        "color": "#00b4d8",
    },
    {
        "id": "MALACCA-TSS",
        "name": "Malacca Strait Traffic Separation Scheme (TSS)",
        "coordinates": [
            [5.50, 95.50],    # Northern Entrance (Aceh)
            [3.00, 100.50],   # Port Klang / Dumai
            [1.25, 103.80],   # Singapore Strait
            [1.05, 104.25],   # Horsburgh Lighthouse
        ],
        "type": "TSS_CORRIDOR",
        "color": "#10b981",
    },
    {
        "id": "JAVA-SEA-TRUNK",
        "name": "Jalur Utama Laut Jawa (Jakarta — Surabaya)",
        "coordinates": [
            [-6.10, 106.88],  # Tanjung Priok
            [-5.80, 109.50],  # Laut Jawa Off Semarang
            [-6.70, 112.50],  # Menuju Selat Madura
            [-7.20, 112.74],  # Tanjung Perak
        ],
        "type": "DOMESTIC_TRUNK",
        "color": "#f59e0b",
    },
]

# Real-time AIS Vessel Telemetry State for Entire Fleet (7 Vessels)
LIVE_VESSELS = [
    {
        "vessel_id": 1,
        "imo_number": "IMO9812345",
        "mmsi": "525019842",
        "call_sign": "YBD22",
        "name": "MV Nusantara Pioneer",
        "vessel_type": "CONTAINER",
        "flag": "ID",
        "lat": -1.85,
        "lng": 105.45,  # Bangka Strait en route to Singapore
        "heading": 335,
        "sog_knots": 14.8,
        "cog_degrees": 332.0,
        "nav_status": "Under way using engine",
        "destination_port": "SGSIN (Singapore)",
        "eta": "2026-11-12T08:00:00Z",
        "departure_port": "IDJKT (Tanjung Priok)",
        "cargo": "18,500 MT / 1,420 TEU",
        "draft_meters": 11.2,
        "main_engine_rpm": 92,
        "fuel_burn_mt_day": 23.8,
        "weather": {
            "sea_state": "Slight to Moderate",
            "wave_height_m": 1.2,
            "wind_knots": 14,
            "wind_dir": "SE (135°)",
            "air_temp_c": 29.5,
            "barometer_hpa": 1011.2,
        },
    },
    {
        "vessel_id": 2,
        "imo_number": "IMO9754321",
        "mmsi": "525008914",
        "call_sign": "YBC44",
        "name": "MV Barito Leader",
        "vessel_type": "BULK_CARRIER",
        "flag": "ID",
        "lat": -5.35,
        "lng": 113.80,  # Central Java Sea heading to Surabaya
        "heading": 195,
        "sog_knots": 12.1,
        "cog_degrees": 198.5,
        "nav_status": "Under way using engine",
        "destination_port": "IDSUB (Tanjung Perak)",
        "eta": "2026-11-11T14:30:00Z",
        "departure_port": "IDBDJ (Banjarmasin)",
        "cargo": "40,000 MT (Coal in Bulk)",
        "draft_meters": 12.8,
        "main_engine_rpm": 84,
        "fuel_burn_mt_day": 27.5,
        "weather": {
            "sea_state": "Smooth to Slight",
            "wave_height_m": 0.8,
            "wind_knots": 9,
            "wind_dir": "E (090°)",
            "air_temp_c": 31.0,
            "barometer_hpa": 1012.0,
        },
    },
    {
        "vessel_id": 3,
        "imo_number": "IMO9654987",
        "mmsi": "525091726",
        "call_sign": "YBE88",
        "name": "MT Samudra Jaya",
        "vessel_type": "TANKER",
        "flag": "ID",
        "lat": -1.26,
        "lng": 116.83,  # Balikpapan Anchorage / Outer Roadstead
        "heading": 85,
        "sog_knots": 0.1,
        "cog_degrees": 88.0,
        "nav_status": "At anchor",
        "destination_port": "IDJKT (Tanjung Priok)",
        "eta": "2026-11-15T18:00:00Z",
        "departure_port": "IDBPN (Balikpapan)",
        "cargo": "35,000 MT (Clean Petroleum Products)",
        "draft_meters": 9.5,
        "main_engine_rpm": 0,
        "fuel_burn_mt_day": 3.2,
        "weather": {
            "sea_state": "Calm (Roadstead)",
            "wave_height_m": 0.3,
            "wind_knots": 5,
            "wind_dir": "NE (045°)",
            "air_temp_c": 30.2,
            "barometer_hpa": 1010.8,
        },
    },
    {
        "vessel_id": 4,
        "imo_number": "IMO9843210",
        "mmsi": "525044129",
        "call_sign": "YBF11",
        "name": "MV Java Horizon",
        "vessel_type": "CONTAINER",
        "flag": "ID",
        "lat": -6.40,
        "lng": 116.20,  # Java Sea East heading to Makassar
        "heading": 78,
        "sog_knots": 16.2,
        "cog_degrees": 76.5,
        "nav_status": "Under way using engine",
        "destination_port": "IDMAK (Makassar)",
        "eta": "2026-11-11T20:00:00Z",
        "departure_port": "IDSUB (Tanjung Perak)",
        "cargo": "22,400 MT / 1,650 TEU",
        "draft_meters": 11.8,
        "main_engine_rpm": 96,
        "fuel_burn_mt_day": 26.8,
        "weather": {
            "sea_state": "Moderate",
            "wave_height_m": 1.4,
            "wind_knots": 16,
            "wind_dir": "E (085°)",
            "air_temp_c": 28.8,
            "barometer_hpa": 1010.5,
        },
    },
    {
        "vessel_id": 5,
        "imo_number": "IMO9789012",
        "mmsi": "525055318",
        "call_sign": "YBG55",
        "name": "MT Celebes Gas",
        "vessel_type": "TANKER",
        "flag": "ID",
        "lat": -3.20,
        "lng": 118.90,  # Makassar Strait (ALKI II) heading North
        "heading": 15,
        "sog_knots": 13.8,
        "cog_degrees": 12.0,
        "nav_status": "Under way using engine",
        "destination_port": "IDBIT (Bitung)",
        "eta": "2026-11-13T10:00:00Z",
        "departure_port": "IDMAK (Makassar)",
        "cargo": "14,200 MT (LPG Cryogenic Liquid)",
        "draft_meters": 8.8,
        "main_engine_rpm": 88,
        "fuel_burn_mt_day": 20.5,
        "weather": {
            "sea_state": "Slight",
            "wave_height_m": 0.9,
            "wind_knots": 11,
            "wind_dir": "SE (140°)",
            "air_temp_c": 30.5,
            "barometer_hpa": 1011.8,
        },
    },
    {
        "vessel_id": 6,
        "imo_number": "IMO9621456",
        "mmsi": "525066421",
        "call_sign": "YBH66",
        "name": "MV Borneo Express",
        "vessel_type": "BULK_CARRIER",
        "flag": "ID",
        "lat": -2.10,
        "lng": 108.80,  # Karimata Strait (ALKI I) Southbound
        "heading": 188,
        "sog_knots": 13.4,
        "cog_degrees": 185.0,
        "nav_status": "Under way using engine",
        "destination_port": "IDCBN (Cirebon)",
        "eta": "2026-11-12T16:00:00Z",
        "departure_port": "IDPNK (Pontianak)",
        "cargo": "58,000 MT (Bauxite Ore in Bulk)",
        "draft_meters": 13.2,
        "main_engine_rpm": 86,
        "fuel_burn_mt_day": 30.2,
        "weather": {
            "sea_state": "Moderate",
            "wave_height_m": 1.3,
            "wind_knots": 15,
            "wind_dir": "S (175°)",
            "air_temp_c": 29.2,
            "barometer_hpa": 1011.0,
        },
    },
    {
        "vessel_id": 7,
        "imo_number": "IMO9512389",
        "mmsi": "525077532",
        "call_sign": "YBJ77",
        "name": "TB Bima Perkasa 08",
        "vessel_type": "TUG_BARGE",
        "flag": "ID",
        "lat": 1.15,
        "lng": 103.95,  # Singapore Strait / Batam Anchorage
        "heading": 280,
        "sog_knots": 9.2,
        "cog_degrees": 278.0,
        "nav_status": "Under way using engine",
        "destination_port": "MYTPP (Tanjung Pelepas)",
        "eta": "2026-11-10T18:00:00Z",
        "departure_port": "IDBTM (Batam)",
        "cargo": "3,200 MT (Fabricated Steel Deck)",
        "draft_meters": 4.5,
        "main_engine_rpm": 120,
        "fuel_burn_mt_day": 8.2,
        "weather": {
            "sea_state": "Smooth (Strait)",
            "wave_height_m": 0.5,
            "wind_knots": 7,
            "wind_dir": "NE (050°)",
            "air_temp_c": 31.2,
            "barometer_hpa": 1011.5,
        },
    },
]


@router.get("/live", response_model=List[Dict[str, Any]])
async def get_live_ais_fleet():
    """Retrieve real-time AIS dynamic position reports for all monitored vessels."""
    return LIVE_VESSELS


@router.get("/sea-lanes", response_model=List[Dict[str, Any]])
async def get_sea_lanes():
    """Retrieve designated archipelagic sea lanes (ALKI) and traffic separation corridors."""
    return SEA_LANES


@router.post("/simulate-tick")
async def simulate_ais_movement():
    """Advances dynamic vessels along their navigational vectors for live demo simulation."""
    # 1. Move MV Nusantara Pioneer northwest slightly
    LIVE_VESSELS[0]["lat"] = round(LIVE_VESSELS[0]["lat"] + 0.04, 4)
    LIVE_VESSELS[0]["lng"] = round(LIVE_VESSELS[0]["lng"] - 0.02, 4)

    # 2. Move MV Barito Leader south towards Madura Strait
    LIVE_VESSELS[1]["lat"] = round(LIVE_VESSELS[1]["lat"] - 0.03, 4)
    LIVE_VESSELS[1]["lng"] = round(LIVE_VESSELS[1]["lng"] - 0.015, 4)

    # 4. Move MV Java Horizon east towards Makassar
    LIVE_VESSELS[3]["lat"] = round(LIVE_VESSELS[3]["lat"] + 0.01, 4)
    LIVE_VESSELS[3]["lng"] = round(LIVE_VESSELS[3]["lng"] + 0.035, 4)

    # 5. Move MT Celebes Gas north along ALKI II
    LIVE_VESSELS[4]["lat"] = round(LIVE_VESSELS[4]["lat"] + 0.04, 4)
    LIVE_VESSELS[4]["lng"] = round(LIVE_VESSELS[4]["lng"] + 0.01, 4)

    # 6. Move MV Borneo Express south along Karimata
    LIVE_VESSELS[5]["lat"] = round(LIVE_VESSELS[5]["lat"] - 0.035, 4)

    return {
        "status": "success",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "vessels": LIVE_VESSELS,
    }

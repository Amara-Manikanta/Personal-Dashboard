import json
import os
import shutil
from datetime import datetime, timezone

WORKSPACE_DIR = '/Users/manikantaamara/Desktop/Antigravity/Novels_dashboard'
UPLOADS_COLL_DIR = os.path.join(WORKSPACE_DIR, 'uploads', 'collection')
STAMPS_DIR = os.path.join(WORKSPACE_DIR, 'stamps')
NEW_CROPS_DIR = '/Users/manikantaamara/.gemini/antigravity/brain/3ac39f17-1efb-4a3a-b6c8-6087abb1ed87/scratch/new_perfect_crops'
DATA_FILE = os.path.join(WORKSPACE_DIR, 'data', 'collectibles.json')
WEB_DATA_FILE = os.path.join(WORKSPACE_DIR, 'web', 'data', 'collectibles.json')

os.makedirs(UPLOADS_COLL_DIR, exist_ok=True)
os.makedirs(STAMPS_DIR, exist_ok=True)

NEW_STAMPS_METADATA = {
    "IMG_0125": {
        "name": "India – Official Service: Ashoka Lion Capital (5 nP, 1957)",
        "year": "1957",
        "denomination": "5 nP",
        "filename": "India_Official_Service_Lion_Capital_5nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government of India Service decimal definitive stamp in green, featuring the Sarnath Lion Capital of Ashoka with 'SERVICE' and 'शासकीय' security prints. Denomination '5 भारत 5' (Scott #O165)."
    },
    "IMG_0126": {
        "name": "India – Decimal Coinage Map Series: 75 naye Paise (1957)",
        "year": "1957",
        "denomination": "75 nP",
        "filename": "India_Map_Decimal_Series_75nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-value definitive stamp from the 1957 Decimal Coinage series depicting the map of the Republic of India surrounded by sea, printed in deep purple. Inscribed 'POSTAGE', 'न.पै. 75 n.P.', 'INDIA' (Scott #288, SG #386)."
    },
    "IMG_0127": {
        "name": "India – Official Service: Ashoka Lion Capital (1 Anna, 1950)",
        "year": "1950",
        "denomination": "1 Anna",
        "filename": "India_Official_Service_Lion_Capital_1Anna_Green_1950_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service definitive postage stamp featuring the Ashoka Lion Capital printed in rich dark green, inscribed 'SERVICE', 'POSTAGE 1 A. INDIA आना' (Scott #O141)."
    },
    "IMG_0128": {
        "name": "India – Official Service: Ashoka Lion Capital Used (5 nP, 1957)",
        "year": "1957",
        "denomination": "5 nP",
        "filename": "India_Official_Service_Lion_Capital_5nP_Used_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Postally used official Government Service stamp featuring the Ashoka Lion Capital in green with authentic black circular date cancellation. Inscribed '5 भारत 5', 'SERVICE / शासकीय'."
    },
    "IMG_0129": {
        "name": "India – Official Service: Ashoka Lion Capital (30 P, 1968)",
        "year": "1968",
        "denomination": "30 P",
        "filename": "India_Official_Service_Lion_Capital_30P_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government Service definitive stamp printed in royal blue on watermark paper, featuring the Ashoka Lion Capital, inscribed '30 भारत 30', 'INDIA SERVICE', and 'शासकीय'."
    },
    "IMG_0130": {
        "name": "India – Official Service: Ashoka Lion Capital (50 P, 1968)",
        "year": "1968",
        "denomination": "50 P",
        "filename": "India_Official_Service_Lion_Capital_50P_Brown_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service definitive stamp in reddish-brown featuring the Ashoka Lion Capital with security overprint 'SERVICE' and 'शासकीय'. Denomination '50 भारत 50'."
    },
    "IMG_0131": {
        "name": "India – Official Service: Ashoka Lion Capital (3 Pies, 1950)",
        "year": "1950",
        "denomination": "3 Pies",
        "filename": "India_Official_Service_Lion_Capital_3Pies_1950_Stamp_Cropped_Enhanced.jpg",
        "notes": "Smallest denomination of the 1950 Official Service series, depicting the Ashoka Lion Capital printed in dark slate blue/indigo. Inscribed 'SERVICE POSTAGE', '3 Ps. INDIA ३ पाई'."
    },
    "IMG_0132": {
        "name": "India – Decimal Coinage Map Series: 5 naye Paise (1957)",
        "year": "1957",
        "denomination": "5 nP",
        "filename": "India_Map_Decimal_Series_5nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp from the historic 1957 Decimal Currency issue depicting the political map of India in bright emerald green. Inscribed 'POSTAGE', 'न.पै. 5 n.P.', 'INDIA' (Scott #282, SG #380)."
    },
    "IMG_0133": {
        "name": "India – Official Service: 13 nP Surcharge on 1½ Annas (1957)",
        "year": "1957",
        "denomination": "13 nP",
        "filename": "India_Official_Service_Lion_Capital_13nP_Overprint_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historic decimal transition provisional surcharge. During the changeover from annas to naye paise in 1957, existing 1½ Annas red Ashoka Lion Capital service stamps were officially overprinted '13 N.P. / १३ न.पै.' at India Security Press (Scott #O169). Postally used."
    },
    "IMG_0134": {
        "name": "India – Official Service: Ashoka Lion Capital (1 Re, 1968)",
        "year": "1968",
        "denomination": "1 Re",
        "filename": "India_Official_Service_Lion_Capital_1Re_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "One Rupee official Government Service stamp featuring the Ashoka Lion Capital printed in deep slate grey/black. Inscribed '1 भारत 1 Re', 'INDIA SERVICE', and 'सत्यमेव जयते शासकीय'."
    },
    "IMG_0135": {
        "name": "India – Official Service: Ashoka Lion Capital (25 P, 1968)",
        "year": "1968",
        "denomination": "25 P",
        "filename": "India_Official_Service_Lion_Capital_25P_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government Service definitive stamp printed in radiant carmine-rose, featuring the Ashoka Lion Capital, inscribed '25 भारत 25', 'INDIA SERVICE शासकीय', with circular cancellation."
    },
    "IMG_0136": {
        "name": "India – Official Service: Ashoka Lion Capital (20 P, 1968)",
        "year": "1968",
        "denomination": "20 P",
        "filename": "India_Official_Service_Lion_Capital_20P_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service stamp in vivid orange-vermilion depicting the Ashoka Lion Capital, inscribed '20 भारत 20', 'INDIA SERVICE', 'शासकीय'."
    },
    "IMG_0137": {
        "name": "India – Official Service: Ashoka Lion Capital (15 nP, 1957)",
        "year": "1957",
        "denomination": "15 nP",
        "filename": "India_Official_Service_Lion_Capital_15nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Decimal definitive official service issue in deep plum violet, inscribed '15 भारत 15', 'INDIA SERVICE', and 'शासकीय'."
    },
    "IMG_0138": {
        "name": "India – Decimal Coinage Map Series: 15 naye Paise (1957)",
        "year": "1957",
        "denomination": "15 nP",
        "filename": "India_Map_Decimal_Series_15nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp from the 1957 Decimal Currency issue depicting the map of India in ultramarine blue. Inscribed 'POSTAGE', 'न.पै. 15 n.P.', 'INDIA' (Scott #285, SG #383)."
    },
    "IMG_0139": {
        "name": "India – Decimal Coinage Map Series: 10 naye Paise (1957)",
        "year": "1957",
        "denomination": "10 nP",
        "filename": "India_Map_Decimal_Series_10nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Decimal Coinage series stamp in rich olive/forest green depicting the map of India. Inscribed 'POSTAGE', 'न.पै. 10 n.P.', 'INDIA' along the right border (Scott #287, SG #385)."
    },
    "IMG_0140": {
        "name": "India – Decimal Coinage Map Series: 2 naye Paise (1957)",
        "year": "1957",
        "denomination": "2 nP",
        "filename": "India_Map_Decimal_Series_2nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Decimal Coinage series stamp in warm ochre-brown depicting the map of India, issued April 1, 1957. Inscribed 'POSTAGE', 'न.पै. 2 n.P.', 'INDIA' (Scott #280, SG #377)."
    },
    "IMG_0141": {
        "name": "India – Decimal Coinage Map Series: 25 naye Paise (1957)",
        "year": "1957",
        "denomination": "25 nP",
        "filename": "India_Map_Decimal_Series_25nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp depicting the map of India in deep cobalt blue. Inscribed 'POSTAGE', 'न.पै. 25 n.P.', 'INDIA' (Scott #286, SG #384). Postally used with corner strike."
    },
    "IMG_0142": {
        "name": "India – Decimal Coinage Map Series: 20 naye Paise (1957)",
        "year": "1957",
        "denomination": "20 nP",
        "filename": "India_Map_Decimal_Series_20nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp depicting the map of India in bright cyan/sky blue. Inscribed 'POSTAGE', 'न.पै. 20 n.P.', 'INDIA'. Postally used."
    },
    "IMG_0143": {
        "name": "India – Decimal Coinage Map Series: 50 naye Paise (1957)",
        "year": "1957",
        "denomination": "50 nP",
        "filename": "India_Map_Decimal_Series_50nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp depicting the map of India in bright orange, inscribed 'POSTAGE', 'न.पै. 50 n.P.', 'INDIA', with authentic postal cancellation strike."
    },
    "IMG_0144": {
        "name": "India – Official Service: Ashoka Lion Capital (1 Anna Red, 1950)",
        "year": "1950",
        "denomination": "1 Anna",
        "filename": "India_Official_Service_Lion_Capital_1Anna_Red_1950_Stamp_Cropped_Enhanced.jpg",
        "notes": "Early official Service definitive stamp in deep crimson red depicting the Ashoka Lion Capital with 'SERVICE' banner. Inscribed 'POSTAGE 1 A. INDIA आना'."
    },
    "IMG_0145": {
        "name": "India – Official Service: Ashoka Lion Capital (1 Rupee Wide Margin, 1950)",
        "year": "1950",
        "denomination": "1 Rupee",
        "filename": "India_Official_Service_Lion_Capital_1Rupee_WideMargin_1950_Stamp_Cropped_Enhanced.jpg",
        "notes": "Classic high-value 1 Rupee official Service definitive stamp featuring the Ashoka Lion Capital flanked by classical pillars in purple-violet with wide sheet margins. Inscribed 'SERVICE POSTAGE', '1 R. INDIA १ रु.'."
    },
    "IMG_0146": {
        "name": "India – Centenary of Indian Railways: Steam Locomotive WP Class (1953)",
        "year": "1953",
        "denomination": "8 Annas",
        "filename": "India_Railways_Centenary_Chittaranjan_Steam_Locomotive_8Annas_1953_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historic commemorative stamp issued on April 16, 1953, celebrating the Centenary (1853-1953) of Indian Railways. Depicts a modern indigenous broad-gauge WP-class steam locomotive manufactured at Chittaranjan Locomotive Works (CLW), West Bengal. Printed in deep cobalt blue, inscribed 'POSTAGE 8 As. चित्तरंजन INDIA आना' (Scott #244, SG #345). Authentic cancellation."
    },
    "IMG_0147": {
        "name": "India – Official Service: Ashoka Lion Capital (10 nP Green, 1957)",
        "year": "1957",
        "denomination": "10 nP",
        "filename": "India_Official_Service_Lion_Capital_10nP_Green_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government of India Service stamp in forest green, denomination '10 भारत 10', featuring the Ashoka Lion Capital with 'SERVICE' and 'शासकीय' security marks."
    },
    "IMG_0148": {
        "name": "India – Official Service: Ashoka Lion Capital (1 Anna Blue, 1950)",
        "year": "1950",
        "denomination": "1 Anna",
        "filename": "India_Official_Service_Lion_Capital_1Anna_Blue_1950_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service definitive stamp in deep teal-blue depicting the Ashoka Lion Capital. Inscribed 'SERVICE POSTAGE', '1 A. INDIA आना' (Scott #O141)."
    },
    "IMG_0149": {
        "name": "India – Official Service: Ashoka Lion Capital (35 P, 1968)",
        "year": "1968",
        "denomination": "35 P",
        "filename": "India_Official_Service_Lion_Capital_35P_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service definitive stamp in royal purple depicting the Ashoka Lion Capital, inscribed '35 भारत 35', 'INDIA SERVICE शासकीय'."
    },
    "IMG_0150": {
        "name": "India – Official Service: Ashoka Lion Capital (1 nP, 1957)",
        "year": "1957",
        "denomination": "1 nP",
        "filename": "India_Official_Service_Lion_Capital_1nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government Service decimal definitive stamp in slate black/grey, inscribed 'SERVICE POSTAGE', '1 n.P. INDIA १ न.पै.'."
    },
    "IMG_0151": {
        "name": "India – Official Service: Ashoka Lion Capital (2 nP Blue, 1957)",
        "year": "1957",
        "denomination": "2 nP",
        "filename": "India_Official_Service_Lion_Capital_2nP_Blue_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service stamp in navy blue depicting the Ashoka Lion Capital, inscribed '2 भारत 2', 'INDIA SERVICE शासकीय'."
    },
    "IMG_0152": {
        "name": "India – Official Service: Ashoka Lion Capital (50 nP Brown, 1958)",
        "year": "1958",
        "denomination": "50 nP",
        "filename": "India_Official_Service_Lion_Capital_50nP_Service_1958_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service definitive stamp in brown depicting the Ashoka Lion Capital, inscribed 'SERVICE POSTAGE', '50 N.P. INDIA ५० न.पै.'."
    }
}

# 1. Copy images
print("Copying cropped images to uploads/collection/ and stamps/...")
for img_key, meta in NEW_STAMPS_METADATA.items():
    src_crop = os.path.join(NEW_CROPS_DIR, f"crop_{img_key}.jpeg")
    dst_coll = os.path.join(UPLOADS_COLL_DIR, meta["filename"])
    dst_stamps = os.path.join(STAMPS_DIR, meta["filename"])
    if os.path.exists(src_crop):
        shutil.copy2(src_crop, dst_coll)
        shutil.copy2(src_crop, dst_stamps)
        print(f"Copied {img_key} -> {meta['filename']}")
    else:
        print(f"Warning: {src_crop} not found!")

# 2. Add to collectibles.json
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    collectibles = json.load(f)

existing_urls = set()
for item in collectibles:
    for img in item.get('images', []):
        existing_urls.add(img.get('url'))

now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)
new_items = []

for idx, (img_key, meta) in enumerate(NEW_STAMPS_METADATA.items()):
    rel_url = f"uploads/collection/{meta['filename']}"
    if rel_url in existing_urls:
        continue
        
    new_id = f"{now_ms}_stamp_{idx + 200}"
    item_record = {
        "id": new_id,
        "type": "stamp",
        "category": "Stamps",
        "name": meta["name"],
        "country": "India",
        "year": meta["year"],
        "denomination": meta["denomination"],
        "material": "Paper",
        "coinKind": "",
        "coinStatus": "",
        "quantity": 1,
        "dateCollected": "",
        "notes": meta["notes"],
        "images": [
            {
                "url": rel_url,
                "kind": "original"
            }
        ],
        "addedAt": datetime.now(timezone.utc).isoformat()
    }
    new_items.append(item_record)

print(f"Adding {len(new_items)} new stamp items...")
all_collectibles = new_items + collectibles

with open(DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(all_collectibles, f, indent=2, ensure_ascii=False)
print(f"Saved {len(all_collectibles)} total items to {DATA_FILE}")

with open(WEB_DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(all_collectibles, f, indent=2, ensure_ascii=False)
print(f"Synced {len(all_collectibles)} total items to {WEB_DATA_FILE}")

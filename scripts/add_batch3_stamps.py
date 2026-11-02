import json
import os
import shutil
import time
from datetime import datetime, timezone

WORKSPACE_DIR = '/Users/manikantaamara/Desktop/Antigravity/Novels_dashboard'
UPLOADS_COLL_DIR = os.path.join(WORKSPACE_DIR, 'uploads', 'collection')
STAMPS_DIR = os.path.join(WORKSPACE_DIR, 'stamps')
CROPS_DIR = '/Users/manikantaamara/.gemini/antigravity/brain/3ac39f17-1efb-4a3a-b6c8-6087abb1ed87/scratch/batch3_crops'
DATA_FILE = os.path.join(WORKSPACE_DIR, 'data', 'collectibles.json')
WEB_DATA_FILE = os.path.join(WORKSPACE_DIR, 'web', 'data', 'collectibles.json')

os.makedirs(UPLOADS_COLL_DIR, exist_ok=True)
os.makedirs(STAMPS_DIR, exist_ok=True)

BATCH3_METADATA = {
    "crop_IMG_0153.jpeg": {
        "name": "India – Official Service: Ashoka Lion Capital (100 P / 1 Re, 1968)",
        "year": "1968",
        "denomination": "100 P",
        "filename": "India_Official_Service_Lion_Capital_100P_Perf_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government of India Service definitive stamp in deep purple, featuring the Ashoka Lion Capital, inscribed '100 भारत 100', 'INDIA SERVICE', 'शासकीय'. Postally used with authentic circular cancellation."
    },
    "crop_IMG_0154.jpeg": {
        "name": "India – Mahatma Gandhi Birth Centenary: Portrait (35 P, 1969)",
        "year": "1969",
        "denomination": "35 P",
        "filename": "India_Mahatma_Gandhi_Portrait_35P_1969_Stamp_Cropped_Enhanced.jpg",
        "notes": "Mahatma Gandhi Birth Centenary definitive stamp depicting Gandhi in three-quarter profile in sepia brown, inscribed 'भारत INDIA 35', 'गांधीजी GANDHIJI' (Scott #496). Authentic postal cancellation."
    },
    "crop_IMG_0155.jpeg": {
        "name": "India – Official Service: Ashoka Lion Capital (30 P, 1968)",
        "year": "1968",
        "denomination": "30 P",
        "filename": "India_Official_Service_Lion_Capital_30P_Blue_Used_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Postally used official Government Service definitive stamp printed in royal blue on watermark paper, featuring the Ashoka Lion Capital, inscribed '30 भारत 30', 'INDIA SERVICE', and 'शासकीय'. Authentic circular date cancel."
    },
    "crop_IMG_0156.jpeg": {
        "name": "India – Official Service: Ashoka Lion Capital (20 P, 1968)",
        "year": "1968",
        "denomination": "20 P",
        "filename": "India_Official_Service_Lion_Capital_20P_Used_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Service stamp in terracotta orange-brown depicting the Ashoka Lion Capital, inscribed '20 भारत 20', 'INDIA SERVICE', 'शासकीय'. Authentic wavy line postal cancellation."
    },
    "crop_IMG_0157.jpeg": {
        "name": "India – Five Year Plan: Heavy Tractor / Land Reclamation (3 Annas, 1955)",
        "year": "1955",
        "denomination": "3 Annas",
        "filename": "India_Five_Year_Plan_Tractor_Bulldozer_3Annas_1955_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historic First Five Year Plan definitive series stamp celebrating modern mechanized agriculture and land reclamation. Depicts a heavy crawler tractor / bulldozer clearing land in deep purple, inscribed 'POSTAGE 3 As. INDIA ३ आना' (Scott #254, SG #356)."
    },
    "crop_IMG_0158.jpeg": {
        "name": "India – Official Service: Ashoka Lion Capital High Value (200 P / Rs 2, 1975)",
        "year": "1975",
        "denomination": "200 P",
        "filename": "India_Official_Service_Lion_Capital_200P_Rs2_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-value official Government Service definitive stamp in radiant carmine-red, featuring the Ashoka Lion Capital flanked by classical pillars, inscribed '200 भारत 200', 'INDIA SERVICE शासकीय'. Authentic postal date cancel."
    }
}

# 1. Copy files to destination directories
for crop_file, meta in BATCH3_METADATA.items():
    src_path = os.path.join(CROPS_DIR, crop_file)
    dst_uploads = os.path.join(UPLOADS_COLL_DIR, meta["filename"])
    dst_stamps = os.path.join(STAMPS_DIR, meta["filename"])
    
    shutil.copy2(src_path, dst_uploads)
    shutil.copy2(src_path, dst_stamps)
    print(f"Copied {crop_file} -> {meta['filename']}")

# 2. Update collectibles.json
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    collectibles = json.load(f)

existing_urls = {img["url"] for item in collectibles for img in item.get("images", [])}
now_ms = int(time.time() * 1000)

new_items = []
for idx, (crop_file, meta) in enumerate(BATCH3_METADATA.items()):
    rel_url = f"uploads/collection/{meta['filename']}"
    if rel_url in existing_urls:
        print(f"Skipping {rel_url}, already exists.")
        continue
        
    new_id = f"{now_ms}_stamp_{idx + 300}"
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

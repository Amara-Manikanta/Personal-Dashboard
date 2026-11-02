import json
import os
import shutil
import glob
from datetime import datetime, timezone
from PIL import Image

WORKSPACE_DIR = '/Users/manikantaamara/Desktop/Antigravity/Novels_dashboard'
UPLOADS_COLL_DIR = os.path.join(WORKSPACE_DIR, 'uploads', 'collection')
PERFECT_CROPS_DIR = '/Users/manikantaamara/.gemini/antigravity/brain/3ac39f17-1efb-4a3a-b6c8-6087abb1ed87/scratch/perfect_crops'
DATA_FILE = os.path.join(WORKSPACE_DIR, 'data', 'collectibles.json')
WEB_DATA_FILE = os.path.join(WORKSPACE_DIR, 'web', 'data', 'collectibles.json')

os.makedirs(UPLOADS_COLL_DIR, exist_ok=True)

# Complete catalogue mapping for IMG_0062 to IMG_0124
STAMPS_METADATA = {
    "IMG_0062": {
        "name": "India – Wildlife Week: Indian Rhinoceros / Rhino Postage Stamp (1962)",
        "year": "1962",
        "denomination": "15 nP",
        "filename": "India_Rhino_15nP_1962_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative postage stamp issued by India Post on October 1, 1962, marking Wildlife Week to promote preservation of endangered Indian wildlife. Features a detailed depiction of the Indian Rhinoceros (Rhinoceros unicornis / Greater One-horned Rhino) amidst tall grassland, with inscriptions '15 न. पै. nP', 'RHINO', 'INDIA POSTAGE', and imprint 'INDIA SECURITY PRESS'. Printed via photogravure by India Security Press, Nashik (Perforation 13½ x 14, Scott #362, SG #460). Postally used with authentic circular cancellation."
    },
    "IMG_0063": {
        "name": "India – Family Planning: A Small Family is a Happy Family (1977)",
        "year": "1977",
        "denomination": "60 P",
        "filename": "India_Family_Planning_Small_Family_60P_1977_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive postage stamp issued by India Post in the 1970s promoting the national family planning programme. Features the iconic red inverted triangle with line art depiction of a nuclear family of four (parents, daughter, and son), captioned 'छोटा परिवार सुखी परिवार / A SMALL FAMILY IS A HAPPY FAMILY', inscribed 'भारत INDIA' and denomination '60'. Postally used with postal cancel mark."
    },
    "IMG_0064": {
        "name": "India – Children's Day (Bal Din): Girl Reading Book (1957)",
        "year": "1957",
        "denomination": "15 nP",
        "filename": "India_Childrens_Day_Bal_Din_Girl_Reading_15nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative postage stamp issued on November 14, 1957 (Nehru's Birthday / National Children's Day). Features a young girl absorbed in reading a book, inscribed 'बाल दिन 14-11-57', 'INDIA POSTAGE', and face value '15 न.पै. nP'. Printed via photogravure at India Security Press, Nashik (Scott #296, SG #397). Authentic circular cancellation."
    },
    "IMG_0065": {
        "name": "India – Musical Instruments: Saraswati Veena (1974)",
        "year": "1974",
        "denomination": "100 P",
        "filename": "India_Musical_Instruments_Veena_100P_1974_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive postage stamp from the Indian Musical Instruments series issued in the 1970s. Depicts the classical Saraswati Veena (plucked string chordophone), an ancient and revered instrument of Indian classical music. Inscribed 'भारत INDIA' with denomination '100'. Postally used with clear postal strike."
    },
    "IMG_0066": {
        "name": "India – Golden Jubilee of Steel Industry: Jamsetji Tata & Steel Plant (1958)",
        "year": "1958",
        "denomination": "15 nP",
        "filename": "India_Steel_Industry_Golden_Jubilee_Jamsetji_Tata_15nP_1958_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp issued on March 1, 1958, celebrating the 50th Anniversary / Golden Jubilee (1908-1958) of the Tata Iron and Steel Company (TISCO) in Jamshedpur. Features pioneer industrialist Jamsetji Nusserwanji Tata within a medallion overlooking the blast furnaces and smokestacks of the steel works. Inscriptions: 'भारतीय इस्पात उद्योग स्वर्ण जयन्ती 1908-1958', 'INDIA POSTAGE', and '15 न.पै. nP' (Scott #303, SG #406). Authentic 1958 cancellation."
    },
    "IMG_0067": {
        "name": "India – Handicrafts: Bidriware Metal Craft Vase (1966)",
        "year": "1966",
        "denomination": "2 P",
        "filename": "India_Handicrafts_Bidriware_Vase_2P_1966_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive postage stamp from the Indian Handicrafts series depicting Bidriware (बीदरी पात्र), the renowned metal handicraft from Bidar, Karnataka, featuring blackened zinc alloy inlaid with pure silver floral motifs. Denomination '2 P. / पै.', inscribed 'BIDRIWARE' and 'भारत INDIA'."
    },
    "IMG_0068": {
        "name": "India – Wildlife: Flying Crane / Siberian Crane (1975)",
        "year": "1975",
        "denomination": "50 P",
        "filename": "India_Wildlife_Flying_Crane_50P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Postage stamp from the Wildlife / Avian series depicting a migratory crane (Siberian / Sarus Crane) in flight against an open sky, inscribed 'भारत INDIA' and value '50'. Postally used."
    },
    "IMG_0069": {
        "name": "India – Thiruvalluvar: Buy National Savings Certificates Overprint (1960)",
        "year": "1960",
        "denomination": "15 nP",
        "filename": "India_Thiruvalluvar_National_Savings_Overprint_15nP_1960_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historical commemorative issue featuring classical Tamil saint-philosopher and poet Thiruvalluvar, author of the Tirukkural, seated writing on palm leaves. Overprinted with official promotional postal cancel: 'BUY NATIONAL SAVINGS CERTIFICATES'. Inscribed 'THIRUVALLUVAR', '15 न.पै. nP', and 'INDIA POSTAGE INDIA SECURITY PRESS'."
    },
    "IMG_0070": {
        "name": "India – Lokmanya Bal Gangadhar Tilak Birth Centenary (1956)",
        "year": "1956",
        "denomination": "2 Annas",
        "filename": "India_Lokmanya_Tilak_Birth_Centenary_2Annas_1956_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative postage stamp issued on July 23, 1956, commemorating the 100th birth anniversary (1856-1956) of freedom fighter and nationalist leader Lokmanya Bal Gangadhar Tilak ('Swaraj is my birthright'). Denomination 2 Annas ('2 A. / आना'), printed in deep red-brown at India Security Press (Scott #269, SG #369). Distinct circular cancel dated 19 SEP 56."
    },
    "IMG_0071": {
        "name": "India – Official Service: Ashoka Lion Capital (1958)",
        "year": "1958",
        "denomination": "50 nP",
        "filename": "India_Official_Service_Lion_Capital_50nP_1958_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government of India Service postage stamp featuring the National Emblem: the Lion Capital of Ashoka from Sarnath with the 'SERVICE' and 'शासकीय' security overprint. Denomination '50 भारत INDIA 50'. Printed in red-brown on watermark paper."
    },
    "IMG_0072": {
        "name": "India – Mahatma Gandhi Definitive Portrait (1969)",
        "year": "1969",
        "denomination": "50 P",
        "filename": "India_Mahatma_Gandhi_Portrait_50P_1969_Stamp_Cropped_Enhanced.jpg",
        "notes": "Postage stamp from the Mahatma Gandhi Birth Centenary definitive series depicting the Father of the Nation in three-quarter profile with round spectacles. Inscribed 'भारत INDIA 50' and 'महात्मा गांधी MAHATMA GANDHI'. Postally used."
    },
    "IMG_0073": {
        "name": "India – Jawaharlal Nehru Definitive Portrait (1965)",
        "year": "1965",
        "denomination": "50 P",
        "filename": "India_Jawaharlal_Nehru_Portrait_50P_1965_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive postage stamp honoring India's first Prime Minister, Jawaharlal Nehru, wearing the classic Nehru cap in deep blue duotone. Inscribed 'भारत INDIA 50' and 'नेहरू NEHRU'. Postally used."
    },
    "IMG_0074": {
        "name": "India – Archaeological: Mahabodhi Temple, Bodh Gaya (1949)",
        "year": "1949",
        "denomination": "4 Annas",
        "filename": "India_Archaeological_Bodh_Gaya_Temple_4Annas_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historic postage stamp from India's first definitive Archaeological series issued on August 15, 1949. Depicts the iconic Mahabodhi Temple at Bodh Gaya, Bihar, where Gautama Buddha attained enlightenment. Denomination '4 AS. / आना', inscribed 'INDIA POSTAGE' in rich royal blue. Authentic postal cancel."
    },
    "IMG_0075": {
        "name": "India – Archaeological: Kandariya Mahadev Temple, Khajuraho (1949)",
        "year": "1949",
        "denomination": "8 Annas",
        "filename": "India_Archaeological_Khajuraho_Temple_8Annas_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historic definitive stamp from the 1949 Archaeological series depicting the majestic shikharas of Kandariya Mahadev Temple at Khajuraho, Madhya Pradesh, celebrated for Chandela temple architecture. Value '8 AS. / आना', in teal-green."
    },
    "IMG_0076": {
        "name": "India – Freedom from Hunger: FAO Campaign (1963)",
        "year": "1963",
        "denomination": "15 nP",
        "filename": "India_Freedom_From_Hunger_FAO_15nP_1963_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp issued on March 21, 1963, in support of the UN Food and Agriculture Organization (FAO) worldwide Freedom from Hunger campaign. Features stylized hands shielding wheat ears and the globe emblem, inscribed 'FREEDOM FROM HUNGER', '15 न.पै. nP', 'भूख निवारण', 'INDIA भारत' (Scott #368, SG #466)."
    },
    "IMG_0077": {
        "name": "India – Archaeological: Great Stupa of Sanchi (1949)",
        "year": "1949",
        "denomination": "10 nP",
        "filename": "India_Archaeological_Sanchi_Stupa_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Archaeological series stamp depicting the ancient Buddhist Great Stupa at Sanchi, Madhya Pradesh (3rd century BCE, Emperor Ashoka), showing the hemispherical dome and ornate Torana gateway. Inscribed 'SANCHI STUPA', 'भारत INDIA'."
    },
    "IMG_0078": {
        "name": "India – Official Service: Ashoka Lion Capital (1957)",
        "year": "1957",
        "denomination": "2 nP",
        "filename": "India_Official_Service_Lion_Capital_2nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government of India Service decimal definitive stamp depicting the Ashoka Lion Capital, inscribed '2 भारत INDIA 2', with official security overprint 'SERVICE' and 'शासकीय'."
    },
    "IMG_0079": {
        "name": "India – Architecture & Heritage: Konark Sun Temple Chariot Wheel (1975)",
        "year": "1975",
        "denomination": "500 P",
        "filename": "India_Heritage_Architecture_Konark_500P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-value definitive stamp featuring ancient Indian stone temple architecture and sculpture from the Konark Sun Temple. Inscribed 'भारत 500 INDIA' (Rs 5 denomination), green and black bicolour print."
    },
    "IMG_0080": {
        "name": "India – Agriculture & Industry: Tea Gardens of Assam (1975)",
        "year": "1975",
        "denomination": "1000 P",
        "filename": "India_Industry_Tea_Gardens_Assam_1000P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-value Rs 10 definitive stamp illustrating the rolling terraced hills of the lush tea plantations of Assam, celebrated worldwide for Assam orthodox black tea. Inscribed 'भारत INDIA 1000' in olive green."
    },
    "IMG_0081": {
        "name": "India – Decimal Coinage Map Series: 1 naye Paise (1957)",
        "year": "1957",
        "denomination": "1 nP",
        "filename": "India_Map_Decimal_Series_1nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Key historical stamp issued on April 1, 1957, celebrating India's adoption of the decimal currency system (100 naye paise = 1 Rupee). Features an accurate political map of the Republic of India surrounded by sea, printed in deep turquoise-green, inscribed 'POSTAGE', 'न.पै. 1 n.P.' (Scott #279, SG #375). Postally used."
    },
    "IMG_0082": {
        "name": "India – Decimal Coinage Map Series: 8 naye Paise (1957)",
        "year": "1957",
        "denomination": "8 nP",
        "filename": "India_Map_Decimal_Series_8nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Decimal coinage series stamp issued in 1957 depicting the map of India in emerald green, inscribed 'POSTAGE', 'न.पै. 8 n.P.', and 'INDIA' along the right vertical margin (Scott #284, SG #382)."
    },
    "IMG_0083": {
        "name": "India – Decimal Coinage Map Series: 3 naye Paise (1957)",
        "year": "1957",
        "denomination": "3 nP",
        "filename": "India_Map_Decimal_Series_3nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Decimal coinage series stamp issued on April 1, 1957, depicting the map of India in rich chocolate brown, inscribed 'POSTAGE', 'न.पै. 3 n.P.', and 'INDIA' (Scott #281, SG #378). Postally used."
    },
    "IMG_0084": {
        "name": "India – Official Service: Ashoka Lion Capital Rs 10 (1975)",
        "year": "1975",
        "denomination": "1000 P",
        "filename": "India_Official_Service_Lion_Capital_1000P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-denomination official Government Service stamp featuring the Ashoka Lion Capital in deep maroon/purple, inscribed '1000 भारत 1000', with 'SERVICE' and 'शासकीय' security prints."
    },
    "IMG_0085": {
        "name": "India – Classical Dance: Bharatanatyam Danseuse (1957)",
        "year": "1957",
        "denomination": "15 nP",
        "filename": "India_Classical_Dance_Bharatanatyam_15nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp from the Indian Classical Dance series depicting a graceful Bharatanatyam dancer in classical pose with traditional temple jewelry and costume. Denomination '15 nP', inscribed 'INDIA POSTAGE'."
    },
    "IMG_0086": {
        "name": "India – Tourism: Dal Lake Shikara, Srinagar, Kashmir (1966)",
        "year": "1966",
        "denomination": "2 P",
        "filename": "India_Tourism_Dal_Lake_Kashmir_2P_1966_Stamp_Cropped_Enhanced.jpg",
        "notes": "Tourism definitive issue depicting a traditional wooden Shikara boat gliding across the calm waters of scenic Dal Lake, Srinagar, with the snow-capped Himalayan mountains in the background. Inscribed 'DAL LAKE', '2 P. भारत INDIA'."
    },
    "IMG_0087": {
        "name": "India – Mahatma Gandhi Definitive Profile Portrait (1969)",
        "year": "1969",
        "denomination": "20 P",
        "filename": "India_Mahatma_Gandhi_Large_Portrait_1969_Stamp_Cropped_Enhanced.jpg",
        "notes": "Large profile portrait stamp of Mahatma Gandhi issued for his birth centenary (1869-1969). Features a photogravure rendering in warm sepia with distinct circular postal strike across the right margin. Inscribed 'भारत INDIA'."
    },
    "IMG_0088": {
        "name": "India – Official Service: Ashoka Lion Capital 100P Imperf (1968)",
        "year": "1968",
        "denomination": "100 P",
        "filename": "India_Official_Service_Lion_Capital_100P_Imperf_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Collector's imperforate sheet margin cutting of the Official Service 100 Paise (1 Rupee) Ashoka Lion Capital definitive. Features intact wide paper margins, printed in rich plum purple with crisp inscriptions '100 भारत 100', 'INDIA SERVICE', and 'सत्यमेव जयते शासकीय'."
    },
    "IMG_0089": {
        "name": "India – Official Service: Ashoka Lion Capital (1957)",
        "year": "1957",
        "denomination": "10 nP",
        "filename": "India_Official_Service_Lion_Capital_10nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Official Government of India Service stamp in emerald green, denomination '10 भारत 10', featuring the Ashoka Lion Capital with 'SERVICE' and 'शासकीय' security marks."
    },
    "IMG_0090": {
        "name": "India – Aviation & Defense: Supersonic Jet Fighter HAL Marut (1968)",
        "year": "1968",
        "denomination": "20 P",
        "filename": "India_Aviation_Supersonic_Jet_Marut_20P_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp celebrating the Indian Air Force and indigenous aerospace engineering, depicting a supersonic fighter jet (HAL HF-24 Marut / Gnat) climbing into the sky in purple-violet duotone. Inscribed 'भारत INDIA' and value '20 P'."
    },
    "IMG_0091": {
        "name": "India – Agriculture: Tea Plucking Worker (1968)",
        "year": "1968",
        "denomination": "15 P",
        "filename": "India_Agriculture_Tea_Plucking_015P_1968_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive series stamp showcasing Indian agro-economy, depicting a woman tea picker harvesting tender tea leaves in green monochrome. Inscribed 'PLUCKING TEA', '0.15 भारत INDIA'."
    },
    "IMG_0092": {
        "name": "India – Wildlife: Royal Bengal Tiger (1963)",
        "year": "1963",
        "denomination": "15 nP",
        "filename": "India_Wildlife_Royal_Bengal_Tiger_15nP_1963_Stamp_Cropped_Enhanced.jpg",
        "notes": "Key wildlife commemorative stamp issued on October 7, 1963, for Wildlife Week, featuring the majestic head and stripes of the Royal Bengal Tiger (Panthera tigris). Inscribed '15 न.पै. nP', 'TIGER', 'भारत INDIA' (Scott #367, SG #465)."
    },
    "IMG_0093": {
        "name": "India – Fauna: Indian Peacock, National Bird (1966)",
        "year": "1966",
        "denomination": "2 P",
        "filename": "India_Fauna_Peacock_National_Bird_2P_1966_Stamp_Cropped_Enhanced.jpg",
        "notes": "Postage stamp depicting India's national bird, the Indian Peacock (Pavo cristatus), showing its iridescent crest and plumage in blue-purple. Inscribed 'PEACOCK', '2 P. भारत INDIA'."
    },
    "IMG_0094": {
        "name": "India – Sardar Vallabhbhai Patel (1975)",
        "year": "1975",
        "denomination": "100 P",
        "filename": "India_Sardar_Vallabhbhai_Patel_100P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp honoring Sardar Vallabhbhai Patel, first Deputy Prime Minister and Home Minister of independent India, architect of national integration. Brown intaglio portrait inscribed 'भारत INDIA 100'."
    },
    "IMG_0095": {
        "name": "India – Industry: ONGC Offshore Oil Rig Bombay High (1976)",
        "year": "1976",
        "denomination": "500 P",
        "filename": "India_Industry_ONGC_Offshore_Oil_Rig_500P_1976_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-value definitive stamp depicting offshore crude oil extraction at Bombay High by the Oil & Natural Gas Commission (ONGC), featuring a massive drilling rig platform in yellow, red, and blue. Inscribed '500 भारत INDIA'."
    },
    "IMG_0096": {
        "name": "India – First War of Independence Centenary: Rani of Jhansi (1957)",
        "year": "1957",
        "denomination": "15 nP",
        "filename": "India_First_War_Independence_1857_Rani_Jhansi_15nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp issued on August 15, 1957, marking the 100th anniversary of the 1857 Uprising (First War of Independence). Features cavalrymen and Rani Lakshmibai of Jhansi leading the charge on horseback in chocolate brown. Inscribed '1857-1957', 'INDIA 15 nP' (Scott #293, SG #393)."
    },
    "IMG_0097": {
        "name": "India – Wildlife: Asian Elephant (1953)",
        "year": "1953",
        "denomination": "3 Pies",
        "filename": "India_Wildlife_Indian_Elephant_3P_1953_Stamp_Cropped_Enhanced.jpg",
        "notes": "Vintage definitive stamp featuring a caparisoned Asian / Indian Elephant marching through dense forest. Intaglio engraved in deep purple-blue, inscribed 'INDIA POSTAGE' and face value '3 PS.'."
    },
    "IMG_0098": {
        "name": "India – Refugee Relief Postal Surtax Overprint (1971)",
        "year": "1971",
        "denomination": "5 P",
        "filename": "India_Refugee_Relief_Overprint_5P_1971_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historic postal tax issue of 1971. In response to the massive influx of 10 million refugees escaping the genocide in East Pakistan (Bangladesh), India Post levied a mandatory 5 Paise postal surtax overprinted in bold carmine red: 'शरणार्थी सहायता / REFUGEE RELIEF' (Scott #MR1)."
    },
    "IMG_0099": {
        "name": "India – Agriculture: Cotton Plant Bolls / Kapas (1975)",
        "year": "1975",
        "denomination": "100 P",
        "filename": "India_Agriculture_Cotton_Bolls_100P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp illustrating ready-to-harvest white cotton bolls (Gossypium) on the branch, commemorating India's cotton textile industry. Sepia print inscribed '100 भारत INDIA'."
    },
    "IMG_0100": {
        "name": "India – Archaeological: Chola Bronze Nataraja (1949)",
        "year": "1949",
        "denomination": "2 Annas",
        "filename": "India_Archaeological_Chola_Nataraja_2Annas_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Iconic stamp from the premier 1949 Archaeological definitive series depicting the masterwork 11th-century Chola bronze of Nataraja dancing within a ring of flames. Denomination '2 AS. / आना', printed in sky blue at India Security Press."
    },
    "IMG_0101": {
        "name": "India – Agriculture: Field Harvest Worker (1966)",
        "year": "1966",
        "denomination": "15 nP",
        "filename": "India_Agriculture_Harvest_Worker_15nP_1966_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp showing a smiling rural female farm laborer holding a freshly harvested sheaf of golden wheat. Inscribed 'भारत INDIA 15'."
    },
    "IMG_0102": {
        "name": "India – Sculpture: Konark Sun Temple War Horse (1975)",
        "year": "1975",
        "denomination": "200 P",
        "filename": "India_Sculpture_Konark_War_Horse_200P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-value definitive stamp depicting the monumental 13th-century stone war horse sculpture from the Sun Temple at Konark, Odisha. Inscribed '200 भारत INDIA' in terracotta red."
    },
    "IMG_0103": {
        "name": "India – Plantations: Rubber Tapping in Kerala (1975)",
        "year": "1975",
        "denomination": "500 P",
        "filename": "India_Plantations_Rubber_Tapping_500P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp depicting a worker making a spiral groove cut in a rubber tree trunk (Hevea brasiliensis) to collect latex sap, honoring Kerala's rubber plantations. Inscribed '500 भारत INDIA'."
    },
    "IMG_0104": {
        "name": "India – Cash Crops: Cashew Nuts & Fruit / Kaju (1975)",
        "year": "1975",
        "denomination": "25 P",
        "filename": "India_Agriculture_Cashew_Nuts_25P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive series stamp showing ripe cashew apples and raw kidney-shaped cashew nuts (Anacardium occidentale). Inscribed 'भारत INDIA 25'."
    },
    "IMG_0105": {
        "name": "India – Centenary of International Red Cross: Henri Dunant (1963)",
        "year": "1963",
        "denomination": "15 nP",
        "filename": "India_Red_Cross_Centenary_Henri_Dunant_15nP_1963_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp issued on May 8, 1963, celebrating 100 years of the International Red Cross movement (1863-1963). Features founder Jean Henri Dunant and the vibrant Red Cross emblem. Inscribed '15 न.पै. nP', 'रेड क्रास शताब्दी 1863-1963', 'INDIA भारत' (Scott #370, SG #468)."
    },
    "IMG_0106": {
        "name": "India – Sacred Monuments: Golden Temple Amritsar (1975)",
        "year": "1975",
        "denomination": "60 P",
        "filename": "India_Heritage_Amritsar_Golden_Temple_60P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp showcasing Sri Harmandir Sahib (The Golden Temple) in Amritsar, Punjab, the central gurdwara and holiest pilgrimage site of Sikhism, surrounded by the sacred Amrit Sarovar lake. Inscribed 'भारत INDIA 60'."
    },
    "IMG_0107": {
        "name": "India – Handicrafts: Rajasthani Puppets Kathputli (1975)",
        "year": "1975",
        "denomination": "30 P",
        "filename": "India_Handicrafts_Rajasthani_Puppets_30P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp from the Indian Handicrafts series depicting traditional string puppets (Kathputli) of Rajasthan in elaborate folk attire. Inscribed 'HANDICRAFTS / हस्त शिल्प', '30 P. भारत INDIA'."
    },
    "IMG_0108": {
        "name": "India – Archaeological: Ajanta Fresco Royal Couple (1949)",
        "year": "1949",
        "denomination": "2 Annas",
        "filename": "India_Archaeological_Ajanta_Fresco_2Annas_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Historic 1949 Archaeological definitive stamp depicting classical wall painting from Cave 17 of the Ajanta Caves, Maharashtra (UNESCO World Heritage Site), showing an ancient royal couple in soft blue. Inscribed '2 AS. INDIA आना'."
    },
    "IMG_0109": {
        "name": "India – Classical Dance: Kathakali Dancer (1975)",
        "year": "1975",
        "denomination": "25 P",
        "filename": "India_Classical_Dance_Kathakali_25P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp depicting a Kathakali classical dance-drama actor from Kerala in elaborate makeup, paccha face paint, and headgear. Denomination 25 P in rose-red."
    },
    "IMG_0110": {
        "name": "India – Medieval Sculpture: River Goddess Ganga (1975)",
        "year": "1975",
        "denomination": "1 Re",
        "filename": "India_Medieval_Sculpture_Goddess_Ganga_1Re_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "High-value definitive stamp illustrating the magnificent 8th-century stone carving of the River Goddess Ganga standing upon her mythical vahana (Makara), from the National Museum collection. Inscribed 'मध्ययुगीन मूर्तिकला / MEDIEVAL SCULPTURE GANGA', '1 Re भारत INDIA'."
    },
    "IMG_0111": {
        "name": "India – Folk Art: Bankura Terracotta Horse, West Bengal (1975)",
        "year": "1975",
        "denomination": "20 P",
        "filename": "India_Folk_Art_Bankura_Horse_20P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp showcasing the Bankura terracotta horse, a world-famous craft from Panchmura, Bankura district, West Bengal, famous for its erect ears and symmetrical geometric proportions. Inscribed '20 भारत INDIA'."
    },
    "IMG_0112": {
        "name": "India – Netaji Subhas Chandra Bose (1975)",
        "year": "1975",
        "denomination": "100 P",
        "filename": "India_Netaji_Subhas_Chandra_Bose_100P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Postage stamp honoring revolutionary leader Netaji Subhas Chandra Bose, Supreme Commander of the Azad Hind Fauj (INA). Inscribed 'भारत INDIA 100' in brown intaglio."
    },
    "IMG_0113": {
        "name": "India – Wildlife: Royal Bengal Tiger Profile (1963)",
        "year": "1963",
        "denomination": "15 nP",
        "filename": "India_Wildlife_Bengal_Tiger_Profile_15nP_1963_Stamp_Cropped_Enhanced.jpg",
        "notes": "Wildlife series commemorative stamp featuring the intense gaze and markings of the Indian Royal Bengal Tiger (Panthera tigris). Inscribed '15 nP भारत INDIA'."
    },
    "IMG_0114": {
        "name": "India – Heavy Industry: Bhakra Nangal Dam Hydroelectric Power (1975)",
        "year": "1975",
        "denomination": "1 Re",
        "filename": "India_Industry_Bhakra_Dam_Power_1Re_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp illustrating heavy electrical turbine equipment and hydroelectric power generation at the historic Bhakra Dam, celebrated as a 'temple of modern India'. Inscribed '1 Re INDIA'."
    },
    "IMG_0115": {
        "name": "India – Rabindranath Tagore Birth Centenary (1961)",
        "year": "1961",
        "denomination": "20 P",
        "filename": "India_Rabindranath_Tagore_Centenary_20P_1961_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp celebrating the birth centenary (1861-1961) of poet, philosopher, and Nobel Prize winner Rabindranath Tagore, author of 'Gitanjali' and the Indian national anthem. Inscribed 'भारत INDIA 20'."
    },
    "IMG_0116": {
        "name": "India – Archaeological: Trimurti of Elephanta Caves, Lord Shiva (1949)",
        "year": "1949",
        "denomination": "9 Pies",
        "filename": "India_Archaeological_Trimurti_Elephanta_9P_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Classic definitive stamp from the 1949 Archaeological series depicting the world-renowned colossal 6th-century rock-cut sculpture of Trimurti / Sadashiva (Creator, Preserver, Destroyer) inside the Elephanta Caves on Gharapuri Island in Mumbai harbor. Inscribed 'TRIMURTI ELEPHANTA', 'INDIA'."
    },
    "IMG_0117": {
        "name": "India – Children's Day (Bal Din): Boy Eating Banana (1957)",
        "year": "1957",
        "denomination": "8 nP",
        "filename": "India_Childrens_Day_Bal_Din_Boy_Eating_8nP_1957_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp issued on November 14, 1957 (Nehru's Birthday / Children's Day). Features a joyful boy enjoying a healthy snack, symbolizing nutrition and child welfare. Printed in radiant magenta, inscribed 'बाल दिन 14-11-57', 'INDIA POSTAGE 8 न.पै. nP' (Scott #297, SG #398). Clear circular cancellation."
    },
    "IMG_0118": {
        "name": "India – Wildlife: Barasingha / Swamp Deer (1975)",
        "year": "1975",
        "denomination": "25 P",
        "filename": "India_Wildlife_Barasingha_Swamp_Deer_25P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp illustrating the handsome twelve-tined antlers of the endangered Barasingha (Swamp Deer), endemic to northern and central India's grassland floodplains. Inscribed 'भारत INDIA 25'."
    },
    "IMG_0119": {
        "name": "India – Heavy Industry: Steel Melting Blast Furnace (1966)",
        "year": "1966",
        "denomination": "6 P",
        "filename": "India_Industry_Molten_Steel_Ladle_6P_1966_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp depicting an industrial ladle pouring glowing molten steel in an integrated blast furnace mill. Printed in purple-blue, inscribed '6 Ps. INDIA ६ पै.'."
    },
    "IMG_0120": {
        "name": "India – Family Planning: Small Family Happy Family (1977)",
        "year": "1977",
        "denomination": "75 P",
        "filename": "India_Family_Planning_Happy_Family_75P_1977_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp promoting maternal and child health with a family portrait of parents and two children under the red triangle banner. Inscribed 'छोटा परिवार खुशियों का आधार / SMALL FAMILY HAPPY FAMILY', 'भारत INDIA 75'."
    },
    "IMG_0121": {
        "name": "India – Horticulture: Indian Mangoes / आम (1975)",
        "year": "1975",
        "denomination": "50 P",
        "filename": "India_Horticulture_Mangoes_Alphonso_50P_1975_Stamp_Cropped_Enhanced.jpg",
        "notes": "Postage stamp from the Agriculture and Fruit series depicting luscious ripe Indian mangoes on the branch, celebrated as the National Fruit of India. Inscribed 'आम MANGOES', '50 P. भारत INDIA'."
    },
    "IMG_0122": {
        "name": "India – Heritage: Victoria Memorial Hall, Calcutta (1949)",
        "year": "1949",
        "denomination": "3 Annas",
        "filename": "India_Heritage_Victoria_Memorial_Calcutta_3Annas_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Definitive stamp from the 1949 series illustrating the white Makrana marble monument of the Victoria Memorial in Kolkata (Calcutta). Inscribed 'INDIA 3 AS. / आना' with postmark."
    },
    "IMG_0123": {
        "name": "India – Prime Minister Lal Bahadur Shastri (1966)",
        "year": "1966",
        "denomination": "50 P",
        "filename": "India_Lal_Bahadur_Shastri_Portrait_50P_1966_Stamp_Cropped_Enhanced.jpg",
        "notes": "Commemorative stamp issued on January 26, 1966, honoring India's second Prime Minister Lal Bahadur Shastri following his untimely passing in Tashkent. Features his bust in blue, inscribed 'लाल बहादुर शास्त्री L. BAHADUR SHASTRI', '50 P. भारत INDIA' (Scott #423, SG #524)."
    },
    "IMG_0124": {
        "name": "India – Archaeological: Chola Bronze Nataraja Dancer (1949)",
        "year": "1949",
        "denomination": "4 Annas",
        "filename": "India_Archaeological_Nataraja_Bronze_4Annas_1949_Stamp_Cropped_Enhanced.jpg",
        "notes": "Stately definitive stamp from the 1949 Archaeological series featuring the sacred bronze idol of Nataraja inside a circle of cosmic fire. Denomination '4 AS. / आना', printed in deep magenta-rose."
    }
}

# 1. Copy cropped files to uploads/collection/
print("Copying cropped images to uploads/collection/...")
for img_key, meta in STAMPS_METADATA.items():
    src_crop = os.path.join(PERFECT_CROPS_DIR, f"crop_{img_key}.jpeg")
    dst_img = os.path.join(UPLOADS_COLL_DIR, meta["filename"])
    if os.path.exists(src_crop):
        shutil.copy2(src_crop, dst_img)
        print(f"Copied {img_key} -> {meta['filename']}")
    else:
        print(f"Warning: {src_crop} not found!")

# 2. Update collectibles.json
with open(DATA_FILE, 'r', encoding='utf-8') as f:
    collectibles = json.load(f)

# Find existing image URLs to avoid duplication
existing_urls = set()
for item in collectibles:
    for img in item.get('images', []):
        existing_urls.add(img.get('url'))

new_items = []
now_ms = int(datetime.now(timezone.utc).timestamp() * 1000)

for idx, (img_key, meta) in enumerate(STAMPS_METADATA.items()):
    rel_url = f"uploads/collection/{meta['filename']}"
    
    # If already exists in collectibles (like IMG_0062), update it
    found = False
    for item in collectibles:
        for img in item.get('images', []):
            if img.get('url') == rel_url:
                found = True
                # Update details to ensure clean metadata
                item["name"] = meta["name"]
                item["year"] = meta["year"]
                item["denomination"] = meta["denomination"]
                item["notes"] = meta["notes"]
                break
        if found:
            break
            
    if not found:
        # Create new record
        new_id = f"{now_ms}_stamp_{idx + 100}"
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

print(f"Created {len(new_items)} new stamp items.")

# Prepend new items to collectibles
all_collectibles = new_items + collectibles

with open(DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(all_collectibles, f, indent=2, ensure_ascii=False)
print(f"Saved {len(all_collectibles)} items to {DATA_FILE}")

# Sync to web/data/collectibles.json
with open(WEB_DATA_FILE, 'w', encoding='utf-8') as f:
    json.dump(all_collectibles, f, indent=2, ensure_ascii=False)
print(f"Synced {len(all_collectibles)} items to {WEB_DATA_FILE}")

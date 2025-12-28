
const STATES_LIST = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
    "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Tripura",
    "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep", "New Delhi", "Puducherry", "Ladakh", "Jammu and Kashmir"
];

const COUNTRIES_LIST = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
    "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)",
    "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic",
    "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. 'Swaziland')", "Ethiopia",
    "Fiji", "Finland", "France",
    "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
    "Haiti", "Holy See", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Ivory Coast",
    "Jamaica", "Japan", "Jordan",
    "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan",
    "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg",
    "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)",
    "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
    "Oman",
    "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal",
    "Qatar",
    "Romania", "Russia", "Rwanda",
    "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria",
    "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
    "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States of America", "Uruguay", "Uzbekistan",
    "Vanuatu", "Venezuela", "Vietnam",
    "Yemen",
    "Zambia", "Zimbabwe"
];

const INITIAL_STATE_DATA = {
    visited: false,
    placesVisited: [],
    placesToVisit: [],
    restaurants: [],
    food: [],
    treks: [],
    stays: [],
    highlights: []
};

// Key for localStorage
const STORAGE_KEY = 'travelTrackerData_v2';

const SAMPLE_DATA = {
    "Arunachal Pradesh": {
        "visited": true,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Andhra Pradesh": {
        "visited": true,
        "placesVisited": [
            "Golconda Fort",
            "Salar jang Museum",
            "uppada beach",
            "Vanajangi",
            "padampuram botanical garden",
            "Srivari Padalu",
            "Srivari Mettu",
            "Sudha Car Museum",
            "Charminar",
            "Lumbini Park",
            "Japali Anjaneya Swamy Temple",
            "Andhra Sabarimala",
            "galikonda view point",
            "Alipiri Mettulu",
            "Sri Venugopala Swamy Temple",
            "kkd beach",
            "Eat Sreet",
            "Shilparamam",
            "coffee museum",
            "Qutab Shahi Tombs",
            "Sripada srivallabha swami temple",
            "Biodiversity Complex",
            "Laknavaram Cheruvu",
            "Hussain Sagar",
            "Rock Garden",
            "Kailasagiri",
            "Datatreya Birth Place",
            "Papi Kondalu",
            "Srikalahasti Temple",
            "Ananthagiri Hills",
            "Silathoranam",
            "chaparai waterfall",
            "Sri Bhadrakalli Temple",
            "Kukkuteswara Temple",
            "Step Well",
            "KanakaDurga Temple",
            "Nehru Zooligical Park",
            "Watch  Tower",
            "Birla mandir",
            "Birla science museum",
            "Coringa Wild Life Sanctury",
            "Katika waterfalls",
            "Boora caves",
            "Sri Padmavathi Ammavari",
            "Ganga Amma Temple",
            "Kanipakam Temple",
            "1000 Pillar Temple",
            "Indira Gandhi Zoological Park",
            "Ramoji Film City",
            "Shri Jagannath temple",
            "Kondanda ramaswamy Temple",
            "Vemulawada Temple",
            "Shri Jagannath Temple"
        ],
        "placesToVisit": [
            "kothapalli waterfalls",
            "Ethipothala waterfalls",
            "Dallapalli Hills",
            "tatiguda waterfalls",
            "damaku view point",
            "Lambasingi",
            "Statue of equatiy",
            "Bhongir fort",
            "Bhemili beach",
            "ramakrishna beach",
            "Arma Konda"
        ],
        "restaurants": [
            "Rubix Cube",
            "Casa de reo",
            "Krishnapatnam",
            "Foddie Train",
            "Hotel Shadab"
        ],
        "food": [
            "Penne in arrablata pasta",
            "Cottage cheese in paprica sauce with flavoured rice",
            "Chinna Peserattu",
            "Punugulu Curry",
            "Annavaram Prasadam"
        ],
        "treks": [],
        "stays": [
            "The mooshine project"
        ]
    },
    "Assam": {
        "visited": true,
        "placesVisited": [
            "Chakreshwar Temple",
            "Kaziranga National Park",
            "Kamakhya Temple",
            "Kaziranga National Orchid And Biodiversity Park",
            "Maa Dhumawati Mandir"
        ],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Indonesia": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Bihar": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Chattisgarh": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Goa": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Gujrat": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [
            "Dhokla",
            "Kachori"
        ],
        "treks": [],
        "stays": []
    },
    "Himachal Pradesh": {
        "visited": true,
        "placesVisited": [
            "Manikarnan Sahib(Hot spring)",
            "Chicham Bridge",
            "Nagar Castle",
            "Dhankar Monestry",
            "River Rafting",
            "Langza",
            "Tabo monestry",
            "Hidimba Temple",
            "Rothang Pass",
            "Hikkim",
            "Vashishtha",
            "Sissu",
            "Club House",
            "Van husan",
            "Atul Tunnel",
            "Kunzum Pass",
            "Kufri",
            "Green Valley",
            "Gulaba",
            "Kasol Manikaran",
            "Manestory",
            "Paragliding",
            "Solang Valley",
            "Mall Road",
            "Key Monestry"
        ],
        "placesToVisit": [
            "Kalath hot water springs",
            "Atal Tanal",
            "Tosh",
            "Bir Billing",
            "Parvati Valley",
            "Chail",
            "Gulaba",
            "tirthan valley",
            "Kasol Manikaran",
            "Stagazing",
            "Kinnaur",
            "Chamba",
            "Spiti Valley",
            "McLeod Ganj",
            "Paragliding"
        ],
        "restaurants": [],
        "food": [],
        "treks": [
            "Jogini Falls",
            "Chandratal Lake",
            "Dhankar Lake"
        ],
        "stays": [
            "Kunzom spiti inn",
            "Swiss camps",
            "Hotel Grand",
            "Ride At Hill-Nihal Hotel & Cottage",
            "Angels inn",
            "Neha Residency",
            "House stay"
        ]
    },
    "Jharkhand": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Karnataka": {
        "visited": true,
        "placesVisited": [
            "Chamundeshwari Temple",
            "Hazara Rama Temple",
            "Gagan Mahal",
            "Kallathgiri Falls",
            "Stepped Tank",
            "Lalbagh",
            "Mullayanagiri",
            "Mahanaavami dibba",
            "Nandi Hills",
            "Laxmi Narasimha Temple",
            "Jawaharlal Nehru Planetarium",
            "Malpe Beach",
            "Bull Temple",
            "Underground Prasanna Virupaksha shiva temple",
            "Golden Temple",
            "Agara Lake",
            "Vidhana Soudha",
            "Honnammanahalla Falls",
            "Innovative film city",
            "Aqua World Underwater",
            "Murdeshwar",
            "Ram Footsteps Chintamani",
            "Raja's Seat",
            "Kadalekalu Gnesha Temple",
            "Monolithic Bull",
            "Club Cabana",
            "Makalidurga Fort Trekking",
            "St. Philomena's Church",
            "Elephant stable",
            "Maravanthe Beach",
            "Wonderla",
            "Mall Of Asia",
            "Queens palace basement",
            "Coracle ride",
            "Mini Golf Madness",
            "Mysuru Zoo",
            "Shanti Falls",
            "BTM Lake",
            "Anjanadri Hill",
            "Sri Krishna temple",
            "Mysore Palace(Amba Vilas Palace)",
            "Lotus Mahal",
            "Brindavan Gardens",
            "Indian Music experiance museum",
            "Jog Falls",
            "Government Aquarium",
            "Pyramid of alley",
            "Badavilinga Temple",
            "Virupaksha Temple",
            "Payana Car Museum",
            "Tala Kaveri",
            "Queens Bath",
            "Zanana Enclosure",
            "Birds of paradise",
            "Vijaya Vithala Temple",
            "Jhari Water Falls",
            "Sanapur Lake",

        ],
        "placesToVisit": [
            "Vatada hosahalli lake",
            "Tadiandamol",
            "Kodachadri Trek",
            "Ranganathittu Bird Sanctuary",
            "Jaganmohan Palace",
            "Kopatty trek",
            "Kurinjal Trek",
            "HAL Heritage Centre and Aerospace Museum",
            "Hogenakkal Falls",
            "Gangadikal trek",
            "Balamuri-Yedamuri falls",
            "Horsley Hills",
            "Bangalore Palace",
            "Rail Museum",
            "Panchami kallu",
            "Ettina Bhuja",
            "Nishani Motte Trek",
            "Ramadevara Betta",
            "Himavad Gopalaswamy Betta",
            "Gudibande Fort",
            "Dodda Alada Mara",
            "Skandagiri",
            "Torch light parade ground",
            "Chota Ladakh",
            "Munchanabele Dam",
            "Avalabetta",
            "Sky Jumper, Trampoline park",
            "Kurinjal trek",
            "Netravati trek",
            "Ballalarayana Fort",
            "Tipu Sultan's Summer Palace",
            "Srinivasa Sagara",
            "Kudremukh Trek",
            "mani biryani hoskote",
            "TK Falls",
            "Kaigal Falls",
            "Bharachukki Waterfalls"
        ],
        "restaurants": [
            "Go Native",
            "The Big Barbeque Buffet",
            "Plan B",
            "Barbeque",
            "United telugu kitchen",
            "Dhaba Stories",
            "Chai Galli",
            "Reddy's Resturant",
            "Thindi Bandi",
            "Torq03",
            "Fiesta by Barbeque Nation",
            "The Dhaba Strories",
            "HAMPI PARADISE RESTAURANT",
            "1947",
            "Hoy Punjabi Banaswadi",
            "Palleturi Dosa"
        ],
        "food": [
            "Meghana Biryani",
            "Babai Tiffens  Podi dosa",
            "NandiniPedda"
        ],
        "treks": [
            "zpoint trek",
            "Matanga Hill",
            "Anthargange Cave Trekking",
            "Chunchi Falls"
        ],
        "stays": [
            "Wheel to hills stay inn Service Apartments",
            "Club Cabana",
            "Far Trek 001 3 BHK Apartment near IIM B",
            "Rocky Medows Resort",
            "Tirmul Facing"
        ]
    },
    "Kerala": {
        "visited": true,
        "placesVisited": [
            "Sabarmallai"
        ],
        "placesToVisit": [
            "Mattupetti Indo Swiss Farm",
            "Kundala Lake",
            "Rose Garden",
            "Nyayamakad Waterfall",
            "Lakkom Water Falls",
            "Pothamedu View Point",
            "Carmelagiri Elephant park",
            "Meesapulimala",
            "Kalari Kshetra",
            "Top Station",
            "Tata Tea Museum",
            "Attukal Waterfalls",
            "Lockhart Gap",
            "Anamudi",
            "Marayoor Dolmens",
            "Chinnar Wildlife Sanctuary",
            "Echo point",
            "Chokramudi Peak",
            "Jatayu earth centre",
            "Chinnakanal Waterfalls",
            "Athirapilly Treehouse",
            "Wonder Valley Adventure nd Amusement Park",
            "Kolukkumalai Tea Estate",
            "Kuthumkal Waterfalls",
            "Photo Point",
            "Eravikulam National Park",
            "Devikulam",
            "Mattupetty Dam",
            "Cheeyappara Waterfalls"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Madhya Pradesh": {
        "visited": true,
        "placesVisited": [
            "Stupa of Sanchi"
        ],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Maharashtra": {
        "visited": true,
        "placesVisited": [
            "Alibug fort/Kolaba",
            "Golden Pakkode",
            "Gateway of India",


            "7 Wonders",
            "Marine Drive",
            "Khandala Ghat view Point",
            "Narayani Dham Temple",
            "Jehangir art gallery",
            "Mahankalli Caves",
            "Karla Bhuda Caves",
            "Imagica",
            "Vasai Creek",
            "Essel World",
            "Uttan Beach",
            "Shiridi Temple",
            "Loins Point",
            "Veermata Jijabai Bhosale Udyan And Zoo",
            "Alibug Beach",

        ],
        "placesToVisit": [
            "Harishchandragad Trek",
            "Naneghat Trek",
            "Harihar fort trek",
            "Dandi Beach",
            "Kalsubai"
        ],
        "restaurants": [],
        "food": [
            "Pani Puri",
            "Vada Pav",
            "Pav Bhaji",
            "Lonavala Chikki",
            "Modaks",
            "Paradise chicken biryani - Airoli"
        ],
        "treks": [
            "Irshalgad Fort",
            "Kothaligad",
            "Karnala Fort"
        ],
        "stays": [
            "Sai Inn Resort",
            "Rivergate Resort"
        ]
    },
    "Manipur": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Meghalaya": {
        "visited": true,
        "placesVisited": [
            "Kakyaki",
            "Dawki river",
            "Ploice bazar",
            "Ward's lake",
            "Camping",
            "Garden of caves",
            "Nohkalikai waterfalls",
            "Single root bridge",
            "Blue lagoom",
            "Mawlynnong village",
            "Mawsmai caves",
            "Cherry blossoms",
            "krang suri falls",
            "India - Bangladesh border",
            "Cliff jumping",
            "Mawphlang sacred forest",
            "Double decker root bridge"
        ],
        "placesToVisit": [
            "Umiam Lake",
            "Rainbow Falls",
            "Wei Shawdong"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": [
            "Lilly resturant",
            "Smoky tribe falls coffee"
        ]
    },
    "Nagaland": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Nepal": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [
            "Chitwan",
            "Kathmandu",
            "Nagarkot",
            "Lumbini",
            "Chandragiri Hills",
            "Sarangkot",
            "Pokhara"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "New Delhi": {
        "visited": true,
        "placesVisited": [
            "India Gate",
            "Akshardham Temple",
            "Jantar mantar",
            "Lotus Temple",
            "Rashtrapati Bhavan",
            "Train Museum",
            "Redfort",
            "Jahangir Palace",
            "Raj Ghat",
            "Taj Mahal",
            "Khas Mahal"
        ],
        "placesToVisit": [
            "Humayu's Tomb",
            "Isckon",
            "Birla Mandir",
            "Jama Masjid"
        ],
        "restaurants": [
            "Bagundi Andhra Kitchen"
        ],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Odisha": {
        "visited": true,
        "placesVisited": [
            "Konark/Chandrabhaga Beach",
            "Chilika Lake",
            "Puri Beach",
            "Puri Jagannath temple",
            "Sun Temple"
        ],
        "placesToVisit": [
            "Ashtanga Beach",
            "bird santurcy",
            "lingraja Temple",
            "ASI Museum"
        ],
        "restaurants": [],
        "food": [
            "Chhena poda",
            "Dahi bara",
            "Ras malai",
            "Rasgulla",
        ],
        "treks": [],
        "stays": [
            "Susila Nivas"
        ]
    },
    "Puducherry": {
        "visited": true,
        "placesVisited": [
            "Sernity Beach",
            "Watch Tower",
            "Paradise Beach",
            "Mangrove Forest",
            "French War memorial",
            "Rock Beach",
            "Arovile Mytri Mandir",
            "Shanti Park",
            "Pondichery Museum",
            "New Light House",
            "Edsen Beach",
            "Promenade Beach",
            "Craft Bazar",
            "Old Light House",
            "Arulmigu Manakula Vinayagar Temple"
        ],
        "placesToVisit": [],
        "restaurants": [
            "Cormandal Cafe",
            "Cafe Qualita",
            "Crepe in touch"
        ],
        "food": [
            "Mango pad thai salad - Cormandal cafe",
            "Burnt American cheese cake - Cormandal cafe",
            "Florentine Spinach Pizza - Cafe Qualita",
            "Pondy Brest - Crepe in touch"
        ],
        "treks": [],
        "stays": [
            "Coffee ideas",
            "Hope Cafe",
            "Crepe in touch",
            "Cormandal Cafe",
            "Fizi Villa",
            "Italian Quality Relish"
        ]
    },
    "Punjab": {
        "visited": true,
        "placesVisited": [
            "Brahma Sarovar Temple",
            "Golden Temple",
            "Wagah Border",
            "Vaishno Devi Mandir"
        ],
        "placesToVisit": [
            "Jallinwala Bagh",
            "Shri Durgiana Temple"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Rajasthan": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [
            "Mehrangarh Fort",
            "Desert National Park",
            "Lord Brahma Temple",
            "National Research Centre on Camels",
            "Salim Singh Ki Haveli",
            "Jaisalmer Fort",
            "National Research Centre on Equines",
            "Jantar Mantar",
            "Patwon ki Haveli",
            "Bada Bagh",
            "Fateh Sagar Lake",
            "Jaswant Thada",
            "Jal Mahal",
            "Step well",
            "Hawa Mahal",
            "Gadisar Lake",
            "Karni Mata Temple",
            "Nathmal Ki Haveli",
            "Amer Fort",
            "Sam Sand Dunes",
            "Ambrai Ghat",
            "Nahargarh Fort",
            "Badi Lake",
            "Mount abhu",
            "Pushkar Lake",
            "Mandore Garden",
            "Jagmandir",
            "Junagarh Fort",
            "City Palace",
            "Bishnoi Village"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Sikkim": {
        "visited": true,
        "placesVisited": [
            "Tashi View Point, Bojoghari",
            "Kanchanjanga",
            "Zero Point",
            "Bakthangfalls",
            "Scintillating Sister Waterfall",
            "Sikkim Himalyan Zoological park",
            "Cornationbridge"
        ],
        "placesToVisit": [
            "Tsomgo Lake",
            "Nathula Pass",
            "Pelling skywalk",
            "Baba Harbhajan Mandir",
            "Lachen"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Singapore": {
        "visited": true,
        "placesVisited": [
            "Universal studios",
            "Vivo city mall",
            "Singapore flyer",
            "Flower Dome",
            "Wings of time",
            "Silosa point",
            "Buddha tooth relic temple",
            "Orchard road",
            "Skyline Luge Singapore",
            "Little india",
            "Merlion park",
            "Marina bay sands",
            "Super tree gove",
            "Cloud forest",
            "Gradens of the bay"
        ],
        "placesToVisit": [
            "National orchid garden",
            "Singapore cable car",
            "Singapore botanic garden",
            "IFly Singapore",
            "Singapore zoo",
            "Sands skypark obersavtion desk",
            "National museum of Singapore",
            "Skyline ride",
            "Arab stree",
            "Haji lane",
            "Suntec city",
            "Night Safari Nocturnal Wildlife Park",
            "China square"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Srinagar": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Tamil Nadu": {
        "visited": true,
        "placesVisited": [
            "Nilligiri Mountain Rail",
            "Sri Lakshmi Narayani Golden Temple",
            "Light house",
            "Panch Rath",
            "Dolphin Nose view point",
            "Pine Forest",
            "Marina beach",
            "Private tea estate",
            "Ooty lake",
            "Pykara Lake/ Paykara Waterfalls",
            "The Madras Regimental museum",
            "Valluvar Kottam",
            "Butterball",
            "Seashore Temple",
            "Ekambaranathar Temple West Gopuram",
            "Kodaikanal",
            "Adiyogi",
            "Arunachalam Temple",
            "Chocolate factory"
        ],
        "placesToVisit": [
            "Guna caves",
            "Doddabetta Peak",
            "Tea factory & museum",
            "Glendale Tea Factory Outlet",
            "Under Water aquarium",
            "Wallington Lake",
            "Eucalyptus oil factory",
            "Arichalmunai",
            "Ooty botanical garden",
            "Rallia Dam",
            "Sim's Park",
            "Emerald lake",
            "Lamb's rock"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Uttar Pradesh": {
        "visited": true,
        "placesVisited": [
            "Pontoon bridge",
            "Anand Bhawan Museum",
            "Kashi vishwanath temple",
            "Ganga Harathi"
        ],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Uttarakhand": {
        "visited": true,
        "placesVisited": [
            "Treveni Ghat",
            "Jwala Devi Temple",
            "Robber's Cave",
            "Bungee Jumping",

            "Kempty Falls"
        ],
        "placesToVisit": [
            "Camel's Back Road",
            "Lal Tibba",
            "Shikhar Falls",
            "Mussoorie Adventure Park",
            "Company Garden",
            "Chetwoode Hall",
            "Jharipani Falls",
            "Dhanaulti",
            "Gun Hill Point",
            "Mindrolling Monastery",
            "Cloud's End",
            "auli sky resort",
            "Auli Artificial Lake",
            "Mussoorie Lake",
            "Kasmanda Palace",
            "Christ Church",
            "Tapovan",
            "chenab lake",
            "Benog Wildlife Sanctuary",
            "Nag Tibba Trek",
            "Khalanga War Memorial",
            "Happy Valley",
            "Chattrakund",
            "Lake Mist",
            "Library Bazar",
            "Sir George Everest's House"
        ],
        "restaurants": [],
        "food": [],
        "treks": [
            "Kedarnath"
        ],
        "stays": [
            "Tiwari Hotel",
            "Hotel Devlok",
            "Hotel yog tapovan",
            "Bungee Jumping"
        ]
    },
    "Vietnam": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "United States of America": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "France": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "United Arab Emirates": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Japan": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "Thailand": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
    "West Bengal": {
        "visited": false,
        "placesVisited": [],
        "placesToVisit": [
            "Tiger Hill",
            "Sundarbans Mangrove forest",
            "Ghoom Monastery",
            "Batasia Loop",
            "Japanese Peace Pagoda"
        ],
        "restaurants": [],
        "food": [],
        "treks": [],
        "stays": []
    },
};

const getStatesData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        // Merge stored data with sample data for demo purposes
        // User data (stored) takes precedence over sample data
        const storedData = stored ? JSON.parse(stored) : {};
        const data = { ...SAMPLE_DATA, ...storedData };

        // Merge with full state list to ensure all states appear
        return STATES_LIST.map(name => ({
            name,
            ...INITIAL_STATE_DATA,
            ...(SAMPLE_DATA[name] || {}), // Apply sample data first
            ...(storedData[name] || {})   // Apply stored data on top
        }));
    } catch (e) {
        console.error('Error loading travel data:', e);
        return STATES_LIST.map(name => ({ name, ...INITIAL_STATE_DATA }));
    }
};

const saveStateData = (stateName, updates) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedData = stored ? JSON.parse(stored) : {};

        // Merge with existing sample data to ensure we don't lose it on first save
        const baseData = {
            ...INITIAL_STATE_DATA,
            ...(SAMPLE_DATA[stateName] || {}),
            ...(storedData[stateName] || {})
        };

        storedData[stateName] = {
            ...baseData,
            ...updates
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
        return true;
    } catch (e) {
        console.error('Error saving travel data:', e);
        return false;
    }
};

const getStateStats = () => {
    const data = getStatesData();
    const visitedCount = data.filter(s => s.visited || s.placesVisited.length > 0).length;
    const totalTreks = data.reduce((acc, curr) => acc + (curr.treks ? curr.treks.length : 0), 0);
    return {
        totalStates: STATES_LIST.length,
        visitedStates: visitedCount,
        totalTreks,
        progress: (visitedCount / STATES_LIST.length) * 100
    };
};

const getCountriesData = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        // Include sample data logic if needed, or just stored data
        // For countries we might not have sample data yet, but consistent logic is good
        const storedData = stored ? JSON.parse(stored) : {};
        const data = { ...SAMPLE_DATA, ...storedData };

        // Merge with full country list
        return COUNTRIES_LIST.map(name => ({
            name,
            ...INITIAL_STATE_DATA,
            ...(data[name] || {})
        }));
    } catch (e) {
        console.error('Error loading country data:', e);
        return COUNTRIES_LIST.map(name => ({ name, ...INITIAL_STATE_DATA }));
    }
};

const getCountryStats = () => {
    const data = getCountriesData();
    const visitedCount = data.filter(c => c.visited || c.placesVisited.length > 0).length;
    const totalTreks = data.reduce((acc, curr) => acc + (curr.treks ? curr.treks.length : 0), 0);
    return {
        totalCountries: COUNTRIES_LIST.length,
        visitedCountries: visitedCount,
        totalTreks,
        progress: (visitedCount / COUNTRIES_LIST.length) * 100
    };
};

// --- Bucket List Logic ---
const BUCKET_LIST_KEY = '__BUCKET_LIST__';

const SAMPLE_BUCKET_LIST = [
    { id: 1, text: "See the Northern Lights in Iceland", completed: false },
    { id: 2, text: "Scuba dive in the Great Barrier Reef", completed: false },
    { id: 3, text: "Hot air balloon ride in Cappadocia", completed: false },
    { id: 4, text: "Safari in Kenya's Masai Mara", completed: false },
    { id: 5, text: "Cherry Blossom season in Japan", completed: false },
    { id: 6, text: "Trek to Everest Base Camp", completed: false }
];

const getBucketList = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedData = stored ? JSON.parse(stored) : {};
        return storedData[BUCKET_LIST_KEY] || SAMPLE_BUCKET_LIST;
    } catch (e) {
        console.error('Error loading bucket list:', e);
        return SAMPLE_BUCKET_LIST;
    }
};

const saveBucketList = (items) => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const storedData = stored ? JSON.parse(stored) : {};
        storedData[BUCKET_LIST_KEY] = items;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedData));
        return true;
    } catch (e) {
        console.error('Error saving bucket list:', e);
        return false;
    }
};

window.TravelData = {
    getStatesData,
    saveStateData,
    getStateStats,
    getCountriesData,
    saveCountryData: saveStateData, // Reusing the same save function
    getCountryStats,
    getBucketList,
    saveBucketList
};

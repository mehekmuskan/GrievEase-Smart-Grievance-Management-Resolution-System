import re

CATEGORY_KEYWORDS = {
    "Water Supply": [
        "water", "drinking water", "water shortage",
        "water leakage", "pipeline", "tap water",
        "ನೀರು", "ಕುಡಿಯುವ ನೀರು", "ನೀರಿನ ಸಮಸ್ಯೆ",
        "ನೀರಿನ ಕೊರತೆ", "ನೀರಿನ ಪೈಪ್"
    ],
    "Electricity": [
        "electricity", "power cut", "power failure",
        "electricity bill", "transformer", "street light",
        "current", "ವಿದ್ಯುತ್", "ವಿದ್ಯುತ್ ಸಮಸ್ಯೆ",
        "ವಿದ್ಯುತ್ ಕಡಿತ", "ಕರೆಂಟ್"
    ],
    "Roads": [
        "road", "pothole", "street", "bridge",
        "road damage", "traffic", "ರಸ್ತೆ",
        "ಗುಂಡಿ", "ರಸ್ತೆ ಸಮಸ್ಯೆ", "ಸಂಚಾರ"
    ],
    "Sanitation": [
        "garbage", "drainage", "sewage", "waste",
        "dirty", "cleanliness", "toilet",
        "ಕಸ", "ಚರಂಡಿ", "ತ್ಯಾಜ್ಯ", "ಸ್ವಚ್ಛತೆ"
    ],
    "Healthcare": [
        "hospital", "doctor", "medicine", "health",
        "medical", "ambulance", "ಆಸ್ಪತ್ರೆ",
        "ವೈದ್ಯರು", "ಔಷಧಿ", "ಆರೋಗ್ಯ"
    ],
    "Education": [
        "school", "college", "teacher", "education",
        "classroom", "student", "ಶಾಲೆ",
        "ಕಾಲೇಜು", "ಶಿಕ್ಷಣ", "ಶಿಕ್ಷಕರು"
    ],
    "Public Safety": [
        "police", "crime", "theft", "accident",
        "danger", "safety", "harassment",
        "ಪೊಲೀಸ್", "ಕಳ್ಳತನ", "ಅಪಘಾತ",
        "ಅಪಾಯ", "ಸುರಕ್ಷತೆ"
    ]
}

RESOLUTIONS = {
    "Water Supply": "Inspect the water supply system and restore the water service.",
    "Electricity": "Assign an electricity department technician to inspect and resolve the issue.",
    "Roads": "Arrange a site inspection and schedule necessary road repairs.",
    "Sanitation": "Send sanitation workers to inspect and clean the affected area.",
    "Healthcare": "Forward the complaint to the concerned healthcare authority for immediate review.",
    "Education": "Forward the complaint to the concerned education department for investigation.",
    "Public Safety": "Forward the complaint to the appropriate public safety authority for investigation.",
    "Other": "Forward the complaint to the relevant department for review."
}

HIGH_PRIORITY_KEYWORDS = [
    "urgent", "emergency", "immediately", "danger",
    "life threatening", "accident", "fire",
    "no water for", "days without water",
    "ತುರ್ತು", "ಅಪಾಯ", "ಅಪಘಾತ", "ಬೆಂಕಿ", "ಜೀವಕ್ಕೆ ಅಪಾಯ"
]

MEDIUM_PRIORITY_KEYWORDS = [
    "problem", "issue", "damaged", "broken",
    "complaint", "ಸಮಸ್ಯೆ", "ಹಾಳಾಗಿದೆ"
]


def detect_language(text):
    if re.search(r"[\u0C80-\u0CFF]", text):
        return "Kannada"
    return "English"


def classify_complaint(title, description):
    text = f"{title} {description}".lower()

    language = detect_language(text)

    category_scores = {
        category: sum(
            1 for keyword in keywords
            if keyword.lower() in text
        )
        for category, keywords in CATEGORY_KEYWORDS.items()
    }

    best_category = max(category_scores, key=category_scores.get)
    best_score = category_scores[best_category]

    if best_score == 0:
        category = "Other"
        confidence = 0.50
    else:
        category = best_category
        confidence = min(0.65 + best_score * 0.10, 0.95)

    water_emergency = (
        "water" in text
        and any(word in text for word in [
            "no", "without", "shortage", "unavailable"
        ])
    )

    if water_emergency or any(
        keyword in text for keyword in HIGH_PRIORITY_KEYWORDS
    ):
        priority = "High"
    elif any(
        keyword in text for keyword in MEDIUM_PRIORITY_KEYWORDS
    ):
        priority = "Medium"
    else:
        priority = "Low"

    summary = description.strip()

    if len(summary) > 180:
        summary = summary[:177].rsplit(" ", 1)[0] + "..."

    return {
        "category": category,
        "priority": priority,
        "summary": summary,
        "suggested_resolution": RESOLUTIONS[category],
        "language": language,
        "confidence": round(confidence, 2),
        "explanation": (
            f"Category predicted using complaint keywords. "
            f"Detected language: {language}. "
            f"Priority assigned using urgency keywords."
        )
    }

import re

EMAIL = re.compile(r'[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}')
PHONE = re.compile(r'(\+?\d{1,2}\s?)?(\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}')
SSN   = re.compile(r'\b\d{3}-\d{2}-\d{4}\b')
CARD  = re.compile(r'\b(?:\d[ -]*?){13,16}\b')

def redact(text: str) -> str:
    text = EMAIL.sub("[REDACTED_EMAIL]", text)
    text = PHONE.sub("[REDACTED_PHONE]", text)
    text = SSN.sub("[REDACTED_SSN]", text)
    text = CARD.sub("[REDACTED_CARD]", text)
    return text
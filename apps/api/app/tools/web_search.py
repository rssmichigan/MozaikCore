from typing import List, Dict

def web_search(query: str) -> List[Dict]:
    """
    Stub search: returns static results now.
    Later: call a real web API and return [{"title":..., "url":..., "snippet":...}, ...]
    """
    return [
        {"title": "Example Domain", "url": "https://example.com", "snippet": "This domain is for use in illustrative examples."}
    ]

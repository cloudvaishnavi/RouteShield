def validate_request(data, required_fields):
    if not data: return False, 'Request payload is empty'
    missing = [f for f in required_fields if f not in data]
    if missing: return False, f"Missing required fields: {', '.join(missing)}"
    return True, None

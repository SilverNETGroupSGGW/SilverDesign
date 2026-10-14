# source: api-python/main.py lines 120-130
# https://github.com/SilverNETGroupSGGW/Charmander/blob/63b4bc9373cb150718fb6a351d4aa006368a750e/api-python/main.py#L120-L130

@app.post("/register-device", status_code=status.HTTP_201_CREATED)
def register_device(request: RegisterDeviceRequest):
    with _get_db() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO device_tokens (token) VALUES (?)",
            (request.token,),
        )
        conn.commit()
        total = conn.execute("SELECT COUNT(*) FROM device_tokens").fetchone()[0]
    print(f"Device registered: {request.token}")
    return {"registered": request.token, "total": total}

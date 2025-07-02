import json
import socket

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # Doesn't have to connect
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
    finally:
        s.close()
    return ip

ip = get_local_ip()

with open("ip.json", "w") as f:
    json.dump({"ip": ip}, f)

print(f"[write_ip] Saved IP {ip} to ip.json")

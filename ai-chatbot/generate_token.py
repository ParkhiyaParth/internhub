import datetime
import os

import jwt
from dotenv import load_dotenv

load_dotenv()

secret = os.getenv("JWT_SECRET", "change_me")
algo = os.getenv("JWT_ALGORITHM", "HS256")

payload = {
    "sub": "admin_user_001",
    "name": "Super Admin",
    "role": "Admin",
    "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(days=7),
}

token = jwt.encode(payload, secret, algorithm=algo)

print("Generated token:\n")
print(token)

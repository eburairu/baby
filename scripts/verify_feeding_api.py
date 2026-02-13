import urllib.request
import urllib.parse
import json
import datetime
import sys
import http.cookiejar

# Configuration
API_BASE_URL = "http://localhost:8000/api"

# Setup cookie jar
cookie_jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(cookie_jar))
urllib.request.install_opener(opener)

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    if data is not None:
        data_bytes = json.dumps(data).encode('utf-8')
        headers["Content-Type"] = "application/json"
    else:
        data_bytes = None

    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode('utf-8')
            if res_body:
                return json.loads(res_body), response.status
            return None, response.status
    except urllib.error.HTTPError as e:
        print(f"HTTP Error: {e.code} - {e.read().decode('utf-8')}")
        return None, e.code
    except Exception as e:
        print(f"Error: {e}")
        return None, 500

def test_feeding_api():
    timestamp = int(datetime.datetime.now().timestamp())
    username = f"test_user_{timestamp}"
    email = f"test_{timestamp}@example.com"
    password = "password123"
    family_name = f"Test Family {timestamp}"
    
    print(f"Registering family for user: {username}")
    # Register Family
    register_url = f"{API_BASE_URL}/auth/register/family"
    reg_data = {
        "name": family_name,
        "username": username, # Using username as per auth.py
        "password": password
    }
    
    # Note: The auth router uses 'username' field for registration, not email directly in UserCreate?
    # Checking auth.py: register_family takes FamilyCreate which has username.
    # Let's check schemas/family.py to be sure about FamilyCreate fields
    
    _, status = make_request(register_url, method="POST", data=reg_data)
    
    if status != 200:
        print("Registration failed")
        return

    print("Registration successful. Cookie should be set in jar.")

    # Verify we can get current user
    me_res, status = make_request(f"{API_BASE_URL}/auth/me")
    if status != 200:
        print("Failed to get current user info. Cookie might not be working.")
        return
    print(f"Logged in as: {me_res['username']}")

    # Create Baby
    baby_data = {"name": "Test Baby", "date_of_birth": "2024-01-01", "gender": "BOY"}
    baby_res, status = make_request(f"{API_BASE_URL}/babies/", method="POST", data=baby_data)
    
    if status != 200:
        print("Failed to create baby")
        return
    baby_id = baby_res["id"]
    print(f"Baby created with ID: {baby_id}")

    # 2. Create Feeding (Breast)
    feeding_time = datetime.datetime.now().isoformat()
    breast_data = {
        "baby_id": baby_id,
        "feeding_time": feeding_time,
        "feeding_type": "BREAST",
        "duration_minutes": 15,
        "notes": "Left side"
    }
    breast_res, status = make_request(f"{API_BASE_URL}/feedings/", method="POST", data=breast_data)
    if status != 200:
        print("Failed to create breast feeding")
        return
    breast_id = breast_res["id"]
    print(f"Breast feeding record created: {breast_id}")

    # 3. Create Feeding (Bottle)
    bottle_data = {
        "baby_id": baby_id,
        "feeding_time": feeding_time,
        "feeding_type": "BOTTLE",
        "amount_ml": 120,
        "notes": "Formula"
    }
    bottle_res, status = make_request(f"{API_BASE_URL}/feedings/", method="POST", data=bottle_data)
    if status != 200:
        print("Failed to create bottle feeding")
        return
    bottle_id = bottle_res["id"]
    print(f"Bottle feeding record created: {bottle_id}")

    # 4. Get Feedings
    feedings, status = make_request(f"{API_BASE_URL}/feedings/?baby_id={baby_id}")
    if status != 200:
        print("Failed to get feedings")
        return
    
    if len(feedings) != 2:
        print(f"Expected 2 feedings, got {len(feedings)}")
        return
    print("Feedings retrieved successfully.")

    # 5. Delete Feeding
    _, status = make_request(f"{API_BASE_URL}/feedings/{breast_id}", method="DELETE")
    if status != 200:
        print("Failed to delete feeding")
        return
    print("Feeding deleted successfully.")

    # Verify deletion
    feedings, status = make_request(f"{API_BASE_URL}/feedings/?baby_id={baby_id}")
    if len(feedings) != 1:
        print(f"Expected 1 feeding after deletion, got {len(feedings)}")
        return
    
    print("All backend verification tests passed!")

if __name__ == "__main__":
    try:
        test_feeding_api()
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

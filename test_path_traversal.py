import os

frontend_build_path = "/app/frontend/out"
full_path = "../../etc/passwd"

joined_path = os.path.join(frontend_build_path, full_path)
print(f"Joined path: {joined_path}")
print(f"Is absolute: {os.path.isabs(joined_path)}")
print(f"Real path: {os.path.realpath(joined_path)}")

full_path_2 = "/etc/passwd"
joined_path_2 = os.path.join(frontend_build_path, full_path_2)
print(f"Joined path 2: {joined_path_2}")

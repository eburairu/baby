import hashlib


def hash_token(token: str) -> str:
    """セッショントークンを SHA-256 でハッシュ化して返す。"""
    return hashlib.sha256(token.encode()).hexdigest()

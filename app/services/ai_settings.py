import os
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from google import genai
from app.models.system_settings import SystemSetting


def get_ai_config(db: Session) -> Dict[str, Any]:
    """
    system_settings テーブルから AI 関連の設定を取得し、辞書形式で返す。
    DB に設定がない場合はデフォルト値を返す。
    """
    settings = db.query(SystemSetting).all()
    config = {s.key: s.value for s in settings}

    # 型変換
    if "llm_temperature" in config:
        try:
            config["llm_temperature"] = float(config["llm_temperature"])
        except (ValueError, TypeError):
            config["llm_temperature"] = 0.7
    
    if "llm_max_tokens" in config:
        try:
            config["llm_max_tokens"] = int(config["llm_max_tokens"])
        except (ValueError, TypeError):
            config["llm_max_tokens"] = 800

    # 機能フラグの Boolean 変換
    for key in ["ai_enabled_chat", "ai_enabled_summary", "ai_enabled_feedback"]:
        if key in config:
            config[key] = config[key].lower() == "true"
        else:
            config[key] = True  # デフォルトは True

    # 推論（思考）レベルの設定 (none, low, medium, high)
    if "llm_reasoning_effort" not in config:
        config["llm_reasoning_effort"] = "none"

    return config


def get_available_llm_models() -> List[Dict[str, str]]:
    """
    Google AI Studio から利用可能なモデルリストを取得する。
    """
    api_key = os.environ.get("LLM_API_KEY")
    if not api_key:
        return []

    try:
        client = genai.Client(api_key=api_key)
        models = []
        for m in client.models.list():
            if m.supported_actions and "generateContent" in m.supported_actions:
                # 'models/gemini-1.5-pro' -> 'gemini-1.5-pro'
                model_id = m.name.split("/")[-1]
                models.append({
                    "id": model_id,
                    "name": m.display_name,
                    "description": m.description or ""
                })
        return models
    except Exception as e:
        print(f"Error fetching models: {e}")
        # フォールバックとして主要なモデルを返す
        return [
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "description": "Highly capable model"},
            {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "description": "Fast and efficient model"},
            {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "description": "Balanced performance"},
        ]

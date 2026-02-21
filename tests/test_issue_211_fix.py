import json
import re

def _extract_json(text: str) -> str:
    text = text.strip()
    match = re.search(r"```(?:json)?\s*(.*?)\s*```", text, re.DOTALL)
    if match:
        return match.group(1).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1].strip()
    return text

def test_extract_json_with_extra_text():
    bad_response = """```json
{"feedback": "ミルクをしっかり飲めていて安心ですね。", "has_concern": false}
```
以上の内容でフィードバックを生成しました。"""
    
    extracted = _extract_json(bad_response)
    assert extracted == '{"feedback": "ミルクをしっかり飲めていて安心ですね。", "has_concern": false}'
    json.loads(extracted)

def test_extract_json_no_code_block():
    response = "AIからの回答： {\"feedback\": \"順調です\", \"has_concern\": false} 以上です。"
    extracted = _extract_json(response)
    assert extracted == '{"feedback": "順調です", "has_concern": false}'
    json.loads(extracted)

if __name__ == "__main__":
    test_extract_json_with_extra_text()
    test_extract_json_no_code_block()
    print("Logic tests passed!")

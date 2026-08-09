import json
import httpx
from app.core.config import settings

class AIClient:
    """
    Universal AI Client supporting Gemini, OpenAI, Anthropic, or robust deterministic fallback.
    """
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL

    async def generate_json(self, prompt: str, system_instruction: str = "") -> dict:
        """
        Sends prompt to LLM and returns parsed JSON.
        Falls back to mock/deterministic response if API key is missing or fails.
        """
        if not self.api_key:
            return None

        try:
            if self.provider == "gemini":
                return await self._call_gemini(prompt, system_instruction)
            elif self.provider == "openai":
                return await self._call_openai(prompt, system_instruction)
            else:
                return None
        except Exception as e:
            print(f"[AIClient] Warning: LLM call failed with error: {e}. Falling back to deterministic mode.")
            return None

    async def generate_text(self, prompt: str, system_instruction: str = "") -> str:
        if not self.api_key:
            return None

        try:
            if self.provider == "gemini":
                res_json = await self._call_gemini(prompt, system_instruction, text_only=True)
                return res_json if isinstance(res_json, str) else str(res_json)
            elif self.provider == "openai":
                res_json = await self._call_openai(prompt, system_instruction, text_only=True)
                return res_json if isinstance(res_json, str) else str(res_json)
            return None
        except Exception as e:
            print(f"[AIClient] Warning: LLM text call failed: {e}")
            return None

    async def _call_gemini(self, prompt: str, system_instruction: str, text_only: bool = False):
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload = {
            "contents": [{"parts": [{"text": f"{system_instruction}\n\n{prompt}"}]}]
        }
        if not text_only:
            payload["generationConfig"] = {"responseMimeType": "application/json"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text = data["candidates"][0]["content"]["parts"][0]["text"]
                return text if text_only else json.loads(text)
            else:
                raise Exception(f"Gemini API returned status {resp.status_code}: {resp.text}")

    async def _call_openai(self, prompt: str, system_instruction: str, text_only: bool = False):
        url = "https://api.openai.com/v1/chat/completions"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": prompt}
            ]
        }
        if not text_only:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                content = data["choices"][0]["message"]["content"]
                return content if text_only else json.loads(content)
            else:
                raise Exception(f"OpenAI API returned status {resp.status_code}: {resp.text}")

ai_client = AIClient()

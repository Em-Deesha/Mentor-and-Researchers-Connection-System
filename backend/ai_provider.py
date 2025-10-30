from abc import ABC, abstractmethod
from typing import Optional
import openai
import google.generativeai as genai
from config import settings

class AIProvider(ABC):
    @abstractmethod
    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

class OpenAIProvider(AIProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OpenAI API key not configured")
        self.client = openai.AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            messages.append({"role": "user", "content": prompt})

            response = await self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                temperature=0.7,
                max_tokens=1500
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

class GeminiProvider(AIProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("Gemini API key not configured")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        # Try models that work with current API version
        models_to_try = ['models/gemini-1.5-flash-latest', 'models/gemini-1.5-pro-latest', 'models/gemini-1.5-flash', 'models/gemini-1.5-pro']
        self.model = None
        for model_name in models_to_try:
            try:
                self.model = genai.GenerativeModel(model_name)
                # Test if it works
                test_resp = self.model.generate_content("test")
                break
            except:
                continue
        if not self.model:
            # Final fallback
            self.model = genai.GenerativeModel('models/gemini-1.5-flash')

    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        try:
            full_prompt = prompt
            if system_prompt:
                full_prompt = f"{system_prompt}\n\n{prompt}"

            response = self.model.generate_content(full_prompt)
            return response.text
        except Exception as e:
            raise Exception(f"Gemini API error: {str(e)}")

class AIProviderFactory:
    _providers = {}

    @classmethod
    def get_provider(cls, provider_name: str = None) -> AIProvider:
        if provider_name is None:
            provider_name = settings.AI_PROVIDER

        if provider_name not in cls._providers:
            if provider_name.lower() == "openai":
                try:
                    cls._providers[provider_name] = OpenAIProvider()
                except Exception as e:
                    print(f"Failed to initialize OpenAI: {e}. Falling back to Gemini.")
                    provider_name = "gemini"

            if provider_name.lower() == "gemini":
                try:
                    cls._providers[provider_name] = GeminiProvider()
                except Exception as e:
                    print(f"Failed to initialize Gemini: {e}")
                    raise Exception("No AI provider available")

        return cls._providers[provider_name]

    @classmethod
    async def generate_with_fallback(cls, prompt: str, system_prompt: Optional[str] = None, preferred_provider: str = None) -> tuple[str, str]:
        providers_to_try = []

        if preferred_provider:
            providers_to_try.append(preferred_provider)

        if settings.AI_PROVIDER not in providers_to_try:
            providers_to_try.append(settings.AI_PROVIDER)

        other_providers = ["openai", "gemini"]
        for provider in other_providers:
            if provider not in providers_to_try:
                providers_to_try.append(provider)

        last_error = None
        for provider_name in providers_to_try:
            try:
                provider = cls.get_provider(provider_name)
                response = await provider.generate_response(prompt, system_prompt)
                return response, provider_name
            except Exception as e:
                last_error = e
                print(f"Provider {provider_name} failed: {e}")
                continue

        raise Exception(f"All AI providers failed. Last error: {last_error}")

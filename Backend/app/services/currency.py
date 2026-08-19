import json
import httpx
import os
import redis
from datetime import timedelta

# Initialize Redis client
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = os.getenv("REDIS_PORT", "6379")
redis_client = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

CURRENCY_CACHE_KEY = "ukla:exchange_rates"
CACHE_EXPIRY = timedelta(hours=24)
API_URL = "https://open.er-api.com/v6/latest/USD"

async def get_exchange_rates():
    """
    Fetches exchange rates from Redis cache.
    If not found, fetches from the external API and caches it.
    Returns a dictionary of rates relative to USD.
    """
    try:
        cached_data = redis_client.get(CURRENCY_CACHE_KEY)
        if cached_data:
            return json.loads(cached_data)
    except Exception as e:
        print(f"Redis error: {e}")

    # Cache miss, fetch from API
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(API_URL)
            response.raise_for_status()
            data = response.json()
            rates = data.get("rates", {})
            
            if rates:
                # Save to cache
                try:
                    redis_client.setex(
                        CURRENCY_CACHE_KEY,
                        CACHE_EXPIRY,
                        json.dumps(rates)
                    )
                except Exception as e:
                    print(f"Failed to cache exchange rates: {e}")
            return rates
        except Exception as e:
            print(f"Error fetching from exchange API: {e}")
            # Fallback hardcoded rates just in case
            return {
                "USD": 1,
                "EUR": 0.9,
                "GBP": 0.78,
                "SGD": 1.34,
                "THB": 35.5,
                "MMK": 2100
            }

async def convert_currency(amount: float, from_curr: str, to_curr: str) -> float:
    rates = await get_exchange_rates()
    from_rate = rates.get(from_curr.upper(), 1)
    to_rate = rates.get(to_curr.upper(), 1)
    
    # Convert to USD first, then to target currency
    usd_amount = amount / from_rate
    target_amount = usd_amount * to_rate
    
    return round(target_amount, 2)

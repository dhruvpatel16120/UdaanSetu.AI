# Gemini API Quota Management

## Current Issue

You've hit the daily quota limit for Gemini-2.5-flash (20 requests/day on free tier).

## Solution Applied

✅ **Switched to `gemini-1.5-flash`** which has a more generous free tier quota:

- **1,500 requests per day** (RPD)
- **1 million tokens per minute** (TPM)
- **15 requests per minute** (RPM)

## File Changed

- `backend/app/services/chat_mentor.py` - Line 12
- Changed from: `"gemini-2.5-flash"`
- Changed to: `"gemini-1.5-flash"`

## What to Do Now

### Immediate Fix

Your backend server is running in reload mode, so the change is automatically applied. Just wait **47 seconds** as indicated in the error message, then try again.

### Long-term Solutions

#### Option 1: Use Gemini 1.5 Flash (Current)

- ✅ **Free tier**: 1,500 requests/day
- ✅ Good performance
- ✅ Lower cost
- Best for development and testing

#### Option 2: Upgrade to Paid Plan

If you need gemini-2.5-flash for production:

1. Visit: https://ai.google.dev/pricing
2. Enable billing for your Google Cloud project
3. Get higher quotas and access to advanced models

#### Option 3: Implement Rate Limiting

Add rate limiting to prevent quota exhaustion:

```python
# Add to chat_mentor.py
from time import time, sleep

class MentorChatService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = "gemini-1.5-flash"
        self.last_request_time = 0
        self.min_request_interval = 1  # 1 second between requests

    async def chat_with_mentor(self, ...):
        # Rate limiting
        current_time = time()
        time_since_last_request = current_time - self.last_request_time
        if time_since_last_request < self.min_request_interval:
            sleep(self.min_request_interval - time_since_last_request)

        self.last_request_time = time()
        # ... rest of the code
```

#### Option 4: Add Request Caching

Cache similar queries to reduce API calls:

```python
from functools import lru_cache
import hashlib

def cache_key(query: str, language: str) -> str:
    return hashlib.md5(f"{query}:{language}".encode()).hexdigest()

# Store frequently asked questions
FAQ_CACHE = {
    # English
    "what_is_udaansetu": "UdaanSetu.AI is an AI-powered...",
    # Gujarati
    "ઉડાનસેતુ_શું_છે": "ઉડાનસેતુ.AI એ એક AI-સંચાલિત...",
}
```

## Monitoring Your Usage

### Check Current Usage

Visit: https://ai.dev/rate-limit

### Monitor API Calls

Add logging to track requests:

```python
import logging

logger = logging.getLogger(__name__)

async def chat_with_mentor(self, ...):
    logger.info(f"API Call - User: {user_id}, Model: {self.model_name}")
    # ... API call
    logger.info(f"API Response received - Tokens used: {response.usage}")
```

## Quota Limits Comparison

| Model                | Free Tier RPD | Free Tier RPM | Paid Tier RPD |
| -------------------- | ------------- | ------------- | ------------- |
| **gemini-1.5-flash** | 1,500         | 15            | 2,000         |
| gemini-1.5-pro       | 50            | 2             | 1,000         |
| gemini-2.5-flash     | 20            | 10            | 4,000         |
| gemini-2.5-pro       | 10            | 2             | 2,000         |

## Best Practices

### 1. Optimize Prompts

- Keep system prompts concise
- Only include necessary context in follow-up messages
- Current implementation already uses LITE MODE for follow-ups ✅

### 2. Use History Wisely

```python
# Current implementation (good)
for msg in history[-6:]:  # Only last 6 messages
```

### 3. Implement Error Handling

```python
try:
    response = await llm.ainvoke(messages)
    return response.content
except Exception as e:
    if "RESOURCE_EXHAUSTED" in str(e):
        return "⏰ We've reached our daily limit. Please try again in a few hours or upgrade to premium for unlimited access."
    return f"I'm having trouble connecting. Please try again."
```

### 4. Add Fallback Responses

For common questions, use pre-written responses instead of API calls:

```python
COMMON_RESPONSES = {
    "en": {
        "what_is_udaansetu": "UdaanSetu.AI is an AI-powered Career Mentor...",
        "how_to_start": "To get started with your career journey...",
    },
    "gu": {
        "ઉડાનસેતુ_શું_છે": "ઉડાનસેતુ.AI એક AI-સંચાલિત કારકિર્દી માર્ગદર્શક છે...",
    }
}
```

## Troubleshooting

### Error: "RESOURCE_EXHAUSTED"

**Solution**: Wait for the retry delay (shown in error) or switch models

### Error: "INVALID_ARGUMENT"

**Solution**: Check your prompt length and format

### Error: "PERMISSION_DENIED"

**Solution**: Verify your API key in `.env` file

## Next Steps

1. ✅ **Model switched to gemini-1.5-flash** - Active now
2. ⏰ **Wait 47 seconds** for quota reset window
3. 🧪 **Test the chat** - Should work with new model
4. 📊 **Monitor usage** at https://ai.dev/rate-limit
5. 🎯 **Consider implementing caching** for production

## Resources

- [Gemini API Pricing](https://ai.google.dev/pricing)
- [Rate Limits Documentation](https://ai.google.dev/gemini-api/docs/rate-limits)
- [Usage Monitoring](https://ai.dev/rate-limit)
- [Best Practices](https://ai.google.dev/gemini-api/docs/best-practices)

# Solstice Agent API

A FastAPI-based backend service that powers AI features for the Solstice wellness app.

## Features

- **URL Parsing**: Converts content URLs into structured workout cards
- **Cue Generation**: Creates instructional cues for exercise cards
- **Routine Recommendations**: Suggests personalized routines based on user preferences

## Tech Stack

- **FastAPI**: Modern, high-performance web framework
- **Ollama**: Local LLM inference using Mistral 7B
- **Pydantic**: Data validation and settings management
- **HTTPX**: Asynchronous HTTP client
- **Uvicorn**: ASGI server

## Setup

### Local Development

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Install Ollama:
   ```bash
   curl -fsSL https://ollama.com/install.sh | sh
   ```

3. Pull the Mistral model:
   ```bash
   ollama pull mistral
   ```

4. Create a `.env` file:
   ```
   OLLAMA_HOST=http://localhost:11434
   OLLAMA_MODEL=mistral
   USE_OPENROUTER=false
   OPENROUTER_API_KEY=  # Optional fallback
   ```

5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Docker Deployment

1. Build the Docker image:
   ```bash
   docker build -t solstice-agent-api .
   ```

2. Run the container:
   ```bash
   docker run -p 8000:8000 -d solstice-agent-api
   ```

### Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables as specified in the `.env` file

## API Endpoints

### Health Check
```
GET /
```

### Parse URL
```
POST /parse
{
  "url": "https://youtube.com/watch?v=xyz"
}
```

### Generate Cues
```
POST /cue
{
  "card": {
    "title": "Downward Dog",
    "mediaUrl": "...",
    "startTime": 5,
    "endTime": 20
  }
}
```

### Recommend Routines
```
POST /recommend
{
  "userId": "abc123",
  "tags": ["mobility", "strength"]
}
```

## Authentication

All endpoints require a Bearer token in the Authorization header. This token should be the user's ID from Supabase.

```
Authorization: Bearer user-id-from-supabase
```

## Integration with Solstice App

Update the `agentService.ts` file in the Solstice app to use these endpoints:

```typescript
const AGENT_API = process.env.AGENT_API_URL;

export async function intakeAgent(url: string, user: User) {
  const response = await fetch(`${AGENT_API}/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.id}`
    },
    body: JSON.stringify({ url })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to parse URL: ${response.statusText}`);
  }
  
  return await response.json();
}
```

## Monitoring and Logs

The API includes request logging middleware that logs:
- Request method and path
- Response status code
- Processing time

All logs are formatted with timestamps and log levels for easy filtering.

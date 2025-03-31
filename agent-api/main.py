"""
Solstice Agent API
FastAPI backend for Solstice app's AI features
"""
import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime

import httpx
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, HttpUrl
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("solstice-agent-api")

# Initialize FastAPI app
app = FastAPI(
    title="Solstice Agent API",
    description="AI-powered backend for the Solstice wellness app",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment variables
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

# Models
class UrlRequest(BaseModel):
    url: HttpUrl = Field(..., description="URL to parse into cards")

class Card(BaseModel):
    id: Optional[str] = Field(None, description="Unique identifier")
    title: str = Field(..., description="Card title")
    description: Optional[str] = Field(None, description="Card description")
    source_url: Optional[str] = Field(None, description="Source URL")
    source_type: str = Field(..., description="Source type (youtube, instagram, etc.)")
    thumbnail_url: Optional[str] = Field(None, description="Thumbnail URL")
    media_url: Optional[str] = Field(None, description="Media URL")
    startTime: Optional[float] = Field(None, description="Start time in seconds")
    endTime: Optional[float] = Field(None, description="End time in seconds")
    duration: Optional[float] = Field(None, description="Duration in seconds")
    sets: Optional[int] = Field(None, description="Number of sets")
    reps: Optional[int] = Field(None, description="Number of reps")
    notes: Optional[str] = Field(None, description="Additional notes")
    cues: Optional[List[Dict[str, Any]]] = Field(None, description="List of cues")
    createdBy: str = Field("agent", description="Created by agent or user")

class ParseResponse(BaseModel):
    cards: List[Card] = Field(..., description="List of parsed cards")

class CardRequest(BaseModel):
    card: Card = Field(..., description="Card to generate cues for")

class Cue(BaseModel):
    id: Optional[str] = Field(None, description="Unique identifier")
    label: str = Field(..., description="Cue label")
    text: Optional[str] = Field(None, description="Cue text")
    instructions: Optional[str] = Field(None, description="Cue instructions")
    timestamp: Optional[float] = Field(None, description="Timestamp in seconds")
    type: Optional[str] = Field(None, description="Cue type")

class CueResponse(BaseModel):
    cues: List[Cue] = Field(..., description="List of generated cues")

class RecommendRequest(BaseModel):
    userId: str = Field(..., description="User ID")
    tags: Optional[List[str]] = Field(None, description="List of tags")

class RoutineRecommendation(BaseModel):
    id: str = Field(..., description="Routine ID")
    title: str = Field(..., description="Routine title")
    description: Optional[str] = Field(None, description="Routine description")
    tags: Optional[List[str]] = Field(None, description="List of tags")

class RecommendResponse(BaseModel):
    routines: List[RoutineRecommendation] = Field(..., description="List of recommended routines")

# Helper functions
async def get_user_from_token(authorization: str = Header(None)) -> str:
    """
    Extract user ID from authorization header
    In a real implementation, this would validate the token with Supabase
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")
    
    # For now, just return the token as the user ID
    # In production, validate this token with Supabase
    return authorization.replace("Bearer ", "")

async def call_llm(prompt: str) -> str:
    """Call LLM using OpenRouter"""
    try:
        if not OPENROUTER_API_KEY:
            logger.error("OpenRouter API key is missing")
            raise HTTPException(status_code=500, detail="OpenRouter API key is missing")
            
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "mistralai/mistral-7b-instruct",
                    "messages": [{"role": "user", "content": prompt}],
                },
            )
            result = response.json()
            return result["choices"][0]["message"]["content"]
    except Exception as e:
        logger.error(f"Error calling LLM: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error calling LLM: {str(e)}")

def detect_platform(url: str) -> str:
    """Detect platform from URL"""
    url_lower = url.lower()
    
    if "youtube.com" in url_lower or "youtu.be" in url_lower:
        return "youtube"
    elif "instagram.com" in url_lower:
        return "instagram"
    elif "tiktok.com" in url_lower:
        return "tiktok"
    elif "twitter.com" in url_lower or "x.com" in url_lower:
        return "twitter"
    elif any(term in url_lower for term in ["medium.com", "blog.", ".blog", "article"]):
        return "article"
    else:
        return "web"

# API routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {"status": "ok", "message": "Solstice Agent API is running"}

@app.post("/parse", response_model=ParseResponse)
async def parse_url(
    request: UrlRequest,
    user_id: str = Depends(get_user_from_token)
):
    """Parse a URL into cards"""
    url = str(request.url)
    platform = detect_platform(url)
    
    logger.info(f"Parsing URL: {url} (Platform: {platform})")
    
    # Construct prompt for the LLM
    prompt = f"""
    You are an AI assistant for a wellness app called Solstice. Parse the following {platform} URL into a structured workout routine:
    
    URL: {url}
    
    Break this content into logical segments (cards) that represent distinct exercises or movements.
    For each segment, identify:
    1. A clear title
    2. Approximate start and end times (in seconds)
    3. Brief description
    4. Number of sets and reps (if applicable)
    
    Return your response as a JSON array of cards with the following structure:
    {{
      "cards": [
        {{
          "title": "Exercise Name",
          "description": "Brief description",
          "source_url": "{url}",
          "source_type": "{platform}",
          "startTime": 30,
          "endTime": 60,
          "duration": 30,
          "sets": 3,
          "reps": 10,
          "notes": "Additional notes",
          "createdBy": "agent"
        }}
      ]
    }}
    
    Only return valid JSON without any additional text.
    """
    
    try:
        # Call LLM
        llm_response = await call_llm(prompt)
        
        # Extract JSON from response
        try:
            # Try to parse the entire response as JSON
            result = json.loads(llm_response)
        except json.JSONDecodeError:
            # If that fails, try to extract JSON from the text
            import re
            json_match = re.search(r'```json\n(.*?)\n```', llm_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
            else:
                # Last resort: find anything that looks like JSON
                json_match = re.search(r'({.*})', llm_response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise HTTPException(status_code=500, detail="Failed to parse LLM response")
        
        # Ensure the response has the expected structure
        if "cards" not in result:
            raise HTTPException(status_code=500, detail="Invalid response format from LLM")
        
        # Add generated timestamps
        timestamp = datetime.now().isoformat()
        for card in result["cards"]:
            if "source_url" not in card or not card["source_url"]:
                card["source_url"] = url
            if "source_type" not in card or not card["source_type"]:
                card["source_type"] = platform
            
            # Generate a unique ID if not present
            if "id" not in card or not card["id"]:
                import uuid
                card["id"] = f"card-{uuid.uuid4()}"
        
        return result
    
    except Exception as e:
        logger.error(f"Error parsing URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error parsing URL: {str(e)}")

@app.post("/cue", response_model=CueResponse)
async def generate_cues(
    request: CardRequest,
    user_id: str = Depends(get_user_from_token)
):
    """Generate cues for a card"""
    card = request.card
    
    logger.info(f"Generating cues for card: {card.title}")
    
    # Construct prompt for the LLM
    prompt = f"""
    You are an AI assistant for a wellness app called Solstice. Generate instructional cues for the following exercise:
    
    Exercise: {card.title}
    Description: {card.description or ""}
    Duration: {card.duration or ""} seconds
    
    Generate 3-5 specific, actionable cues that would help someone perform this exercise correctly.
    Each cue should focus on form, breathing, tempo, intensity, or other important aspects.
    
    Return your response as a JSON object with the following structure:
    {{
      "cues": [
        {{
          "label": "Keep core engaged",
          "instructions": "Maintain tension in your abdominal muscles throughout the movement",
          "type": "form"
        }},
        {{
          "label": "Breathe deeply",
          "instructions": "Inhale on the eccentric phase, exhale on the concentric phase",
          "type": "breathing"
        }}
      ]
    }}
    
    Valid cue types: "form", "breathing", "tempo", "focus", "intensity", "general"
    
    Only return valid JSON without any additional text.
    """
    
    try:
        # Call LLM
        llm_response = await call_llm(prompt)
        
        # Extract JSON from response
        try:
            # Try to parse the entire response as JSON
            result = json.loads(llm_response)
        except json.JSONDecodeError:
            # If that fails, try to extract JSON from the text
            import re
            json_match = re.search(r'```json\n(.*?)\n```', llm_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
            else:
                # Last resort: find anything that looks like JSON
                json_match = re.search(r'({.*})', llm_response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise HTTPException(status_code=500, detail="Failed to parse LLM response")
        
        # Ensure the response has the expected structure
        if "cues" not in result:
            raise HTTPException(status_code=500, detail="Invalid response format from LLM")
        
        # Add IDs to cues
        for cue in result["cues"]:
            if "id" not in cue or not cue["id"]:
                import uuid
                cue["id"] = f"cue-{uuid.uuid4()}"
        
        return result
    
    except Exception as e:
        logger.error(f"Error generating cues: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating cues: {str(e)}")

@app.post("/recommend", response_model=RecommendResponse)
async def recommend_routines(
    request: RecommendRequest,
    user_id: str = Depends(get_user_from_token)
):
    """Recommend routines based on user profile and behavior"""
    tags = request.tags or []
    
    logger.info(f"Generating recommendations for user: {request.userId} with tags: {tags}")
    
    # Construct prompt for the LLM
    prompt = f"""
    You are an AI assistant for a wellness app called Solstice. Generate personalized routine recommendations for a user with the following preferences:
    
    User ID: {request.userId}
    Tags/Interests: {', '.join(tags) if tags else 'Not specified'}
    
    Generate 3-5 routine recommendations that would appeal to this user.
    
    Return your response as a JSON object with the following structure:
    {{
      "routines": [
        {{
          "id": "r-1",
          "title": "Morning Mobility Flow",
          "description": "A gentle routine to improve joint mobility and wake up your body",
          "tags": ["mobility", "morning", "beginner"]
        }},
        {{
          "id": "r-2",
          "title": "Quick Core Blast",
          "description": "An efficient core workout that takes just 10 minutes",
          "tags": ["core", "quick", "intermediate"]
        }}
      ]
    }}
    
    Only return valid JSON without any additional text.
    """
    
    try:
        # Call LLM
        llm_response = await call_llm(prompt)
        
        # Extract JSON from response
        try:
            # Try to parse the entire response as JSON
            result = json.loads(llm_response)
        except json.JSONDecodeError:
            # If that fails, try to extract JSON from the text
            import re
            json_match = re.search(r'```json\n(.*?)\n```', llm_response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group(1))
            else:
                # Last resort: find anything that looks like JSON
                json_match = re.search(r'({.*})', llm_response, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group(1))
                else:
                    raise HTTPException(status_code=500, detail="Failed to parse LLM response")
        
        # Ensure the response has the expected structure
        if "routines" not in result:
            raise HTTPException(status_code=500, detail="Invalid response format from LLM")
        
        return result
    
    except Exception as e:
        logger.error(f"Error generating recommendations: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests"""
    start_time = datetime.now()
    response = await call_next(request)
    process_time = (datetime.now() - start_time).total_seconds()
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.4f}s")
    return response

# Main entry point
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

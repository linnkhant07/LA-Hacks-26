"""
Story models that match the TypeScript schema exactly.
Based on /backend/src/types/index.ts
"""

from pydantic import BaseModel
from typing import List, Optional, Literal

class Hotspot(BaseModel):
    object: str
    bbox: List[float]  # [x1, y1, x2, y2]

class StoryChoice(BaseModel):
    question: str
    option_a: 'OptionBranch'
    option_b: 'OptionBranch'

class OptionBranch(BaseModel):
    label: str
    pages: List['StoryPage']

class StoryPage(BaseModel):
    page_id: str
    narration: str
    image_prompt: str
    image_url: str = ""  # Empty until populated by image generation
    audio_url: str = ""  # Empty - handled by voice agents
    hotspots: List[Hotspot] = []
    choice: Optional[StoryChoice] = None

class Narrator(BaseModel):
    type: Literal['animal', 'custom']
    character: Literal['fox', 'owl', 'bear', 'custom']
    voice_id: str = ""

class CYUItem(BaseModel):
    type: Literal['voice', 'drag', 'draw']
    question: str

class Story(BaseModel):
    id: Optional[str] = None  # MongoDB _id becomes id in Python
    title: str
    topic: str
    narrator: Narrator
    pages: List[StoryPage]
    cyu: List[CYUItem] = []

class StoryContext(BaseModel):
    topic: str
    current_page: str
    branch_taken: Optional[str] = None
    story_so_far: str
    narrator_character: str
    educational_facts_covered: List[str] = []
    adhd_mode: bool = True

# Request/Response models for API
class StoryGenerationRequest(BaseModel):
    topic: str
    narrator: Narrator

class StoryGenerationResponse(BaseModel):
    story_id: str
    status: Literal['processing', 'completed', 'failed']
    story: Optional[Story] = None
    message: Optional[str] = None

# Update forward references
StoryChoice.model_rebuild()
OptionBranch.model_rebuild()
StoryPage.model_rebuild()
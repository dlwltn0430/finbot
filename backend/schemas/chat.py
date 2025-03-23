from openai.types.chat import ChatCompletionMessage, ChatCompletionMessageParam
from pydantic import BaseModel
from typing import Literal, List, Optional


class Message(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    uuid: Optional[str] = None
    question: str
    messages: List[ChatCompletionMessageParam] = []


class Usage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    cached_prompt_tokens: int
    total_tokens: int


class ChatResponse(BaseModel):
    uuid: str
    title: Optional[str] = None
    answer: str
    question: str
    messages: List[ChatCompletionMessageParam | ChatCompletionMessage] = []
    usage: Usage

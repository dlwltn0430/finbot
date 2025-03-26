from pydantic import BaseModel
from typing import Literal, List, Optional, TypeAlias, Union


class KBChatContent(BaseModel):
    paragraph: str
    urls: List[str]


class KBChatUserMessage(BaseModel):
    role: Literal["user"]
    content: str


class KBChatAssistantMessage(BaseModel):
    role: Literal["assistant"]
    content: List[KBChatContent]


KBChatMessage: TypeAlias = Union[
    KBChatUserMessage,
    KBChatAssistantMessage,
]


class ChatRequest(BaseModel):
    uuid: Optional[str] = None
    question: str
    messages: List[KBChatMessage] = []


class Usage(BaseModel):
    prompt_tokens: int
    completion_tokens: int
    cached_prompt_tokens: int
    total_tokens: int


class ChatResponse(BaseModel):
    title: Optional[str] = None
    question: str
    answer: List[KBChatContent]
    messages: List[KBChatMessage] = []

from enum import Enum
from typing import List
from pydantic import BaseModel


class KB0_Answer(BaseModel):
    paragraph: str
    urls: List[str]


class KB0_ResponseFormat(BaseModel):
    answers: List[KB0_Answer]


class KB0_1_ResponseFormat(BaseModel):
    sub_questions: List[str]


class KB0_2_ToolEnum(Enum):
    search_deposits = "search_deposits"
    search_loans = "search_loans"
    search_faqs = "search_faqs"


class KB0_2_ResponseFormat(BaseModel):
    tools: List[KB0_2_ToolEnum]


class KB0_4_Document(BaseModel):
    extracted: str
    urls: List[str]


class KB0_4_ResponseFormat(BaseModel):
    documents: List[KB0_4_Document]

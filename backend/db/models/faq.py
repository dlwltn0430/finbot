from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from db.common import N_DIM, V_DIM, Base, SQLEnum

from pgvector.sqlalchemy import Vector, SPARSEVEC

from enum import Enum


class FaqCategoryEnum(Enum):
    """Faq 구분"""

    deposit = "예금"
    trust_fund = "신탁/펀드"
    loan = "대출"
    exchange_remit = "환전/송금"
    trade = "수출입"
    foreign_deposit_etc = "외화예금/기타"
    pension = "퇴직연금"


class FaqModel(Base):
    """FAQ 테이블"""

    __tablename__ = "faqs"
    url: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    category: Mapped[str] = mapped_column(SQLEnum(FaqCategoryEnum), nullable=False)

    title: Mapped[str] = mapped_column(String, nullable=False)
    title_dense_vector = mapped_column(Vector(N_DIM))
    title_sparse_vector = mapped_column(SPARSEVEC(dim=V_DIM))

    content: Mapped[str] = mapped_column(String, nullable=False)
    content_dense_vector = mapped_column(Vector(N_DIM))
    content_sparse_vector = mapped_column(SPARSEVEC(dim=V_DIM))

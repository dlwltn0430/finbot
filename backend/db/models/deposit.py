from typing import List
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.common import N_DIM, V_DIM, Base, SQLEnum

from pgvector.sqlalchemy import Vector, SPARSEVEC

from enum import Enum


class DepositCategoryEnum(Enum):
    """예금 상품 구분"""

    deposit = "예금"
    savings = "적금"
    free = "입출금자유"
    housing = "주택청약"


class DepositModel(Base):
    """예금 상품 테이블"""

    __tablename__ = "deposits"

    url: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    category: Mapped[str] = mapped_column(SQLEnum(DepositCategoryEnum), nullable=False)

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)

    period: Mapped[str] = mapped_column(String, nullable=True)
    amount: Mapped[str] = mapped_column(String, nullable=True)
    interest: Mapped[str] = mapped_column(String, nullable=True)

    chunks: Mapped[List["DepositChunkModel"]] = relationship(back_populates="deposit")


class DepositChunkModel(Base):
    """예금 상품 본문 청크 테이블"""

    __tablename__ = "deposit_content_chunks"

    deposit_id: Mapped[int] = mapped_column(
        ForeignKey("deposits.id", ondelete="CASCADE"),
        index=True,
    )

    content: Mapped[str] = mapped_column(String, nullable=False)
    dense_vector = mapped_column(Vector(N_DIM))
    sparse_vector = mapped_column(SPARSEVEC(dim=V_DIM))

    deposit: Mapped[DepositModel] = relationship(back_populates="chunks", lazy="joined")

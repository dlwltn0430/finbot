from typing import List
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.common import N_DIM, V_DIM, Base, SQLEnum

from pgvector.sqlalchemy import Vector, SPARSEVEC

from enum import Enum


class LoanCategoryEnum(Enum):
    """대출 상품 구분"""

    credit = "신용대출"
    secured = "담보대출"
    lease_guaratee = "전월세/반환보증"
    auto = "자동차대출"
    group_interim = "집단중도금/이주비대출"
    housing_fund = "주택도시기금대출"


class LoanModel(Base):
    """대출 상품 테이블"""

    __tablename__ = "loans"

    url: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    category: Mapped[str] = mapped_column(SQLEnum(LoanCategoryEnum), nullable=False)

    title: Mapped[str] = mapped_column(String, nullable=False)
    description: Mapped[str] = mapped_column(String, nullable=False)

    target: Mapped[str] = mapped_column(String, nullable=True)
    period: Mapped[str] = mapped_column(String, nullable=True)
    repayment_method: Mapped[str] = mapped_column(String, nullable=True)
    limit: Mapped[str] = mapped_column(String, nullable=True)

    chunks: Mapped[List["LoanChunkModel"]] = relationship(back_populates="loan")


class LoanChunkModel(Base):
    """대출 상품 본문 청크 테이블"""

    __tablename__ = "loan_content_chunks"

    loan_id: Mapped[int] = mapped_column(
        ForeignKey("loans.id", ondelete="CASCADE"),
        index=True,
    )

    content: Mapped[str] = mapped_column(String, nullable=False)
    dense_vector = mapped_column(Vector(N_DIM))
    sparse_vector = mapped_column(SPARSEVEC(dim=V_DIM))

    loan: Mapped[LoanModel] = relationship(back_populates="chunks", lazy="joined")

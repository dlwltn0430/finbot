from db.models.deposit import DepositModel, DepositChunkModel
from .base import BaseRepository

from typing import Any, Dict, List, Optional

from pgvector import SparseVector
from sqlalchemy import func
from db.common import V_DIM


class DepositRepository(BaseRepository[DepositModel]):

    def search_hybrid(
        self,
        dense_vector: Optional[List[float]] = None,
        sparse_vector: Optional[Dict[Any, float]] = None,
        lexical_ratio: float = 0.5,
        k: int = 5,
    ):
        """내용으로 유사도 검색"""

        score_dense_content = 1 - DepositChunkModel.dense_vector.cosine_distance(dense_vector)
        score_lexical_content = -1 * (
            DepositChunkModel.sparse_vector.max_inner_product(SparseVector(sparse_vector, V_DIM))
        )

        score_content = ((score_lexical_content * lexical_ratio) + score_dense_content *
                         (1 - lexical_ratio)).label("score_content")

        subq = (
            self.session.query(
                DepositChunkModel.deposit_id.label("deposit_id"),
                func.max(score_content).label("max_score"),
            ).group_by(DepositChunkModel.deposit_id).subquery()
        )

        query = (
            self.session.query(DepositChunkModel).join(
                subq,
                (DepositChunkModel.deposit_id == subq.c.deposit_id)
                & (score_content == subq.c.max_score),
            ).order_by(subq.c.max_score.desc()).limit(k)
        )

        return query.all()

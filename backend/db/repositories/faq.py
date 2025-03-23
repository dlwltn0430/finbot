from typing import Any, Dict, List, Optional

from pgvector import SparseVector
from sqlalchemy import func
from db.common import V_DIM
from db.models.faq import FaqModel
from db.repositories.base import BaseRepository


class FaqRepository(BaseRepository[FaqModel]):

    def search_hybrid(
        self,
        dense_vector: Optional[List[float]] = None,
        sparse_vector: Optional[Dict[Any, float]] = None,
        lexical_ratio: float = 0.5,
        rrf_k: int = 120,
        k: int = 5,
    ):
        """제목 및 내용으로 유사도 검색"""

        score_dense_content = 1 - FaqModel.content_dense_vector.cosine_distance(dense_vector)
        score_lexical_content = -1 * (
            FaqModel.content_sparse_vector.max_inner_product(SparseVector(sparse_vector, V_DIM))
        )
        score_content = ((score_lexical_content * lexical_ratio) + score_dense_content *
                         (1 - lexical_ratio)).label("score_content")

        rank_content = self.session.query(
            FaqModel.id,
            func.row_number().over(order_by=score_content.desc()).label("rank_content"),
        ).subquery()

        score_dense_title = 1 - FaqModel.content_dense_vector.cosine_distance(dense_vector)
        score_lexical_title = -1 * (FaqModel.title_sparse_vector.max_inner_product(SparseVector(sparse_vector, V_DIM)))
        score_title = ((score_lexical_title * lexical_ratio) + score_dense_title *
                       (1 - lexical_ratio)).label("score_title")

        rank_title = self.session.query(
            FaqModel.id,
            func.row_number().over(order_by=score_title.desc()).label("rank_title"),
        ).subquery()

        rrf_score = (1 / (rrf_k + rank_content.c.rank_content) + 1 /
                     (rrf_k + rank_title.c.rank_title)).label("rrf_score")

        query = (
            self.session.query(FaqModel).join(
                rank_content,
                FaqModel.id == rank_content.c.id,
            ).join(
                rank_title,
                FaqModel.id == rank_title.c.id,
            ).order_by(rrf_score.desc()).limit(k)
        )

        return query.all()

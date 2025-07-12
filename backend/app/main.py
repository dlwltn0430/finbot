from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.chat import router as chat_router

from common.database import init_mongodb_client


def create_app(lifespan):
    """FastAPI 인스턴스 생성 및 초기화"""

    app = FastAPI(lifespan=lifespan)
    app.include_router(chat_router)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 인스턴스 생명주기 관리 함수"""

    client, database = init_mongodb_client()
    app.state.client = client
    app.state.database = database

    yield

    app.state.client.close()


app = create_app(lifespan)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langchain_upstage import ChatUpstage

from app.db import init_db
from common.database import init_mongodb_client
from fastapi.security.api_key import APIKeyHeader

from app.api.v1 import router as v1_router

from common.database import init_mongodb_client
from fastapi.security.api_key import APIKeyHeader

from app.api.v1 import router as v1_router
from domains.common.agents.supervisor import init_graph
from domains.user.auth import TokenService


def create_app(lifespan):
    """FastAPI 인스턴스 생성 및 초기화"""

    auth_header = APIKeyHeader(name="Authorization", auto_error=False)
    app = FastAPI(lifespan=lifespan, dependencies=[Depends(auth_header)])

    app.include_router(v1_router.router, prefix="/api/v1")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    init_db()

    return app


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI 인스턴스 생명주기 관리 함수"""

    client, database = init_mongodb_client()
    app.state.client = client
    app.state.database = database

    llm = ChatUpstage(
        model="solar-pro2",
        temperature=0.0,
        reasoning_effort="low",
        max_tokens=16384,
    )

    app.state.graph = init_graph(llm, database)

    yield

    app.state.client.close()


app = create_app(lifespan)

token_service = TokenService(app.state.db)


@app.middleware("http")
async def verify_token_middleware(req: Request, call_next):
    """토큰 인증 미들웨어"""

    excluded_paths = [
        "/docs",
        "/openapi.json",
        "/api/v1/auth/kakao/callback",
        "/api/v1/auth/kakao/login",
    ]

    if req.method == "OPTIONS" or req.url.path in excluded_paths:
        response = await call_next(req)
        return response

    access_token = req.cookies.get("access_token")
    if not access_token:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED,
                            content={"detail": "Not authenticated"})

    try:
        payload = token_service.verify_and_decode_token(access_token)
        req.state.user_id = payload.get("sub")

    except Exception as e:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED,
                            content={"detail": "Token has expired or is invalid"})

    response = await call_next(req)
    return response

import asyncio
from typing import Any, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timedelta, timezone

import jwt

from dotenv import load_dotenv

import os

from common.database import init_mongodb_client
from domains.user.models import Token

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 14


class InvalidTokenError(Exception):
    pass


class TokenCRUD:

    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.get_collection("tokens")

    async def upsert_tokens(self, token_data: Dict[str, Any]) -> Dict[str, Any]:
        return await self.collection.find_one_and_update(
            {"user_id": token_data["user_id"]}, {"$set": token_data}, upsert=True)

    async def get_tokens_by_refresh_token(
            self, refresh_token: str) -> Optional[Dict[str, Any]]:
        return await self.collection.find_one({"refresh_token": refresh_token})


class TokenService:

    def __init__(self, db: AsyncIOMotorDatabase):
        self.crud = TokenCRUD(db)

    def _create_token(self, sub: str, expires_delta: timedelta) -> str:
        expire = datetime.now(timezone.utc) + expires_delta
        payload = {"exp": expire, "sub": sub}
        return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

    async def issue_new_token_pair(self, user_id: str) -> Dict[str, str]:
        """액세스 토큰과 리프레시 토큰 쌍 발급 및 DB 저장"""
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

        at = self._create_token(user_id, access_token_expires)
        rt = self._create_token(user_id, refresh_token_expires)

        token_model = Token(
            user_id=user_id,
            access_token=at,
            refresh_token=rt,
            access_token_expires_at=datetime.now(timezone.utc) + access_token_expires,
            refresh_token_expires_at=datetime.now(timezone.utc) + refresh_token_expires)

        await self.crud.upsert_tokens(token_model.model_dump())

        return {"access_token": at, "refresh_token": rt}

    def verify_and_decode_token(self, token: str) -> Dict[str, Any]:
        try:
            return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise
        except jwt.PyJWTError:
            raise InvalidTokenError("Invalid token")

    # TODO: Refresh Token Rotation 방식 적용 필요
    async def refresh_access_token(self, refresh_token: str) -> str:
        """
        리프레시 토큰으로 새로운 액세스 토큰 발급하고 DB 정보 갱신.
        이 함수가 만료 여부 판별 및 재발급/갱신을 모두 처리.
        """
        try:
            payload = self.verify_and_decode_token(refresh_token)
            user_id = payload["sub"]
        except jwt.ExpiredSignatureError:
            raise InvalidTokenError("Refresh token has expired")
        except InvalidTokenError:
            raise

        stored_token_info = await self.crud.get_tokens_by_refresh_token(refresh_token)
        if not stored_token_info:
            raise InvalidTokenError("Refresh token not found in DB or revoked")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        new_at = self._create_token(user_id, access_token_expires)

        update_data = {
            "access_token":
                new_at,
            "access_token_expires_at":
                datetime.now(timezone.utc) + access_token_expires,
        }

        await self.crud.upsert_tokens({"user_id": user_id, **update_data})

        return new_at


async def run(user_id: str):
    client, db = init_mongodb_client()
    token_service = TokenService(db)
    tokens = await token_service.issue_new_token_pair(user_id)
    print(tokens)


if __name__ == "__main__":
    temp = "e954ff6a-850a-4fab-a1e1-a7338876a275"
    asyncio.run(run(temp))

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_database
from app.schemas.user import UserIn
from domains.user.auth import InvalidTokenError, TokenService
from domains.user.models import User
from domains.user.user_repo import SocialRepository, UserRepository

router = APIRouter(prefix="")


async def get_current_user(req: Request,
                           db: AsyncIOMotorDatabase = Depends(get_database)):
    token_service = TokenService(db)
    user_crud = UserRepository(db)

    access_token = req.cookies.get("access_token")
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )

    try:
        payload = token_service.verify_and_decode_token(access_token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
            )

        user = await user_crud.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user

    except InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired or is invalid",
        )


@router.get("/me/temporary")
async def get_temporary_user_info(user: Optional[User] = Depends(get_current_user)):
    return user


@router.post("/me/temporary")
async def user_signup(user_in: UserIn,
                      user: Optional[User] = Depends(get_current_user),
                      db: AsyncIOMotorDatabase = Depends(get_database)):

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="사용자 정보가 없습니다.",
        )

    social_repo = SocialRepository(db)
    social_account = await social_repo.get_by_user_id(user.id)

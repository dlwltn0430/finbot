from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import JSONResponse, RedirectResponse
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.dependencies import get_database
from app.kakao import KakaoAuth

from dotenv import load_dotenv

from domains.user.auth import InvalidTokenError, TokenService
from domains.user.models import SocialAccount, User
from domains.user.user_repo import SocialRepository, UserRepository

load_dotenv()

router = APIRouter(prefix="")

kakao_api = KakaoAuth()


@router.get("/kakao/login")
def get_kakao_code():
    return RedirectResponse(kakao_api.auth_url)


@router.get("/kakao/callback")
async def kakao_redirection(req: Request,
                            code: str,
                            db: AsyncIOMotorDatabase = Depends(get_database)):

    user_repo = UserRepository(db)
    token_service = TokenService(db)
    social_repo = SocialRepository(db)

    token_info = await kakao_api.get_kakao_token(code)
    kakao_user_info = await kakao_api.get_user_info(token_info.access_token)

    if not kakao_user_info:
        return RedirectResponse(url="/error", status_code=302)

    kakao_user_id: str = kakao_user_info["kakao_user_id"]
    social_account = await social_repo.get_by_provider_id("kakao", kakao_user_id)

    redirect_url = "/"

    if social_account:
        user_id = social_account.user_id

    else:
        new_user = await user_repo.create_user(
            User(**{
                "email": kakao_user_info["email"],
                "nickname": kakao_user_info["nickname"],
            }))

        user_id = new_user.id

        await social_repo.create(
            SocialAccount(user_id=user_id,
                          provider="kakao",
                          provider_user_id=kakao_user_id))

        redirect_url = "/signup/details"

    tokens = await token_service.issue_new_token_pair(user_id)

    res = RedirectResponse(url=redirect_url, status_code=302)

    res.set_cookie(key="access_token",
                   value=tokens["access_token"],
                   httponly=True,
                   secure=True,
                   samesite="strict",
                   max_age=1800,
                   path="/")

    res.set_cookie(key="refresh_token",
                   value=tokens["refresh_token"],
                   httponly=True,
                   secure=True,
                   samesite="strict",
                   max_age=1209600,
                   path="/")

    return res


@router.post("/token/refresh")
async def refresh_token(request: Request,
                        db: AsyncIOMotorDatabase = Depends(get_database)):

    token_service = TokenService(db)

    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Refresh token not found in cookies")

    try:
        new_access_token = await token_service.refresh_access_token(refresh_token)
    except InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))

    response = JSONResponse(content={
        "status": "success",
        "message": "Access token refreshed"
    })

    response.set_cookie(key="access_token",
                        value=new_access_token,
                        httponly=True,
                        secure=True,
                        samesite="strict",
                        max_age=1800)

    return response

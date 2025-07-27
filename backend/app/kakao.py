"""카카오 간편로그인 모듈

REST API 방식의 카카오 간편인증 Flow:
    1. FE -> BE 인증 페이지로 이동
    2. BE -> Kakao 인가 코드 발급
    3. BE -> FE 인가 코드 발급된 인증 페이지로 리디렉션

    4. FE -> Kakao 동의 및 로그인 버튼 클릭
    5. Kakao -> BE 리디렉션 (카카오 서버에서 유저 정보 로드 필요)
    6. BE -> FE 로그인 완료 페이지로 리디렉션
"""

from typing import List, Optional

from urllib.parse import urlencode

import httpx
import os

from pydantic import BaseModel

BASE_SCOPES = ["profile_nickname", "profile_image", "account_email"]
AUTHORIZE_ENDPOINT = "https://kauth.kakao.com/oauth/authorize"

ACCESS_TOKEN_ENDPOINT = "https://kauth.kakao.com/oauth/token"
PROFILE_ENDPOINT = "https://kapi.kakao.com/v2/user/me"

KAKAO_REST_API_KEY = os.getenv("KAKAO_REST_API_KEY", "")


class KakaoTokenResponse(BaseModel):
    token_type: str
    access_token: str
    expires_in: int
    refresh_token: str
    refresh_token_expires_in: int
    id_token: Optional[str] = None
    scope: Optional[str] = None


class KakaoAuth:

    def __init__(
            self,
            client_secret: Optional[str] = None,
            client_id: str = KAKAO_REST_API_KEY,
            scopes: Optional[List[str]] = BASE_SCOPES,
            name: str = "kakao",
            redirect_uri: str = "http://localhost:8899/api/v1/auth/kakao/callback"):
        self.client_id = client_id
        self.redirect_uri = redirect_uri
        self.client_secret = client_secret
        self.scopes = scopes
        self.name = name

    @property
    def auth_url(self) -> str:
        """인가 코드 요청 URL"""

        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
        }

        query_string = urlencode(params)

        return f"{AUTHORIZE_ENDPOINT}?{query_string}"

    async def get_kakao_token(self, code: str):
        """인증 토큰 발급"""

        headers = {"Content-Type": "application/x-www-form-urlencoded;charset=utf-8"}

        payload = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "code": code
        }

        async with httpx.AsyncClient() as client:
            res = await client.post(ACCESS_TOKEN_ENDPOINT,
                                    data=payload,
                                    headers=headers)

        res.raise_for_status()
        json_data = res.json()

        return KakaoTokenResponse(**json_data)

    async def get_user_info(self, access_token: str):
        """액세스 토큰 사용하여 사용자 정보 요청"""

        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            res = await client.get(PROFILE_ENDPOINT, headers=headers)

        res.raise_for_status()
        json_data = res.json()

        kakao_account = json_data.get("kakao_account")

        if not kakao_account:
            return None

        return {
            "kakao_user_id": json_data["id"],
            "email": kakao_account["email"],
            "profile_image": kakao_account["profile"].get("profile_image_url"),
            "nickname": kakao_account.get("nickname")
        }

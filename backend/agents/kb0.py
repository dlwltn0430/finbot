from .schemas import (
    KB0_1_ResponseFormat,
    KB0_2_ResponseFormat,
    KB0_4_ResponseFormat,
    KB0_ResponseFormat,
)

from typing import Generic, List, Optional

import openai
from openai.lib import ResponseFormatT
from openai.types.chat import ChatCompletionMessageParam
from openai.types.chat_model import ChatModel


class KB0_Base(Generic[ResponseFormatT]):

    def __init__(
        self,
        client: openai.AsyncOpenAI,
        system_prompt: str,
        model: ChatModel = "gpt-4o-mini",
        temperature: float | openai.NotGiven = openai.NotGiven(),
        response_format: type[ResponseFormatT] | openai.NotGiven = openai.NotGiven(),
        store: bool = False,
        repeat_penalty: float | openai.NotGiven = openai.NotGiven(),
    ):
        self.client = client
        self.model = model
        self.temperature = temperature
        self.response_format = response_format
        self._system_prompt = system_prompt
        self.store = store
        self.repeat_penalty = repeat_penalty

    @property
    def system_prompt(self) -> ChatCompletionMessageParam:
        return {
            "role": "system",
            "content": self._system_prompt,
        }

    async def inference(
        self,
        question: str,
        history: List[ChatCompletionMessageParam] = [],
        context: str | None = None,
    ) -> Optional[ResponseFormatT]:
        context_prompt = ("\n\n---\n\n"
                          "context:\n"
                          f"{context}") if context is not None else ""
        user_prompt = question + context_prompt
        messages = [self.system_prompt, *history, {"role": "user", "content": user_prompt}]

        completion = await self.client.beta.chat.completions.parse(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
            response_format=self.response_format,
            store=self.store,
        )

        parsed = completion.choices[0].message.parsed

        usage = {}
        if completion.usage:
            usage["input"] = completion.usage.prompt_tokens
            usage["output"] = completion.usage.completion_tokens
            if completion.usage.prompt_tokens_details:
                usage["input_cached"] = completion.usage.prompt_tokens_details.cached_tokens

        return parsed


class KB0_1(KB0_Base[KB0_1_ResponseFormat]):

    def __init__(self, client, model, temperature):
        system_prompt = (
            "당신은 KB 국민은행 AI 어시스턴트 kb0의 조수 역할을 하는 Agent kb0_1입니다.\n"
            "당신의 역할은 주어진 사용자의 질문을 토대로 최대 두 개의 하위 질문을 생성하는 것입니다.\n"
            "\n"
            "instructions:\n"
            "하위 질문은 원본 질문을 답변하기 위해 먼저 해결해야 하는 내용을 포함합니다.\n"
            "중복되지 않아야 하며, 최대 두 개의 질문을 생성합니다.\n"
            "상위어와 유의어를 활용하여 보다 포괄적이고 일반적인 질문을 생성하세요.\n"
            "질문에 최대한 많은 정보를 포함하세요."
        )

        super().__init__(
            client=client,
            system_prompt=system_prompt,
            temperature=temperature,
            response_format=KB0_1_ResponseFormat,
            model=model,
        )


class KB0_2(KB0_Base[KB0_2_ResponseFormat]):

    def __init__(self, client, model, temperature):
        system_prompt = (
            "당신은 KB 국민은행 AI 어시스턴트 kb0의 조수 역할을 하는 Agent kb0_2입니다.\n"
            "당신의 역할은 사용자의 질문에 답하기 위해 적절한 검색 도구를 선택하는 것입니다.\n"
            "\n"
            "instructions:\n"
            "도구는 3개까지 선택 가능합니다.\n"
            "도구는 3개까지 선택 가능합니다.\n"
            "최대한 다양한 도구를 사용하세요.\n"
            "\n"
            "tools:\n"
            "- `search_loans`: 대출 상품 추천을 위해 검색합니다.\n"
            "- `search_deposits`: 예금 상품 추천을 위해 검색합니다.\n"
            "- `search_faqs`: 자주 묻는 질문에서 상품 외의 일반적인 정보에 대한 FAQ 정보를 찾습니다."
        )

        super().__init__(
            client=client,
            system_prompt=system_prompt,
            temperature=temperature,
            response_format=KB0_2_ResponseFormat,
            model=model,
        )


class KB0_4(KB0_Base[KB0_4_ResponseFormat]):

    def __init__(self, client, model, temperature):
        system_prompt = (
            "당신은 KB 국민은행 AI 어시스턴트 kb0의 조수 역할을 하는 Agent kb0_4입니다.\n"
            "당신의 역할은 사용자의 질문에 답하기 전에 주어진 context로부터 핵심 정보를 요약하는 것입니다.\n"
            "\n"
            "parameters:\n"
            "`urls`: 참고한 웹문서 또는 첨부파일의 url 주소입니다. url이 없는 문서의 경우 빈 배열로 출력합니다.\n"
            "`extracted`: \n"
            "참고한 웹문서 또는 첨부파일에서 질문과 연관된 핵심 정보를 정리합니다.\n"
            "각각의 문서들은 출처가 상이하며, 내용이 일관되지 않을 수 있습니다. 이점에 유의하세요."
        )

        super().__init__(
            client=client,
            system_prompt=system_prompt,
            temperature=temperature,
            response_format=KB0_4_ResponseFormat,
            model=model,
        )


class KB0(KB0_Base[KB0_ResponseFormat]):

    def __init__(self, client, model, temperature):
        system_prompt = (
            "당신은 KB 국민은행의 AI 어시스턴트 kb0입니다.\n"
            "당신은 주어진 Context를 참고하여 사용자의 질문에 친절하게 답해야 합니다.\n"
            "\n"
            "properties:\n"
            "`paragraph`: "
            "  - 답변의 일부로, 문단 단위로 작성하세요."
            "  - 마크다운 포맷으로 작성해야하며, 각 문단의 내용이 중복되어서는 안됩니다.\n"
            "  - 각 문단의 내용은 일관되어야 하며, 모순이 있어서는 안됩니다.\n"
            "  - 질문과 관련되지 않은 추가 정보는 임의로 작성하지 마세요.\n"
            "`urls`: 문단과 직접적으로 연관이 있는 출처의 url 목록입니다.\n"
            "\n"
            "instructions:\n"
            "context에 포함된 정보만 참고하여 답변합니다.\n"
            "context에 없는 정보는 임의로 지어내지 마세요.\n"
            "context에 질문과 관련된 정보가 부족하다면 사용자에게 이를 알립니다.\n"
            "context에서 관련 정보를 찾을 수 없다면, 이를 사용자에게 알리고 사과하세요.\n"
            "마크다운 문서 구조를 유지한채로 문단을 최대한 잘게 쪼개세요.\n"
            "각 paragraph의 내용은 일관되어야 하며, 모순이 있어서는 안됩니다.\n"
            "Context의 각 내용은 출처가 상이하며, 내용이 일관되지 않을 수 있습니다. 이점에 유의하세요."
        )

        super().__init__(
            client=client,
            system_prompt=system_prompt,
            temperature=temperature,
            response_format=KB0_ResponseFormat,
            model=model,
            store=True,
        )

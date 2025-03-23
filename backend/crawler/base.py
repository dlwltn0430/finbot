from abc import ABC, abstractmethod
from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel
from selenium.webdriver import Chrome
from selenium.webdriver.common.by import By

from db.common import Base

DTO = TypeVar("DTO", bound=BaseModel)
ORM = TypeVar("ORM", bound=Base)

BASE_URL = "https://obank.kbstar.com"


class BaseKBCrawler(ABC, Generic[DTO, ORM]):

    @abstractmethod
    def dto2orm(self, dto: DTO) -> ORM:
        pass

    @abstractmethod
    def scrape_detail(self, url: str) -> Optional[DTO]:
        pass

    @abstractmethod
    def scrape_urls(self, page_code: str) -> List[str]:
        pass


class SeleniumClient:

    def __init__(self, driver: Chrome):
        self.driver = driver

    @property
    def pagination(self):
        selector = "div.paging input[type='submit']"
        return self.driver.find_elements(by=By.CSS_SELECTOR, value=selector)

    def pagination_generator(self):
        idx = 0
        while True:
            elements = self.pagination
            if idx >= len(elements):
                break
            yield elements[idx]
            idx += 1

    def get_page_url(self, page_code: str):
        return f"{BASE_URL}/quics?page={page_code}"

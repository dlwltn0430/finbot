"""FAQ 스크랩"""

from typing import List
from selenium.webdriver import Chrome

from crawler import faq
from db.models.faq import FaqModel
from db.repositories import FaqRepository

from tqdm import tqdm

PAGE_CODES = {
    "예금": "C019772",
    "신탁/펀드": "C019773",
    "대출": "C019774",
    "환전/송금": "C019777",
    "수출입": "C019778",
    "외화예금/기타": "C019779",
    "퇴직연금": "C025066",
}

if __name__ == "__main__":
    driver = Chrome()
    crawler = faq.FaqCrawler(driver=driver)
    repo = FaqRepository()

    for category, code in tqdm(PAGE_CODES.items(), desc="열심히 긁어모으는 중..."):
        urls = crawler.scrape_urls(code)
        orms: List[FaqModel] = []

        for url in urls:
            dto = crawler.scrape_detail(url)
            if not dto:
                continue

            dto.category = category
            orm = crawler.dto2orm(dto)

            orms.append(orm)

        orms = repo.create_all(orms)
        print(category, len(orms))

"""대출 상품 스크랩"""

from typing import List
from selenium.webdriver import Chrome

from crawler import loan
from db.models.loan import LoanModel

from tqdm import tqdm

from db.repositories.loan import LoanRepository

PAGE_CODES = {
    "신용대출": "C103429",
    "담보대출": "C103557",
    "전월세/반환보증": "C103507",
    "자동차대출": "C103573",
    "집단중도금/이주비대출": "C109229",
    "주택도시기금대출": "C103998",
}

if __name__ == "__main__":
    driver = Chrome()
    crawler = loan.LoanCrawler(driver=driver)
    repo = LoanRepository()

    tot_urls: List[str] = []

    for category, code in tqdm(PAGE_CODES.items(), desc="열심히 긁어모으는 중..."):
        urls = crawler.scrape_urls(code)
        orms: List[LoanModel] = []

        for url in urls:
            dto = crawler.scrape_detail(url)
            if not dto:
                continue

            dto.category = category
            orm = crawler.dto2orm(dto)

            orms.append(orm)

        orms = repo.create_all(orms)
        print(category, len(orms))

    print("Done.")

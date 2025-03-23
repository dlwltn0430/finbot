"""예금 상품 스크랩"""

from typing import List
from selenium.webdriver import Chrome

from crawler import deposit

from tqdm import tqdm

from db.repositories.deposit import DepositRepository

if __name__ == "__main__":
    driver = Chrome()
    crawler = deposit.DepositCrawler(driver=driver)
    repo = DepositRepository()

    tot_urls: List[str] = []

    url_dict = crawler.scrape_urls_dict("C016613")

    orms = []

    for category, urls in tqdm(
        url_dict.items(),
        desc="열심히 긁어오는중....",
    ):
        for url in urls:
            dto = crawler.scrape_detail(url)
            if not dto:
                continue

            dto.category = category
            orm = crawler.dto2orm(dto)

            orms.append(orm)

    repo.create_all(orms)

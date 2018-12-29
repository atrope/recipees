import requests
import re
from bs4 import BeautifulSoup
import csv
from queue import Queue, Empty
from concurrent.futures import ThreadPoolExecutor


class MultiThreadScraper:
    def __init__(self):
        self.pool = ThreadPoolExecutor(max_workers=20)
        self.scraped_pages = set([])
        self.to_crawl = Queue()

    def getTitle(self, soup):
        return self.normalize_string(soup.find('h1').get_text())

    def normalize_string(self, string):
        word = string.replace('\xa0', ' ').replace('\n', ' ').replace('\t', ' ')
        return re.sub(r'\s+', ' ', word.strip())

    def add_link(self, url):
            self.to_crawl.put(url)

    def getIngredients(self, soup):
        ingredients = soup.select('.recipeIngredients ul li')
        restrict = ['Add all ingredients to list', '']
        return [self.normalize_string(ingredient.get_text())
                for ingredient in ingredients
                if ingredient.get_text(strip=True) not in restrict
                ]

    def write_csv(self, id, dict):
        with open('uk/%s.csv' % id, 'w') as f:  # Just use 'w' mode in 3.x
            w = csv.DictWriter(f, dict.keys())
            w.writeheader()
            w.writerow(dict)
            print("Done #%s %s" % (id, dict["title"]))

    def post_scrape_callback(self, res):
        result = res.result()
        if result and result.status_code == 200:
            soup = BeautifulSoup(result.content, "html.parser")
            mydict = {}
            id = result.url.split('/recipe/')[1].split('/')[0]
            mydict["title"] = self.getTitle(soup)
            mydict["ingredients"] = self.getIngredients(soup)
            self.write_csv(id, mydict)


    def scrape_page(self, url):
        try:
            cookies = {'euConsentId': '1a2ce6d8-7995-b287-0156-399d689fedc0'}
            res = requests.get(url, timeout=(3, 30),cookies=cookies)
            return res
        except requests.RequestException as e:
            return

    def run_scraper(self):
        while True:
            try:
                target_url = self.to_crawl.get(timeout=60)
                if target_url not in self.scraped_pages:
                    print("Scraping URL: {}".format(target_url))
                    self.scraped_pages.add(target_url)
                    job = self.pool.submit(self.scrape_page, target_url)
                    job.add_done_callback(self.post_scrape_callback)
            except Empty:
                return
            except Exception as e:
                print(e)
                continue

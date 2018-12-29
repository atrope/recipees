# https://www.allrecipes.com
# http://allrecipes.co.uk
from MultiThreadScraperUK import MultiThreadScraper


s = MultiThreadScraper()
with open('Scrapper/uk/links_uk_right') as f:
    lines = f.read().splitlines()
    for url in lines:
        s.add_link(url)
s.run_scraper()

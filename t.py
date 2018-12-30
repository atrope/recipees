from bs4 import BeautifulSoup
import requests

headers = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36'}

html = requests.get("https://www.transfermarkt.com/bayern-munich/jugendarbeit/verein/27/plus/0/galerie/0?wettbewerb_id=gesamt&option=0&art=0", headers=headers)
soup = BeautifulSoup(html.content, "html.parser")
print (soup)

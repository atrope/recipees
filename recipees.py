# https://www.allrecipes.com
# http://allrecipes.co.uk
import re
import requests
# import sys
from bs4 import BeautifulSoup
import csv


def getTitle(soup):
    return soup.find('h1').get_text()


def getCalories(soup):
    cal = soup.find('span', {'class': "calorie-count"})
    if cal:
        return cal.get_text(strip=True)
    else:
        return 0


def getIngredients(self):
    ingredients = soup.findAll('li', {'class': "checkList__line"})
    restrict = ['Add all ingredients to list', '']
    return [normalize_string(ingredient.get_text())
            for ingredient in ingredients
            if ingredient.get_text(strip=True) not in restrict
            ]


def normalize_string(string):
    word = string.replace('\xa0', ' ').replace('\n', ' ').replace('\t', ' ')
    return re.sub(r'\s+', ' ', word.strip())


for i in range(15, 100):
    mydict = {}
    url = "https://www.allrecipes.com/recipe/%d" % i
    page = requests.get(url)
    soup = BeautifulSoup(page.content, "html.parser")
    mydict["title"] = getTitle(soup)
    if mydict["title"] == "Bummer.":
        print("Error getting #%d" % i)
        continue
    mydict["ingredients"] = getIngredients(soup)
    mydict["calories"] = getCalories(soup)
    with open('us/%d.csv' % i, 'w') as f:  # Just use 'w' mode in 3.x
        w = csv.DictWriter(f, mydict.keys())
        w.writeheader()
        w.writerow(mydict)
        print("Done #%d %s" % (i, mydict["title"]))

# url = "https://www.allrecipes.com/recipe/231288/debbies-amazing-apple-bread/"
# if len(sys.argv) > 1:
#     url = sys.argv[1]
# page = requests.get(url)
# soup = BeautifulSoup(page.content, "html.parser")
# print(title(soup))
# print(calories(soup))
# print(ingredients(soup))

import json
from collections import Counter
import string

foodlist = {}
for letter in string.ascii_lowercase:
    foodlist[letter] = []

with open("../foods", newline='') as f:
    lines = f.read().splitlines()
    for food in lines:
        try:
            foodlist[food[0]].append(food)
        except Exception as e:
            continue

foods = []
with open('final.json') as f:
    data = json.load(f)
for item in data['country']['UK']['recipes']:
    for i in item['ingredients']:
        if i['name']:
            food = i['name']
            if foodlist[food[0]].count(food):
                foods.append(food)
            else:
                newfood = food.split(' ')
                if foodlist[newfood[0][0]].count(newfood[0]):
                    for a in newfood:
                        foods.append(a)
                else:
                    foods.append(food)
x = Counter(foods).most_common(300)
dict = {"name": "foods", "children": []}

for a in x:
    dict["children"].append({"name": a[0], "children": [{"total": a[1]}]})
# print(json.dumps(dict, indent=4))
# json.dump(dict, "counter.json", indent=4)
with open("counter.json", 'w') as outfile:
    json.dump(dict, outfile, indent=4)

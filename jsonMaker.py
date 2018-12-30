import csv
import json
import ast
import glob
import string
from multiprocessing.dummy import Pool as ThreadPool

foodlist = {}
for letter in string.ascii_lowercase:
    foodlist[letter] = []

with open("foods", newline='') as f:
    lines = f.read().splitlines()
    for food in lines:
        try:
            foodlist[food[0]].append(food)
        except Exception as e:
            continue


def similar(a, b):
    from difflib import SequenceMatcher
    return SequenceMatcher(None, a, b).ratio()

def getWeight(food):
    import re
    tokens = food.split(" ")
    t = tokens[0]
    m = re.search(r'(\d+(g|ml|kg|tbsp))', t)
    if m:
        l = [re.split(r'(\d+)', s) for s in [m.group(1).strip()]]
        return {'qty': l[0][1], 'type': l[0][2]}
    try:
        qty = int(t[0])
        if tokens[1] in ['teaspoon','ml','g','kg','tbsp']:
            return {'qty': t, 'type': tokens[1]}
        else:
            return {'qty': t, 'type': "-"}
    except IndexError:
        return {'qty': t, 'type': "-"}
    except Exception:
        return {'qty': 1, 'type': "-"}


def isFood(token):
    try:
        for food in foodlist[token[0]]:
            similarity = similar(token, food)
            if similarity > 0.9:
                return True
    except Exception as e:
        return False

def ingredient_to_json(ingredients):
    import re
    list = []
    for ingredient in ingredients:
        if ingredient != "For the sauce":
            # print(">> %s" % ingredient)
            ingr = []
            tokens = re.sub('[^a-zA-Z ]+', '', ingredient).strip().split(" ")
            for token in tokens:
                if (isFood(token)):
                    ingr.append(token)
            uniq = []
            [uniq.append(x) for x in ingr if x not in uniq]
            # print("== %s" % ' '.join(uniq))
            w = getWeight(ingredient)
            tmp = {'name': ' '.join(uniq), 'quantity': w['qty'], "type": w['type']}
            list.append(tmp)
    return list


def execute(filename):
    with open(filename, newline='') as csvfile:
        reader = csv.DictReader(csvfile, delimiter=',')
        for row in reader:
            data = {}
            listIngredient = ast.literal_eval(row['ingredients'])
            if len(listIngredient):
                data['title'] = row['title']
                data['ingredients'] = ingredient_to_json(listIngredient)
                data['calories'] = 0
                print(filename)
                with open(filename.replace("csv","json"), 'w') as outfile:
                    json.dump(data, outfile, indent=4)


files = glob.glob('uk/csv/*.csv')
pool = ThreadPool(16)
# open the urls in their own threads
# and return the results
results = pool.map(execute, files)
pool.close()
pool.join()

# for filename in files:
#     execute(filename)

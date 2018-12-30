import json
import glob

recipesuk = []
recipesus = []
files = glob.glob('uk/json/*.json')
for filename in files:
    with open('uk/json/2.json') as f:
        data = json.load(f)
        recipesuk.append(data)

data = {}
data['country'] = {}
data['country']["US"] = {'diseases': [], "recipes": recipesus}
data['country']["UK"] = {'diseases': [], "recipes": recipesuk}
with open("uk/final.json", 'w') as outfile:
    json.dump(data, outfile, indent=4)

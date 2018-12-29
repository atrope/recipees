import re

def hasNumber(s):
    return re.search('\d', s)


def hasWord(str,word):
    return str.find(word) != -1

urls = []
with open('linksuk') as f:
    lines = f.read().splitlines()
    for url in lines:
        if hasWord(url, "aspx") and not hasWord(url, "/tag-") and not hasWord(url, "photos") and hasWord(url,"/recipe/"):
            if hasNumber(url):
                fixurl = url.split("?")[0]
                urls.append(fixurl)
urls = list(set(urls))
for url in urls:
    print url

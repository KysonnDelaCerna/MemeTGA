import requests
import json

response = requests.get("https://api.scryfall.com/cards/search?q=set%3Dm21").content

lands = []
nonlands = []

while True:
    response = json.loads(response)
    cards = response["data"]

    for card in cards:
        temp = {}
        temp["name"] = card["name"]
        temp["mana_cost"] = card["mana_cost"]
        temp["cmc"] = card["cmc"]
        temp["colors"] = card["colors"]
        temp["color_identity"] = card["color_identity"]
        temp["legalities"] = {}
        temp["legalities"]["standard"] = card["legalities"]["standard"]
        temp["legalities"]["historic"] = card["legalities"]["historic"]
        temp["legalities"]["pioneer"] = card["legalities"]["pioneer"]
        temp["set"] = card["set"]
        temp["set_name"] = card["set_name"]
        temp["collector_number"] = card["collector_number"]
        temp["rarity"] = card["rarity"]
        if "Land" in card["type_line"]:
            temp["produce"] = card["color_identity"]
            lands.append(temp)
        else:
            nonlands.append(temp)
    
    if response["has_more"] == True:
        response = requests.get(response["next_page"]).content
    else:
        break

with open("lands.json", "w") as write_file:
    json.dump(lands, write_file)

with open("nonlands.json", "w") as write_file:
    json.dump(nonlands, write_file)


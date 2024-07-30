import json

# read json file
with open("data\data.json", mode="r", encoding="utf-8") as file:
    json_object = json.load(file)
    #print(json_object)
    #print(json_object[0])
    #print(len(json_object)) #18

# initialize new dict structure
updated_structure = {
    "items": []
}
#keys = updated_structure.keys()
#print(keys)

# initialize nested dictionary
item = {
    "name": "",
    "info": {

    },
    "narratives": {
        "time": "",
        "place": "",
        "artistic expression": ""
    }
}

# function definition
def update_structure(json_object):
    for i in json_object:
        item = {
            "name": i["name"],
            "iId": i["iId"],
            "info": {
                "text 1": i["text 1"],
                "text 2": i["text 2"],
                "text 3": i["text 3"],
                "image": i["image"],
                "narratives": {
                    "time": i["date"],
                    "place": i["place"],
                    "artistic expression": i["art"]
                    }
            },
            "itemMeta": {
                "date": i["date"],
                "conservation location": i["conservation location"],
                "author": i["author"],
                "authority": i["authority"],
                "place": i["place"],
                "art": i["art"],
                "religion": i["religion"],
            },  
        }
        updated_structure["items"].append(item)
    #print(updated_structure["items"])
    return updated_structure

# function call
new_file = update_structure(json_object)
#print("This is the new file:")
#print(new_file)
#print(len(updated_structure["items"]))


# output json
json_string = json.dumps(new_file)

with open("data\\revised_structure.json", mode="w", encoding="utf-8") as output:
    json.dump(new_file, output, ensure_ascii=False, indent=4)
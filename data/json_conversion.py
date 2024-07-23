import json

with open("data\data.json", mode="r", encoding="utf-8") as file:
    json_object = json.loads(file.read())

    #print(json_object[0])
    #print(len(json_object)) #18

updated_structure = {
    "items": []
}
#keys = updated_structure.keys()
#print(keys)
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
#def update_structure(json_object):
    #for i in json_object: 
        #updated_structure["items"].append(item)
        #for dict in updated_structure["items"]:
            #print(dict)
            #dict = {
                #"name": i["name"],
                #"info": {
                    #"date": i["date"],
                    #"conservation location": i["conservation location"],
                    #"author": i["author"],
                    #"authority": i["authority"],
                    #"place": i["place"],
                    #"art": i["art"],
                    #"religion": i["religion"],
                    #"image": i["image"],
                    #"text 1": i["text 1"],
                    #"text 2": i["text 2"],
                    #"text 3": i["text 3"],
                    #"narratives": {
                        #"time": i["date"],
                        #"place": i["place"],
                        #"artistic expression": i["art"]
                    #}
                #}   
            #}
            #updated_structure["items"].append(dict)
    #print(updated_structure)  
    #return updated_structure

def update_structure(json_object):
    for i in json_object:
        print(i)
        item = {
            "name": i["name"],
            "info": {
                "date": i["date"],
                "conservation location": i["conservation location"],
                "author": i["author"],
                "authority": i["authority"],
                "place": i["place"],
                "art": i["art"],
                "religion": i["religion"],
                "image": i["image"],
                "text 1": i["text 1"],
                "text 2": i["text 2"],
                "text 3": i["text 3"],
                "narratives": {
                    "time": i["date"],
                    "place": i["place"],
                    "artistic expression": i["art"]
                    }
                }   
            }
        updated_structure["items"].append(item)
    #print(updated_structure["items"])
    return updated_structure

new_file = update_structure(json_object)
print("This is the new file:")
print(new_file)
#print(len(updated_structure["items"]))

json_string = json.dumps(new_file)

#with open("updated_structure.json", mode="w", encoding="utf-8") as file:
    #file.write(json_string, indent=4)
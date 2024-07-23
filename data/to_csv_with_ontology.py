import csv

# Defining the ontology based on schema.org
ontology = {
    "NAME": "name",
    "DATE": "dateCreated",
    "CONSERVATION LOCATION": "locationCreated",
    "AUTHOR": "author",
    "PLACE": "contentLocation",
    "ART": "genre",
    "RELIGION": "religiousEvent"
}


def map_ontology(row):
    mapping = {}
    for csv_field, schema_field in ontology.items():
        mapping[schema_field] = row[csv_field]
    return mapping


with open('/Users/carlamenegat/Downloads/Phalic culture(Sheet2)(2).csv', mode='r', encoding='utf-8') as infile, open(
        'data_with_ontology.csv', mode='w', encoding='utf-8', newline='') as outfile:
    reader = csv.DictReader(infile)
    fieldnames = [ontology[field] for field in reader.fieldnames]
    writer = csv.DictWriter(outfile, fieldnames=fieldnames)

    writer.writeheader()
    for row in reader:
        mapping = map_ontology(row)
        writer.writerow(mapping)

print("Mapping completed. File 'data_with_ontology.csv' created successfully.")

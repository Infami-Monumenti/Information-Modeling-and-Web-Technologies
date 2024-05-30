import pandas as pd
import json

csv = pd.read_csv("Phalic culture(Sheet2).csv", keep_default_na=False, encoding="unicode_escape", dtype={"NAME": "string", "DATE": "string", "CONSERVATION LOCATION": "string", "PLACE": "string", "ART": "string", "RELIGION": "string"})

json = csv.to_json("phallic_culture.json", orient="records", force_ascii=False, indent=4)

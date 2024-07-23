import pandas as pd
import json

df = pd.read_json("data/data.json", encoding="utf-8")
print(df)

# json_split = df.to_json("data\data_split.json", force_ascii="False", orient="split")

# json_columns = df.to_json("data\data_columns.json", force_ascii="False", orient="columns")

json_index = df.to_json("data\data_index.json", force_ascii="False", orient="index")

json_table = df.to_json("data\data_table.json", force_ascii="False", orient="table")
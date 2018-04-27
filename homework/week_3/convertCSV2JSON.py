import csv
import json

csvfile = open('honeyproduction.csv', 'r')
jsonfile = open('honeyproduction.json', 'w')

reader = csv.DictReader(csvfile, delimiter=";")
data = []

for row in reader:
    data.append(dict(row))
dicto = {"data": data}
json.dump(dicto, jsonfile);

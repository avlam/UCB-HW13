# Dependencies
import pandas as pd
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from flask import Flask, render_template, jsonify
import re

# Database Setup
engine = create_engine('sqlite:///Instructions/DataSets/belly_button_biodiversity.sqlite')
Base = automap_base()
Base.prepare(engine, reflect = True)

# bbb = belly button biodiversity
# Base.metadata.tables.keys() returns dict_keys(['otu', 'samples', 'samples_metadata'])

# Save references to table(s)
otu = Base.classes.otu
samples = Base.classes.samples
s_meta = Base.classes.samples_metadata

# Create Session
session = Session(engine)

# Flask App
app = Flask(__name__)

# Utility
def parse_sample(sample_id):
    if type(sample_id) == str:
        id = re.search('\d+',sample_id)
        if id == None:
            print('No ID found.')
            return None
        else:
            id = int(id.group(0))
            return id
    elif type(sample_id) == int:
        return sample_id
    else:
        print('Unexpected input.')
        return None

# Create API routes
# 1- Dashboard homepage
@app.route('/')
def home_template():
    return render_template('index.html')

# 2- List of sample names (list format)
@app.route('/names')
def sample_names():
    columns = Base.metadata.tables['samples'].columns.keys()
    # Confirm sample_ids adhere to format "BB_xxxx"
    samples = []
    for candidate in columns:
        if candidate[:3].lower() == "bb_":
            samples.append(candidate)
    return jsonify(samples)


# 3- List of otu descriptions (list format)
@app.route('/otu')
def otu_desc():
    return jsonify([x[0] for x in session.query(otu.lowest_taxonomic_unit_found).all()])

# 4- metadata object for given sample
@app.route('/metadata/<sample>')
def metadata(sample):
    sample_query = parse_sample(sample)
    query_string = f'Select * from samples_metadata WHERE sampleid like {sample_query}'
    return jsonify(pd.read_sql(query_string, engine, index_col='SAMPLEID').to_dict(orient='records'))

# 5- washing frequency as a singular number
@app.route('/wfreq/<sample>')
def washing_freq(sample):
    sample_query = parse_sample(sample)
    query_string = f'Select WFREQ from samples_metadata WHERE sampleid like {sample_query}'
    return jsonify(int(pd.read_sql(query_string, engine)['WFREQ'][0]))

# 6- List of distionaries containing sorted lists for otu_ids and sample_values
@app.route('/samples/<sample>')
def sample_data(sample):
    sample_query = parse_sample(sample)
    query_string = f'Select BB_{sample_query} as sample_values,otu_id from samples'
    return jsonify(pd.read_sql('Select BB_940 as sample_values,otu_id from samples', engine)
        .sort_values('sample_values',ascending=False).to_dict(orient='list'))







# Flask app main
if __name__ == "__main__":
    app.run(debug=True)
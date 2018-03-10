# Dependencies
import pandas as pd
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from flask import Flask, render_template, jsonify

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

# Create API routes
# 1- Dashboard homepage
# 2- List of sample names (list format)
# 3- List of otu descriptions (list format)
# 4- metadata object for given sample
# 5- washing frequency as a singular number
# 6- List of distionaries containing sorted lists for otu_ids and sample_values






# Flask app main
if __name__ == "__main__":
    app.run(debug=True)
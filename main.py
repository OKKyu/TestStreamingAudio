#!python3
# -*- coding: utf-8 -*-

import base64
from pathlib import Path
from flask import Flask, render_template, Markup, request, jsonify, Response
import logging.config
app = Flask(__name__)

@app.route("/")
def hello():
    common = {"siteTitle":"TestStreamingAudio"}
    return render_template("views/index.html", common=common)

@app.route('/test/<fname>')
def teststreaming(fname):
    fpath = Path("./data/" + fname)
    app.logger.debug(fname)
    
    if fpath.exists() == True and fpath.is_file() == True:
        with open(str(fpath), 'rb') as f:
            byteData = f.read()
            data = {
                'binary': base64.b64encode(byteData).decode('utf-8')
            }
            return jsonify(data)
    
    return None

if __name__ == '__main__':
    #using log.conf for develop mode.
    logging.config.fileConfig(fname='env/log_develop.conf', disable_existing_loggers=False)
    app.run(host='0.0.0.0', debug=True, port=5001)
else:
    #using log.conf for deploy mode.
    logging.config.fileConfig(fname='env/log_honban.conf', disable_existing_loggers=False)

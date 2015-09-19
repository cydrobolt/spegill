from . import config
from flask import Flask, request
import indicoio
from RedisLib import rds, R_SPEGILL_USER


indicoio.config.api_key = config.indico_api_key

app = Flask('spegill')
app.secret_key = config.password

@app.route("/speech_data", methods=["GET", "POST"])
def analyse_text():
    input_text = request.form["text"]
    user_key   = request.form["key"]

    # check if user exists in redis
    spegill_user_redis_key = R_SPEGILL_USER % user_key
    user_info = rds.get(spegill_user_redis_key)

    if user_info == None:
        rds.set(spegill_user_redis_key, "1")

    indico_response = indicoio.analyze_text(input_text, apis=['named_entities'])
    named_entities = indico_response["named_entities"]
    named_entities_names = named_entities.keys()
    print named_entities_names

    return "OK"

@app.route("/")
def root():
    return "welcome to spegill"
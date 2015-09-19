from . import config
from flask import Flask, request, render_template
import indicoio
import ujson as json
from RedisLib import rds, R_SPEGILL_USER


indicoio.config.api_key = config.indico_api_key

app = Flask('spegill')
app.secret_key = config.password

def append_to_redis_array(redis_key, new_entry):
    # new_entry is an array that is to be combined with
    # the existing array in `redis_key`
    curr_redis_data = rds.get(redis_key)
    if curr_redis_data == None:
        curr_redis_data = []
    current_data = json.loads(curr_redis_data)
    current_data += new_entry
    new_redis_data = json.dumps(current_data)
    rds.set(redis_key, new_redis_data)


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

    text_tags = indicoio.text_tags(input_text)
    text_tags_names = (sorted(text_tags.keys(), key=lambda x: text_tags[x], reverse=True)[:5])

    named_entities = indico_response["named_entities"]
    named_entities_names = named_entities.keys()
    append_to_redis_array(spegill_user_redis_key + ":named_entities", named_entities_names)

    print named_entities_names
    print text_tags_names

    return "OK"

@app.route("/image_data", methods=["GET", "POST"])
def analyse_image():
    image_b64 = request.form['image_b64']


@app.route("/")
def root():
    return render_template("video.html")

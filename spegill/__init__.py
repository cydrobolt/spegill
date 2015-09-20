from . import config
from flask import Flask, request, render_template
import indicoio, requests
import ujson as json
from RedisLib import rds, R_SPEGILL_USER
import base64, hashlib

indicoio.config.api_key = config.indico_api_key

app = Flask('spegill')
app.secret_key = config.password

def append_to_redis_array(redis_key, new_entry):
    # new_entry is an array that is to be combined with
    # the existing array in `redis_key`
    curr_redis_data = rds.get(redis_key)
    if curr_redis_data == None:
        curr_redis_data = "[]"
    current_data = json.loads(curr_redis_data)
    current_data += new_entry
    new_redis_data = json.dumps(current_data)
    rds.set(redis_key, new_redis_data)

current_user = None

@app.route("/text_data", methods=["GET", "POST"])
def analyse_text():
    input_text = request.form["text"]
    user_key   = current_talking_user

    action = request.form.get("action")

    # entity_value = entity["value"]

    # check if user exists in redis
    spegill_user_redis_key = R_SPEGILL_USER % user_key
    user_info = rds.get(spegill_user_redis_key)

    if user_info == None:
        rds.set(spegill_user_redis_key, "1")

    if action == "political":
        indico_response = indicoio.analyze_text(input_text, apis=['political'])
        political_party = indico_response["political"]
        top_political_party = sorted(political_party.keys(), key=lambda x: political_party[x], reverse=True)[0]
        return top_political_party
    else:
        indico_response = indicoio.analyze_text(input_text, apis=['keywords'])

        keywords = indico_response["keywords"]
        keywords_ = (sorted(keywords.keys(), key=lambda x: keywords[x], reverse=True)[:5])
        return keywords_

@app.route("/image_data", methods=["GET", "POST"])
def analyse_image():
    image_b64 = request.form["b64_image"][22:]

    img_data = base64.b64decode(image_b64)
    h = hashlib.sha256()
    h.update(image_b64)
    file_hash = h.hexdigest()
    filename = 'spegill/static/{}.jpg'.format(file_hash)
    with open(filename, 'wb') as f:
        f.write(img_data)

    spegill_external_path = "{}/{}.jpg".format(config.external_host, file_hash)

    facepp_request_path = config.facepp_compiled_path.format(spegill_external_path)
    print facepp_request_path
    r = requests.get(facepp_request_path)

    return r.text


@app.route("/add")
def add_ads():
    return render_template("add.html")

@app.route("/")
def root():
    return render_template("video.html")

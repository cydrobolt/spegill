from . import config
from flask import Flask, request, render_template
import indicoio, requests
import ujson as json
from RedisLib import rds, R_SPEGILL_USER
import base64, hashlib

indicoio.config.api_key = config.indico_api_key

app = Flask('spegill')
app.secret_key = config.password
current_talking_user = ""

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

def get_external_link(file_hash):
    return "{}/{}.jpg".format(config.external_host, file_hash)


current_user = None

@app.route("/text_data", methods=["GET", "POST"])
def analyse_text():
    input_text = request.form["text"]
    user_key   = current_talking_user

    action = request.form.get("action")

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


@app.route("/image_create_person", methods=["GET", "POST"])
def create_person():
    face_id_list = request.form.get("face_id_list")

    obj_id_list = json.loads(face_id_list)
    obj_csv_id_list = ",".join(obj_id_list)

    post_url = config.facepp_compiled_person_path.format(obj_csv_id_list)
    icp = requests.post(post_url)

@app.route("/update_user_data", methods=["GET", "POST"])
def update_user_data():
    person_id = request.form.get("person_id")
    user_dump = request.form.get("user_dump")

    spegill_user_redis_key = R_SPEGILL_USER % person_id
    rds.set(spegill_user_redis_key + ":dump", user_dump)
    return "OK"

@app.route("/image_recog_person", methods=["GET", "POST"])
def recog_person():
    person_image_url = request.form.get("data_hash")

    post_url = config.facepp_compiled_person_get_path.format(person_image_url)
    irp = requests.post(post_url)
    irpp = json.loads(irp.text)
    try:
        recog_first_match = irpp["face"][0]["candidate"][0]

        recog_person_id = recog_first_match["person_id"]
        recog_person_confidence = recog_first_match["confidence"]

        if recog_person_confidence < 65:
            return "NO MATCH"

        spegill_user_redis_key = R_SPEGILL_USER % recog_person_id
        result = rds.get(spegill_user_redis_key + ":dump")

        return result
    except:
        return "ERR"

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

    spegill_external_path = get_external_link(file_hash)

    facepp_request_path = config.facepp_compiled_path.format(spegill_external_path)
    r = requests.get(facepp_request_path)

    return json.dumps({"o": r.text, "ha": spegill_external_path})


@app.route("/add")
def add_ads():
    return render_template("add.html")

@app.route("/")
def root():
    return render_template("video.html")

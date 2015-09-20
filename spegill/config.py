password = "spegill_secret_key123"
debug_mode = True
app_port = 5000
app_host = "127.0.0.1"

redis_host = app_host
redis_port = 6379

indico_api_key = "723a98d4b63f2efe8dccd4ff5973797e"
azure_api_key  = "01ebd2ca7d3244058527b2b6b5febdd2"

wit_ai_api_key = "SHJ346J22BRLFMWBJWGFHRSLHOMAQ6DN"

facepp_api_key = "d04ecdfcb75ee16b9384e67d34ceb414"
facepp_api_secret = "oIAftLdzUSlJ2pKrWCXUUA3DYUG7msQ5"
facepp_api_path = "http://apius.faceplusplus.com/v2/detection/detect?api_key={}&api_secret={}&attribute=glass,pose,gender,age,race,smiling&url={{}}"
facepp_compiled_path = facepp_api_path.format(facepp_api_key, facepp_api_secret)

facepp_person_api_path = "https://apius.faceplusplus.com/v2/person/create?api_key={}&api_secret={}&face_id={{}}&group_name=main"
facepp_compiled_person_path = facepp_person_api_path.format(facepp_api_key, facepp_api_secret)

facepp_person_get = "https://apius.faceplusplus.com/v2/recognition/identify?api_key={}&api_secret={}&url={{}}&group_name=main&mode=oneface"
facepp_compiled_person_get_path = facepp_person_get.format(facepp_api_key, facepp_api_secret)


wit_ai_path = "https://api.wit.ai/message?v=20150919&q={}"

# external static file host
external_host = "https://5f774464.ngrok.io"

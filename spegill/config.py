password = "spegill_secret_key123"
debug_mode = True
app_port = 5000
app_host = "127.0.0.1"

redis_host = app_host
redis_port = 6379

indico_api_key = "723a98d4b63f2efe8dccd4ff5973797e"
azure_api_key  = "01ebd2ca7d3244058527b2b6b5febdd2"

facepp_api_key = "d04ecdfcb75ee16b9384e67d34ceb414"
facepp_api_secret = "oIAftLdzUSlJ2pKrWCXUUA3DYUG7msQ5"
facepp_api_path = "http://apius.faceplusplus.com/v2/detection/detect?api_key={}&api_secret={}&attribute=glass,pose,gender,age,race,smiling&url={{}}"
facepp_compiled_path = facepp_api_path.format(facepp_api_key, facepp_api_secret)

# external static file host
external_host = "https://5f774464.ngrok.io"

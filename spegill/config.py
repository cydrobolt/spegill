password = "spegill_secret_key123"
debug_mode = True
app_port = 5000
app_host = "127.0.0.1"

redis_host = app_host
redis_port = 6379

indico_api_key = "723a98d4b63f2efe8dccd4ff5973797e"
azure_api_key  = "01ebd2ca7d3244058527b2b6b5febdd2"

azure_face_template = """
https://is.azure-api.net/face/v0/detections?analyzesAge&analyzesGender&subscription-key={api_key}
""".format({"api_key": azure_api_key})

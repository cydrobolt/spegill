# Reset Spegill FPP dataset
import requests
from spegill import config

delete_group = "https://apius.faceplusplus.com/v2/group/delete?api_secret={}&api_key={}&group_name=main".format(
    config.facepp_api_secret, config.facepp_api_key
)

create_group = "https://apius.faceplusplus.com/v2/group/create?api_secret={}&api_key={}&group_name=main".format(
    config.facepp_api_secret, config.facepp_api_key
)

print "Deleting group..."
print requests.get(delete_group).text
print "Recreating group..."
print requests.get(create_group).text

print "Done!"

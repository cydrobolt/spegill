from spegill import app
from spegill import config
debug = config.debug_mode
port  = config.app_port
host  = config.app_host

app.run(debug=debug, port=port, host=host)

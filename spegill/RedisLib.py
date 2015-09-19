import redis, config

R_SPEGILL = "spegill:%s"
R_SPEGILL_USER = R_SPEGILL % "user:%s"

rds = redis.Redis(host=config.redis_host, port=config.redis_port, db=0)

#!/bin/bash

HOMER_IP="${HOMER_IP:-127.0.0.1}"
HOMER_PORT="${HOMER_PORT:-80}"
PUBLIC_IP="${PUBLIC_IP:-127.0.0.1}"
APIBAN_KEY="${APIBAN_KEY:-0000000000000000000000}"
HOMER_TOKEN="${HOMER_TOKEN:-XLzeFGVTeKKnkWszHgLDkhlYoEYdLKUyMpvHUcoIPBNjzFyLOlXhmWmljmXxcNiJbEKknptGFdNhQTIa}"

sed -i "s/HOMER_IP_HERE/$HOMER_IP/g" /app/config.js
sed -i "s/HOMER_PORT_HERE/$HOMER_PORT/g" /app/config.js
sed -i "s/LOCAL_IP_HERE/$PUBLIC_IP/g" /app/config.js
sed -i "s/APIBAN_KEY_HERE/$APIBAN_KEY/g" /app/config.js
sed -i "s/HOMER_TOKEN_HERE/$HOMER_TOKEN/g" /app/config.js

cat /app/config.js

exec "$@"

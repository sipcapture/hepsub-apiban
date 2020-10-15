\#!/bin/bash

HOMER_IP="${HOMER_IP:-127.0.0.1}"
HOMER_PORT="${HOMER_PORT:-80}"
PUBLIC_IP="${PUBLIC_IP:-127.0.0.1}"
APIBAN_KEY="${APIBAN_KEY:-0000000000000000000000}"

sed -i "s/HOMER_IP_HERE/$HOMER_IP/g" /app/config.js
sed -i "s/HOMER_PORT_HERE/$HOMER_PORT/g" /app/config.js
sed -i "s/PUBLIC_IP_HERE/$PUBLIC_IP/g" /app/config.js
sed -i "s/APIBAN_KEY_HERE/$APIBAN_KEY/g" /app/config.js

cat /app/config.js

exec "$@"

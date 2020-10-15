FROM node:10-alpine
ENV version 0120916

COPY . /app
WORKDIR /app

RUN npm install 

# Expose Ports
EXPOSE 18088

COPY ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD [ "npm", "start" ]

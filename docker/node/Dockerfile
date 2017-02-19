FROM node:7.2
MAINTAINER Jose Soto <josecanhelp@gmail.com>

ENV REFRESHED_AT 2017-17-02

WORKDIR /var/www/html
COPY local.js /var/www/html/config/local.js
RUN npm install -g knex perk-cli
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]

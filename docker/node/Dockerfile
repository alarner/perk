FROM node:7.2

MAINTAINER Jose Soto <josecanhelp@gmail.com>

ENV REFRESHED_AT 2017-19-02

WORKDIR /var/www/html

RUN ["npm", "install", "-g", "knex", "perk-cli"]

EXPOSE 3000

CMD ["npm", "run", "dev"]

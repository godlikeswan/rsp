FROM node:latest
USER node
WORKDIR /home/node
COPY --chown=node . .
RUN npm install
RUN npm run build
CMD npm start


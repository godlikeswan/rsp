FROM node:16.16.0
WORKDIR /home/node
COPY . .
RUN npm install
RUN npm run build
CMD npm start

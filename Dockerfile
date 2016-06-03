FROM node:5.11.1
RUN mkdir /code
WORKDIR /code
ADD package.json /code
RUN npm install
ADD . /code
CMD npm start


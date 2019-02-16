FROM node:alpine


WORKDIR /app

ENV PRISMA_ENDPOINT "https://13.77.154.13:4466/nlp"
COPY package.json /app
RUN npm install

COPY . /app

CMD npm start

EXPOSE 4000
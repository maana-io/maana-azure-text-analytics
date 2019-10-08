FROM node:alpine


WORKDIR /app

ENV PRISMA_ENDPOINT "https://13.77.154.13:4466/nlp"
COPY package.json /app
RUN npm install

ENV SUBSCRIPTION_KEY=3b862f072bf2429f922a8b5099bc824e
ENV AZURE_TA_ENDPOINT=https://westus2.api.cognitive.microsoft.com/text/analytics/v2.0

COPY . /app

CMD npm start

EXPOSE 4000
FROM node:22

COPY . .
RUN yarn
RUN yarn build

CMD ["yarn", "start:dev"]
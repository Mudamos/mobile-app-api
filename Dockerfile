FROM node:7.6.0-wheezy

# https://stackoverflow.com/questions/69408776/how-to-force-older-debian-to-forget-about-dst-root-ca-x3-expiration-and-use-isrg
RUN echo "deb http://archive.debian.org/debian wheezy main" > /etc/apt/sources.list \
    && echo "deb http://archive.debian.org/debian-security wheezy/updates main" >> /etc/apt/sources.list \
    && apt-get update -o Acquire::Check-Valid-Until=false \
    && apt-get install -y ca-certificates \
    && sed -i '/^mozilla\/DST_Root_CA_X3.crt$/ s/^/!/' /etc/ca-certificates.conf \
    && update-ca-certificates --fresh \
    && rm -rf /var/lib/apt/lists/*

ENV PATH bin:$PATH
ENV APP_ROOT /app
ENV NODE_ENV=production
RUN mkdir -p $APP_ROOT
WORKDIR $APP_ROOT

RUN mkdir upload pdf_process

RUN echo "alias node='node --use-openssl-ca'" >> ~/.bashrc

RUN mkdir node10 \
  && cd node10 \
  && curl -O https://nodejs.org/download/release/v10.18.0/node-v10.18.0-linux-x64.tar.xz \
  && tar -xf node-v10.18.0-linux-x64.tar.xz \
  && cd - \
  && ln -s /app/node10/node-v10.18.0-linux-x64/bin/node /usr/local/bin/node10

COPY package.json ./

RUN npm install --only=production

COPY bin/install-custom-ca-bundle .
# Bundle is used only if USE_MESSAGE_INTEGRATOR_CA=true
RUN ./install-custom-ca-bundle && rm install-custom-ca-bundle

COPY . ./

ENV USE_OPENSSL_CA true

CMD ["docker/startup.sh"]

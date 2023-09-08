 Mudamos Mobile Api


Api Mudamos.org para gerenciamento, criaçao e apuração de votos para Leis de Iniciativa Popular.
=======

[Link GitHub](https://github.com/itsriodejaneiro/mudamos-mobile-api)


## Inicio

Esta API ira prover os recusos necessários para a gestão de Leis de Iniciativa Popular.



## Pré-requisitos 

* Instalação

  ImageMagick - [https://www.imagemagick.org/script/index.php](https://www.imagemagick.org/script/index.php)

  MySql - [https://www.mysql.com](https://www.mysql.com)

  Redis - [https://redis.io](https://redis.io)
  
## Repositório

* Git

  ```sh
  git clone https://github.com/itsriodejaneiro/mudamos-mobile-api.git 
  ```

* Pacotes NodeJs

  Executar na pasta raiz do projeto MUDAMOS-MOBILE-API.
  ```sh
  npm install 
  ```

## Configurações

  * Enviroments .env

    Este arquivo é responsável por definir qual variável de ambiente será usada pelo NodeJs e também sua porta de execução.

    ```
      NODE_ENV=development
      PORT=4000
    ```

    Arquivo .env está localizado no diretório raiz do projeto MUDAMOS-MOBILE-API.

    É possível também alterar o ambiente através do command line e do package.json.

    Package.json
    ```
      "scripts": {
        "test": "node ./node_modules/mocha/bin/mocha",
        "start": "NODE_ENV=development node index.js"
      },
    ```
    Command Line

    ```sh
        NODE_ENV=development node index.js
        NODE_ENV=produtction node index.js
        NODE_ENV=local-dev node index.js
        NODE_ENV=staging node index.js
    ```
   
  * Executando a Instalação / Process Manager

    * Command Line
    ```sh
        node index.js
    ```

    * Process Manager

      Para garantir a disponibilidade da aplicação é altamente recomendado o uso de um process manager. Abaixo listamos algumas recomendações. 

      [https://strongloop.com](https://strongloop.com)

      [http://pm2.keymetrics.io](http://pm2.keymetrics.io)
      
      [https://github.com/foreverjs/forever](https://github.com/foreverjs/forever)

## Teste de Integraçao

  * Env

  Tanto o .env quando o .env-test devem estar com o NODE_ENV=test

  * Instalação

    Docker - [https://www.docker.com](https://www.docker.com)

    ```sh
    sudo npm install -g mocha
    ```

  * Rodando Docker

    ```sh
    docker-compose up --build
    ```

  * Rodar testes de unidade

    ```sh
    NODE_ENV=test mocha ./test/integration-tests/**/*-spec.js
    ```


## Batch Schedule

  * Instalação

    Não necessida de nada instalado
  
  * Schedules Permitidos

    NODE_ENV=production node app_v1/services/schedule.js function=startFileProcess
    
    NODE_ENV=production node app_v1/services/schedule.js function=startFileProcessByRange=1=1000

      ```
       Considere o total de votos e selecione a faixa que deseja processar. 
       Caso exista mais de uma petição ativa, o range será considerado para todas elas. 
       Caso existam menos registros do que o informado no range o Schedule ira ajustar automaticamente as quantidades.
      ```
    NODE_ENV=production node app_v1/services/schedule.js function=startPetitionBlockchainVerify

    NODE_ENV=production node app_v1/services/schedule.js function=startBatchBlockchainVerify

    NODE_ENV=production node app_v1/services/schedule.js function=starImportUserMudamos

    NODE_ENV=production node app_v1/services/schedule.js function=starBlackList

  * Rodando Schedules

    NODE_ENV 
    ```
    Selecione o Enviroments no qual deseja executar o agendamento
    ```
    SCRIPT_TIMEOUT
    ```
    Limite de tempo em minutos que uma schedule pode ser executada. Ultrapassando esse limite o processo será encerrado com código 1
    ```
    app_v1/services/schedule.js
    ```
    Selecione o versão do Agendamento
    ```
    function=starBlackList

    ```
    Selecione o Agendamento
    ```

    Execute
    ```sh
    NODE_ENV=production node app_v1/services/schedule.js function=starBlackList
    ```


## Folha de Rosto PDF de Assinaturas

  * Descrição

    Toda petição cadastrada na plataforma mudamos precisa de uma folha de rosto.
    No arquivo de Environments temos uma chave para ser colocado o Path onde a imagem vai estar PDF_IMAGE_TEMPLATE.
    Lembrando que o projeto está integrado com o AWS , mas você pode facilmente modificar esta implementação.
  
  * Tamanhos

    Esta folha de rosto de seguir algumas especificações.
      Tamanho em Pixel : Altura = 3508 e Largura = 2480
      Tamanho A4 72 Dpi
      Formato PNG

  * Padrão Mudamos

    Padrão Bucket Mudamos  mudamos-imagens , pasta images/petition. 

  * Como fazer

    Criar pasta com o Id da Petição 
      Ex.: images/petition/1  , images/petition/2

    Criar os arquivos referentes as página da petição
      Caso exista mais de 1 página de folha de rosto adicionar o prefixo _ + a quantidade de página , ex.: 1_1.png , 1_2.png, 1_3.png
    
    Como fica : s
    ```sh
      mudamos-images/images/petition/{id}/{id}.png
      Exemplo:
        mudamos-images/images/petition/1/1_1.png
        mudamos-images/images/petition/1/1_2.png
        mudamos-images/images/petition/2/2.png
    ```


## ENV vars

- APPLE_CLIENT_ID: mobile app bundle identifier
- APPLE_SIGN_IN_IGNORE_EXPIRATION: should ignore apple token expiration time
- AWS_BATCH_VOTE_CREATOR_URL: url da fila sqs de criação de batch votes
- AWS_REGION: main aws region
- AWS_ACCESSKEY_ID
- AWS_ACCESSKEY_SECRET
- AWS_BUCKET: signatures bucket
- AWS_BUCKET_PRIVATE: private signature bucket
- AWS_MOVE_S3_FILE_URL: url da fila sqs para mover arquivos no s3
- AWS_PETITION_PDF_SIGNATURE_CREATOR_URL: url da fila sqs de criação de pdf de assinaturas
- AWS_SMS_REGION: region used by the old sms feature
- AWS_URL: main aws region url
- AWS_URL_IMG_BUCKET: image bucket
- DB_CONNECTIONS_LIMIT: max pool connection limit used by the old conneciton pool
- DB_POOL_ACQUIRE:  The maximum time, in milliseconds, that pool will try to get connection before throwing error
- DB_POOL_IDLE: The maximum time, in milliseconds, that a connection can be idle before being released.
- DB_POOL_MAX_CONNECTIONS: max pool connections used by new code
- DB_POOL_MIN_CONNECTIONS: min pool connections used by the new code
- DB_HOST
- DB_USER
- DB_MULTIPLE_STATEMENTS_ENABLED: if multiple statements should be enabled. Only enable this when necessary (eg. some migrations require it)
- DB_PASS
- DB_PORT
- DB_NAME
- LOG_LEVEL: Level de log
- MUDAMOS_API_URL: the mudamos api url eg. https://www.mudamos.org/api
- NODE_ENV
- PDF_DEFAULT_FONT_PATH: caminho relativo ao root da aplicação para o path da fonte default usada no pdf
- PDF_LINES_PER_PAGE: número de linhas no pdf
- PDF_MUDAMOS_FONT_PATH: caminho relativo ao root da aplicação para o path da fonte mudamos
- PDF_MUDAMOS_BOLD_FONT_PATH: caminho relativo ao root da aplicação para o path da fonte mudamos bold
- PDF_SIGNATURE_VALIDATION_URL: url da página de validação de assinaturas no mudamos web
- ONESIGNAL_API_KEY: the one signal (push message) api key
- ONESIGNAL_APP_ID: the one signal (push message) api id
- PORT: porta do servidor web (ex. 4000)
- REQUEST_TIMEOUT: timeout to external services
- SCRIPT_TIMEOUT: Limite de minutos que uma task pode executar
- SHOW_LOG_COLOR: Habilita cores nos logs (Boolean)
- SIGNER_DB_HOST: host do banco da signer app
- SIGNER_DB_USER
- SIGNER_DB_PASS
- SIGNER_DB_PORT
- SIGNER_DB_NAME
- SIGNER_DB_POOL_MAX_CONNECTIONS
- SIGNER_DB_POOL_MIN_CONNECTIONS
- TZ: Time zone (ex. America/Sao_Paulo)
- WEB_CONCURRENCY: Number of Clusters (web process)

### Facebook limited login

Para que a api de login via facebook funcione corretamente, se faz necessário ter uma versão de node 10.18.0 intalada. Essa versão é executada para processar dados do jwt do facebook.
Instale o node 10.18.0 e criei em seu PATH o comando `node10` apontando para o binário do node 10.

Exemplo:

```
$ ls `which node10` # /usr/local/bin/node10@ -> /Users/myuser/.ndenv/versions/10.18.0/bin/node
```

### Instalando certificado root do Let's encrypt

Este projeto usa uma versão bem antiga do node e alguns certificados rails (CA store) da let's encrypt expiraram em 30 de Setembro de 2021. Na imagem docker, os certificados foram atualizados e os comandos estão sendo passados com o modificador `--use-openssl-ca`, o que faz o node usar o CA store do openssl.
Para o desenvolvimento local em macos, será necessário baixar o Root Certificate Chain da let's encrypt e usar nas chamadas de serviços que necessitam seu uso.

Em macos rode:
```
$ ./bin/install-custom-ca-bundle
```

Então sete a variável de ambiente `USE_MESSAGE_INTEGRATOR_CA=true`

O comando anterior irá gerar o bundle `lets_encrypt_bundle_ca.pem` que é usado pelo código ao chamar a callback do integrador (integrator message callback).

### Rodando migrações

Para rodar migrações e interagir com o CLI do sequelize lembre de escopar a app que rodará o comando. Por padrão é app é a principal *main*.

```
$ sequelize db:migrate
```

Mesmo que:

```
$ MIGRATION_APP=main sequelize db:migrate
```

Para rodar migrações da *signer*:

```
$ MIGRATION_APP=signer sequelize db:migrate
```

#### Criando novas migrações

```
$ sequelize migration:create --name add-something-to-some-table
```

#### Desfazendo a última migração efetuada

```
$ sequelize db:migrate:undo
```

## Workers

Para iniciar os consumidores de filas (processos em background) execute:

```
$ ./bin/workers
```

É possível indicar quais workers iniciar:

```
$ ./bin/workers -c one-worker -c another-worker
```

Execute `./bin/workers --help` para ver a lista de workers.

## Release

Para gerar uma nova versão da imagem da app execute:

Esse comando irá gerar um nova image, aplicar as tags de latest, staging e APP_VERSION localmente.

A nova versão também será enviada para a amazon (somente a tag com a versão).

```
$ APP_VERSION=x.xx.x npm run release
```

Agora caso queria publicar a nova imagem em staging execute:

```
$ npm run push-staging
```

Para publicar de fato a nova tag latest:


```
$ npm run push-latest
```

#### Release com push staging em comando único

Para gerar uma nova versão e num comando único efetuar o push da nova imagem de staging.

```
$ APP_VERSION=x.xx.x npm run build-latest-and-deploy-staging
```

## Desenvolvimento

Para iniciar o servidor em modo de hot reload execute `nodemon` ou `npm run hotreload`.

### Lint

```
$ npm run lint
```

Obs. somente parte da app passa pelo lint (ver .eslintignore).

### Assinatura de mensagem via integrador (desenvolvimento)

É possível simular um integrador, gerando QR codes ou links para assinatura de mensagens customizadas. Para isso sete as env vars:

```
SIGNER_MESSAGE_DEV_TEST_CALLBACK_ENABLED=true // habilita a rota de callback local
SIGNER_MESSAGE_DEV_TEST_APP_LINK_ENABLED=true // habilita a rota de geração de applinks local
SIGNER_MESSAGE_DEV_TEST_APP_LINK_FIREBASE_SUBDOMAIN=f9d7p
SIGNER_MESSAGE_DEV_TEST_IOS_BUNDLE_ID=br.com.tagview.mudamosmobile
SIGNER_MESSAGE_DEV_TEST_ANDROID_PACKAGE_NAME=br.com.tagview.petition.mudamos.beta
SIGNER_MESSAGE_DEV_TEST_IOS_APP_STORE_ID=1214485690

SIGNER_MESSAGE_INTEGRATOR_CALLBACK_HOST=http://localhost:4000/api/v1/sign-message-integrator-dev-test/callback
```

Agora subir o servidor localmente e acessar `/api/v1/sign-message-integrator-dev-test/applink`.

Esse endpoint pode receber os atributos esperados pelo caso de uso `src/use-cases/message-sign/integrator-app-link-generator.js`, ou seja para fazer override da mensagem a ser assinada, basta passar na query string a informação ex:

```
/api/v1/sign-message-integrator-dev-test/applink?messageToSign=uma-outra-mensage
```

Use os QR codes gerados nesta página para validar a assinatura na app Mudamos+.

O resultado da assinatura, também será enviado para a própria app, para isso tenha certeza de estar consumindo a fila SQS da feature localmente rodando os workers `./bin/workers`.
O endpoint de callback irá validar e logar informações da assinatura para debugging.

## APIS - Requests e Responses
  Raiz - /api/
  * /v1
    * /profile
      * /documents
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```

        Request

        ```
        {
          "user":{
            "cpf":"11111111130",
            "voteidcard":"111111111114",
            "termsAccepted":true
          }
        }
        ```

      * /mobile_pin
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          {  
            "mobile":{  
                "number":"11999887766"
            }
          }

        ```

      * /mobile
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          {  
            "mobile":{  
                "pinCode":"33503",
                "number":"11999887766",
                "imei":"300988605208167",
                "brand":"samsung",
                "model":"J5",
                "so":"android",
                "soVersion":"6.0.1",
                "screenSize":"320x480"
            }
          }
        ```

      * /wallet
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          {  
            "user":{  
                "walletKey":"1FTCdx3VhA4pxWtb6e1uiyzhAcGXeoGJwy"
            }
          }

        ```

      * /birthday
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          {  
            "user":{  
                "birthday":"1978-11-15"
            }
          }
        ```

      * /zipcode
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          {  
            "user":{  
                "address":"Asa Sul Entrequadra Sul 414/415 - Brasília, DF, 70297-400, Brazil",
                "state":"Distrito Federal",
                "city":"Brasilia",
                "district":"Brasilia",
                "uf":"DF",
                "city":"Brasília",
                "lat":-15.8356558,
                "lng":-47.916,
                "zipcode":"70297400"
            }
          }
        ```

      * /
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```

    * /auth

      * /token

        Header 

        ```
          Header : {
            Authorization : Basic cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```

      * /facebook/token
        
        Header 

        ```
          Header : {
            access_token :  cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```

        Request

        ```
          {
            "petition":
              {
                "versionId":"1"
              }
          }
        ```

      * /logout
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```

    * /users

      * /password/reset
           
        Request

        ```
          {  
            "user":{  
                "email":"test@gmail.com"
            }
          }
        ```
      * /password/update

        * Authorization

          Header 

          ```
            Header : {
              Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
            {  
              "user":{  
                  "email":"test@gmail.com"
              }
            }
          ```
        * Pincode
         
          Request

          ```
          {  
            "user":{  
                "password":"123456",
                "pincode":"74024"
            }
          }
          ```

      * /sign_up

        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
          
        Request

        ```
          {  
            "user":{  
                "name":"Teste teste teste",
                "email":"email@email.com.br",
                "password":"123456"
            }
          }
        ```

       * Authorization

          Header 

          ```
            Header : {
              Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
            {  
              "user":{  
                  "name":"Teste teste teste",
                  "email":"email@email.com.br",
                  "password":"123456"
              }
            }
          ```

        * No Authorization
         
          Request

          ```
            {  
              "user":{  
                  "name":"Teste teste teste",
                  "email":"email@email.com.br",
                  "password":"123456"
              }
            }
          ```

      * /message/{plip_id}
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          GET plip_id 
        ```

      * /profile/update
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          {  
            "user":{  
                "birthday":"1978-11-15",
                "name":"Teste",
                "zipcode":"05305012",
                "state":"São Paulo",
                "city":"São Paulo",
                "district":"Bairro",
                "uf":"SP",
                "lat":-23.532934,
                "lng":-46.72902190000001
            }
          }
        ```

      * /remove/account
        
        Request

        ```
        {  
          "user":{  
              "email":"email@email.com"
          }
        }
        ```

      * /resend_validation
         
        Request

        ```
        {  
          "user":{  
              "email":"email@email.com"
          }
        }
        ```

      * /email/update

        * Authorization TOKEN
       
          Header 

          ```
            Header : {
              Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
          {  
            "user":{  
              "email":"email@email.com"
            }
          }
          ```

        * Authorization KEY

          Header 

          ```
            Header : {
              Authorization :  cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```

          Request

          ```
          {  
            "user":{  
                "profile_email":"email@email.com",
                "new_profile_email":"new_mail@email.com"
            }
          }

          ```

      * /recovery

        * Authorization KEY

          Header 

          ```
            Header : {
              Authorization :  cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
          {  
            "user":{  
                "user_name":"Fulano",
                "user_birthday":"1978-11-15",
                "user_voteidcard":"111222333444",
                "user_cpf":"11122233344",
                "user_zipcode":"05305012",
                "user_state":"Paraíba",
                "user_uf":"PB",
                "user_city":"Belém do Brejo do Cruz",
                "user_district":"Parque Ibirapuera",
                "mobile_number":"11123456789",
                "profile_email":"email@email.com"
            },
            "score":1
          }
          ```

    * /petition

      * /register

        * Authorization KEY

          Header 

          ```
            Header : {
              Authorization :  cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
          {  
            "petition":{  
                "id_version":"333",
                "id_petition":"1",
                "name":"Lei da Ficha Limpa",
                "sha":"0710ec7b4616fd356bd2007220336eca98c85c132be587c1f1d7610d02e12662",
                "url":"http://www.mudamosweb.org/peticao/ficha-limpa",
                "page_url":"http://www.mudamosweb.org/peticao/ficha-limpa"
            }
          }
          ```

      * /{version_id}/info
        
        Request

        ```
          Metodo Get version_id via URL
        ```

      * {version_id}/{limit}/votes

        Request

        ```
          Metodo Get 
            version_id via URL
            limit via URL
        ```

      * {version_id}/{limit}/votes/blockchain

        Request

        ```
          Metodo Get 
            version_id via URL
            limit via URL
        ```

      * /{sha256}/status
  
        Request

        ```
         Metodo Get 
            sha256 via URL
        ```

      * /{version_id}/{group}/votes/friends
        
        * Authorization

          Header 

          ```
            Header : {
              Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
            Metodo Get 
              version_id via URL
              group (boolean true e false) via URL
          ```

        * No Authorizarion

          Request

          ```
            Metodo Get 
              version_id via URL
              group (boolean true e false) via URL
          ```

      * /plip/{plip_id}/info

          Request

          ```
            Metodo Get 
              plip_id via URL
          ```

      * /{plip_id}/signatures

          Request

          ```
            Metodo Get 
              plip_id via URL
          ```

      * /plip/{plip_id}/versions

        Request

        ```
          Metodo Get 
            plip_id via URL
        ```

    * /address

      * /search/address/{address}
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          Metodo Get 
            cep via URL
        ```

      * /search/{lat}/{lng}/inverse
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          Metodo Get 
            lat via URL
            lng via URL
        ```

    * /config

      * /{key}

        Request

        ```
          Metodo Get 
            key via URL
        ```

    * /message

      * /sign
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
        {  
          "signMessage":{  
              "petitionId":1,
              "block":"Rafael Lima;58038020;039721201252;2017-05-12T05:06:15.277Z;Pelo Fim da Compra de Apoio Político;1;16Nf8dm34CU2E29J1U1oWRhG8DEMGL4Epq;IPH1UEXHAgEaRfjgkzBh+keo41voVTXcfOaWChU3kdV3X5qz3lhSeTKxTwrQJLAkToxOA2N9WhNKAaB1qEee2Sk=;1216"
          }
        }
        ```

      * /blockchain/status

        Request

        ```
        {  
          "sign":{  
              "signature":"ILmzdArreSZWcQRq79dPLs/IHSUYO0okX2/ix8gPLBEjL+NFsG71uPzXqxp24T075V6jQtoBNvXnWAvrqWi7bXU="
          }
        }
        ```
    * /notification

      * /confirm/{access_token}

        Request

        ```
          Metodo Get 
            access_token via URL
        ```

  * /v2

    * /auth

      * /facebook/token

        Header 

        ```
          Header : {
            access_token :  cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```

        Request

        ```
          {  
            "petition":{  
                "versionId":"1"
            },
            "block":"fae4a2a2b6d678f609ec39474a73ad659636c26a16c5c5bb861958e7dc2d2c1;20"
          }
        ```
         
        obs.: Block gerado através do Proof Of Work da LibCrypto

        Block

        ```
          Mensagem Assinada com a LibCrypto
          Usando o access_token Header
        ```

    * /users

      * /sign_up

        * Authorization
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
          
        Request

        ```
          {  
            "user":{  
                "name":"Teste teste teste",
                "email":"email@email.com.br",
                "password":"123456"
            }
          } 
        ```

       * No Authorization

          Header 

          ```
            Header : {
              Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
          {  
            "user":{  
                "name":"Teste",
                "email":"teste@teste.com",
                "password":"123456"
            },
            "petition":{  
                "versionId":"1"
            },
            "block":"fae4a2a2b6d678f609ec39474a73ad659636c26a16c5c5bb861958e7dc2d2c1"
          }
          ```

          obs.: Block gerado através do Proof Of Work da LibCrypto

          Block

          ```
            Mensagem Assinada com a LibCrypto
            Usando o user.name;user.email;user.password , separados por ';'
          ```

      * /password/reset/

        Request

        ```
          {  
            "user":{  
                "email":"teste@teste.com.br"
            },
            "block":"32afba5d47e587ebae454baed483cc60d1cf2a82bdff7c42e951afec5aca1c46;2"
          }
        ```

        obs.: Block gerado através do Proof Of Work da LibCrypto

        Block

        ```
          Mensagem Assinada com a LibCrypto
          Usando o user.email
        ```

      * /password/update/

        * Authorization

          Header 

          ```
            Header : {
              Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
            }
          ```
          
          Request

          ```
            {  
              "user":{  
                  "currentPassword":"123456",
                  "newPassword":"1234567"
              }
            }
          ```

        * No Authorization
         
        Request

        ```
          {  
            "user":{  
                "password":"123456",
                "pincode":"63631"
            },
            "block":"32afba5d47e587ebae454baed483cc60d1cf2a82bdff7c42e951afec5aca1c46"
          }
        ```

        obs.: Block gerado através do Proof Of Work da LibCrypto

        Block

        ```
          Mensagem Assinada com a LibCrypto
          Usando o user.password;user.pincode , separados por ';'
        ```

    * /address

      * /search/:lat/:lng/inverse
        
        Header 

        ```
          Header : {
            Authorization : Bearer cmVuYXRvbXNpbHZhQGdtYWlsLmNvbTo4ZDk2OWVlZjZlY2FkM2MyOWEzYTYyOTI4MGU2ODZjZjBjM2Y1ZDVhODZhZmYzY2ExMjAyMGM5MjNhZGM2Yzky
          }
        ```
        
        Request

        ```
          Metodo Get 
            lat via URL
            lng via URL
        ```

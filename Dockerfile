# Use uma imagem base oficial do Node.js
FROM node:18.15.0

# Instale o ffmpeg
RUN apt-get update && apt-get install -y ffmpeg

# Definir diretório de trabalho no container
WORKDIR /usr/src/app

# Copie ambos os arquivos 'package.json' e 'package-lock.json' (se disponível)
COPY package*.json ./

# Instale as dependências do seu projeto
RUN npm install

# Copie o restante dos arquivos do seu projeto para o diretório de trabalho no container
COPY . .

# Copie a chave JSON para o container
COPY go-speechtotext-39eb04271f11.json /app/go-speechtotext-39eb04271f11.json

# Defina a variável de ambiente para apontar para a chave JSON
ENV GOOGLE_APPLICATION_CREDENTIALS=/app/go-speechtotext-39eb04271f11.json


# Expõe a porta que o seu aplicativo usa 
EXPOSE 3000

# Comando para iniciar o seu aplicativo
CMD [ "node", "server.js" ]

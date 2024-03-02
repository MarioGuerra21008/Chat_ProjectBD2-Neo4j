# Chat Project Data Base 2

Este proyecto es una red social que permite a los usuarios chatear y compartir posts. El proyecto está dividido en dos partes: el frontend y el backend.
El frontend esta desarrollado en React JS y el backend con Express utilizando una base de datos MongoDB.

## Frontend

### Instalación

Para instalar las dependencias del frontend, navega al directorio `frontend` y ejecuta el siguiente comando:

```bash
cd frontend
yarn install
yarn start
```

## Backend

### Instalación

Para instalar las dependencias del frontend, navega al directorio `backend` y ejecuta el siguiente comando:

```bash
cd backend
yarn install
yarn start
```

### Base de Datos MONGODB

Las colecciones utilizadas para el proyecto fueron las siguientes:
- users:
  ![Descripción de la imagen](users_collection.png)
- posts:
  ![Descripción de la imagen](posts_collections.png)
- messages:
  
  ![Descripción de la imagen](messages_collection.png)
- conversations:
  ![Descripción de la imagen](conversations_collection.png)

### Generación de Datos usando JavaScript

Se utiliza un script para la generación de datos para las bases en MongoDB, para esto se requiere hacer una conexión a la URI de la base de datos.

```bash
MONGO_URL = mongodb://localhost:27017/<nombre_de_la_base_de_datos>
```

Para correr el script, se requiere de las siguientes dependencias:

```bash
yarn add mongoose
yarn add @faker-js/faker
yarn add bcrypt
```

O con NPM:

```bash
npm install mongoose
npm install @faker-js/faker
npm install bcrypt
```
Finalmente, para ejecutar el script "scripProyectoBDD.js" se utiliza el siguiente comando:

```bash
node scriptProyectoBDD.js
```

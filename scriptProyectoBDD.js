const mongoose = require('mongoose');
const { faker, fakerAF_ZA, fakerSK, fakerEN } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/elmeroproyectobdd2', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

// Definir los modelos de mongoose para las colecciones
const UserSchema = new mongoose.Schema({
    profilePicture: String,
    coverPicture: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isAdmin: Boolean,
    username: String,
    email: String,
    passwordHash: String,
    password: String,
    createdAt: Date,
    updatedAt: Date
});

const PostSchema = new mongoose.Schema({
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    desc: String,
    img: String,
    createdAt: Date,
    updatedAt: Date
});

const ConversationSchema = new mongoose.Schema({
    members: [String],
    createdAt: Date,
    updatedAt: Date
});

const MessageSchema = new mongoose.Schema({
    conversationId: String,
    sender: String,
    text: String,
    createdAt: Date,
    updatedAt: Date
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema)
const Conversation = mongoose.model('Conversation', ConversationSchema);
const Message = mongoose.model('Message', MessageSchema);

// Función para hashear contraseñas
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// Función para generar usuarios
async function generateUsers(numUsers) {
    const users = [];
    const allUsers = await User.find(); // Obtener todos los usuarios existentes
    for (let i = 0; i < numUsers; i++) {
        const password = faker.internet.password();
        const passwordHash = await hashPassword(password); // Generar hash de la contraseña
        const user = new User({
            profilePicture: faker.image.avatar(),
            coverPicture: faker.image.url(),
            followers: [],
            following: [],
            isAdmin: false,
            username: faker.internet.userName(),
            email: faker.internet.email(),
            passwordHash: passwordHash, // Guardar hash de la contraseña
            password: password, // Mantener la contraseña original
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        });
        // Agregar ObjectID de usuarios aleatorios a followers y following
        const randomUserIds = getRandomUserIds(allUsers, 100); // Obtener hasta 100 ObjectID de usuarios aleatorios
        user.followers = randomUserIds;
        user.following = randomUserIds;
        await user.save();
        users.push(user);
    }
    return users;
}

// Función para obtener ObjectID de usuarios aleatorios
function getRandomUserIds(users, maxCount) {
    const randomUserIds = [];
    const numUsers = Math.min(maxCount, users.length); // Limitar el número máximo de usuarios aleatorios
    for (let i = 0; i < numUsers; i++) {
        randomUserIds.push(users[Math.floor(Math.random() * users.length)]._id);
    }
    return randomUserIds;
}

// Función para generar publicaciones
async function generatePosts(users) {
    for (const user of users) {
        const numPosts = Math.floor(Math.random() * 10) + 1; // Ajusta la cantidad según tus necesidades
        for (let i = 0; i < numPosts; i++) {
            const numLikes = Math.floor(Math.random() * 10) + 1; // Limitar el rango de likes
            const likedUsers = []; // Array para almacenar los usuarios que darán like
            for (let j = 0; j < numLikes; j++) {
                // Escoge un usuario aleatorio dentro del rango permitido
                const randomUser = users[Math.floor(Math.random() * users.length)];
                likedUsers.push(randomUser._id);
            }
            const post = new Post({
                likes: likedUsers,
                userId: user._id,
                desc: faker.lorem.sentence(),
                img: faker.image.url(),
                createdAt: faker.date.past(),
                updatedAt: faker.date.recent()
            });
            await post.save();
        }
    }
}

// Función para generar conversaciones
async function generateConversations(users) {
    const conversations = [];
    for (let i = 0; i < users.length; i += 2) {
        const conversation = new Conversation({
            members: [users[i]._id, users[i + 1]._id],
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        });
        await conversation.save();
        conversations.push(conversation);
    }
    return conversations;
}

// Obtiene un elemento aleatorio del array
function getRandomElement(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Función para generar mensajes
async function generateMessages(conversations) {
    for (const conversation of conversations) {
        const numMessages = Math.floor(Math.random() * 10) + 1;
        for (let i = 0; i < numMessages; i++) {
            const message = new Message({
                conversationId: conversation._id,
                sender: getRandomElement(conversation.members),
                text: faker.lorem.sentence(),
                createdAt: faker.date.past(),
                updatedAt: faker.date.recent()
            });
            await message.save();
        }
    }
}

// Generar datos
async function generateData() {
    const numUsers = 50000;
    const users = await generateUsers(numUsers);
    await generatePosts(users);
    const conversations = await generateConversations(users);
    await generateMessages(conversations);
    console.log('Generación de datos completada.');
    db.close();
}

generateData();

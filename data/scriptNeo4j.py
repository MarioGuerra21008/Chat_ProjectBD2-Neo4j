import pandas as pd
from faker import Faker
import hashlib
import random
from datetime import datetime, timedelta

fake = Faker()

hobbies_id = ["Hobby_0", "Hobby_1", "Hobby_2", "Hobby_3", "Hobby_4", "Hobby_5", "Hobby_6", "Hobby_7", "Hobby_8", "Hobby_9"]

# Lista de hobbies específicos
specific_hobbies = ["Deportes", "Musica", "Entretenimiento", "Farandula", "Cocina", "Arte", "Videojuegos", "Peliculas", "Tecnología", "Ciencia"]

# Descripciones de los hobbies
hobby_descriptions = [
    "Practicar deportes es una actividad física que involucra competencia o recreación.",
    "La música es una forma de arte que utiliza sonidos organizados en el tiempo.",
    "El entretenimiento es cualquier actividad que ofrece diversión o placer.",
    "La farándula se refiere al mundo del espectáculo y del entretenimiento.",
    "La cocina es el arte de preparar alimentos para el consumo.",
    "El arte es una expresión humana creativa que puede manifestarse en diversas formas.",
    "Los videojuegos son juegos electrónicos que implican interacción con un dispositivo de usuario.",
    "Las películas son obras cinematográficas que cuentan historias a través de imágenes en movimiento.",
    "La tecnología se refiere al conjunto de conocimientos y herramientas que se utilizan para crear productos y procesos.",
    "La ciencia es el estudio sistemático de la naturaleza y el universo mediante la observación y experimentación."
]

# Tópicos de los hobbies
hobby_topics = [
    ["Fútbol", "Baloncesto", "Natación", "Tenis", "Atletismo"],
    ["Rock", "Pop", "Jazz", "Clásica", "Electrónica"],
    ["Cine", "Teatro", "Televisión", "Música en vivo", "Eventos deportivos"],
    ["Actuación", "Música", "Cine", "Televisión", "Moda"],
    ["Recetas", "Técnicas de cocina", "Ingredientes", "Cocina internacional", "Postres"],
    ["Pintura", "Escultura", "Dibujo", "Fotografía", "Arte digital"],
    ["Aventura", "Estrategia", "Deportes", "Acción", "Multijugador"],
    ["Drama", "Comedia", "Acción", "Terror", "Ciencia ficción"],
    ["Programación", "Tecnología móvil", "Desarrollo web", "Inteligencia artificial", "Ciberseguridad"],
    ["Física", "Química", "Biología", "Astronomía", "Medicina"]
]

# Generar datos para User
users = []
for i in range(1250):
    user_id = f"User_{i}"
    username = fake.user_name()
    password = 'password123'  # Misma contraseña para todos los usuarios
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    date_created = fake.date_time_this_decade()
    followers = random.randint(0, 10000)
    following = random.randint(0, 10000)
    hobby = random.choice(hobbies_id)
    users.append((user_id, username, password, password_hash, date_created, followers, following, hobby))

# Generar datos para Post
posts = []
for i in range(1250):
    post_id = f"Post_{i}"
    username = random.choice(users)[0]  # Tomar un nombre de usuario aleatorio
    post = fake.text()
    post_created = fake.date_time_this_decade()
    post_updated = random.choice([True, False])
    likes = random.sample([user[0] for user in users], random.randint(0, len(users)//10))  # Muestra aleatoria de usuarios
    image = fake.image_url()
    hobby = random.choice(hobbies_id)
    posts.append((post_id, username, post, post_created, post_updated, likes, image, hobby))

# Generar datos para Conversation
conversations = []
for i in range(1250):
    conv_id = f"Conversation_{i}"
    member1 = random.choice(users)[0]
    member2 = random.choice(users)[0]
    conversation_name = fake.sentence()
    conversation_created = fake.date_time_this_decade()
    messages_quantity = random.randint(2, 10)  # Entre 2 y 10 mensajes por conversación
    conversations.append((conv_id, member1, member2, conversation_name, conversation_created, messages_quantity))

# Generar datos para Message y vincular con Conversation
messages = []
for conv in conversations:
    for _ in range(conv[5]):
        message_id = f"Message_{len(messages)}"
        username = random.choice([conv[1], conv[2]])  # Tomar un miembro aleatorio de la conversación
        text = fake.text()
        date_created = fake.date_time_this_decade()
        date_updated = date_created + timedelta(minutes=random.randint(1, 60))
        media = fake.image_url()
        messages.append((message_id, username, text, date_created, date_updated, media, conv[0]))  # Añadir ID de la conversación

# Generar datos para Hobby
hobbies = []
for i, hobby_name in enumerate(specific_hobbies):
    hobby_id = hobbies_id[i]
    description = hobby_descriptions[i]
    followers = [user[0] for user in users if user[7] == hobby_id]
    topics = hobby_topics[i]
    posts_tags = [post[0] for post in posts if post[7] == hobby_id]  # Obtener IDs de posts con el mismo hobby
    hobbies.append((hobby_id, hobby_name, description, followers, topics, posts_tags))

# Crear DataFrames de pandas
users_df = pd.DataFrame(users, columns=['ID', 'Username', 'Password', 'PasswordHash', 'Date_created', 'Followers', 'Following', 'Hobby'])
posts_df = pd.DataFrame(posts, columns=['ID', 'Username', 'Post', 'Post_created', 'Post_updated', 'Likes', 'Image', 'Hobby'])
conversations_df = pd.DataFrame(conversations, columns=['ID', 'Member1', 'Member2', 'Conversation_name', 'Conversation_created', 'Messages_quantity'])
messages_df = pd.DataFrame(messages, columns=['ID', 'Username', 'Text', 'Date_created', 'Date_updated', 'Media', 'Conversation_id'])
hobbies_df = pd.DataFrame(hobbies, columns=['ID', 'Name', 'Description', 'Followers', 'Topics', 'Posts'])

# Guardar los DataFrames como archivos CSV
users_df.to_csv('data/users.csv', index=False)
posts_df.to_csv('data/posts.csv', index=False)
conversations_df.to_csv('data/conversations.csv', index=False)
messages_df.to_csv('data/messages.csv', index=False)
hobbies_df.to_csv('data/hobbies.csv', index=False)

# Generar datos para relaciones
likes_hobby = []
for user in users:
    hobby = user[7]
    date_liked = fake.date_time_this_decade()
    interest = random.randint(1, 10)
    comment = fake.text()
    likes_hobby.append((user[0], hobby, date_liked, interest, comment))

# Generar datos para posts_tags
posts_tags = []
for post in posts:
    hobby = post[7]  # Obtener el hobby asignado al post
    date_posted = post[3]  # Tomar la fecha en que se creó el post
    popularity = random.randint(1, 1000)
    relevance = random.randint(1, 10)
    posts_tags.append((post[0], hobby, date_posted, popularity, relevance))

follows = []
for user1 in users:
    user2 = random.choice(users)[0]  # Tomar un usuario aleatorio
    date_followed = fake.date_time_this_decade()
    interactions = random.randint(1, 100)
    interest_level = random.randint(1, 10)
    follows.append((user1[0], user2, date_followed, interactions, interest_level))

posted = []
for post in posts:
    username = post[1]
    post = post[0]
    date_posted = fake.date_time_this_decade()
    post_type = random.choice(['text', 'image', 'video'])
    visibility = random.choice(['public', 'private', 'friends'])
    posted.append((username, post, date_posted, post_type, visibility))

likes_post = []
for user in users:
    post = random.choice(posts)[0]  # Tomar un post aleatorio
    date_liked = fake.date_time_this_decade()
    comment = fake.text()
    likes_post.append((user[0], post, date_liked, comment))

in_relationship_with = []
for user1 in users:
    user2 = random.choice(users)[0]  # Tomar un usuario aleatorio
    date_relationship = fake.date_time_this_decade()
    status = random.choice(['comprometido', 'casado', 'novios', 'soltero'])
    duration = random.randint(1, 10)
    in_relationship_with.append((user1[0], user2, date_relationship, status, duration))

belongs_to = []
for message in messages:
    conversation = message[6]  # Tomar la conversación asociada al mensaje
    date_sent = message[3]
    message_type = random.choice(['text', 'image', 'attachment'])
    read = random.choice([True, False])
    belongs_to.append((message[0], conversation, date_sent, message_type, read))

chats_with = []
for conv in conversations:
    user1, user2 = conv[1], conv[2]
    date_started = conv[4]
    duration = random.randint(1, 100)
    theme = conv[3]
    chats_with.append((user1, user2, date_started, duration, theme))

related_to = []
for post in posts:
    # Obtener todos los posts asociados al hobby actual
    hobby = post[7]
    date_related = post[3]  # Tomar la fecha del primer post asociado
    relevance = random.randint(1, 10)
    comment = fake.text()
    related_to.append((hobby, post[0], date_related, relevance, comment))


follows_topic = []
for user in users:
    hobby = user[7]
    date_followed = fake.date_time_this_decade()
    interest_level = random.randint(1, 10)
    last_activity = fake.date_time_this_decade()
    follows_topic.append((user[0], hobby, date_followed, interest_level, last_activity))

# Crear DataFrames de pandas para las relaciones
likes_hobby_df = pd.DataFrame(likes_hobby, columns=['Username', 'Hobby', 'Date_liked', 'Interest', 'Comment'])
posts_tags_df = pd.DataFrame(posts_tags, columns=['Post', 'Hobby', 'Date_posted', 'Popularity', 'Relevance'])
follows_df = pd.DataFrame(follows, columns=['User1', 'User2', 'Date_followed', 'Interactions', 'Interest_level'])
posted_df = pd.DataFrame(posted, columns=['Username', 'Post', 'Date_posted', 'Post_type', 'Visibility'])
likes_post_df = pd.DataFrame(likes_post, columns=['Username', 'Post', 'Date_liked', 'Comment'])
in_relationship_with_df = pd.DataFrame(in_relationship_with, columns=['User1', 'User2', 'Date_relationship', 'Status', 'Duration'])
belongs_to_df = pd.DataFrame(belongs_to, columns=['Message', 'Conversation_name', 'Date_sent', 'Message_type', 'Read'])
chats_with_df = pd.DataFrame(chats_with, columns=['User1', 'User2', 'Date_started', 'Duration', 'Theme'])
related_to_df = pd.DataFrame(related_to, columns=['Hobby', 'Post', 'Date_related', 'Relevance', 'Comment'])
follows_topic_df = pd.DataFrame(follows_topic, columns=['Username', 'Hobby', 'Date_followed', 'Interest_level', 'Last_activity'])

# Guardar los DataFrames como archivos CSV
likes_hobby_df.to_csv('data/likes_hobby.csv', index=False)
posts_tags_df.to_csv('data/posts_tags.csv', index=False)
follows_df.to_csv('data/follows.csv', index=False)
posted_df.to_csv('data/posted.csv', index=False)
likes_post_df.to_csv('data/likes_post.csv', index=False)
in_relationship_with_df.to_csv('data/in_relationship_with.csv', index=False)
belongs_to_df.to_csv('data/belongs_to.csv', index=False)
chats_with_df.to_csv('data/chats_with.csv', index=False)
related_to_df.to_csv('data/related_to.csv', index=False)
follows_topic_df.to_csv('data/follows_topic.csv', index=False)

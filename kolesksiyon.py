import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone  # timezone eklendi

# Firebase Admin SDK için servis hesabı json yolunu belirt
cred = credentials.Certificate('games-ssocieyt-1ac1b-firebase-adminsdk-fbsvc-f99edc787c.json')
firebase_admin.initialize_app(cred)

db = firestore.client()

def create_users():
    users_ref = db.collection('users')
    user_data = {
        "uid": "user_1",
        "email": "user1@example.com",
        "username": "userone",
        "displayName": "User One",
        "photoURL": "https://example.com/photo1.jpg",
        "bio": "This is user one",
        "createdAt": datetime.now(timezone.utc),  # değiştirildi
        "isPrivate": False,
        "followers": ["user_2", "user_3"],
        "following": ["user_2"],
        "gameIds": {
            "valorant": "Gold",
            "csgo": "Silver",
            "leagueoflegends": "Platinum"
        },
        "socialLinks": {
            "twitch": "twitchuser1",
            "youtube": "youtubeuser1",
            "twitter": "twitteruser1",
            "instagram": "instagramuser1"
        },
        "savedPosts": ["post_1", "post_2"]
    }
    users_ref.document(user_data["uid"]).set(user_data)
    print("User document created")

def create_posts():
    posts_ref = db.collection('posts')
    post_data = {
        "id": "post_1",
        "author": {
            "id": "user_1",
            "username": "userone",
            "displayName": "User One",
            "photoURL": "https://example.com/photo1.jpg"
        },
        "content": "This is a post",
        "mediaUrl": "https://example.com/image.jpg",
        "mediaType": "image",
        "gameTag": "valorant",
        "createdAt": datetime.now(timezone.utc),  # değiştirildi
        "likes": ["user_2"],
        "saves": ["user_3"],
        "commentsCount": 1,
    }
    post_doc = posts_ref.document(post_data["id"])
    post_doc.set(post_data)

    comments_ref = post_doc.collection('comments')
    comment_data = {
        "id": "comment_1",
        "text": "Nice post!",
        "author": {
            "id": "user_2",
            "username": "usertwo",
            "displayName": "User Two",
            "photoURL": "https://example.com/photo2.jpg"
        },
        "createdAt": datetime.now(timezone.utc),  # değiştirildi
        "likes": ["user_1"]
    }
    comments_ref.document(comment_data["id"]).set(comment_data)
    print("Post and comment created")

def create_conversations():
    conversations_ref = db.collection('conversations')
    conv_data = {
        "id": "conv_1",
        "participants": ["user_1", "user_2"],
        "lastMessage": {
            "text": "Hey, how are you?",
            "senderId": "user_1",
            "timestamp": datetime.now(timezone.utc)  # değiştirildi
        }
    }
    conv_doc = conversations_ref.document(conv_data["id"])
    conv_doc.set(conv_data)

    messages_ref = conv_doc.collection('messages')
    message_data = {
        "id": "msg_1",
        "senderId": "user_1",
        "text": "Hey, how are you?",
        "mediaUrl": "",
        "mediaType": "",
        "timestamp": datetime.now(timezone.utc),  # değiştirildi
        "read": False
    }
    messages_ref.document(message_data["id"]).set(message_data)
    print("Conversation and message created")

def create_notifications():
    notifications_ref = db.collection('notifications')
    notif_data = {
        "id": "notif_1",
        "userId": "user_1",
        "type": "follow",
        "from": {
            "id": "user_2",
            "username": "usertwo",
            "displayName": "User Two",
            "photoURL": "https://example.com/photo2.jpg"
        },
        "content": "User Two followed you",
        "resourceId": "",
        "createdAt": datetime.now(timezone.utc),  # değiştirildi
        "read": False
    }
    notifications_ref.document(notif_data["id"]).set(notif_data)
    print("Notification created")

def main():
    create_users()
    create_posts()
    create_conversations()
    create_notifications()

if __name__ == "__main__":
    main()

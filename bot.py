import os
import threading
import sqlite3
import uuid

from flask import (
    Flask,
    jsonify,
    request,
    send_from_directory
)
from flask_cors import CORS

from telegram import (
    Update,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    WebAppInfo,
)

from telegram.ext import (
    Application,
    CommandHandler,
    ContextTypes,
)


# ==================================================
# SETTINGS
# ==================================================

BOT_TOKEN = os.environ.get("BOT_TOKEN")

WEB_APP_URL = "https://rushi2001.github.io/find-my-partner-ai/"

PORT = int(os.environ.get("PORT", 10000))

DB = "users.db"

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ==================================================
# FLASK SERVER
# ==================================================

server = Flask(__name__)

CORS(server)


# ==================================================
# DATABASE
# ==================================================

def get_db():

    conn = sqlite3.connect(DB)

    conn.row_factory = sqlite3.Row

    return conn


def init_db():

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users(
            telegram_id INTEGER PRIMARY KEY,
            name TEXT,
            age TEXT,
            gender TEXT,
            looking TEXT,
            city TEXT,
            photo_id TEXT
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS likes(
            from_user INTEGER,
            to_user INTEGER,
            UNIQUE(from_user, to_user)
        )
    """)

    conn.commit()

    conn.close()


init_db()


# ==================================================
# HOME
# ==================================================

@server.route("/")
def home():

    return jsonify({
        "status": "online",
        "app": "Find My Partner AI",
        "bot": "running",
        "backend": "running"
    })


# ==================================================
# HEALTH
# ==================================================

@server.route("/health")
def health():

    return jsonify({
        "success": True,
        "status": "healthy"
    })


# ==================================================
# TEST
# ==================================================

@server.route("/test")
def test():

    return jsonify({
        "success": True,
        "message": "Backend is working!"
    })


# ==================================================
# REGISTER
# ==================================================

@server.route("/register", methods=["POST"])
def register():

    try:

        telegram_id = request.form.get("telegram_id")
        name = request.form.get("name")
        age = request.form.get("age")
        gender = request.form.get("gender")
        looking = request.form.get("looking")
        city = request.form.get("city")

        photo = request.files.get("photo")


        # ------------------------------------------
        # VALIDATION
        # ------------------------------------------

        if not telegram_id:

            return jsonify({
                "success": False,
                "message": "Telegram ID missing"
            }), 400


        if not name:

            return jsonify({
                "success": False,
                "message": "Name is required"
            }), 400


        if not age:

            return jsonify({
                "success": False,
                "message": "Age is required"
            }), 400


        try:

            age_number = int(age)

        except ValueError:

            return jsonify({
                "success": False,
                "message": "Invalid age"
            }), 400


        if age_number < 18:

            return jsonify({
                "success": False,
                "message": "You must be 18+"
            }), 400


        if not gender:

            return jsonify({
                "success": False,
                "message": "Gender is required"
            }), 400


        if not looking:

            return jsonify({
                "success": False,
                "message": "Looking for is required"
            }), 400


        if not city:

            return jsonify({
                "success": False,
                "message": "City is required"
            }), 400


        # ------------------------------------------
        # PHOTO
        # ------------------------------------------

        photo_name = ""


        if photo and photo.filename:

            extension = os.path.splitext(
                photo.filename
            )[1].lower()


            allowed_extensions = [
                ".jpg",
                ".jpeg",
                ".png",
                ".webp"
            ]


            if extension not in allowed_extensions:

                return jsonify({
                    "success": False,
                    "message": "Invalid photo format"
                }), 400


            photo_name = (
                str(telegram_id)
                + "_"
                + uuid.uuid4().hex
                + extension
            )


            photo_path = os.path.join(
                UPLOAD_FOLDER,
                photo_name
            )


            photo.save(photo_path)


        # ------------------------------------------
        # DATABASE
        # ------------------------------------------

        conn = get_db()

        cursor = conn.cursor()


        cursor.execute("""
            INSERT OR REPLACE INTO users
            (
                telegram_id,
                name,
                age,
                gender,
                looking,
                city,
                photo_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (

            int(telegram_id),

            name,

            str(age_number),

            gender,

            looking,

            city,

            photo_name
        ))


        conn.commit()

        conn.close()


        # ------------------------------------------
        # SUCCESS
        # ------------------------------------------

        return jsonify({

            "success": True,

            "message":
                "Profile created successfully",

            "telegram_id":
                int(telegram_id),

            "name":
                name,

            "photo":
                photo_name

        })


    except Exception as e:

        print(
            "REGISTER ERROR:",
            str(e)
        )


        return jsonify({

            "success": False,

            "message":
                "Registration failed",

            "error":
                str(e)

        }), 500


# ==================================================
# USERS
# ==================================================

@server.route("/users")
def users():

    conn = get_db()

    cursor = conn.cursor()


    cursor.execute("""
        SELECT
            telegram_id,
            name,
            age,
            gender,
            looking,
            city,
            photo_id
        FROM users
    """)


    rows = cursor.fetchall()

    conn.close()


    users_list = []


    for row in rows:

        users_list.append({

            "telegram_id":
                row["telegram_id"],

            "name":
                row["name"],

            "age":
                row["age"],

            "gender":
                row["gender"],

            "looking":
                row["looking"],

            "city":
                row["city"],

            "photo_id":
                row["photo_id"]

        })


    return jsonify(users_list)


# ==================================================
# PROFILE PHOTOS
# ==================================================

@server.route("/uploads/<filename>")
def uploaded_file(filename):

    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# ==================================================
# MATCHING PROFILES
# ==================================================

@server.route("/profiles/<int:telegram_id>")
def profiles(telegram_id):

    conn = get_db()

    cursor = conn.cursor()


    cursor.execute("""
        SELECT looking
        FROM users
        WHERE telegram_id=?
    """, (
        telegram_id,
    ))


    current_user = cursor.fetchone()


    if not current_user:

        conn.close()


        return jsonify({

            "success": False,

            "message":
                "User not registered"

        }), 404


    looking = current_user["looking"]


    cursor.execute("""
        SELECT
            telegram_id,
            name,
            age,
            gender,
            city,
            photo_id
        FROM users
        WHERE gender=?
        AND telegram_id!=?
    """, (

        looking,

        telegram_id
    ))


    rows = cursor.fetchall()

    conn.close()


    profiles_list = []


    for row in rows:

        photo_url = ""


        if row["photo_id"]:

            photo_url = (
                request.host_url.rstrip("/")
                + "/uploads/"
                + row["photo_id"]
            )


        profiles_list.append({

            "telegram_id":
                row["telegram_id"],

            "name":
                row["name"],

            "age":
                row["age"],

            "gender":
                row["gender"],

            "city":
                row["city"],

            "photo":
                photo_url

        })


    return jsonify({

        "success": True,

        "profiles":
            profiles_list

    })


# ==================================================
# LIKE PROFILE
# ==================================================

@server.route(
    "/like/<int:from_user>/<int:to_user>",
    methods=["POST"]
)
def like_user(from_user, to_user):

    conn = get_db()

    cursor = conn.cursor()


    cursor.execute("""
        INSERT OR IGNORE INTO likes
        (
            from_user,
            to_user
        )
        VALUES (?, ?)
    """, (

        from_user,

        to_user
    ))


    conn.commit()


    cursor.execute("""
        SELECT 1
        FROM likes
        WHERE from_user=?
        AND to_user=?
    """, (

        to_user,

        from_user
    ))


    is_match = (
        cursor.fetchone()
        is not None
    )


    conn.close()


    return jsonify({

        "success": True,

        "match":
            is_match,

        "from_user":
            from_user,

        "to_user":
            to_user

    })


# ==================================================
# TEST USER 1
# ==================================================

@server.route("/add-test-user")
def add_test_user():

    conn = get_db()

    cursor = conn.cursor()


    cursor.execute("""
        INSERT OR REPLACE INTO users
        (
            telegram_id,
            name,
            age,
            gender,
            looking,
            city,
            photo_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (

        1111111111,

        "Test User",

        "24",

        "Male",

        "Female",

        "Washim",

        ""
    ))


    conn.commit()

    conn.close()


    return jsonify({

        "success": True,

        "message":
            "Test user added"

    })


# ==================================================
# TEST USER 2
# ==================================================

@server.route("/add-test-user-2")
def add_test_user_2():

    conn = get_db()

    cursor = conn.cursor()


    cursor.execute("""
        INSERT OR REPLACE INTO users
        (
            telegram_id,
            name,
            age,
            gender,
            looking,
            city,
            photo_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (

        2222222222,

        "Test User 2",

        "22",

        "Female",

        "Male",

        "Washim",

        ""
    ))


    conn.commit()

    conn.close()


    return jsonify({

        "success": True,

        "message":
            "Test User 2 added"

    })


# ==================================================
# FLASK SERVER
# ==================================================

def run_server():

    server.run(
        host="0.0.0.0",
        port=PORT
    )


# ==================================================
# TELEGRAM BOT
# ==================================================

async def start(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    keyboard = [

        [

            InlineKeyboardButton(
                "🚀 Open Find My Partner",
                web_app=WebAppInfo(
                    url=WEB_APP_URL
                )
            )

        ]

    ]


    reply_markup = InlineKeyboardMarkup(
        keyboard
    )


    await update.message.reply_text(

        "❤️ Welcome to Find My Partner AI!\n\n"

        "Find genuine connections and meet new people.\n\n"

        "👇 Tap the button below to open the app.",

        reply_markup=reply_markup
    )


# ==================================================
# HELP
# ==================================================

async def help_command(
    update: Update,
    context: ContextTypes.DEFAULT_TYPE
):

    keyboard = [

        [

            InlineKeyboardButton(
                "🚀 Open Find My Partner",
                web_app=WebAppInfo(
                    url=WEB_APP_URL
                )
            )

        ]

    ]


    await update.message.reply_text(

        "❤️ Find My Partner AI\n\n"

        "Use the button below to open the Mini App.",

        reply_markup=InlineKeyboardMarkup(
            keyboard
        )
    )


# ==================================================
# BOT FUNCTION
# ==================================================

def run_bot():

    if not BOT_TOKEN:

        print(
            "❌ BOT_TOKEN environment variable is missing!"
        )

        return


    application = (
        Application
        .builder()
        .token(BOT_TOKEN)
        .build()
    )


    application.add_handler(

        CommandHandler(
            "start",
            start
        )
    )


    application.add_handler(

        CommandHandler(
            "help",
            help_command
        )
    )


    print(
        "🤖 Telegram Bot Starting..."
    )


    application.run_polling(
        drop_pending_updates=True
    )


# ==================================================
# MAIN
# ==================================================

if __name__ == "__main__":

    print(
        "🚀 Find My Partner AI Starting..."
    )


    server_thread = threading.Thread(

        target=run_server,

        daemon=True
    )


    server_thread.start()


    run_bot()
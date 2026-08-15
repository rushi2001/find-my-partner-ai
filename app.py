from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os
import uuid

app = Flask(__name__)
CORS(app)

DB = "users.db"

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# =========================
# DATABASE
# =========================

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


# =========================
# HOME
# =========================

@app.route("/")
def home():

    return jsonify({
        "status": "online",
        "app": "Find My Partner AI"
    })


# =========================
# TEST
# =========================

@app.route("/test")
def test():

    return jsonify({
        "success": True,
        "message": "Backend is working!"
    })


# =========================
# REGISTER
# =========================

@app.route("/register", methods=["POST"])
def register():

    try:

        # =========================
        # FORM DATA
        # =========================

        telegram_id = request.form.get("telegram_id")
        name = request.form.get("name")
        age = request.form.get("age")
        gender = request.form.get("gender")
        looking = request.form.get("looking")
        city = request.form.get("city")

        photo = request.files.get("photo")


        # =========================
        # VALIDATION
        # =========================

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


        # =========================
        # PHOTO
        # =========================

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


        # =========================
        # DATABASE
        # =========================

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


        # =========================
        # SUCCESS
        # =========================

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

        print("REGISTER ERROR:", e)

        return jsonify({

            "success": False,

            "message":
                "Registration failed",

            "error":
                str(e)

        }), 500


# =========================
# USERS
# =========================

@app.route("/users")
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


# =========================
# PROFILE PHOTOS
# =========================

@app.route("/uploads/<filename>")
def uploaded_file(filename):

    from flask import send_from_directory

    return send_from_directory(
        UPLOAD_FOLDER,
        filename
    )


# =========================
# MATCHING PROFILES
# =========================

@app.route("/profiles/<int:telegram_id>")
def profiles(telegram_id):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT looking
        FROM users
        WHERE telegram_id=?
    """, (telegram_id,))

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


# =========================
# LIKE PROFILE
# =========================

@app.route(
    "/like/<int:from_user>/<int:to_user>",
    methods=["POST"]
)
def like_user(from_user, to_user):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR IGNORE INTO likes
        (from_user, to_user)
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


# =========================
# TEST USER 1
# =========================

@app.route("/add-test-user")
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


# =========================
# TEST USER 2
# =========================

@app.route("/add-test-user-2")
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


# =========================
# RUN
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )
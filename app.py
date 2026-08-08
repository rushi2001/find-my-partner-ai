from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB = "users.db"


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
# USERS
# =========================
@app.route("/add-test-user")
def add_test_user():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT OR REPLACE INTO users
        (telegram_id, name, age, gender, looking, city, photo_id)
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
        "message": "Test user added"
    })
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

            "telegram_id": row["telegram_id"],
            "name": row["name"],
            "age": row["age"],
            "gender": row["gender"],
            "looking": row["looking"],
            "city": row["city"],
            "photo_id": row["photo_id"]

        })

    return jsonify(users_list)


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
            "message": "User not registered"
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
    """, (looking, telegram_id))

    rows = cursor.fetchall()

    conn.close()

    profiles_list = []

    for row in rows:

        profiles_list.append({

            "telegram_id": row["telegram_id"],
            "name": row["name"],
            "age": row["age"],
            "gender": row["gender"],
            "city": row["city"],
            "photo_id": row["photo_id"]

        })

    return jsonify({

        "success": True,
        "profiles": profiles_list

    })


# =========================
# RUN
# =========================

if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000
    )
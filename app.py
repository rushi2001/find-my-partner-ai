from flask import Flask, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

DB = "users.db"

def init_db():

    conn = sqlite3.connect(DB)

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


@app.route("/")
def home():
    return jsonify({
        "status": "online",
        "app": "Find My Partner AI"
    })


@app.route("/test")
def test():
    return jsonify({
        "success": True,
        "message": "Backend is working!"
    })


@app.route("/users")
def users():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT telegram_id, name, age, gender, looking, city, photo_id
        FROM users
    """)

    rows = cursor.fetchall()
    conn.close()

    return jsonify([
        {
            "telegram_id": row["telegram_id"],
            "name": row["name"],
            "age": row["age"],
            "gender": row["gender"],
            "looking": row["looking"],
            "city": row["city"],
            "photo_id": row["photo_id"]
        }
        for row in rows
    ])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

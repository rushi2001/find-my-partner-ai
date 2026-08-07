from flask import Flask, jsonify
import sqlite3

app = Flask(__name__)

DB = "users.db"


def get_db():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


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
        SELECT telegram_id, name, age, gender, looking, city
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
            "city": row["city"]
        }
        for row in rows
    ])


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

import os
import threading

from flask import Flask

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


# ==================================================
# FLASK SERVER
# ==================================================

server = Flask(__name__)


@server.route("/")
def home():
    return "Find My Partner AI Bot is running!"


@server.route("/health")
def health():
    return "OK"


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

    # Start Flask server
    server_thread = threading.Thread(
        target=run_server,
        daemon=True
    )

    server_thread.start()

    # Start Telegram bot
    run_bot()
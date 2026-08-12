import os

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


# ==================================================
# START COMMAND
# ==================================================

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):

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

    reply_markup = InlineKeyboardMarkup(keyboard)

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
        reply_markup=InlineKeyboardMarkup(keyboard)
    )


# ==================================================
# MAIN
# ==================================================

def main():

    if not BOT_TOKEN:
        raise ValueError(
            "BOT_TOKEN environment variable is missing!"
        )

    app = (
        Application
        .builder()
        .token(BOT_TOKEN)
        .build()
    )

    # /start
    app.add_handler(
        CommandHandler(
            "start",
            start
        )
    )

    # /help
    app.add_handler(
        CommandHandler(
            "help",
            help_command
        )
    )

    print(
        "🤖 Find My Partner AI Bot is running..."
    )

    app.run_polling(
        drop_pending_updates=True
    )


# ==================================================
# RUN
# ==================================================

if __name__ == "__main__":
    main()
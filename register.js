const API_URL = "https://find-my-partner-ai.onrender.com";

const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const telegramUser =
    tg.initDataUnsafe?.user;

const telegramId =
    telegramUser?.id;


// ===============================
// REGISTER USER
// ===============================

async function registerUser() {

    const name =
        document.getElementById("name").value.trim();

    const age =
        document.getElementById("age").value.trim();

    const gender =
        document.getElementById("gender").value;

    const looking =
        document.getElementById("looking").value;

    const city =
        document.getElementById("city").value.trim();

    const message =
        document.getElementById("message");


    // ===============================
    // VALIDATION
    // ===============================

    if (!telegramId) {

        message.innerText =
            "❌ Please open this app from Telegram.";

        return;
    }


    if (!name) {

        message.innerText =
            "❌ Please enter your name.";

        return;
    }


    if (!age || Number(age) < 18) {

        message.innerText =
            "❌ You must be 18 or older.";

        return;
    }


    if (!gender) {

        message.innerText =
            "❌ Please select your gender.";

        return;
    }


    if (!looking) {

        message.innerText =
            "❌ Please select who you are looking for.";

        return;
    }


    if (!city) {

        message.innerText =
            "❌ Please enter your city.";

        return;
    }


    // ===============================
    // SHOW LOADING
    // ===============================

    message.innerText =
        "⏳ Creating your profile...";


    try {

        const response = await fetch(
            API_URL + "/register",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    telegram_id: telegramId,

                    name: name,

                    age: age,

                    gender: gender,

                    looking: looking,

                    city: city

                })
            }
        );


        const data =
            await response.json();


        console.log(
            "REGISTER RESPONSE:",
            data
        );


        if (!response.ok || !data.success) {

            message.innerText =
                "❌ " +
                (data.message ||
                "Registration failed.");

            return;
        }


        // ===============================
        // SUCCESS
        // ===============================

        message.innerText =
            "✅ Profile created successfully!";


        setTimeout(function() {

            window.location.href =
                "find.html";

        }, 1000);


    } catch (error) {

        console.error(
            "REGISTER ERROR:",
            error
        );


        message.innerText =
            "❌ Unable to connect to server.";
    }
}
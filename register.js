const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const message = document.getElementById("message");
const button = document.getElementById("createProfileBtn");

const user = tg.initDataUnsafe?.user;


// ===============================
// TELEGRAM TEST
// ===============================

if (user) {

    message.innerHTML = `
        <b>Telegram Connected ✅</b><br><br>
        User ID: ${user.id}<br>
        User Name: ${user.first_name || "No name"}
    `;

} else {

    message.innerHTML = `
        <b>Telegram User Not Found ❌</b><br><br>
        initData length: ${tg.initData ? tg.initData.length : 0}
    `;

}


// ===============================
// PHOTO PREVIEW
// ===============================

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");

photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {
        photoPreview.src = e.target.result;
    };

    reader.readAsDataURL(file);

});


// ===============================
// BUTTON CLICK
// ===============================

button.addEventListener("click", function () {

    // FIRST: prove that button works
    message.innerHTML = "⏳ Button clicked...";

    console.log("CREATE PROFILE BUTTON CLICKED");


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


    // ===============================
    // VALIDATION
    // ===============================

    if (!user) {

        message.innerHTML =
            "❌ Telegram User ID not found.";

        return;
    }

    if (!name) {

        message.innerHTML =
            "❌ Please enter your name.";

        return;
    }

    if (!age || Number(age) < 18) {

        message.innerHTML =
            "❌ Age must be 18 or above.";

        return;
    }

    if (!gender) {

        message.innerHTML =
            "❌ Please select Gender.";

        return;
    }

    if (!looking) {

        message.innerHTML =
            "❌ Please select Looking For.";

        return;
    }

    if (!city) {

        message.innerHTML =
            "❌ Please enter City.";

        return;
    }


    // ===============================
    // PROFILE DATA
    // ===============================

    const profile = {

        telegram_id: user.id,

        telegram_name:
            user.first_name || "",

        name: name,

        age: Number(age),

        gender: gender,

        looking: looking,

        city: city
    };


    console.log("PROFILE:", profile);


    message.innerHTML =
        "⏳ Profile ready...";


    // ===============================
    // SEND TO TELEGRAM
    // ===============================

    if (typeof tg.sendData === "function") {

        try {

            tg.sendData(
                JSON.stringify(profile)
            );

            message.innerHTML =
                "✅ Profile sent to Telegram!";

        } catch (error) {

            console.error(
                "sendData error:",
                error
            );

            message.innerHTML =
                "❌ Telegram sendData error.";
        }

    } else {

        message.innerHTML =
            "❌ Telegram sendData unavailable.";
    }

});
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();


// ==========================================
// ELEMENTS
// ==========================================

const message = document.getElementById("message");
const button = document.getElementById("createProfileBtn");

const photoInput = document.getElementById("photo");
const photoPreview = document.getElementById("photoPreview");


// ==========================================
// TELEGRAM USER
// ==========================================

const user = tg.initDataUnsafe?.user;


// ==========================================
// TELEGRAM STATUS
// ==========================================

if (user) {

    message.innerHTML = `
        <b>Telegram Connected ✅</b><br><br>
        User ID: ${user.id}<br>
        User Name: ${user.first_name || "User"}
    `;

} else {

    message.innerHTML = `
        ⚠️ Telegram User Not Found<br><br>
        initData length:
        ${tg.initData ? tg.initData.length : 0}
    `;

}


// ==========================================
// PHOTO PREVIEW
// ==========================================

if (photoInput) {

    photoInput.addEventListener(
        "change",
        function () {

            const file =
                photoInput.files[0];

            if (!file) {
                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    photoPreview.src =
                        event.target.result;

                };

            reader.readAsDataURL(file);

        }
    );

}


// ==========================================
// CREATE PROFILE BUTTON
// ==========================================

button.addEventListener(
    "click",
    async function () {

        message.innerHTML =
            "⏳ Checking profile...";


        // ======================================
        // GET FORM VALUES
        // ======================================

        const name =
            document
                .getElementById("name")
                .value
                .trim();

        const age =
            document
                .getElementById("age")
                .value
                .trim();

        const gender =
            document
                .getElementById("gender")
                .value;

        const looking =
            document
                .getElementById("looking")
                .value;

        const city =
            document
                .getElementById("city")
                .value
                .trim();


        // ======================================
        // VALIDATION
        // ======================================

        if (!user) {

            message.innerHTML =
                "❌ Telegram User ID not found.";

            return;
        }


        if (!name) {

            message.innerHTML =
                "❌ Please enter your name.";

            document
                .getElementById("name")
                .focus();

            return;
        }


        if (!age ||
            Number(age) < 18) {

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


        // ======================================
        // FORM DATA
        // ======================================

        const formData =
            new FormData();


        formData.append(
            "telegram_id",
            user.id
        );

        formData.append(
            "name",
            name
        );

        formData.append(
            "age",
            age
        );

        formData.append(
            "gender",
            gender
        );

        formData.append(
            "looking",
            looking
        );

        formData.append(
            "city",
            city
        );


        // ======================================
        // PHOTO
        // ======================================

        if (
            photoInput &&
            photoInput.files.length > 0
        ) {

            formData.append(
                "photo",
                photoInput.files[0]
            );

        }


        // ======================================
        // SEND TO RENDER
        // ======================================

        message.innerHTML =
            "⏳ Creating your profile...";


        try {

            const response =
                await fetch(
                    "https://find-my-partner-ai.onrender.com/register",
                    {
                        method: "POST",

                        body: formData
                    }
                );


            const data =
                await response.json();


            console.log(
                "RENDER RESPONSE:",
                data
            );


            // ==================================
            // SERVER ERROR
            // ==================================

            if (
                !response.ok ||
                !data.success
            ) {

                message.innerHTML =
                    "❌ " +
                    (
                        data.message ||
                        "Profile creation failed."
                    );

                return;
            }


            // ==================================
            // SUCCESS
            // ==================================

            message.innerHTML =
                "✅ Profile created successfully!";


            console.log(
                "PROFILE CREATED:",
                data
            );


            // ==================================
            // GO TO FIND PAGE
            // ==================================

            setTimeout(
                function () {

                    window.location.href =
                        "find.html";

                },
                1000
            );


        } catch (error) {

            console.error(
                "RENDER ERROR:",
                error
            );


            message.innerHTML =
                "❌ Unable to connect to server.";
        }

    }
);
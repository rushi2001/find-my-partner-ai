const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;

const message = document.getElementById("message");

if (user) {

    message.innerHTML = `
        <b>Telegram Connected ✅</b><br><br>

        initData length:
        ${tg.initData ? tg.initData.length : 0}
        <br><br>

        User ID:
        ${user.id}
        <br><br>

        User Name:
        ${user.first_name || "No name"}
    `;

} else {

    message.innerHTML = `
        <b>Telegram User NOT FOUND ❌</b><br><br>

        initData length:
        ${tg.initData ? tg.initData.length : 0}
        <br><br>

        Please open this Mini App directly
        from the Telegram bot.
    `;
}
const tg = window.Telegram.WebApp;

tg.ready();
tg.expand();

const user = tg.initDataUnsafe?.user;

document.getElementById("message").innerHTML = `
    <b>Telegram Test</b><br><br>

    initData length:
    ${tg.initData ? tg.initData.length : 0}
    <br><br>

    User ID:
    ${user ? user.id : "NOT FOUND"}
    <br><br>

    User Name:
    ${user ? (user.first_name || "No name") : "NOT FOUND"}
`;
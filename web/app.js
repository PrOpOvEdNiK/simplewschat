let socket = {};

const chatLogin = (event, form) => {
    event.preventDefault();
    const formData = new FormData(form);
    const obFormData = Object.fromEntries(formData);
    const login = obFormData['login'];

    const wsURL = "ws:/192.168.1.139/ws?userName=" + login;
    wsHandler(wsURL, login);

    form.reset();
};

const sendMessage = (event, form) => {
    event.preventDefault();
    const formData = new FormData(form);
    const obFormData = Object.fromEntries(formData);
    const message = obFormData['message'];
    const messageData = {
        text: message
    };

    socket.send(JSON.stringify(messageData));

    form.reset();

    const chatInput = document.getElementById('chat-form-input');
    chatInput.focus();
};

const wsHandler = (wsURL, login) => {
    const loginSection = document.getElementById('loginSection');
    const chatSection = document.getElementById('chatSection');
    const chat = document.getElementById('chat');
    const chatInput = document.getElementById('chat-form-input');
    socket = new WebSocket(wsURL);

    socket.onopen = function (e) {
        loginSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        chatInput.focus();

        console.log("[open] Соединение установлено");
    };

    socket.onmessage = function (event) {
        const data = JSON.parse(event.data);
        // console.log(`[message] Данные получены с сервера: ${event.data}`);

        const obDate = new Date();
        const currentDate = obDate.toLocaleDateString();
        const currentTime = obDate.toLocaleTimeString();
        const sTime = `[${currentDate} ${currentTime}] `;

        let messageHTML = document.createElement('div');
        switch (data['action']) {
            case "Ping":
                socket.send(JSON.stringify({"action": "Pong"}));
                break;
            case "PublicMessage":
                messageHTML.className = "public-message";
                messageHTML.innerHTML = `${sTime} ${data['userName']}: ${data['text']}`;
                break;
            case "ConnectionLost":
                messageHTML.className = "system-message";
                messageHTML.innerHTML = `${sTime} ${data['userName']} отвалился :(`;
                break;
            case "Connected":
                messageHTML.className = "system-message";
                messageHTML.innerHTML = `${sTime} ${data['userName']} вошел в чат`;
                break;
            case "Disconnected":
                messageHTML.className = "system-message";
                messageHTML.innerHTML = `${sTime} ${data['userName']} покинул чат`;
                break;
        }

        chat.prepend(messageHTML);
    };

    socket.onclose = function (event) {
        if (event.wasClean) {
            console.log(`[close] Соединение закрыто чисто, код=${event.code} причина=${event.reason}`);
        } else {
            // например, сервер убил процесс или сеть недоступна
            // обычно в этом случае event.code 1006
            console.log(`[close] Соединение прервано, код=${event.code}`);
        }
    };

    socket.onerror = function (error) {
        console.log(`[error] ${error.message}`);
    };
};

window.addEventListener('load', function () {
    const loginInput = document.getElementById('login-form-input');
    loginInput.focus();
});
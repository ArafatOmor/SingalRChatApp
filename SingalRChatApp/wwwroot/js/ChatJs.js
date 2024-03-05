"use strict"; 
const connection = new signalR.HubConnectionBuilder().configureLogging(signalR.LogLevel.Debug)
    .withUrl("http://localhost:5062/chathub", {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
    }).build();

const start = async () => {
    try {
        await connection.start();
    }
    catch (error) {
        console.log(error)
    }
};
const joinUser = async () => {
    const name = window.prompt('Enter your name');
    if (name) {
        sessionStorage.setItem('user', name);
        await joinChat(name);
    }
};

const joinChat = async (user) => {
    if (!user)
        return;
    try {
        const message = `${user} Joind`;
        await connection.invoke( "JoinChat", user, message );
    }
    catch (error) {
        console.log(error)
    }
};
const gerUser = () =>  sessionStorage.getItem("user");

const reciveMessage = async () => {
    const currentUser = getUser();
    if (!currentUser) return;
    try {
        connection.on("ReceivedMessage", (user, message) => {
            const messageClass = currentUser == user ? "send" : "received";
            appendMessage(message, messageClass);
        });
        connection.on("ReceivedFile", (user, fileName, fileData) => {
            const ReceivedFile = currentUser == user ? "send" : "received";
            if (fileData.startWith("data:image")) {
                appendImage(fileData, messageClass);
            }
            else {
                appendFile(user, fileName, fileData, messageClass);
            }
        });
    }
    catch (error) {
        console.log(error)
    }
};
const appendMessage = (message, messageClass) => {
    const messageSectionEL = document.getElementById('messageSection');
    const msgBoxEl = document.createElement("div");
    msgBoxEl.classList.add("msg-box");
    msgBoxEl.classList.add(messageClass);
    msgBoxEl.textConten = message;
    messageSectionEL.appendChild(msgBoxEl);
};
const appendFile = (user, fileName, fileData, messageClass) => {
    const messageSectionEL = document.getElementById('messageSection');
    const msgBoxEl = document.createElement("div");
    msgBoxEl.classList.add("msg-box");
    msgBoxEl.classList.add(messageClass);
    const linkEL = document.createElement("a");
    linkEL.href = `data;application/octet-stream;base64,${fileData}`;
    linkEL.download = fileName;
    linkEL.textContent = fileName;
    msgBoxEl.appendChild(linkEL);

    const filePreview = document.createElement("div");
    if (fileName.match(/\.(jpg|jpeg|png|gif)&/)) {
        const imageEl = document.createElement("img");
        imageEl.src = `data.image/jpeg;base64,${fileData}`;
        imageEl.classList.add("file-preview");
        filePreview.appendChild(imageEl);
    }
    else {
        const fileText = document.createElement("p");
        fileText.textContent = `File Type does not support preview.Please downloae the file`;
        filePreview.appendChild(fileText);
    }
    msgBoxEl.appendChild(filePreview);
    messageSectionEL.appendChild(msgBoxEl);

};
const appendImage = (imageData, messageClass) => {
    const messageSectionEl = document.getElementById('messageSection');
    const msgBoxEl = document.createElement("div");
    msgBoxEl.classList.add("msg-box");
    const imageEl = document.createElement("img");
    imageEl.src = imageData;
    imageEl.classList.add("file-preview");
    msgBoxEl.appendChild(msgBoxEl);
};
const sendFile = async (user, file) => {
    try {
        const formData = new FormData();
        formData.append('user', user);
        formData.append('file', file);
        await fetch('/upload', {
            method: 'POST',
            body: formData
        });
    }
    catch (error) {
        console.log(error);
    }
};
    const sendMessage = async (user, message) => {
        try {
            await connection.invoke('SendMessage', user, message)
        }
        catch (error) { console.log(error); }
    }
    document.getElementById('btnSendFile').addEventListener('click', async (e) => {
        e.preventDefault();
        const user = getUser();
        if (!user)
            return;
        const fileInput = document.getElementById('fileInput');
        if (fileInput.file.length > 0) {
            const file = fileInput.files[0];
            await sendFile(user, file);
            fileInput.value = null;
        }
    });
    document.getElementById('btnSend').addEventListener('click', async (e) => {
        e.preventDefault();
        const user = getUser();
        if (!user)
            return;
        const textMessageEL = document.getElementById('txtMessage');
        const msg = textMessageEL.value;
        if (msg) {
            await sendMessage(user, `${user}:${msg}`)
            textMessageEL.value = "";

        }
    });
const startApp = async () => {
    await start();
    await joinUser();
    await reciveMessage();
};
    startApp();


  
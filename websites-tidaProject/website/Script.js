import { logPlayer, readUserJSON, readKeysJSON, getUserByLogin } from "./base.js";

let Base = [];
let name, password;
let user = null;

async function init() {
    Base = await readUserJSON();
    name = document.getElementById("log").value;
    password = document.getElementById("pass").value;
    if (logPlayer(Base, name, password)) {
        console.log("You logged");
        user = getUserByLogin(Base, name);
        sessionStorage.setItem('user', JSON.stringify(user)); // Store user in sessionStorage
        window.location.replace("Keys.html");
    }
}

async function loadKeys() {
    user = JSON.parse(sessionStorage.getItem('user')); // Retrieve user from sessionStorage
    Base = await readKeysJSON();
    const keysContainer = document.getElementById('keysContainer');
    keysContainer.innerHTML = ''; // Clear any existing content

    for (let i = 0; i < Base.length; i++) {
        if (user && user.school === Base[i].school) {
            const schoolData = Base[i].Data;
            schoolData.forEach(keyData => {
                const keyElement = document.createElement('div');
                keyElement.classList.add('key-item');
                keyElement.innerHTML = `
                    <h3>Key: ${keyData.key}</h3>
                    <p>Name: ${keyData.Name}</p>
                    <p>Key Taken Date: ${keyData.KeyTakenDate}</p>
                    <p>Key Taken Time: ${keyData.KeyTakenTime}</p>
                    <p>Key Given Date: ${keyData.KeyGivenDate}</p>
                    <p>Key Given Time: ${keyData.KeyGivenTime}</p>
                `;
                keysContainer.appendChild(keyElement);
            });
        }
    }
}

window.loadKeys = loadKeys;
window.init = init;
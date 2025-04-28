import { logPlayer, readUserJSON, getUserByLogin } from "./base.js";

let user = null;

async function init() {
    const Base = await readUserJSON();
    const name = document.getElementById("log").value;
    const password = document.getElementById("pass").value;
    if (logPlayer(Base, name, password)) {
        console.log("You logged");
        user = getUserByLogin(Base, name);
        sessionStorage.setItem('user', JSON.stringify(user)); 
        window.location.replace("Keys.html");
    }
}

async function loadKeys() {
    user = JSON.parse(sessionStorage.getItem('user')); 
    const keysContainer = document.getElementById('keysContainer');
    keysContainer.innerHTML = ''; 

    try {
        // First, try to initialize keys if they don't exist
        await fetch(`/api/keys/${user.school}`);
        
        // Then fetch the keys
        const response = await fetch(`/api/keys/${user.school}`);
        const keys = await response.json();
        
        if (keys.length === 0) {
            keysContainer.innerHTML = '<p class="no-keys">No keys found. Please try refreshing the page.</p>';
            return;
        }
        
        keys.forEach(keyData => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key-item');
            keyElement.classList.add(keyData.isLocked ? 'locked' : 'unlocked');
            
            keyElement.innerHTML = `
                <h3>Key: ${keyData.key}</h3>
                <p>Status: ${keyData.isLocked ? 'Locked' : 'Unlocked'}</p>
                ${keyData.isLocked ? `
                    <p>Locked by: ${keyData.name}</p>
                    <p>Locked since: ${keyData.keyTakenDate} at ${keyData.keyTakenTime}</p>
                ` : ''}
                <div class="key-actions">
                    <button onclick='checkIn(\"${keyData.key}\",\"${user.school}\")' ${keyData.isLocked ? 'disabled' : ''}>
                        Lock Key
                    </button>
                    <button onclick='checkOut(\"${keyData.key}\",\"${user.school}\")' ${!keyData.isLocked ? 'disabled' : ''}>
                        Unlock Key
                    </button>
                </div>
            `;
            keysContainer.appendChild(keyElement);
        });
    } catch (error) {
        console.error('Error loading keys:', error);
        keysContainer.innerHTML = '<p class="no-keys">Error loading keys. Please try refreshing the page.</p>';
    }
}

async function loadLockedKeys() {
    user = JSON.parse(sessionStorage.getItem('user')); 
    const lockedKeysContainer = document.getElementById('lockedKeysContainer');
    lockedKeysContainer.innerHTML = ''; 

    try {
        const response = await fetch(`/api/keys/${user.school}/locked`);
        const lockedKeys = await response.json();
        
        if (lockedKeys.length === 0) {
            lockedKeysContainer.innerHTML = '<p class="no-keys">No keys are currently locked.</p>';
            return;
        }

        lockedKeys.forEach(keyData => {
            const keyElement = document.createElement('div');
            keyElement.classList.add('key-item');
            keyElement.classList.add('locked');
            
            keyElement.innerHTML = `
                <h3>Key: ${keyData.key}</h3>
                <p>Locked by: ${keyData.name}</p>
                <p>Locked since: ${keyData.keyTakenDate} at ${keyData.keyTakenTime}</p>
                <div class="key-actions">
                    <button onclick='checkOut(\"${keyData.key}\",\"${user.school}\")'>Unlock Key</button>
                </div>
            `;
            lockedKeysContainer.appendChild(keyElement);
        });
    } catch (error) {
        console.error('Error loading locked keys:', error);
    }
}

async function checkIn(id, school) {
    const name = prompt("Enter your name and role (e.g., 'John Smith - Math Teacher'):");
    if (!name) return;

    try {
        const response = await fetch('/api/keys/lock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: id, school, name })
        });
        
        if (response.ok) {
            loadKeys();
            if (window.location.pathname.includes('LockedKeys.html')) {
                loadLockedKeys();
            }
        }
    } catch (error) {
        console.error('Error locking key:', error);
    }
}

async function checkOut(id, school) {
    const yesNo = confirm("Do you want to return this key?");
    if (!yesNo) return;

    try {
        const response = await fetch('/api/keys/unlock', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ key: id, school })
        });
        
        if (response.ok) {
            loadKeys();
            if (window.location.pathname.includes('LockedKeys.html')) {
                loadLockedKeys();
            }
        }
    } catch (error) {
        console.error('Error unlocking key:', error);
    }
}

function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content and mark tab as active
    document.getElementById(`${tabName}Keys`).classList.add('active');
    document.querySelector(`.tab[onclick="switchTab('${tabName}')"]`).classList.add('active');
    
    // If switching to locked tab, load locked keys
    if (tabName === 'locked') {
        loadLockedKeys();
    }
}

window.loadKeys = loadKeys;
window.loadLockedKeys = loadLockedKeys;
window.init = init;
window.checkIn = checkIn;
window.checkOut = checkOut;
window.switchTab = switchTab;
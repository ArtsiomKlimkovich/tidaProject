const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname, 'website')));
app.use(bodyParser.json());

app.use(session({
    secret: 's9z8o6z0LmXNYOLfXfh8LBf18jy8zGvl',
    resave: false,
    saveUninitialized: true
}));

// Helper function to read keys data
function readKeysData() {
    const filePath = path.join(__dirname, 'website', 'keysData.json');
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

// Helper function to write keys data
function writeKeysData(data) {
    const filePath = path.join(__dirname, 'website', 'keysData.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Get all keys for a school
app.get('/api/keys/:school', (req, res) => {
    try {
        const keys = readKeysData();
        const schoolKeys = keys.filter(key => key.school === req.params.school);
        res.json(schoolKeys);
    } catch (error) {
        res.status(500).send('Error fetching keys');
    }
});

// Get locked keys for a school
app.get('/api/keys/:school/locked', (req, res) => {
    try {
        const keys = readKeysData();
        const lockedKeys = keys.filter(key => 
            key.school === req.params.school && key.isLocked === true
        );
        res.json(lockedKeys);
    } catch (error) {
        res.status(500).send('Error fetching locked keys');
    }
});

// Lock a key
app.post('/api/keys/lock', (req, res) => {
    try {
        const { key, school, name } = req.body;
        const currentDate = new Date();
        const dateStr = currentDate.toLocaleDateString('pl-PL');
        const timeStr = currentDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        let keys = readKeysData();
        let keyIndex = keys.findIndex(k => k.key === key && k.school === school);

        if (keyIndex === -1) {
            // Add new key
            keys.push({
                key,
                school,
                name,
                keyTakenDate: dateStr,
                keyTakenTime: timeStr,
                isLocked: true
            });
        } else {
            // Update existing key
            keys[keyIndex] = {
                ...keys[keyIndex],
                name,
                keyTakenDate: dateStr,
                keyTakenTime: timeStr,
                isLocked: true
            };
        }

        writeKeysData(keys);
        res.json(keys.find(k => k.key === key && k.school === school));
    } catch (error) {
        res.status(500).send('Error locking key');
    }
});

// Unlock a key
app.post('/api/keys/unlock', (req, res) => {
    try {
        const { key, school } = req.body;
        const currentDate = new Date();
        const dateStr = currentDate.toLocaleDateString('pl-PL');
        const timeStr = currentDate.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        let keys = readKeysData();
        const keyIndex = keys.findIndex(k => k.key === key && k.school === school);

        if (keyIndex !== -1) {
            keys[keyIndex] = {
                ...keys[keyIndex],
                keyGivenDate: dateStr,
                keyGivenTime: timeStr,
                isLocked: false
            };
            writeKeysData(keys);
            res.json(keys[keyIndex]);
        } else {
            res.status(404).send('Key not found');
        }
    } catch (error) {
        res.status(500).send('Error unlocking key');
    }
});

// Initialize keys for a school
app.post('/api/keys/initialize', (req, res) => {
    try {
        const { school } = req.body;
        const keys = [
            { key: 'Entrance', school, name: '', isLocked: false },
            { key: 'A21', school, name: '', isLocked: false },
            { key: 'A22', school, name: '', isLocked: false },
            { key: 'A23', school, name: '', isLocked: false },
            { key: 'A24', school, name: '', isLocked: false },
            { key: 'A25', school, name: '', isLocked: false },
            { key: 'A26', school, name: '', isLocked: false },
            { key: 'A27', school, name: '', isLocked: false },
            { key: 'A28', school, name: '', isLocked: false },
            { key: 'B15', school, name: '', isLocked: false },
            { key: 'B16', school, name: '', isLocked: false },
            { key: 'B23', school, name: '', isLocked: false },
            { key: 'B25', school, name: '', isLocked: false }
        ];

        let existingKeys = readKeysData();
        const schoolKeys = existingKeys.filter(k => k.school === school);

        if (schoolKeys.length === 0) {
            existingKeys = [...existingKeys, ...keys];
            writeKeysData(existingKeys);
            res.json({ message: 'Keys initialized successfully' });
        } else {
            res.json({ message: 'Keys already exist for this school' });
        }
    } catch (error) {
        res.status(500).send('Error initializing keys');
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.post('/login', (req, res) => {
    const { log: username, pass: password } = req.body;
    const users = readUserData();
    const user = users.find(u => u.login === username && u.password === password);

    if (user) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.sendFile(path.join(__dirname, 'website', 'Keys.html'));
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
});

app.post('/updateKeys', (req, res) => {
    const keysData = req.body;
    const filePath = path.join(__dirname, 'website', 'keysBase.json');
    
    fs.writeFile(filePath, JSON.stringify(keysData, null, 2), (err) => {
        if (err) {
            console.error('Error writing to keysBase.json:', err);
            return res.status(500).send('Error updating keys');
        }
        res.status(200).send('Keys updated successfully');
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
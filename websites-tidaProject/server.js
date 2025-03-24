const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');

const app = express();

app.use(express.static(path.join(__dirname, 'website')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 's9z8o6z0LmXNYOLfXfh8LBf18jy8zGvl',
    resave: false,
    saveUninitialized: true
}));

function readUserData() {
    const filePath = path.join(__dirname, 'website', 'userBase.json');
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
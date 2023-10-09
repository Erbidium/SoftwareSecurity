const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const port = 3000;
const jwt = require('jsonwebtoken');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const JWT_SECRET = 'secret';
const JWT_EXPIRES = '10s';

const AUTHORIZATION_HEADER = 'Authorization';

app.use((req, res, next) => {
    let currentUser = {};
    let token = req.get(AUTHORIZATION_HEADER);

    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            currentUser = { username: decoded.username, login: decoded.login };
        } catch (err) { }
    }

    req.user = currentUser;

    next();
});

app.get('/', (req, res) => {
    if (req.user.username) {
        return res.json({
            username: req.user.username
        })
    }
    res.sendFile(path.join(__dirname+'/index.html'));
})

const users = [
    {
        login: 'Login',
        password: 'Password',
        username: 'Username',
    },
    {
        login: 'Login1',
        password: 'Password1',
        username: 'Username1',
    }
]

app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const user = users.find((user) => {
        if (user.login == login && user.password == password) {
            return true;
        }
        return false
    });

    if (user) {
        const token = jwt.sign(
            {
                username: user.username,
                login: user.login,
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES }
        );

        res.json({ token });
    }

    res.status(401).send();
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

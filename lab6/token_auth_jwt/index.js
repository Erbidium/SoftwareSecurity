const express = require("express");
const { auth } = require('express-openid-connect');

require("dotenv").config();

const authDomain = "https://dev-03sf3h7wps3568b4.us.auth0.com";

const clientId = "HRamN7Ut1X7luRsIwvSBZ24Wk5Ufzkh0";
const clientSecret = "Uokb9tRrmGpqZo2f8_F1CVcr6yOVHgDSNvH0IH6o5G_TI4YFTf07eMaD2mas5Qtb";

const config = {
    authRequired: true,
    auth0Logout: true,
    baseURL: 'http://localhost:3000',
    clientID: clientId,
    issuerBaseURL: authDomain,
    secret: clientSecret,
    logoutParams: {
        returnTo: 'http://localhost:3000/logout', // Specify your custom return URL after logout
    },
};

const app = express();
app.set('view engine', 'ejs');
app.use(express.json());
app.use(auth(config));

app.get("/", (req, res) => {
    if (req.oidc.isAuthenticated()) {
        res.render('profile', { User: req.oidc.user.email });
    }
});

app.listen(3000, () => {
    console.log(`Example app listening on port ${3000}`);
});
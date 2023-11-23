const express = require("express");
const path = require("path");
const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");
const axios = require("axios");

require("dotenv").config();

const port = 3000;

const timeToken = 86000

const app = express();
app.use(express.json());

const authTokenUrl = "https://dev-03sf3h7wps3568b4.us.auth0.com/oauth/token";
const authUrl = "https://dev-03sf3h7wps3568b4.us.auth0.com";
const jwksUri = "https://dev-03sf3h7wps3568b4.us.auth0.com/.well-known/jwks.json";

const clientId = "HRamN7Ut1X7luRsIwvSBZ24Wk5Ufzkh0"
const clientSecret = "Uokb9tRrmGpqZo2f8_F1CVcr6yOVHgDSNvH0IH6o5G_TI4YFTf07eMaD2mas5Qtb"

const jwksClientInstance = jwksClient({
    jwksUri,
    cache: true,
});

const indexPath = path.join(__dirname + "/index.html");

app.get("/", (req, res) => {
    const token = req?.headers["authorization"];
    if (token) {
        const decodedToken = jwt.decode(token, {complete: true});

        const decodedHeader = decodedToken?.header;

        const currentTime = Math.floor(Date.now() / 1000);
        const timeExpiresToken = decodedToken.payload.exp;

        jwksClientInstance.getSigningKey(decodedHeader.kid, (error, key) => {
            if(error) {
                console.log(error);
            }
            const signingKey = key.publicKey || key.rsaPublicKey;
            jwt.verify(token, signingKey, (error, decoded) => {
                if (error) {
                    return res.status(401).sendFile(indexPath);
                }
                if(timeExpiresToken - currentTime <= timeToken){
                    console.log("lifetime was expired");
                } else {
                    return res.status(200).json({login: decoded.sub});
                }
            });
        });
    } else {
        res.sendFile(path.join(indexPath));
    }
});


app.get("/logout", (req, res) => {
    res.redirect("/");
    console.log("1");
});


app.post('/api/login', (req, res) => {
    const { login, password } = req.body;

    const requestBody = {
        audience: `${authUrl}/api/v2/`,
        grant_type: "password",
        client_id: clientId,
        client_secret: clientSecret,
        username: login,
        password: password,
    };

    axios
        .post(authTokenUrl, requestBody)
        .then((response) => {
            const token = response.data.access_token;
            res.json({ token });
        })
        .catch((error) => {
            console.log(error);
            res.status(401).json("Fail login");
        });

});

app.post('/api/register', (req, res) => {
    axios
        .post(`${authUrl}/oauth/token`, {
            client_id: clientId,
            client_secret: clientSecret,
            audience: `${authUrl}/api/v2/`,
            grant_type: "client_credentials",
        })
        .then((response) => {
            const accessToken = response.data.access_token;

            const requestBody = {
                email: req.body.login,
                password: req.body.password,
                connection: "Username-Password-Authentication",
            };

            axios
                .post(`${authUrl}/api/v2/users`, requestBody, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                .then((response) => {
                    res.json(requestBody.email + " registered success");
                })
                .catch((error) => {
                    console.log(error);
                    res.status(401).json("Fail registred: " + error?.message);
                });
        });
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
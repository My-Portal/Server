//server dependencies
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const cookieChecker = require('./middleware/cookie-checker');

//firebase admin
const admin = require('firebase-admin');
const serviceAccount = require('./config/firebase-config.js');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
// const { verify } = require('crypto');
// const verifyUser = admin.auth().verifyIdToken;
const loginFiles = path.join(__dirname, 'dist', 'login');
const portalFiles = path.join(__dirname, 'dist', 'portal');

const app = express();
app.use(bodyParser.json());
app.use(cookieParser());

//send homepage (could use express.static)
app.get('/login', (req, res) => {
  console.log('in /login');
  if (req.cookies.__session) {
    console.log('has cookie, redirecting to homepage');
    res.redirect('/');
  }
  res.sendFile(path.join(loginFiles, 'index.html'));
});

app.get('/', cookieChecker, (req, res) => {
  console.log('in /');
  res.sendFile(path.join(portalFiles, 'index.html'));
});

//a manually implimented static server that serves based on authentication.

app.get('*', (req, res) => {
  if (req.cookies.__session) {
    console.log('has cookie, redirecting to homepage');
    res.sendFile(path.join(portalFiles, req.params['0']));
  } else {
    res.sendFile(path.join(loginFiles, req.params['0']));
  }
});

//TODO:
//separate into separate file:

//AUTH:
//CREATE USER:
app.post('/user', (req, res) => {
  console.log('in users post');
  const idToken = req.body.idToken;
  // idToken comes from the client app
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      // let uid = decodedToken.uid;
      // console.log(decodedToken)
      console.log('--------------\nverified!');
      //******************************* */
      //INSERT INTO DATABASE HERE
      //******************************* */
      return true;
    })
    .catch(function (error) {
      //user not verified error don't persist.
      console.log('error', error);
      //VERIFY FUNCTIONALITY
      res.sendStatus(401);
      Promise.resolve(error);
    })
    .then(() => {
      console.log('successfully saved: ');
    });
});

//set user cookie if token has been sent in firebase
app.post('/cookie', (req, res) => {
  const idToken = req.body.idToken;
  console.log('in cookie\n', idToken);

  const expiresIn = 60 * 60 * 24 * 5 * 1000;
  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedUser) => {
      return admin.auth().createSessionCookie(idToken, { expiresIn });
    })
    .then((sessionCookie) => {
      // Set cookie policy for session cookie and set in response.
      const options = { maxAge: expiresIn, httpOnly: true, secure: false };
      res.cookie('__session', sessionCookie, options); //verify later
      res.end(JSON.stringify({ status: 'success' }));
    })
    .catch((error) => {
      console.log(error);
      res.status(401).send('UNAUTHORIZED REQUEST!');
    });
});

app.post('/logout', (req, res) => {
  console.log('in logout');
  const sessionCookie = req.cookies.__session || '';
  res.clearCookie('__session');
  admin
    .auth()
    .verifySessionCookie(sessionCookie)
    .then((decodedClaims) => {
      console.log('DECODE CLAIMS:', decodedClaims);

      return admin.auth().revokeRefreshTokens(decodedClaims.sub);
    })
    .then(() => {
      console.log('cleared cookie access in firebase');
      res.redirect('/'); //THIS ISN'T WORKING (no idea why), ROUTE CLIENT SIDE
    })
    .catch((error) => {
      console.log('LOGOUT ERROR', error);
      res.redirect('/');
    });
});

console.log('listening on port', process.env.PORT || 8080);
app.listen(process.env.PORT || 8080);

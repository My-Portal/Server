const admin = require('firebase-admin');

const checkCookieMiddleware = function (req, res, next) {
  const sessionCookie = req.cookies.__session || '';
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true)
    .then((decodedClaims) => {
      req.decodedClaims = decodedClaims;
      next();
    })
    .catch((error) => {
      console.log('NO COOKIE ERROR, REDIRECT');
      // Session cookie is unavailable or invalid. Force user to login.
      res.redirect('/login');
    });
};

module.exports = checkCookieMiddleware;

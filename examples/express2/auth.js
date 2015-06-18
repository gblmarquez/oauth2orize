/**
 * Module dependencies.
 */
var oauth2_config = {
  clientID: 'roclient',
  clientSecret: 'secret',
  site: 'http://id.conube.com.br',
  tokenPath: '/connect/token',
  userInfo: '/connect/userinfo'
};

var
  passport = require('passport'),
  LocalStrategy = require('passport-local').Strategy,
  oauth2 = require('simple-oauth2')(oauth2_config),
  request = require('request');

/**
 * LocalStrategy
 *
 * This strategy is used to authenticate users based on a username and password.
 * Anytime a request is made to authorize an application, we must ensure that
 * a user is logged in before asking them to approve the request.
 */
passport.use(new LocalStrategy(
  function(username, password, done) {
    oauth2.password.getToken({
      'username': username,
      'password': password,
      'grant_type': 'password',
      'scope': 'openid profile email roles read write all_claims abrir_empresa:user'
    }, function(err, res_token) {
      console.log(token);

      if (!res_token) {
        return done(null, false);
      } else {
        var token = res_token;
        request.get({
          url: oauth2_config.site + oauth2_config.userInfo,
          headers: {
            'Authorization': token.token_type + ' ' + token.access_token
          }
        }, function(err, res) {
          var body = JSON.parse(res.body);
          console.log(body);
          if (err) {
            return done(err);
          }

          if (!res.body) {
            return done(null, false);
          }

          var user = {};
          user.id = body.sub;
          user.email = body.email;
          user.name = body.name;
          user.locale = body.locale;

          console.log('user', body, user);

          return done(null, user);
        });
      }
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log('deserializeUser', id);
  done(null, id);
  // db.users.find(id, function(err, user) {
  //   done(err, user);
  // });
});

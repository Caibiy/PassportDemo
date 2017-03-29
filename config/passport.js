var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var User = require('../app/models/user');
var configAuth = require('./auth');
module.exports = function(passport){
   
    passport.serializeUser(function(user,done){
        done(null,user.id);
    });

    passport.deserializeUser(function(id,done){
        User.findById(id,function(err,user){
            done(err,user);
        })
    });
    passport.use(new FacebookStrategy({
        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL
    },
    function(token,refreshToken,profile,done){
        passport.nextTick(function(){
            User.findOne({'facebook.id':profile.id},function(err,user){
                if(err)
                return done(err);
                if(user){
                    return done(null,user);
                }else{
                    var newUser = new User();
                    newUser.faecbook.id=profile.id;
                    newUser.facebook.token=profile.token;
                    newUser.facebook.name=profile.name.givenName+' '+profile.name.familyName;
                    newUser.facebook.email=profile.emails[0].value;
                    newUser.save(function(err){
                        if(err)
                        throw err;
                        return done(null,newUser);
                    });
                }
            })
        });

    }));
    passport.use('local-signup',new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    },
    function(req,email,password,done){
        process.nextTick(function(){
            User.findOne({'local.email':email},function(err,user){
                if(err)
                return done(err);
                if(user){
                    return done(null,false,req.flash('signupMessage','此邮箱已经存在了'));
                }else{
                    var newUser =new User();
                    newUser.local.email=email;
                    newUser.local.password=newUser.generateHash(password);
                    newUser.save(function(err){
                        if(err)
                        throw err;
                        return done(null,newUser);
                    });
                }
            });
        })
    }));

    passport.use('local-login',new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    },
    function(req,email,password,done){
        User.findOne({'local.email':email},function(err,user){
            if(err)
            return done(err);
            if(!user){
                return done(null,false,req.flash('loginMessage','没有此用户'));
            }
            if(!user.validPassword(password)){
                return done(null,false,req.flash('loginMessage','密码不匹配'));
            }
            return done(null,user);
        })
    }
    ))
}
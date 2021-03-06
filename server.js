/* eslint no-console: 0 */
import path from 'path';
import express from 'express';
import webpack from 'webpack';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.config.js';
import mongoose from 'mongoose';
//import configDatabase from './conig.js';

//import api from './models/api.js';
import User from './models/users.js';
import Table from './models/table.js';

const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 3002 : process.env.PORT;
const app = express();


import session from 'express-session';
import nodemailer from 'nodemailer';
//var passport = require('passport');
//var LocalStrategy = require('passport-local').Strategy;
import bcrypt from 'bcrypt-nodejs';
import async from 'async';
import crypto from 'crypto';
import cookieParser from 'cookie-parser';
import flash from 'express-flash';


// setup body parser
import bodyParser from 'body-parser';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(cookieParser());
app.use(session({ secret: 'session secret key' }));
app.use(flash());

//if (isDeveloping) {
//  const compiler = webpack(config);
//  const middleware = webpackMiddleware(compiler, {
//    publicPath: config.output.publicPath,
//    contentBase: 'src',
//    stats: {
//      colors: true,
//      hash: false,
//      timings: true,
//      chunks: false,
//      chunkModules: false,
//      modules: false
//    }
//  });
//    
//mongoose.connect('mongodb://localhost/ldsCallings');
//mongoose.connection.on('error', function() {
//  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
//});
//
//  app.use(middleware);
//  app.use(webpackHotMiddleware(compiler));
////  app.get('*', function response(req, res) {
////    res.header("Content-Type", "application/javascript");
////    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
////
////    res.end();
////  });
//} else {
//  app.use(express.static(__dirname + '/dist'));
////  app.get('*', function response(req, res) {
////    res.sendFile(path.join(__dirname, 'dist/index.html'));
////  });
//}

// from api.js in models...

// register a user
app.post('/api/users/register', function (req, res) {
  // find or create the user with the given username
  User.findOrCreate({username: req.body.username}, function(err, user, created) {
    if (created) {
      // if this username is not taken, then create a user record
      user.name = req.body.name;
      user.set_password(req.body.password);
      user.ward = req.body.ward;
      user.wardId = req.body.wardId;
      user.calling = req.body.calling;
      user.email = req.body.email;
//      console.log(user.email);
        
      user.save(function(err) {
	if (err) {
	  res.sendStatus("403");
	  return;
	}
        // create a token
	var token = User.generateToken(user.username);
        // return value is JSON containing the user's name and token
        res.json({name: user.name, token: token, ward: user.ward, wardId: user.wardId, calling: user.calling, email: user.email});
      });
    } else {
      // return an error if the username is taken
      res.sendStatus("403");
    }
  });
});

// login a user
app.post('/api/users/login', function (req, res) {
  // find the user with the given username
  User.findOne({username: req.body.username}, function(err,user) {
    if (err) {
      res.sendStatus(403);
      return;
    }
    // validate the user exists and the password is correct
    if (user && user.checkPassword(req.body.password)) {
      // create a token
      var token = User.generateToken(user.username);
      // return value is JSON containing user's name and token
      res.json({name: user.name, token: token, ward: user.ward, wardId: user.wardId, calling: user.calling, email: user.email});
    } else {
      res.sendStatus(403);
    }
  });
});

app.post('/api/forgot', function(req, res, next) {
  async.waterfall([
    function(done) {
      crypto.randomBytes(20, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({ email: req.body.email }, function(err, user) {
        if (!user) {
          req.flash('error', 'No account with that email address exists.');
          console.log('no account with that email');
          return res.redirect('/login');
        }

        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
          
          
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: 'app@gmail.com',
          pass: 'ldscallings.org'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Node.js Password Reset',
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

app.get('/reset/:token', function(req, res) {
//    console.log('req');
//    console.log(req);
    var token = req.params.token;
    console.log('req.params.token');
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
        console.log('invalid token');
//        console.log('token: ');
//        console.log(req.params.token);
        console.log('date');
        console.log(Date.now());
      return res.redirect('/login');
    }
//    res.render('reset', {
//      user: req.user
//    });
      res.append('Set-Cookie', 'reset='+ token +';');
//      res.cookies(token);
      res.redirect('/reset');
//      document.cookie = token;
//      res.json({resetPasswordToken: token});
//      res.redirect(200, 'http://localhost:3000/reset');

  });
});


app.post('/api/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
//        console.log('reset in app.post api/reset/:token');
//        console.log(token);
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
            console.log('invalid reset token');
          return res.redirect('back');
        }

      user.set_password(req.body.password);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
          console.log('passwordReset');
        user.save(function(err) {
//          req.logIn(user, function(err) {
            done(err, user);
//          });
        });
      });
    },
    function(user, done) {
        console.log('email sent to user');
      var smtpTransport = nodemailer.createTransport('SMTP', {
        service: 'Gmail',
        auth: {
          user: 'app@gmail.com',
          pass: 'ldscallings.org'
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'passwordreset@demo.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});

// get all items for the user
//get all tables for the user
//app.get('/api/items', function (req,res) 
app.get('/api/calling', function (req,res) {
  // validate the supplied token

    console.log("in api get calling");

    var user = User.verifyToken(req.headers.authorization, function(user) {
//              console.log(user);
    if (user) {
      // if the token is valid, find all the user's items and return them
      User.find({user:user.id}, function(err, users) {
	if (err) {
        console.log('user not found');
	  res.sendStatus(403);
	  return;
	}
	// return value is the list of items as JSON
	res.json({users: user.calling});
      });
    } else {
        console.log('user = false on get');
      res.sendStatus(403);
    }
  });
});

// get all items for the user
//get all tables for the user
//app.get('/api/items', function (req,res) 
app.get('/api/tables', function (req,res) {
  // validate the supplied token

//    console.log("in api get tables");

    var user = User.verifyToken(req.headers.authorization, function(user) {
//              console.log(user);
    if (user) {
      // if the token is valid, find all the user's items and return them
      Table.find({user:user.id}, function(err, tables) {
	if (err) {
        console.log('user not found');
	  res.sendStatus(403);
	  return;
	}
	// return value is the list of items as JSON
	res.json({tables: tables});
      });
    } else {
        console.log('user = false on get');
      res.sendStatus(403);
    }
  });
});

// add an item
// add a table
app.post('/api/tables', function (req,res) {
  // validate the supplied token
  // get indexes
//    console.log("in post new table");
  var user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, create the item for the user
//      Item.create({title:req.body.item.title,completed:false,user:user.id}, function(err,item) {
Table.create({title:req.body.table.title,user:user.id,tableData:req.body.table.tableData}, function(err,table) {
	if (err) {
      console.log(err);
	  res.sendStatus(403);
	  return;
	}
	res.json({table:table});
      });
    } else {
      console.log('user = false on post new table');
      res.sendStatus(403);
    }
  });
});

// get an item
//get a table
//app.get('/api/items/:item_id', function (req,res) {
app.get('/api/tables/:table_id', function (req,res) {
  // validate the supplied token
  user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, then find the requested item
//      Item.findById(req.params.item_id, function(err, item) {
      Table.findById(req.params.table_id, function(err, table) {
	if (err) {
	  res.sendStatus(403);
	  return;
	}
        // get the item if it belongs to the user, otherwise return an error
        if (table.user != user) {
          res.sendStatus(403);
	  return;
        }
        // return value is the item as JSON
        res.json({table:table});
      });
    } else {
      res.sendStatus(403);
    }
  });
});

// update an item
// update a table
//app.put('/api/items/:item_id', function (req,res) {
app.put('/api/tables/:table_id', function (req,res) {
  // validate the supplied token
  var user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, then find the requested item
//      Item.findById(req.params.item_id, function(err,item) {
      Table.findById(req.params.table_id, function(err,table) {
	if (err) {
      console.log('err in findById update table');
	  res.sendStatus(403);
	  return;
	}
        // update the item if it belongs to the user, otherwise return an error
          
//        if (item.user != user.id) {
//          res.sendStatus(403);
//	  return;
//        }
//        item.title = req.body.item.title;
//        item.completed = req.body.item.completed;
//        item.save(function(err) {
        if (table.user != user.id) {
          res.sendStatus(403);
	  return;
        }
        table.title = req.body.table.title;
        table.tableData = req.body.table.tableData;
        table.save(function(err) {
	  if (err) {
        console.log('err in update table');
          console.log(err);
	    res.sendStatus(403);
	    return;
	  }
          // return value is the item as JSON
          res.json({table:table});
        });
      });
    } else {
        console.log('user = false in update table');
      res.sendStatus(403);
    }
  });
});

// delete an item
// delete a table
app.delete('/api/tables/:table_id', function (req,res) {
//app.delete('/api/items/:item_id', function (req,res) {
  // validate the supplied token
  var user = User.verifyToken(req.headers.authorization, function(user) {
    if (user) {
      // if the token is valid, then find the requested item
      Table.findByIdAndRemove(req.params.table_id, function(err,table) {
//                Item.findByIdAndRemove(req.params.item_id, function(err,item) {
	if (err) {
	  res.sendStatus(403);
	  return;
	}
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(403);
    }
  });
});

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });
    
mongoose.connect('mongodb://localhost/ldsCallings');
mongoose.connection.on('error', function() {
  console.info('Error: Could not connect to MongoDB. Did you forget to run `mongod`?');
});

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
//    res.header("Content-Type", "application/javascript");
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));

    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}

//end from api.js in models...


app.listen(port, '0.0.0.0', function onStart(err) {
  if (err) {
    console.log(err);
  }
  console.info('==> 🌎 Listening on port %s. Open up http://0.0.0.0:%s/ in your browser.', port, port);
});





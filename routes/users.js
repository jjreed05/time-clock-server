const express = require("express");
const router = express.Router();
const ADMIN = 'admin';
const ADMIN_PWD = 'admin123';
const mongoClient = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

// here is where we will handle any database call
const uri = 'mongodb+srv://admin:admin123@gps-time-afto7.mongodb.net/test?retryWrites=true';

router.get('/hello', function(req, res, next){
   res.send('test7');
})

router.post("/authenticate/", function(req, res, next){
   var username = req.body.username.toString();
   var password = req.body.password.toString();

   mongoClient.connect(uri, { useNewUrlParser: true },function(err, client){
         if (err) next(err);

         const collection = client.db("usersDb").collection("userInformation");
         collection.findOne({
            $or: [
               { "username": username },
               { "email": username }
            ]
         }, (error, user) => {
            if (err) next(err);
            if (!user)
               return res.send(user);
            if (!bcrypt.compareSync(password, user.password))
               return res.status(400).send(false);
            res.send(user);
        });
        client.close();
    });
});

router.post("/addUser", function(req, res){
   const username = req.body.username;
   const email = req.body.email;
   const company = req.body.company;
   const password = bcrypt.hashSync(req.body.password, saltRounds);

   let isAdmin = false;
   let userObject = { username, password, email, company, isAdmin };


   // connect to atlas
   mongoClient.connect(uri, { useNewUrlParser: true }, async (err, client) => {
      if (err) throw Error("start of connect");

      // determine if company already exists
      let companyExists;
      const companyInformation = client.db("userDb").collection("companyInformation");
      await companyInformation.findOne({ "name": company}, (error, company) => {
            if (err) throw Error("start of connect");
            companyExists = !!company; // the bang! bang! should convert the company object to a boolean 
      });

      // no error above this line

      // some things need to happen if the company is new
      if (!companyExists){

         // first the new user should be admin
         isAdmin = true;
         userObject = { username, password, email, company, isAdmin };

         // and add the new company to the company collection
         let name = company;
         let anotherObject = { name };
         companyInformation.insertOne(anotherObject, (error, result) => {
            if (err) throw (err);
         })
      }

      // no error above this line
      // make sure there is no user with that username or email first
      var userExists = null;
      const userInformation = client.db("usersDb").collection("userInformation");
      await userInformation.findOne(
          {$or: [{ "username": username }, { "email": email }]}, function (err, user) {
              if (!user) {
                  userInformation.insertOne(userObject, function(err, result){
                      if (err) throw err;
                      res.send(result);
                  });
              }
              else {
                  res.status(400).send("User exists!")
              }
              
              client.close();
       });
    });
});

router.post("/addPunchIn", function(req, res) {
    const time = req.body.time;
    const location = req.body.location;
    const id = req.body.id;
    const ObjectId = mongoose.Types.ObjectId,
        timeClock = [
            {
                "_id": new ObjectId(id),
                "time": time,
                "location": location
            }
        ];

    // connect to atlas
    mongoClient.connect(uri, { useNewUrlParser: true }, function(err, client){
        if(err) throw err;
        const collection = client.db("usersDb").collection("userInformation");
        collection.insertOne(timeClock, function(error, docs){
            if (error) throw error;
            res.send("success");
        });
        client.close();
    });
});


module.exports = router;
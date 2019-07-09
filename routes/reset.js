const express = require("express");
const nodemailer = require("nodemailer");
const router = express.Router();
const ADMIN = 'admin';
const ADMIN_PWD = 'admin123';
const mongoClient = require("mongodb");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const saltRounds = 10;

// here is where we will handle any database call
const uri = 'mongodb+srv://admin:admin123@gps-time-afto7.mongodb.net/test?retryWrites=true';

router.get('/hello/', function(req, res, next){
	res.send('hitting the reset hello endpoint');
})

router.post('/forgotPassword', function(req, res, next){
	if (!req.body.email || req.body.email == ""){
		return res.status(400).send({ error: "Email required" });
	}
	const email = req.body.email;

	mongoClient.connect(uri, { useNewUrlParser: true }, function (err, client){
		if (err) throw err;
		const collection = client.db("usersDb").collection("userInformation");
		collection.findOne({ email: email }, (error, user) => {
			if (user == null){
				return res.status(400).send({ message: "Email not recognized"});
			} else {
				const newPassword = generateRandomPassword();
				return res.send({ message: "Email Sent (not really, I'm not done)"});
				/*
				const transporter = nodemailer.createTransport({
					service: 'gmail',
					auth: {
						user: `${process.env.EMAIL_ADDRESS}`,
						pass: `${process.env.EMAIL_PASSWORD}`
					},
				});

				const mailOptions = {
					from: `${process.env.EMAIL_ADDRESS}`,
					to: `${user.email}`,
					subject: "Link To Reset Password",
					text: 
					`You are receiving this because you (or someone else) have requested the reset of the password for you account.\n\n` +
					`Your password has been temporarily reset to: ${newPassword}\n\n` +
					`Please reset your password as soon as you are able\n\n`,
				}

				console.log('sending mail');

				transporter.sendMail(mailOptions, function(err, res){
					if (err)
						return res.status(400).send({ message: "Failed to send email"});
					else 
						return res.send({ message: "Email Sent"});
				})
				*/
			}

			
		});
	})

})

const generateRandomPassword = () => {
	return 'testresetpassword';
}

module.exports = router;
const nodemailer = require("nodemailer");
const request = require("request");
const fs = require("fs");

module.exports = (function(){
  let options = {
    host:"in-v3.mailjet.com",
    port:587,
    secure:false,
    auth:{
      user:process.env.MAILJETUSER,
      pass:process.env.MAILJETPASS
    }
  };

  let transporter = nodemailer.createTransport(options);
  return function(transporter1 = transporter){
    return function(req,res){
      let query = req.body;
      if(query.message == ""){
        res.status(500).send("No message");
        return;
    }
      transporter1.sendMail({
        from:process.env.GMAILUSER,
        to:process.env.GMAILUSER,
        subject:"Message from " + query.person,
        text:query.message + "\n\n" + "Email: " + query.email
      });
      res.redirect("/");
    }
  };
})();

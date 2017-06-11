const nodemailer = require("nodemailer");
const request = require("request");

module.exports = (function(){
  let options = {
    host:"smtp.gmail.com",
    port:465,
    secure:true,
    auth:{
      type:"OAuth2",
      clientId:process.env.GMAILCLIENT,
      clientSecret:process.env.GMAILSECRET
    }
  };
  let transporter = nodemailer.createTransport(options);

  request({
    url:"https://accounts.google.com/o/oauth2/token",
    method:"POST",
    auth:{
      user:process.env.GMAILCLIENT,
      pass:process.env.GMAILSECRET
    },
    form: {
      'grant_type': 'client_credentials',
    }
  },(err,res)=>{
    if(err) return console.log("opps");
    let json = res.body;
    console.log("Token",json);
  })

  return function(transporter1 = transporter){
    return function(req,res){
      let query = req.body;
      transporter1.sendMail({
        from:process.env.GMAILUSER,
        to:process.env.GMAILUSER,
        subject:"Message from " + query.person,
        text:query.message + "\n" + "Email: " + query.email
      })
      res.redirect("/");
    }
  };
})();

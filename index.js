const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
const config = require('config');

app.use(express.static("public"));
app.use(express.json());

app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});

app.post('/submit', async (request, response) => {
  const data = request.body;
  
  if (data.email && data.body && data.name) {
    let transporter = nodemailer.createTransport({
        host: 'mail.ikengainnovations.com',
        port: 587,
        secure: false,
        auth: {
            user: config.smtp.username,
            pass: config.smtp.password
        }
    });
    
    const body = `${data.body.replace(/\n/g, "<br>")}<br>${data.name}`;
    
    const from = `"${data.name}" <${data.email}>`;
  
    console.log("Form submitted from", from);
    try {
      const info = await transporter.sendMail({
          from,
          to: config.emailList,
          cc: config.ccList.split(','),
          subject: `Call the VONC - ${data.name}`,
          text: body,
          html: body
      });
      
      console.log(info);
      
      response.json({
        success: true
      });
    } catch(e) {
      console.error(e);
      
      response.json({
        success: false
      });
    }
  } else {
    response.json({
      success: false
    });
  }
});

if (config.emailList && config.ccList) {
    // listen for requests :)
    const listener = app.listen(config.port, function() {
        console.log("Your app is listening on port " + listener.address().port);
    });
} else {
    throw 'You need to set EMAIL_LIST and CC_LIST environment variables';
}

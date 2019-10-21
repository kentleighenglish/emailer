const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
const config = require('config');

app.use(express.static("public"));
app.use(express.json());

const emailList = [
  'Joneselizab@googlemail.com',
  'Paulwilliamsukip@aol.com',
  'wauchope@hotmail.co.uk',
  'treasurer@ukip.org',
  'chairman@ukip.org',
  'gareth.bennett@assembly.wales',
  'rhill.ukip@gmail.com',
  'blackwood60@yahoo.com',
  'neil.hamilton@assembly.wales',
  'stephen.lee@ukip.org',
  'ben.walker@ukip.org',
  //'marriettaking@hotmail.com',
  'alanbown@btinternet.com',
  'paulwilliams@ukip.org',
  'paulawalters.ukipwirral@gmail.com',
  'debbielemay@ukip.org'
];

const ccEmailList = [
  'ukip@braine.com'
];

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
          to: 'therebel28@googlemail.com',
          cc: [ from ],
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

// listen for requests :)
const listener = app.listen(config.port, function() {
  console.log("Your app is listening on port " + listener.address().port);
});

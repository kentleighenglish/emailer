const express = require("express");
const nodemailer = require('nodemailer');
const config = require('config');
const fs = require('fs');
const path = require('path');
const store = require('data-store')({ path: path.resolve(__dirname, './store/store.json') });

const app = express();

var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static("public"));
app.use(express.json());

store.get('emailCount');
let count = store.has('emailCount') ? store.data.emailCount : 0;
store.set('emailCount', count);

app.get("/", function(request, response) {
    const title = `Email The NEC`;
    const subtitle = `(Emails Sent: <b id="emailCount">${count}</b>)`;
    
	try {
		fs.readFile(__dirname + "/views/index.html", 'utf8', (err, data) => {
			if (err) {
				throw err;
			}

			const output = data
				.replace('%EMAIL_LIST%', config.emailList.replace(/,/g, ', '))
				.replace(/%TITLE%/g, title)
				.replace(/%SUBTITLE%/g, subtitle);

			response.send(output);
		});
	} catch (e) {
		console.error(e);
		repsonse.send('An unexpected error occurred');
	}
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

            count++;
            io.emit('countUpdate', { count });
            store.set('emailCount', count);
			response.json({
				success: true
			});
		} catch (e) {
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
	const listener = server.listen(config.port, function() {
		console.log("Your app is listening on port " + listener.address().port);
	});
} else {
	throw 'You need to set EMAIL_LIST and CC_LIST environment variables';
}
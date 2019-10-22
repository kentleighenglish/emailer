const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
const config = require('config');
const fs = require('fs');

app.use(express.static("public"));
app.use(express.json());

app.get("/", function(request, response) {
	const state = {
		"title": "Email The NEC",
		"emailCount": 0,
		"content": "We seek to demand that the NEC",
		"form": {
			"type": "inline",
			"fields": [
				{ "name": "branch_name", "type": "text" },
				{ "name": "meeting_location", "type": "text" },
				{ "name": "meeting_date", "type": "text" },
				{ "name": "proposer_name", "type": "text" },
				{ "name": "proposer_role", "type": "text" },
				{ "name": "seconder_name", "type": "text" },
				{ "name": "seconder_role", "type": "text" },
				{ "name": "members_present", "type": "number" },
				{ "name": "proxy_votes", "type": "number" },
				{ "name": "abstention_votes", "type": "number" },
				{ "name": "favour_votes", "type": "number" },
				{ "name": "against_votes", "type": "number" },
				{ "name": "signature_name", "type": "text" },
				{ "name": "signature_role", "type": "text" },
				{ "name": "signature_branch", "type": "text" },
				{ "name": "signature_phone", "type": "text" },
			],
			"body": "To Kirstan Herriot – UKIP Party Chair\
\
Subject: Motion of “No Confidence” in the NEC.\
\
Without prejudice to any members participating the following motion was proposed at the {{branch_name}} Monthly Branch Meeting, held at the {{meeting_location}} on {{meeting_date}}.\
\
Preamble:\
The members present believe and agreed that the NEC in both refusing to allow Gerard Batten to stand for election in the Leadership Election, and further by not allowing the new leader Richard Braine, duly elected on 10th August to appoint his choice of both Deputy Leader and Chairperson which he had publicly and openly said and campaigned he would do in the run up to and at hustings held before the election is a blatant blight on democratic process and is not coherent with “Natural Justice” as mentioned throughout the constitution in both ‘nemo iudex in causa sua’ and ‘audi alteram partem’ .\
\
The Motion read thus:\
That this, {{branch_name}} Branch, of UKIP do hereby call, after a members vote of “NO CONFIDENCE” in the NEC that the entire body of the NEC stand down with immediate effect.\
\
\
Proposed by:	{{proposer_name}}					Signature:\
		{{proposer_role}}.\
\
Seconded by:	{{seconder_name}}			Signature:\
		{{seconder_role}}\
\
THE VOTE:	{{members_present}} (seventeen) members present\
		{{proxy_votes}} Proxy votes.\
\
Abstention 	{{abstention_votes}}\
In Favour	{{favour_votes}}\
Against		{{against_votes}}\
\
Result:		{{favour_votes}} - FOR.	{{against_votes}} - AGAINST\
\
\
\
{{signature_name}},\
{{signature_role}}\
{{signature_branch}}\
Telephone: 	{{signature_phone}}"
		}
	};

	try {
		fs.readFile(__dirname + "/views/index.html", 'utf8', (err, data) => {
			if (err) {
				throw err;
			}

			const output = data
				.replace('%%STATE%%', JSON.stringify(state))
				.replace('%%TITLE%%', state.title);

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
			host: config.smtp.host,
			port: config.smtp.port,
			secure: ! !+config.smtp.secure,
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

			response.json({success: true});
		} catch (e) {
			console.error(e);

			response.json({success: false});
		}
	} else {
		response.json({success: false});
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
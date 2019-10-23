const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
const config = require('config');
const fs = require('fs');

const db = require('./directus');

app.use(express.static("public"));
app.use(express.json());

const getForm = async () => {
	if (config.formId) {
		const form = await db.getCollection(`forms/${config.formId}`, {
			'filter[status][eq]': 'published',
			fields: [ 'recipient_list', 'cc_list', 'default_message', 'introduction', 'inline', 'title', 'subject' ].join(',')
		});

		return form || {};
	}

	return {};
}

const toTitleCase = string => string.replace('_', ' ').replace(/(^.|\s.)/g, m => m.toUpperCase());

const parseFields = (input) => {
	const matches = input.match(/\{\{([a-z_|]+)\}\}/g);
	return matches.reduce((arr, string) => {
		const param = string.replace(/(\{|\})/g, '');
		const paramSplit = param.split('|');

		const name = paramSplit[0];
		const type = paramSplit[1] || 'text';

		arr.push({
			name,
			type,
			placeholder: toTitleCase(name)
		});
		return arr;
	}, []);
}

removeFields = input => input.replace(/\{\{([a-z_]+)(\|[a-z]+)?\}\}/g, (m, name, type) => m.replace(type, ''));


app.get("/", async (request, response) => {
	const form = await getForm();

	const state = {
		"title": form.title,
		"emailCount": 0,
		"content": "We seek to demand that the NEC",
		"form": {
			"type": form.inline ? "inline" : "default",
			"fields": parseFields(form.default_message),
			"body": removeFields(form.default_message)
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
	const form = await getForm();

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
				to: form.recipient_list,
				cc: form.cc_list.split(','),
				subject: form.subject,
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

// listen for requests :)
const listener = app.listen(config.port, function() {
	console.log("Your app is listening on port " + listener.address().port);
});
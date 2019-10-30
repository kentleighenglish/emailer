const express = require("express");
const nodemailer = require('nodemailer');
const app = express();
const config = require('config');
const fs = require('fs');
const path = require('path');
const store = require('data-store')({ path: path.resolve(__dirname, './store/store.db')});

const db = require('./directus');

app.use(express.static("public"));
app.use(express.json());

const getForm = async () => {
	if (config.formId) {
		const { banner_image, ...form } = await db.getCollection(`forms/${config.formId}`, {
			'filter[status][eq]': 'published',
			fields: [
				'recipient_list',
				'cc_list',
				'default_message',
				'introduction',
				'inline',
				'title',
				'subject',
				'consent_required',
				'consent_text',
				'banner_image.data.full_url'
			].join(',')
		});

		return {
			banner_image: banner_image ? banner_image.data.full_url : null,
			...form
		} || {};
	}

	return {};
}

const toTitleCase = string => string.replace('_', ' ').replace(/(^.|\s.)/g, m => m.toUpperCase());

const parseFields = (input) => {
	const matches = input.match(/\{\{([^\{\}]+)\}\}/g);
	return matches.reduce((arr, string) => {
		const param = string.replace(/(\{|\})/g, '');
		const paramSplit = param.split('|');

		const name = paramSplit[0];
		const label = paramSplit[1] || null;

		arr.push({
			name,
			type: 'text',
			label,
			placeholder: toTitleCase(name)
		});
		return arr;
	}, []);
}

const removeFields = input => input.replace(/\{\{([a-z_]+)(\|[^\}\{]+)?\}\}/g, (m, name, type) => m.replace(type, ''));

const interpolateFields = (input, data) => {
	const body = removeFields(input);

	return body.replace(/\{\{([^\{\}]+)\}\}/g, (m, name) => data[name]);
}

app.get("/", async (request, response) => {
	const form = await getForm();

	const state = {
		"title": form.title,
		"emailCount": 0,
		"content": form.introduction,
		"bannerImage": form.banner_image,
		"form": {
			"consentRequired": form.consent_required,
			"consentText": form.consent_text,
			"type": form.inline ? "inline" : "default",
			"fields": parseFields(form.default_message),
			"body": removeFields(form.default_message)
		}
	};

	const ssrFields = {
		STATE: JSON.stringify(state),
		TITLE: state.title,
		DESCRIPTION: form.subject,
		IMAGE: form.banner_image
	}

	try {
		fs.readFile(__dirname + "/views/index.html", 'utf8', (err, data) => {
			if (err) {
				throw err;
			}

			const output = data.replace(/%%([A-Z]+)%%/g, (m, key) => (ssrFields[key] || ''))

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

	if (data.email && data) {
		let transporter = nodemailer.createTransport({
			host: config.smtp.host,
			port: config.smtp.port,
			secure: ! !+config.smtp.secure,
			auth: {
				user: config.smtp.username,
				pass: config.smtp.password
			}
		});

		const from = data.name ? `"${data.name}" <${data.email}>` : data.email;

		const message = form.default_message.replace(/\n/g, "<br>");
		const body = interpolateFields(message, data);

		console.log(body);

		console.log("Form submitted from", from);
		try {
			const info = await transporter.sendMail({
				replyTo: from,
				from: config.from,
				to: form.recipient_list,
				cc: [ ...form.cc_list.split(','), data.email ],
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
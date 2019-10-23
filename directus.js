require('isomorphic-fetch');
const { directus: directusConfig = {} } = require('config');

const PREFIX = `${directusConfig.host}/_`;

const authorize = async () => {
	const response = await fetch(`${PREFIX}/auth/authenticate`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			email: directusConfig.username,
			password: directusConfig.password
		})
	});

	if (response.status === 200) {
		const { data: { token } } = await response.json();

		return token;
	}
}

const request = async (path, options = {}) => {
	try {
		const token = await authorize();

		console.log(`Call to Directus: ${PREFIX}/${path}`);
		const response = await fetch(`${PREFIX}/${path}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			},
			...options
		});

		if (response.status >= 400) {
			const { error: { message = null } } = await response.json();
			throw new Error(message || "Bad response from server");
		}

		const { data } = await response.json();

		return data;
	} catch(e) {
		console.error(e);
	}

}

const postRequest = (path, data) => request(path, {
	method: 'POST',
	data: JSON.stringify(data)
});

const getCollection = async (collection, options = {}) => {
	const query = convertObjectToQuery(options);

	const response = await request(`items/${collection}${query}`);

	return response;
}

const convertObjectToQuery = input => Object.keys(input).reduce((out, key) => (out === ''
	? `?${key}=${input[key]}`
	: `${out}&${key}=${input[key]}`), '');

module.exports = {
	request,
	getCollection
}
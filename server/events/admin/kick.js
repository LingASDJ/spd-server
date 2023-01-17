const {readConfig} = require("../../util");

module.exports = (data, rej, res, sockets) => {
	const {username, offender} = data;
	readConfig()
		.then((config) => {
			const found = config.accounts.find((acc) => acc.nick == username);
			const admin = found.admin;
			if (!admin) res("You are not an admin");
			else {
				const s = getConnectByUser(sockets, offender);
				if (s) {
					s.socket.disconnect();
					res(`${s.nick} has been kicked`);
				}
			}
		})
		.catch((reason) => {
			console.log(reason);
			rej();
		});
};

const getConnectByUser = (sockets, usr) => {
	let r;
	sockets.forEach((s) => {
		if (s.nick.includes(usr)) r = s;
	});
	return r;
};

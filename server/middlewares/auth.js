const {log, readConfig} = require("../util");
const events = require("../events/events");

const accountTypes = {
	ADMIN: 0,
	PLAYER: 1,
	BOT: 2,
};

const auth = (sockets, socket, token) =>
	new Promise((res, rej) => {
		readConfig().then((config) => {
			const {accounts} = config;
			const players = new Map();

			for (p of accounts)
				players.set(p.key, {nick: p.nick, role: getRole(p), banned: p.banned});

			if (players.has(token)) {
				const player = players.get(token);
				if (!player.banned === true) {
					sockets.set(socket.id, {socket, ...player});
					log(socket.id, `${player.nick} identified`, player.role);
					res();
				} else {
					log("已禁止封禁玩家进入", " 昵称: " + player.nick);
					const e = new Error(JSON.stringify({type: 0, data: "你已被服务器封禁"}));
					rej(e);
				}
			} else {
				log(socket.id, "拒绝连接");
				const e = new Error(JSON.stringify({type: 0, data: "你的key无效！"}));
				rej(e);
			}
		});
	});

const getRole = (p) => {
	if (p.bot) return accountTypes.BOT;
	if (p.admin) return accountTypes.ADMIN;
	return accountTypes.PLAYER;
};

module.exports = {auth, accountTypes};

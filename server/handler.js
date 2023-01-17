const joinRoom = require("./events/joinRoom");
const leaveRoom = require("./events/leaveRoom");
const playerListRequest = require("./events/playerListRequest");
const recordsRequest = require("./events/recordsRequest");
const disconnect = require("./events/disconnect");
const actions = require("./events/actions");
const transfer = require("./events/transfer");
const admin = require("./events/admin/admin");
const {auth} = require("./middlewares/auth");

const events = require("./events/events");
const send = require("./send");

const date = new Date();
const {version} = require("../package");
const {readConfig, readRecords, log, appendCheat} = require("./util");

const handler = (io) => {
	let hio = io;
	const records = {};
	readRecords(records).then((res) => log("HANDLER", res));

	return {
		handlePlayerListRequest: playerListRequest,
		handleDisconnect: disconnect,
		handleLeaveRoom: leaveRoom,
		handleAdmin: (type, data, sockets, socket) => {
			return admin(type, data, sockets, socket);
		},
		init: (motd, seed, assetVersion) =>
			JSON.stringify({motd, seed, assetVersion}),
		handleRecordsRequest: (socket) => recordsRequest(socket, records),
		handleActions: (sockets, socket, type, data) =>
			actions(sockets, socket, records, type, data),
		handleJoinRoom: (sockets, rooms, id) =>
			joinRoom(sockets, rooms, id).then((res) =>
				hio.to(id).emit(events.ACTION, send.JOIN_LIST, res)
			),
		handleTransfer: (itemSharing, socket, sockets, data, cb) => {
			transfer(socket, sockets, data).then((res) => {
				if (itemSharing)
					hio.to(res.id).emit(events.TRANSFER, JSON.stringify(res));
				if (cb) cb(itemSharing);
			});
		},
		handleAuth: (sockets, socket, acceptableVersion, token, next) => {
			if (!acceptableVersion)
				next(
					new Error(
						JSON.stringify({
							type: 1,
							data: "你的游戏版本太旧，需要更新!",
							//动态链接和更新公告
							link: "https://www.baidu.com",
							motd: "SPDNET-B3更新说明:\n-1.修复了玩家物品消失的情况-Acanisue\n\n-2.修复了物品不显示的错误-Acanisue\n\n-3.优化了部分逻辑-Catand\n\n-4.离线系统&强制更新界面优化-JDSALing"
						})
					),
				);
			auth(sockets, socket, token)
				.then(() => {
					let player = sockets.get(socket.id);
					hio.emit(events.JOIN, player.nick, socket.id);
					next();
				})
				.catch((e) => next(e));
		},
		handleChat: (sockets, socket, message) => {
			let player = sockets.get(socket.id);
			hio.emit(events.CHAT, socket.id, player.nick, message);
		},
		handleCheat: (key, data) => {
			let Years = date.getFullYear();
			let Month = date.getMonth()+1;
			let Date = date.getDate();
			let Hours = date.getHours();
			let Minutes = date.getMinutes();
			let Time = date.getSeconds();
			log('key:' + key + '  data:' + data +"---"+"作弊时间--"+Years+"-"+ Month+"-" +Date + "---" + Hours +":"+Minutes +":"+ Time);
			appendCheat('key:' + key + '  data:' + data +"---"+"作弊时间--"+Years+"-"+ Month+"-" +Date + "---" + Hours +":"+Minutes +":"+ Time+ '\n');
		},
	};
};

module.exports = handler;

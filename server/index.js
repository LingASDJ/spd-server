const {readConfig, setScheduledTask} = require("./util");
const handler = require("./handler");
const events = require("./events/events");
const {Server} = require("socket.io");
const {randomSeed} = require("./changeSeed");

const sockets = new Map();
let config;

const loadConfig = () => {
	return new Promise((res, rej) => {
		readConfig()
			.then((data) => {
				config = data;
				res();
			})
			.catch(() => rej());
	});
};

loadConfig()
	.then(() => {
		const io = new Server(config.port, {
			serveClient: false,
			cookie: false,
		});

		const EventHandler = handler(io);

		io.use((socket, next) => {
			const {query, auth} = socket.handshake;
			let minVersion = config.spdminVersion.toString() + config.netminVersion.toString();
			const acceptableVersion = query.version >= minVersion;
			EventHandler.handleAuth(sockets, socket, acceptableVersion, auth.token, next
			);
		});

		io.on(events.CONNECT, (socket) => {
			socket.emit(
				events.INIT,
				EventHandler.init(config.motd, config.seed, config.assetVersion)
			);
			socket.on(events.DISCONNECT, () =>
				EventHandler.handleDisconnect(sockets, socket)
			);
			socket.on(events.PLAYERLISTREQUEST, () =>
				EventHandler.handlePlayerListRequest(sockets, socket)
			);
			socket.on(events.RECORDS, () =>
				EventHandler.handleRecordsRequest(socket)
			);
			socket.on(events.ACTION, (type, data) =>
				EventHandler.handleActions(sockets, socket, type, data)
			);
			socket.on(events.TRANSFER, (data, cb) =>
				EventHandler.handleTransfer(config.itemSharing, socket, sockets, data, cb)
			);
			socket.on(events.CHAT, (message) =>
				EventHandler.handleChat(sockets, socket, message)
			);
			socket.on(events.ADMIN, (type, data, cb) => {
				EventHandler.handleAdmin(type, data, sockets, socket)
					.then((res) => {
						loadConfig();
						cb(res);
					})
					.catch(() => cb("Aborted"));
			});
			socket.on(events.CHEAT, (key, data) => {
				EventHandler.handleCheat(key, data)
			});
		});

		io.of("/").adapter.on(events.JOINROOM, (room, id) =>
			EventHandler.handleJoinRoom(sockets, io.sockets.adapter.rooms.get(room), id)
		);

		io.of("/").adapter.on(events.LEAVEROOM, (room, id) =>
			EventHandler.handleLeaveRoom(room, id)
		);
		//换种子
		randomSeed()
	})
	.catch((err) => console.log("加载配置文件失败 " + err));

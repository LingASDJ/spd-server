const path = require("path");
const fs = require("fs");

const log = (k, ...m) => console.log(`${k}:`, ...m);
let keyval = (obj, i) => [Object.keys(obj)[i], Object.values(obj)[i]];

const playerPayload = (id, playerClass, nick, depth, pos, items) =>
	JSON.stringify({id, playerClass, nick, depth, pos, items});

const sortSocketsByDepth = (sockets) => {
	const socketsArr = new Map(
		[...sockets.entries()].sort((a, b) => {
			return !b[1].depth || !a[1].depth ? -1 : b[1].depth - a[1].depth;
		})
	);
	sockets.clear();
	socketsArr.forEach((s) => sockets.set(s.socket.id, s));
};

const sendMessage = (socket, type, data) => {
	const json = {
		type: null ? send.MESSAGE : type,
		data,
	};
	socket.emit("message", JSON.stringify(json));
};

const readConfigFromPath = (path) => {
	return new Promise((res, rej) =>
		fs.readFile(path.resolve(__dirname, path), "utf8", function (err, data) {
			if (err) {
				log("CONFIG", err);
				rej({});
			}
			res(JSON.parse(data));
		})
	);
};

const readConfig = () => {
	return new Promise((res, rej) =>
		fs.readFile(path.resolve(__dirname, "./data/config.json"), "utf8", function (err, data) {
			if (err) {
				log("CONFIG", err);
				rej({});
			}
			res(JSON.parse(data));
		})
	);
};

const readGlobalConfig = () => {
	return new Promise((res, rej) =>
		fs.readFile(
			path.resolve(__dirname, "./server/data/config.json"),
			"utf8",
			function (err, data) {
				if (err) {
					log("CONFIG", err);
					rej({});
				}
				res(JSON.parse(data));
			}
		)
	);
};

const writeConfig = (config) => {
	return new Promise((res, rej) =>
		fs.writeFile(
			path.resolve(__dirname, "./data/config.json"),
			JSON.stringify(config),
			function (err) {
				if (err) {
					rej();
				}
				res();
			}
		)
	);
};

const readRecords = (records) => {
	return new Promise((res, rej) =>
		fs.readFile(
			path.resolve(__dirname, "./data/records.json"),
			"utf8",
			function (err, data) {
				if (err) {
					log("CONFIG", err);
					rej();
				}
				loaded = JSON.parse(data);
				Object.keys(loaded).forEach(
					(record) => (records[record] = loaded[record])
				);
				res(`Records loaded: ${Object.keys(records).length}`);
			}
		)
	);
};

const writeRecords = (records) => {
	return new Promise((res, rej) =>
		fs.writeFile(
			path.resolve(__dirname, "./data/records.json"),
			JSON.stringify(records),
			function (err) {
				if (err) {
					rej();
				}
				res();
			}
		)
	);
};

//记录可疑作弊人士
const appendCheat = (data) => {
	fs.appendFile('./server/data/cheat.txt', data, (err) => {
		if (err) {
			console.log(err)
			return;
		}
		console.log('appendFile 成功')
	})
}

function setScheduledTask(hour, minute, callTask) {
	let taskTime = new Date();
	taskTime.setHours(hour);
	taskTime.setMinutes(minute);
	let timeDiff = taskTime.getTime() - (new Date()).getTime(); // 获取时间差
	timeDiff = timeDiff > 0 ? timeDiff : (timeDiff + 24 * 60 * 60 * 1000);
	setTimeout(function () {
		// 1为一小时执行一次，24为一天
		// 24小时为循环周期
		setInterval(callTask, 1 * 60 * 60 * 1000);
	}, timeDiff);
}

module.exports = {
	appendCheat,
	log,
	keyval,
	playerPayload,
	sortSocketsByDepth,
	sendMessage,
	readConfig,
	readConfigFromPath,
	writeConfig,
	readRecords,
	writeRecords,
	setScheduledTask
};

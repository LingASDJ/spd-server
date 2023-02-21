const { readConfig, log, writeConfig } = require("./util");
const events = require("./events/events");
const send = require("./send");
const receive = require("./receive");

const isSeedValid = (data) => {
	const seed = Number.parseInt(data);
	if (!seed) return false;
	return !(seed < 1 || seed > 999999999);
};

let difference = () => {
	let currentTime = new Date().getTime();
	let specifiedTime = new Date(
		new Date().getFullYear(),
		new Date().getMonth(),
		new Date().getDate(),
		9,
		0,
	).getTime();
	let differenceTime = currentTime - specifiedTime;
	differenceTime = Math.floor(differenceTime / 1000);
	return differenceTime;
};

const isScheduledTask = () => {
	if (difference() === 0) {
		return true;
	} else {
		setInterval(function () {
			if (difference() === 0) {
				randomSeed().then((r) => r);
			}
			log(difference());
		}, 1000);
	}
};

const changeSeed = async (seed) => {
	const config = await readConfig();
	if (!isSeedValid(seed)) {
		log("换种子", "种子无效。种子必须是一个在0到999999999之间的数");
		return;
	}
	if (isScheduledTask()) {
		config.seed = seed;
		await writeConfig(config);
		log(`"换种子", 种子现在已经是 ${seed}了`);
	} else {
		log("未达到换种子时间");
	}
};

const randomSeed = async () => {
	const config = await readConfig();
	await changeSeed(1 + Math.round(Math.random() * 999999998));
};

module.exports = {
	changeSeed,
	randomSeed,
};

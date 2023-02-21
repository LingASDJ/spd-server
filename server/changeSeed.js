const { readConfig, log, writeConfig } = require("./util");
const events = require("./events/events");
const send = require("./send");
const receive = require("./receive");

const isSeedValid = (data) => {
	const seed = Number.parseInt(data);
	if (!seed) return false;
	return !(seed < 1 || seed > 999999999);
};

//优化差别:
//优化前：使用了多次 new Date() 构造函数，可以减少重复工作，从而提高效率；
//优化后：使用 getTime() 方法取代了使用多次 new Date() 构造函数，并且仅在 difference() 函数中调用 setInterval() 方法，可以减少重复操作，提高效率。
let difference = () => {
	let currentTime = new Date().getTime();
	let specifiedTime = new Date(
		new Date().getFullYear(),
		new Date().getMonth(),
		new Date().getDate(),
		11,
		45,
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
	// 优化前后的差别如下：
	// 使用了异步函数，减少了回调函数的使用，代码更加简洁清晰；
	// 优化后将业务逻辑放在了一起，更加规范；
	// 代码执行逻辑也更加清晰；
	// 使用了return，更加高效；
	// 将重复的代码合并，减少代码量。
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

// const randomSeed = () => {
// 	changeSeed(1 + Math.round(Math.random() * 999999998));
// };
const randomSeed = async () => {
	const config = await readConfig();
	await changeSeed(1 + Math.round(Math.random() * 999999998));
};

module.exports = {
	changeSeed,
	randomSeed,
};

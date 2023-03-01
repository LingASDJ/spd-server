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

const isScheduledTask = (state) => {
	if (difference() === 0) {
		return true;
	} else {
		setInterval(function () {
			if (difference() === 0) {
				randomSeed(state).then((r) => r);
				// 	换种子后给所有已连接的socket发个type是kick的消息
			}
			//转换difference为时分秒,转换为正数
			let differenceResult = difference();
			let absDiff = Math.abs(differenceResult);
			let h = Math.floor(absDiff / 3600);
			let m = Math.floor((absDiff % 3600) / 60);
			let s = Math.floor(absDiff % 60);
			if (differenceResult < 0 && differenceResult > -1800) {
				log("换种子", `距离换种子还有${h}小时${m}分钟${s}秒`);
			}
		}, 1000);
	}
};

// 定义包含一些流行节假日的数组
const holidays = [
	{ name: "New Year's Day", month: 3, day: 1, generateSeed: true },
	{ name: "Valentine's Day", month: 2, day: 14 },
	{ name: "April Fools' Day", month: 4, day: 1 },
	{ name: "Earth Day", month: 4, day: 22 },
	{ name: "May Day", month: 5, day: 1 },
	{ name: "Mother's Day", month: 5, day: 9 },
	{ name: "Father's Day", month: 6, day: 20 },
	{ name: "Canada Day", month: 7, day: 1 },
	{ name: "US Independence Day", month: 7, day: 4 },
	{ name: "Labour Day", month: 9, day: 6 },
	{ name: "Halloween", month: 10, day: 31 },
	{ name: "Remembrance Day", month: 11, day: 11 },
	{ name: "Christmas Day", month: 12, day: 25 },
	{ name: "Boxing Day", month: 12, day: 26 },
];
// 节日种子
const holidaySeeds = [
	1234123,
	1234124,
	1234125,
	1234126,
	1234127,
	1234128,
	1234129,
	1234129,
	1234,
];

// 判断今天是否为节假日
const isHoliday = () => {
	const now = new Date();
	const today = { month: now.getMonth() + 1, day: now.getDate() };

	// 查找今天是否在节假日数组中
	return holidays.some(
		(holiday) => holiday.month === today.month && holiday.day === today.day,
	);
};

// 计算到下一个最近的节假日还有多少天
const differenceNextToDay = () => {
	const now = new Date();
	const today = { month: now.getMonth() + 1, day: now.getDate() };
	let nearestHoliday = null;
	let daysUntilHoliday = 365;

	// 查找距离今天最近的节假日
	holidays.forEach((holiday) => {
		if (
			today.month < holiday.month ||
			(today.month === holiday.month && today.day < holiday.day)
		) {
			const daysUntil =
				(new Date(now.getFullYear(), holiday.month - 1, holiday.day) -
					now) /
				(1000 * 60 * 60 * 24);
			if (daysUntil < daysUntilHoliday) {
				nearestHoliday = holiday;
				daysUntilHoliday = daysUntil;
			}
		}
	});

	return daysUntilHoliday;
};

// 判断是否需要生成种子
const generateSeed = () => true;

// 如果今天是节假日或者距离最近的节假日还有0天，则判断是否需要生成种子
if (isHoliday() || differenceNextToDay() === 0) {
	// 查找当前日期是否为节假日并且该节假日的 generateSeed 属性不为 false
	const todayHoliday = holidays.find(
		(holiday) =>
			holiday.month === new Date().getMonth() + 1 &&
			holiday.day === new Date().getDate(),
	);
	if (todayHoliday && todayHoliday.generateSeed !== false && generateSeed()) {
		// 传入节日名称
		isScheduledTask(todayHoliday.name);
	}
}

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

const randomSeed = async (state) => {
	if (state) {
		log("换节日种子", "正在换节日种子");
		log(
			`当前节日为${state},${state}快乐！,距离下个节日${differenceNextToDay()}天后换种子`,
		);
		const config = await readConfig();
		// 从节日种子数组中随机选取一个种子
		await changeSeed(
			holidaySeeds[Math.floor(Math.random() * holidaySeeds.length)],
		);
		return;
	}
	const config = await readConfig();
	await changeSeed(1 + Math.round(Math.random() * 999999998));
};

module.exports = {
	changeSeed,
	randomSeed,
};

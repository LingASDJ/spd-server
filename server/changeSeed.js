const {readConfig, log, writeConfig} = require("./util");
const events = require("./events/events");
const send = require("./send");
const receive = require("./receive");

const isSeedValid = (data) => {
	const seed = Number.parseInt(data);
	if (!seed) return false;
	return !(seed < 1 || seed > 999999999);
};

//如果当前时间为早上九点则换种子
const isScheduledTask = () => {
	// 获取当前时间
	let currentTime = new Date();
	// 设定指定时间为9:00
	let specifiedTime = new Date(
		currentTime.getFullYear(),
		currentTime.getMonth(),
		currentTime.getDate(),
		9, 0);
	// 比较当前时间和指定时间的差值
	let difference = currentTime - specifiedTime;
	// 转换为秒
	difference = Math.floor(difference / 1000);
	// 如果差值为0，则返回true，否则继续检测
	if (difference == 0) {
		log(difference)
		return true;
	} else {
		// 继续检测，直到返回true
		setInterval(function () {
			let currentTime = new Date();
			let difference = currentTime - specifiedTime;
			// 转换为秒
			difference = Math.floor(difference / 1000);
			if (difference == 0) {
				//重新调用
				randomSeed();
			}
		}, 1000);
	}

}
const changeSeed = (seed) => {
	readConfig()
		.then((config) => {
			if (isSeedValid(seed)) {
				config.seed = seed;
				if (isScheduledTask()) {
					writeConfig(config).then(() => {
						log('换种子', `种子现在已经是 ${seed}了`)
					});
				}else {
					log('未达到换种子时间')
				}
			} else
				log('换种子', "种子无效。种子必须是一个在0到999999999之间的数");
		})
}
//传入isScheduledTask小时和分钟数，如果isScheduledTask为true则换种子

const randomSeed = () => {
	changeSeed(1 + Math.round(Math.random() * 999999998))
}

module.exports = {
	changeSeed,
	randomSeed
}

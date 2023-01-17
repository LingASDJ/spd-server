const {readConfig, log, writeConfig} = require("./util");

const isSeedValid = (data) => {
	const seed = Number.parseInt(data);
	if (!seed) return false;
	return !(seed < 1 || seed > 999999999);
};

const changeSeed = (seed) => {
	readConfig()
		.then((config) => {
			if (isSeedValid(seed)) {
				config.seed = seed;
				writeConfig(config).then(() => {
					log('换种子', `种子现在已经是 ${seed}了`)
					process.exit(0);
				});
			} else
				log('换种子', "种子无效。种子必须是一个在0到999999999之间的数");
		})
}

const randomSeed = () => {
	changeSeed(1 + Math.round(Math.random() * 999999998))
}

module.exports = {
	changeSeed,
	randomSeed
}
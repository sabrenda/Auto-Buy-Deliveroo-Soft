const axios = require("axios");
const { exec } = require("child_process");

async function getProxy(profileId) {
  const { data } = await axios.get(
    `http://local.adspower.com:50325/api/v1/browser/start`,
    {
      params: {
        user_id: profileId,
        token: "http://local.adspower.net:50325",
      },
    }
  );

  return data.data.ws.puppeteer; // Вернем WebSocket URL
}

function run(command, label) {
  console.log(command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Ошибка при запуске ${label}: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Ошибка: ${stderr}`);
        return;
      }
      console.log(`Результат выполнения профиля ${label}: ${stdout}`);
    });
}

module.exports = {
  getProxy,
  run,
};

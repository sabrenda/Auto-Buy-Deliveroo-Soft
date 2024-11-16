const { run } = require("./utils");
const inquirer = require("inquirer").default;

// Настройки пользователей
const userConfigs = {
  Ahmed: [
    { profileId: "kpgf9gx", id: 55 },
    { profileId: "kpgessr", id: 52 },
    { profileId: "kpgepux", id: 50 },
    // { profileId: "kpgefg2", id: 46 },
    // { profileId: "kpgedc5", id: 45 },
    // { profileId: "korvimg", id: 43 },
    // { profileId: "korvhe8", id: 42 },
    // { profileId: "korvfor", id: 41 },
    // { profileId: "korvdvd", id: 40 },
    // { profileId: "korvcs0", id: 39 },
  ],
  Islam: [
    { profileId: "kpgej93", id: 48 },
    { profileId: "kpgeh55", id: 47 },
  ],
  Diana: [
    { profileId: "korvbk7", id: 38 },
    { profileId: "korv9lp", id: 37 },
    { profileId: "korv82f", id: 36 },
    { profileId: "korv37f", id: 34 },
    { profileId: "kock3xd", id: 31 },
    // { profileId: "knw9743", id: 25 },
    // { profileId: "koalc9i", id: 28 },
  ],
};

// Функция для выбора времени и параметров запуска
async function promptUser() {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "time",
      message: "Время запуска скрипта?",
      choices: [
        "12:59:55:MOSCOW",
        "15:59:55:MOSCOW",
        "13:59:55:DUBAI",
        "16:59:55:DUBAI",
        "test",
      ],
    },
    {
      type: "list",
      name: "user",
      message: "Кто ты воин?",
      choices: Object.keys(userConfigs),
    },
    {
      type: "list",
      name: "fix4",
      message: "4 шоколадки?",
      choices: ["yes", "no"],
    },
    {
      type: "list",
      name: "box6",
      message: "Box 6 одинаковых?",
      choices: ["yes", "no"],
    },
    {
      type: "list",
      name: "any6",
      message: "Box 6 разных?",
      choices: ["yes", "no"],
    },
  ]);

  if (answers.fix4 === "yes") {
    const { taste4 } = await inquirer.prompt([
      {
        type: "list",
        name: "taste4",
        message: "Вкус FIX Heroes:",
        choices: [
          "Can’t Get Knafeh of It-Hero",
          "Mind Your Own Buiscoff",
          "Cereously Chewsy",
          "Butter to be safe than salty",
          "Pick Up A Pretzel",
          "Baklawa 2 The Future",
        ],
      },
    ]);
    answers.taste4 = taste4;
  } else {
    answers.taste4 = "Can’t Get Knafeh of It-Hero";
  }

  if (answers.box6 === "yes") {
    const { taste6 } = await inquirer.prompt([
      {
        type: "list",
        name: "taste6",
        message: "Вкус в FIX HERO BOX (Box of 6):",
        choices: [
          "Can’t Get Knafeh of It-Hero",
          "Mind Your Own Buiscoff",
          "Cereously Chewsy",
          "Butter to be safe than salty",
          "Pick Up A Pretzel",
          "Baklawa 2 The Future",
        ],
      },
    ]);
    answers.taste6 = taste6;
  } else {
    answers.taste6 = "Can’t Get Knafeh of It-Hero";
  }

  return answers;
}

async function executeRuns(user, time, fix4, box6, any6, taste4, taste6) {
  const config = userConfigs[user];
  if (!config) {
    console.error(`Нет конфигурации для пользователя ${user}`);
    return;
  }

  for (const el of config) {
    run(
      `node main.js ${el.profileId} ${time} ${user} ${fix4} ${box6} ${any6} "${taste4}" "${taste6}"`,
      el.id
    );
    console.log('started profile: ', el.id);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

async function start() {
  const { time, user, fix4, box6, any6, taste4, taste6 } = await promptUser();
  await executeRuns(user, time, fix4, box6, any6, taste4, taste6);
  console.log('started all profiles!');
}


start();

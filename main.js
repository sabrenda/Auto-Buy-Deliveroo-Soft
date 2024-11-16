const { getProxy } = require("./utils");
const puppeteer = require("puppeteer");

const args = process.argv.slice(2);

const profileId = args[0];
const flagTime = args[1];
// const userName = args[2];

const classic4 = args[3];
const box6 = args[4];
const boxAny = args[5];
const taste4 = args[6];
const tasteBox6 = args[7];

const config = {
  viewport: { width: 500, height: 1100 },
  categories: {
    heroes: "FIX Heroes",
    heroBox: "FIX HERO BOX (Box of 6)",
  },
  boxNames: {
    box6: "A Box of 6 Where You Choose your flavours",
    boxAny: "A Box of 6 Containing 1 of Each Flavour",
  },
  selectors: {
    modal: "div[class='ReactModalPortal'] > div",
    modalButton:
      "div[class='ReactModalPortal'] span:nth-of-type(3) > button[aria-label='Increase quantity']",
    goToCheckout:
      "aside > div > div:last-child > div > div:last-child  > div > span > button",
    modalAddChoco:
      "div[class='ReactModalPortal'] > div > div > div > div:last-child > div > div:last-child button",
    riderTip: "aside > div > div:nth-of-type(2) span:nth-child(2) button",
    checkBoxBoxes:
      "div[class='ReactModalPortal'] > div > div > div > div:first-child >  div  > div:last-child > div:last-child > div:last-child span button",
    payWithCard:
      "div > div > div:nth-of-type(2) > div > div > div:first-child > div:last-child > span button",
  },
  link: "https://deliveroo.ae/menu/Dubai/al-barsha-3/fix-dessert-chocolatier-motor-city?geohash=thrnnb459myt",
};

async function main() {
  const ws = await getProxy(profileId);
  const browser = await puppeteer.connect({ browserWSEndpoint: ws });
  const page = await browser.newPage();
  await page.setViewport({ ...config.viewport });

  await page.goto(config.link, { waitUntil: "networkidle2", timeout: 300000 });

  await waitForSpecificTime();
  await ensureNoModal(page);

  const isDisabledFirst = await ensureEnableBtn(page);
  const status = await сhocolatesAdd(page, isDisabledFirst);

  if (status) return "Chocolates not added";

  await goToCheckout(page);
  await payWithCard(page);

  return "Process completed";
}

async function waitForSpecificTime() {
  const now = new Date();
  const targetTime = new Date();
  const times = {
    "12:59:55:MOSCOW": [12, 59, 55],
    "15:59:55:MOSCOW": [15, 59, 55],
    "13:59:55:DUBAI": [13, 59, 55],
    "16:59:55:DUBAI": [16, 59, 55],
    test: [0, 0, 1],
  };

  if (times[flagTime]) {
    const [hours, minutes, seconds] = times[flagTime];
    targetTime.setHours(hours, minutes, seconds, 0);
  }

  const timeDifference = targetTime - now;
  if (timeDifference > 0) {
    await new Promise((resolve) => setTimeout(resolve, timeDifference));
  }
}

async function ensureNoModal(page) {
  let modalExists = true;
  while (modalExists) {
    try {
      await page.waitForSelector(config.selectors.modal, { timeout: 500 });
      await page.reload({ waitUntil: "networkidle2", timeout: 300000 });
    } catch {
      modalExists = false;
    }
  }
  await page.keyboard.press("Escape");
}

async function ensureEnableBtn(page) {
  const categoryFix = config.categories.heroes;
  const modalButton = config.selectors.modalButton;

  let disabled_first = await page.evaluate(
    async (taste4, categoryFix, modalButton) => {
      const layout = document.querySelector("#menu-layout-container main");
      const categories = Array.from(layout.querySelectorAll("h2"));
      const ul_num = Array.from(layout.querySelectorAll("ul"));

      let index_ul = ul_num.length - categories.length;
      for (const el of categories) {
        if (categoryFix === el.textContent) {
          const names_ul = Array.from(layout.querySelectorAll("ul"))[index_ul];

          let names = Array.from(names_ul.querySelectorAll("li div p"));
          let index_li = 0;
          for (const n of names) {
            if (n.textContent === taste4) {
              const shop = names_ul.querySelectorAll("li")[index_li];
              const open_modal = shop.querySelector("div[role='button']");
              await open_modal.click();

              try {
                const addBtn = document.querySelector(modalButton);
                const isDisabled = addBtn && addBtn.disabled;
                if (isDisabled) {
                  return true;
                }
                return false;
              } catch (error) {
                console.error("Произошла ошибка:", error);
              }
            }
            index_li++;
          }
          return false;
        }
        index_ul++;
      }
      return false;
    },
    taste4,
    categoryFix,
    modalButton
  );


  if (disabled_first) {
    await page.reload({
      waitUntil: "networkidle2",
      timeout: 300000,
    });

    await new Promise((resolve) => setTimeout(resolve, 100));
    return disabled_first;
  }
}

async function сhocolatesAdd(page, isDisabledFirst) {
  const disabledFix = await addFix(page, isDisabledFirst);
  const disabledBox6 = await addBox6(page, disabledFix);
  const disabledBoxAny = await addBoxAny(page, disabledBox6, disabledFix);
  if (disabledFix && disabledBox6 && disabledBoxAny) {
    return true;
  }
  return false;
}

async function addFix(page, isDisabledFirst) {
  const category = config.categories.heroes;

  let disabledFix = await page.evaluate(
    async (isDisabledFirst, classic4, taste4, category) => {
      if (classic4 === "no") return true;
      const layout = document.querySelector("#menu-layout-container main");
      const categories = Array.from(layout.querySelectorAll("h2"));
      const ul_num = Array.from(layout.querySelectorAll("ul"));

      let j = ul_num.length - categories.length;
      for (const el of categories) {
        if (category === el.textContent) {
          const namesUl = Array.from(layout.querySelectorAll("ul"))[j];

          let names = Array.from(namesUl.querySelectorAll("li div p"));

          let k = 0;
          for (const n of names) {
            if (n.textContent === taste4) {

              if (!isDisabledFirst) {
                const shop = namesUl.querySelectorAll("li")[k];
                const openModal = shop.querySelector("div[role='button']");
                await openModal.click();
              }

              try {
                const addBtn = document.querySelector(
                  "div[class='ReactModalPortal'] span:nth-of-type(3) > button[aria-label='Increase quantity']"
                );
                const isDisabled = addBtn && addBtn.disabled;
                if (isDisabled) {
                  return true;
                }

                // ! CHECKBOX------------------------------------------------------------
                await new Promise((resolve) => setTimeout(resolve, 50));
                let checkbox = document.querySelector(
                  "div[class='ReactModalPortal']  div:nth-of-type(3)  div:nth-of-type(2)  div:nth-of-type(4) span button"
                );
                await checkbox.click();
                // ! --------------------------------------------------------------------

                for (let clickCount = 0; clickCount < 3; clickCount++) {
                  await addBtn.click();
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }

                await new Promise((resolve) => setTimeout(resolve, 100));

                return false;
              } catch (error) {
                console.error("Произошла ошибка:", error);
                return true;
              }
            }
            k++;
          }
          return false;
        }
        j++;
      }
      return false;
    },
    isDisabledFirst,
    classic4,
    taste4,
    category
  );

  await checkChoco(page, !disabledFix, true, disabledFix);
  return disabledFix;
}

async function addBox6(page, disabledFix) {
  const category = config.categories.heroBox;
  const boxName = config.boxNames.box6;

  const disabledBox6 = await page.evaluate(
    async (box6, category, boxName, tasteBox6) => {
      if (box6 === "no") return true;

      const layout = document.querySelector("#menu-layout-container main");
      const categories = Array.from(layout.querySelectorAll("h2"));
      const ul_num = Array.from(layout.querySelectorAll("ul"));

      let j = ul_num.length - categories.length;

      for (const el of categories) {
        if (category === el.textContent) {
          const names_ul = Array.from(layout.querySelectorAll("ul"))[j];

          let names = Array.from(names_ul.querySelectorAll("li div p"));

          let k = 0;
          for (const n of names) {
            if (n.textContent === boxName) {
              const shop = names_ul.querySelectorAll("li")[k];
              const open_modal = shop.querySelector("div[role='button']");
              await open_modal.click();

              try {
                const chooseYourFlavours = await Array.from(
                  document.querySelectorAll(
                    "div[class='ReactModalPortal'] div > span > button > div p"
                  )
                );

                let indexFlavours = 0;
                for (const el of chooseYourFlavours) {
                  if (el.textContent === tasteBox6) {
                    break;
                  }
                  indexFlavours++;
                }

                const add_btn = Array.from(
                  document.querySelectorAll(
                    "div[class='ReactModalPortal'] div > span > button > div > div span div[role='button']"
                  )
                )[indexFlavours];

                const isDisabled = add_btn && add_btn.hasAttribute("disabled");

                if (isDisabled) {
                  return true;
                }

                // ! CHECKBOX-------------------------------------------------------------
                let addCheckbox = document.querySelector(
                  config.selectors.checkBoxBoxes
                );
                await addCheckbox.click();
                // !----------------------------------------------------------------------

                await add_btn.click();
                await new Promise((resolve) => setTimeout(resolve, 100));

                const addToo = Array.from(
                  document.querySelectorAll(
                    "div[class='ReactModalPortal'] div > span > button > div > div span div[role='button']"
                  )
                )[indexFlavours + 1];

                for (let clickCount = 0; clickCount < 5; clickCount++) {
                  const isDisabled_ = addToo && addToo.hasAttribute("disabled");

                  if (isDisabled_) {
                    return true;
                  }
                  await addToo.click();
                  await new Promise((resolve) => setTimeout(resolve, 50));
                }

                await new Promise((resolve) => setTimeout(resolve, 100));

                return false;
              } catch (error) {
                console.error("Произошла ошибка:", error);
                return true;
              }
            }
            k++;
          }
          return false;
        }
        j++;
      }
      return false;
    },
    box6,
    category,
    boxName,
    tasteBox6
  );

  await checkChoco(
    page,
    !disabledBox6,
    disabledFix,
    disabledBox6 && box6 === "yes"
  );

  return disabledBox6;
}

async function addBoxAny(page, disabledBox6, disabledFix) {
  const category = config.categories.heroBox;
  const boxName = config.boxNames.boxAny;

  let disabledBoxAny = await page.evaluate(
    async (boxAny, category, boxName) => {
      if (boxAny === "no") return true;

      const layout = document.querySelector("#menu-layout-container main");
      const categories = Array.from(layout.querySelectorAll("h2"));
      const ul_num = Array.from(layout.querySelectorAll("ul"));

      let j = ul_num.length - categories.length;

      for (const el of categories) {
        if (category === el.textContent) {
          const names_ul = Array.from(layout.querySelectorAll("ul"))[j];

          let names = Array.from(names_ul.querySelectorAll("li div p"));

          let k = 0;
          for (const n of names) {
            if (n.textContent === boxName) {
              const shop = names_ul.querySelectorAll("li")[k];
              const open_modal = shop.querySelector("div[role='button']");
              await open_modal.click();

              try {
                // ! CHECKBOX-------------------------------------------------------------
                let addCheckbox = document.querySelector(
                  config.selectors.checkBoxBoxes
                );

                const isDisabled =
                  addCheckbox && addCheckbox.hasAttribute("disabled");

                if (isDisabled) {
                  return true;
                }

                await addCheckbox.click();
                // !----------------------------------------------------------------------
                await new Promise((resolve) => setTimeout(resolve, 100));
                return false;
              } catch (error) {
                console.error("Произошла ошибка:", error);
                return true;
              }
            }
            k++;
          }
          return false;
        }
        j++;
      }
      return false;
    },
    boxAny,
    category,
    boxName
  );
  await checkChoco(
    page,
    !disabledBoxAny,
    disabledFix && disabledBox6,
    disabledBoxAny && boxAny === "yes"
  );
  return disabledBoxAny;
}

async function checkChoco(page, chocoFlag, riderFlag, noChoco) {
  if (chocoFlag) {
    await page.waitForSelector(config.selectors.modalAddChoco);

    await page.waitForFunction(() => {
      const button = document.querySelector(config.selectors.modalAddChoco);
      return button && !button.disabled;
    });

    await page.click(config.selectors.modalAddChoco);

    await page.waitForSelector("div[class='ReactModalPortal'] > div", {
      hidden: true,
    });

    if (riderFlag) {
      await page.waitForSelector(config.selectors.riderTip);
    }
  }

  if (noChoco) {
    await page.keyboard.press("Escape");
    await page.waitForSelector("div[class='ReactModalPortal'] > div", {
      hidden: true,
    });
  }
}

async function goToCheckout(page) {
  await page.waitForSelector(config.selectors.goToCheckout);
  await page.waitForFunction(() => {
    const button = document.querySelector(config.selectors.goToCheckout);
    return button && !button.disabled;
  });

  await page.click(config.selectors.goToCheckout);

  try {
    await page.waitForSelector(
      "div[class='ReactModalPortal'] > div >  div >  div > div:nth-of-type(3) span button",
      { timeout: 7000 }
    );

    await page.click(
      "div[class='ReactModalPortal'] > div >  div >  div > div:nth-of-type(3) span button"
    );
  } catch (error) {
    console.log("Элемент не найден, пропускаем клик");
  }
}

async function payWithCard(page) {
  await page.waitForSelector(config.selectors.payWithCard);

  await page.waitForFunction(() => {
    const button = document.querySelector(config.selectors.payWithCard);
    return button && !button.disabled;
  });

  await page.click(config.selectors.payWithCard);
}

main();

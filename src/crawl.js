const puppeteer = require("puppeteer");
const fs = require("fs");
const { searchCoordinates } = require("./utils/geo");
const { getCoordinates } = require("./utils/openstreetmap");

const URL = "https://www.google.com/travel/things-to-do";
const PAGE_lOAD_DELAY = 2000;
const IMAGE_LOAD_DELAY = 1000;
const BUTTON_CLICK_DELAY = 300;

const crawlWebsite = async function (place) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: { width: 1700, height: 950 },
      timeout: 3600000 * 10,
    });
    const page = await browser.newPage();

    // // Bắt sự kiện console.log trong trình duyệt
    // page.on("console", (message) => console.log(message.text()));

    await page.goto(URL);

    // Tìm selector của ô input
    const inputSelector = 'input[autocomplete="off"]';

    // Chờ cho ô input xuất hiện trước khi nhập giá trị
    await page.waitForSelector(inputSelector);

    // Nhập giá trị vào ô input
    await page.type(inputSelector, `Du lịch ${place}`);

    // click vào ô input bởi vì nó đang bị click trên URL
    await page.click(inputSelector);

    // Submit giá trị bằng phím Enter
    await page.keyboard.press("Enter");

    // Chờ cho trang web xử lý và đưa ra kết quả
    await page.waitForNavigation();

    // click vào nút more
    await page.click(".GtiGue.wB1u7d button");

    // Chờ một khoảng thời gian sau khi click (ví dụ: 3 giây)
    await new Promise((r) => setTimeout(r, PAGE_lOAD_DELAY));

    // Scroll to the end of the page
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });

    // Sử dụng page.evaluate để thực hiện các lệnh trong môi trường trình duyệt
    const data = await page.evaluate(
      async (IMAGE_LOAD_DELAY, BUTTON_CLICK_DELAY) => {
        const listItem = document.querySelectorAll(
          "div.f4hh3d[role='listitem']"
        );
        const dataTemp = [];

        for (let i = 0; i < listItem.length; i++) {
          const item = listItem[i];

          item.querySelector("img").click();
          await new Promise((resolve) => setTimeout(resolve, IMAGE_LOAD_DELAY));
          const buttonPrev = document.querySelector(
            'div[jsname="rf24F"]:not([soy-skip]) button'
          );
          const buttonNext = document.querySelector(
            'div[jsname="v6lL4e"]:not([soy-skip]) button'
          );
          const wrapperEle = document.querySelector(
            'div[jsname="BEZjkb"] div[jsslot].NBZP0e.xbmkib'
          );
          if (wrapperEle) {
            const lastChild = wrapperEle.lastElementChild;
            const firstChild = wrapperEle.firstElementChild;
            let rightAll = false,
              leftAll = false;

            if (buttonNext) {
              while (true) {
                if (!rightAll) buttonNext.click();
                else buttonPrev.click();
                await new Promise((resolve) =>
                  setTimeout(resolve, BUTTON_CLICK_DELAY)
                );
                const containerRect = wrapperEle.getBoundingClientRect(); // Kích thước và vị trí của khung nhìn
                const lastItemRect = lastChild.getBoundingClientRect(); // Kích thước và vị trí của phần tử cuối cùng
                const firstItemRect = firstChild.getBoundingClientRect(); // Kích thước và vị trí của phần tử đầu tiên

                // Kiểm tra xem phần tử cuối cùng đã được kéo vào khung nhìn hay chưa
                if (lastItemRect.right <= containerRect.right) {
                  rightAll = true;
                }

                // Kiểm tra xem phần tử đầu tiên đã được kéo vào khung nhìn hay chưa
                if (firstItemRect.left >= containerRect.left) {
                  leftAll = true;
                }

                if (rightAll && leftAll) break;
              }
            }
          }
          const imageWrappers = document.querySelectorAll("div.QtzoWd img");
          const imageList = Array.from(imageWrappers).map((image) => image.src);

          const nameElement = item.querySelector("div.skFvHc.YmWhbc");
          const ratingElement = item.querySelector("span.KFi5wf.lA0BZ");
          const numOfVoteElement = item.querySelector("span.jdzyld.XLC8M");
          const descriptionElement = item.querySelector("div.nFoFM");
          const imageElement = item.querySelector("img");

          const name = nameElement ? nameElement.textContent : "";
          const rating = ratingElement ? ratingElement.textContent : "";
          const numOfVote = numOfVoteElement
            ? numOfVoteElement.textContent
            : "";
          const description = descriptionElement
            ? descriptionElement.textContent
            : "";
          const imageRepresent = imageElement ? imageElement.src : "";

          dataTemp.push({
            name,
            rating,
            numOfVote,
            description,
            imageRepresent,
            imageList,
          });
        }

        return dataTemp;
      },
      IMAGE_LOAD_DELAY,
      BUTTON_CLICK_DELAY
    );

    return data;

    return data;
  } catch (error) {
    console.error("Error:", error.message);
  }
};

const handleCrawl = async (req, res) => {
  const { place } = req.params;
  const result = await crawlWebsite(place);

  console.log(result.length);

  res.json(result);
};

// const dataExtraGeo = await Promise.all(
//   data.map(async (item) => ({
//     ...item,
//     location: await getCoordinates(`${item.name} in ${place}`),
//   }))
// );

// return dataExtraGeo;

module.exports = { handleCrawl };

// Sử dụng hàm crawlWebsite để crawl một trang web
crawlWebsite("Hà Tĩnh")
  .then((data) => {
    // console.log(data);
    console.log(data.length);
    if (data) {
      const jsonData = JSON.stringify(data, null, 2);

      fs.writeFile("data.txt", jsonData, (err) => {
        if (err) {
          console.error("Error writing to file:", err);
        } else {
          console.log("Data written to file successfully.");
        }
      });
    }
  })
  .catch((error) => {
    console.error("Error:", error.message);
  });

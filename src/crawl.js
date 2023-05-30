const puppeteer = require("puppeteer");
const fs = require("fs");

const URL = "https://www.google.com/travel/things-to-do";

const crawlWebsite = async function (place) {
  try {
    const browser = await puppeteer.launch();
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
    await new Promise((r) => setTimeout(r, 3000));

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
    const data = await page.evaluate(() => {
      const listItem = document.querySelectorAll("div.f4hh3d[role='listitem']");
      const dataTemp = Array.from(listItem).map((item) => {
        const nameElement = item.querySelector("div.skFvHc.YmWhbc");
        const ratingElement = item.querySelector("span.KFi5wf.lA0BZ");
        const numOfVoteElement = item.querySelector("span.jdzyld.XLC8M");
        const descriptionElement = item.querySelector("div.nFoFM");
        const imageElement = item.querySelector("img");
        console.log(
          "🚀 ~ file: crawl.js:53 ~ dataTemp ~ imageElement:",
          imageElement.src
        );
        // await new Promise((r) => setTimeout(r, 1000));

        const name = nameElement ? nameElement.textContent : "";
        const rating = ratingElement ? ratingElement.textContent : "";
        const numOfVote = numOfVoteElement ? numOfVoteElement.textContent : "";
        const description = descriptionElement
          ? descriptionElement.textContent
          : "";
        const imageRepresent = imageElement ? imageElement.src : "";

        return {
          name,
          rating,
          numOfVote,
          description,
          imageRepresent,
        };
      });

      return dataTemp;
    });

    return data;
    // await browser.close();
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

module.exports = { handleCrawl };

// Sử dụng hàm crawlWebsite để crawl một trang web
// crawlWebsite("https://www.google.com/travel/things-to-do")
//   .then((data) => {
//     console.log(data);
//     console.log(data.length);
//     if (data) {
//       const jsonData = JSON.stringify(data, null, 2);

//       fs.writeFile("data.txt", jsonData, (err) => {
//         if (err) {
//           console.error("Error writing to file:", err);
//         } else {
//           console.log("Data written to file successfully.");
//         }
//       });
//     }
//   })
//   .catch((error) => {
//     console.error("Error:", error.message);
//   });

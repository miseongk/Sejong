const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("chromedriver").path;
const { By } = require("selenium-webdriver");
const cheerio = require("cheerio");

const _query = require("../../database/db");

const uis_login = async (id, pw) => {
  const service = new chrome.ServiceBuilder(path).build();
  chrome.setDefaultService(service);

  const options = new chrome.Options();
  options.excludeSwitches("enable-logging");
  options.ignoreSynchronization = true;
  options.addArguments("--no-sandbox");
  options.addArguments("--window-size=1920,1080");
  options.headless();

  const chromeCapabilities = webdriver.Capabilities.chrome();
  chromeCapabilities.set("ChromeOptions", options);
  chromeCapabilities.setPageLoadStrategy("eager");

  const driver = await new webdriver.Builder()
    .withCapabilities(chromeCapabilities)
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  let message = "";
  let major = "";
  let name = "";

  try {
    await driver.get(
      "https://portal.sejong.ac.kr/jsp/login/loginSSL.jsp?rtUrl=classic.sejong.ac.kr/ssoLogin.do"
    );
    const checked = await driver.findElement(By.xpath('//*[@id="chkNos"]'));
    if (checked) {
      await driver.findElement(By.xpath('//*[@id="chkNos"]')).click();
      const alert = await driver.switchTo().alert();
      await alert.accept();
    }
    const uis_id = await driver.findElement(By.id("id"));
    const uis_pw = await driver.findElement(By.id("password"));
    uis_id.clear();
    uis_id.sendKeys(id);
    uis_pw.sendKeys(pw);

    await driver.findElement(By.id("loginBtn")).click();

    //학과, 이름 가져오기
    try {
      await driver.switchTo().frame(0);
      message = "Login success";
      try {
        await driver.wait(() => {
          return false;
        }, 1000);
      } catch (err) {}
      await driver.findElement(By.className("box02")).click();
      const html = await driver.getPageSource();
      const $ = cheerio.load(html);
      major = $("li:nth-child(1) dl dd", ".tblA").text();
      name = $("li:nth-child(3) dl dd", ".tblA").text();
    } catch (e) {}
    try {
      await driver.wait(() => {
        return false;
      }, 2000);
    } catch (err) {}
  } catch (e) {
    throw e;
  } finally {
    driver.quit();
  }

  return { message, major, name };
};

router.post("/signin", async (req, res) => {
  let query_response = {};

  const student_id = req.body.student_id;
  const password = req.body.password;

  //포탈 로그인
  const login_result = await uis_login(student_id, password);
  //로그인 성공
  if (login_result.message == "Login success") {
    query_response.data = await _query(
      `SELECT student_id, name, major FROM User WHERE student_id=${student_id};`
    );
    //DB 추가
    if (query_response.data.length == 0) {
      await _query(
        `INSERT INTO User (student_id, name, major) VALUES (${student_id}, '${login_result.name}', '${login_result.major}');`
      );
      query_response.data = {
        student_id: student_id,
        name: login_result.name,
        major: login_result.major,
      };
    }
    query_response.token = jwt.sign(
      {
        student_id: student_id,
        name: login_result.name,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "12h",
      },
      {
        algorithm: "RS256",
      }
    );
  }
  //로그인 실패
  else {
    res.status(400);
    query_response.message = "You entered incorrect information.";
  }
  res.send(query_response);
});

module.exports = router;

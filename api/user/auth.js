const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const webdriver = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const path = require("chromedriver").path;
const { By } = require("selenium-webdriver");

const _query = require("../../database/db");

const uis_login = async (id, pw) => {
  const service = new chrome.ServiceBuilder(path).build();
  chrome.setDefaultService(service);

  const options = new chrome.Options();
  options.excludeSwitches("enable-logging");
  options.ignoreSynchronization = true;
  //options.setMobileEmulation({ deviceName: "Google Nexus 5" });
  options.headless();

  const chromeCapabilities = webdriver.Capabilities.chrome();
  chromeCapabilities.set("ChromeOptions", options);
  chromeCapabilities.setPageLoadStrategy("eager");

  const driver = await new webdriver.Builder()
    .withCapabilities(chromeCapabilities)
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  let message = "Login success";
  try {
    await driver.get(
      "https://portal.sejong.ac.kr/jsp/login/loginSSL.jsp?rtUrl=classic.sejong.ac.kr/ssoLogin.do"
    );
    const checked = await driver.findElement(By.xpath('//*[@id="chkNos"]'));
    if (checked) {
      await driver.findElement(By.xpath('//*[@id="chkNos"]')).click();
      const alert = await driver.switchTo().alert();
      // .then((promise) => promise.accept())
      // .catch((e) => console.log("no alert\n" + e));
      await alert.accept();
    }
    const uis_id = await driver.findElement(By.id("id"));
    const uis_pw = await driver.findElement(By.id("password"));
    uis_id.clear();
    //uis_pw.clear();
    uis_id.sendKeys(id);
    uis_pw.sendKeys(pw);

    const login_btn = await driver.findElement(By.id("loginBtn"));
    login_btn.click();

    await driver
      .switchTo()
      .alert()
      .then((promise) => {
        promise.accept();
        message = "Login failed";
      })
      .catch((e) => console.log("no alert\n" + e));

    driver.switchTo().parentFrame();
    try {
      await driver.wait(() => {
        return false;
      }, 2000);
    } catch (err) {}
  } catch (e) {
    console.log("failed");
    message = "Wrong information";
    throw e;
  } finally {
    driver.quit();
    console.log("chromedriver quit");
  }

  return message;
};

/*
포탈로그인 -> 로그인 성공 -> DB 조회 -> 없으면 추가
          -> 로그인 실패 
*/

router.post("/signin", async (req, res) => {
  let query_response = {};

  const student_id = req.body.student_id;
  const password = req.body.password;

  //포탈 로그인
  const login_result = await uis_login(student_id, password);
  console.log(login_result);
  //로그인 성공
  if (login_result == "Login success") {
    query_response.data = await _query(
      `SELECT student_id,name FROM User WHERE student_id=${student_id};`
    );
    //DB 추가
    if (query_response.data.length == 0) {
      await _query(`INSERT INTO User (student_id) VALUES (${student_id});`);
      query_response.data = {
        student_id: student_id,
      };
    }

    query_response.token = jwt.sign(
      {
        student_id: query_response.data[0].student_id,
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

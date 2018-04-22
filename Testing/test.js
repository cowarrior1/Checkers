var webdriver = require('selenium-webdriver'),
  By = webdriver.By,
  Keys = webdriver.Key;
var until = webdriver.until;
var driver = new webdriver.Builder().forBrowser('chrome').build();

driver.get('http://localhost:8080');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//4.1.3 StartGame Scenario
startGame();
//goes to waiting screen after startGame is clicked
async function startGame(){
  let button = await driver.wait(
    until.elementLocated(By.id('startGame')), 20000);
    await sleep(2000);
    button.click();
    secondPlayerJoin();
}

//second player connects
function secondPlayerJoin(){
  console.log('inside secondPlayerJoin');
  sleep(2000);
  driver.executeScript('window.open("http://localhost:8080");');
}

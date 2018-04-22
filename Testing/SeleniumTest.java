import org.openqa.selenium.Alert;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.StaleElementReferenceException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedCondition;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

import java.awt.AWTException;
import java.awt.Robot;
import java.awt.event.KeyEvent;
import java.util.ArrayList;
import java.util.concurrent.TimeUnit;

import org.junit.Test;

public class NewNodejsTest {
	protected final String uiPath = "http://localhost:8080";
	WebDriver driver = new ChromeDriver();

	// checks the webelements in homepage
	@Test
	public void visitHomepage() {
		try {
			driver.get(uiPath);
			WebElement startGame = driver.findElement(By.id("startGame"));
			WebElement exitGame = driver.findElement(By.id("exitGame"));
			assertEquals(startGame, driver.findElement(By.id("startGame")));
			assertEquals(exitGame, driver.findElement(By.id("exitGame")));
		} finally {
			driver.quit();
		}
	}

	// goes to homepage and checks the url status of current page
	@Test
	public void firstPlayerConnection() {
		try {
			driver.get(uiPath);
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			WebElement startGame = driver.findElement(By.id("startGame"));
			startGame.click();
			WebElement gif = driver.findElement(By.id("loading"));
			assertEquals(gif, driver.findElement(By.id("loading")));
			assertEquals("http://localhost:8080/Waiting", driver.getCurrentUrl());
		} finally {
			driver.quit();
		}
	}

	// Tests for second player connection
	@Test
	public void secondPlayerConnection() throws AWTException, InterruptedException {
		try {
			// First Player Connection
			driver.get(uiPath);
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			WebElement startGame = driver.findElement(By.id("startGame"));
			startGame.click();
			WebElement gif = driver.findElement(By.id("loading"));
			assertEquals(gif, driver.findElement(By.id("loading")));
			assertEquals("http://localhost:8080/Waiting", driver.getCurrentUrl());
			// To open a new tab to establish second player connection
			((JavascriptExecutor) driver).executeScript("window.open('about:blank', '-blank')");
			// To switch to the new tab
			ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
			driver.switchTo().window(tabs.get(1));
			// To navigate to new link/URL in 2nd new tab
			driver.get("http://localhost:8080");
			assertEquals("http://localhost:8080/", driver.getCurrentUrl());
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			WebElement secondstartGame = driver.findElement(By.id("startGame"));
			secondstartGame.click();
			// GameScreen loaded
			WebElement checkerBoard = driver.findElement(By.className("middle-container"));
			assertEquals(checkerBoard, driver.findElement(By.className("middle-container")));
			WebElement leftContainer = driver.findElement(By.className("left-container"));
			assertEquals(leftContainer, driver.findElement(By.className("left-container")));
			assertEquals("http://localhost:8080/Main", driver.getCurrentUrl());
		} finally {
			driver.quit();
		}
	}

	// Tests connected ports, webpage elements, webpage screens, pieces click
	// events..etc
	@Test
	public void pieceHighlightAndDeselect() {
		try {
			// First Player Connection
			driver.get(uiPath);
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			WebElement startGame = driver.findElement(By.id("startGame"));
			startGame.click();
			WebElement gif = driver.findElement(By.id("loading"));
			assertEquals(gif, driver.findElement(By.id("loading")));
			assertEquals("http://localhost:8080/Waiting", driver.getCurrentUrl());
			// To open a new tab to establish second player connection
			((JavascriptExecutor) driver).executeScript("window.open('about:blank', '-blank')");
			// To switch to the new tab
			ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
			driver.switchTo().window(tabs.get(1));
			// To navigate to new link/URL in 2nd new tab
			driver.get("http://localhost:8080");
			assertEquals("http://localhost:8080/", driver.getCurrentUrl());
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			WebElement secondstartGame = driver.findElement(By.id("startGame"));
			secondstartGame.click();
			// GameScreen loaded
			WebElement checkerBoard = driver.findElement(By.className("middle-container"));
			assertEquals(checkerBoard, driver.findElement(By.className("middle-container")));
			WebElement leftContainer = driver.findElement(By.className("left-container"));
			assertEquals(leftContainer, driver.findElement(By.className("left-container")));
			assertEquals("http://localhost:8080/Main", driver.getCurrentUrl());
			// PawnPieceSelected
			// Xpath way-->not recommend
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			// check the turn
			WebElement turn = driver.findElement(By.xpath("/html/body/div[1]"));
			String stringTurn = turn.getText();
			if (stringTurn.equals("Wait for your turn")) {
				assertEquals("Wait for your turn", stringTurn);
				// switch the tab
				driver.switchTo().window(tabs.get(0));
				// checks the turn matches
				WebElement newTurn = driver.findElement(By.xpath("/html/body/div[1]"));
				String newTurnText = newTurn.getText();
				assertEquals("Your Turn", newTurnText);
			}
			else {
				assertEquals("Your Turn", stringTurn);
			}
			WebElement checkerTable = driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[3]/td[2]/div"));
			checkerTable.click();
			String borderColor = checkerTable.getCssValue("box-shadow");
			assertEquals("rgb(7, 206, 74) 0px 0px 10px 5px", borderColor);
			// possible move location displayed
			WebElement possibleMove1 = driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[4]/td[1]/div"));
			WebElement possibleMove2 = driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[4]/td[3]/div"));
			String move1Color = possibleMove1.getCssValue("box-shadow");
			String move2Color = possibleMove2.getCssValue("box-shadow");
			assertEquals("rgb(160, 11, 230) 0px 0px 10px 5px", move1Color);
			assertEquals("rgb(160, 11, 230) 0px 0px 10px 5px", move2Color);

		} finally {
			driver.quit();
		}
	}

	// tests whole game including pieces moves
	@Test
	public void game() {
		try {
			// First Player Connection
			driver.get(uiPath);
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			WebElement startGame = driver.findElement(By.id("startGame"));
			startGame.click();
			WebElement gif = driver.findElement(By.id("loading"));
			assertEquals(gif, driver.findElement(By.id("loading")));
			assertEquals("http://localhost:8080/Waiting", driver.getCurrentUrl());
			// To open a new tab to establish second player connection
			((JavascriptExecutor) driver).executeScript("window.open('about:blank', '-blank')");
			// To switch to the new tab
			ArrayList<String> tabs = new ArrayList<String>(driver.getWindowHandles());
			driver.switchTo().window(tabs.get(1));
			// To navigate to new link/URL in 2nd new tab
			driver.get("http://localhost:8080");
			assertEquals("http://localhost:8080/", driver.getCurrentUrl());
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			WebElement secondstartGame = driver.findElement(By.id("startGame"));
			secondstartGame.click();
			// GameScreen loaded
			WebElement checkerBoard = driver.findElement(By.className("middle-container"));
			assertEquals(checkerBoard, driver.findElement(By.className("middle-container")));
			WebElement leftContainer = driver.findElement(By.className("left-container"));
			assertEquals(leftContainer, driver.findElement(By.className("left-container")));
			assertEquals("http://localhost:8080/Main", driver.getCurrentUrl());
			// PawnPieceSelected
			driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
			// check the turn
			WebElement turn = driver.findElement(By.xpath("/html/body/div[1]"));
			String stringTurn = turn.getText();
			if (stringTurn.equals("Wait for your turn")) {
				assertEquals("Wait for your turn", stringTurn);
				// switch the tab
				driver.switchTo().window(tabs.get(0));
				// checks the turn matches
				WebElement newTurn = driver.findElement(By.xpath("/html/body/div[1]"));
				String newTurnText = newTurn.getText();
				assertEquals("Your Turn", newTurnText);
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[3]/td[4]/div")).click();
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[4]/td[5]")).click();
				driver.switchTo().window(tabs.get(1));
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[6]/td[3]/div")).click();
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[5]/td[4]")).click();
				driver.switchTo().window(tabs.get(0));
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[4]/td[5]/div")).click();
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[6]/td[3]")).click();
				String score = driver.findElement(By.xpath("/html/body/div[2]/div[1]/div")).getText();
				assertEquals("1", score); //checking the score

			}
			else {
				assertEquals("Your Turn", stringTurn);
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[3]/td[4]/div")).click();
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[4]/td[5]")).click();
				driver.switchTo().window(tabs.get(0));
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[6]/td[3]/div")).click();
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[5]/td[4]")).click();
				driver.switchTo().window(tabs.get(1));
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[4]/td[5]/div")).click();
				driver.findElement(By.xpath("/html/body/div[2]/div[2]/table/tr[6]/td[3]")).click();
				String score = driver.findElement(By.xpath("/html/body/div[2]/div[1]/div")).getText();
				assertEquals("1", score);
			}

		} finally {
			driver.quit();
		}
	}
}

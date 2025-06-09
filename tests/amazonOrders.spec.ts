import { test, expect, Page } from '@playwright/test';
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';

test('Amazon Orders', async ({ page }) => {
  // Go to Amazon  
  await page.goto('https://www.amazon.com');

  // Login to Amazon Orders
  await login_amazon(page)  

  // Read parameters
  let parameters = await getParameters()

  // Declare file content array
  let fileContent: any[] = []

  // Read UI Orders to file content
  let proceed = true
  while (proceed) {
    proceed = await readPage(page, fileContent, parameters) ?? false
    if (proceed) {
      await expect(page.getByRole('link', { name: 'Next →' })).toBeVisible();
      await page.getByRole('link', { name: 'Next →' }).click();
    }
  }
  
  // Write data to file
  writeToFile(fileContent)

});

test('Pay Orders', async ({ page }) => {
  // Go to Amazon
  // await page.goto('https://www.discover.com');
  // await page.goto('https://www.discovercard.com/cardmembersvcs/loginlogout/app/ac_main?TYPE=33554433&REALMOID=06-0002361d-a8e6-1425-9d8f-5f27aad9306d&GUID=&SMAUTHREASON=0&METHOD=GET&SMAGENTNAME=-SM-EHDGTgiKFBoJpguJbt8U7OlKqSNptavVvNicV5eFIroRwXzw3mKgSudzyHZxDm%2bKD2z0mHIpeX2IIMTizVmPVUHtyVE3%2fKQoBADqqvXwHyVWEVzPq0YGKb5%2fm6FXA2lP&TARGET=-SM-https%3a%2f%2fwww%2ediscovercard%2ecom%2fcardmembersvcs%2fstatements%2fapp%2fstmt');
  // await page.goto('https://portal.discover.com/customersvcs/universalLogin/ac_main?link=%2Fcardmembersvcs%2Fepay%2Fapp%2FpaymentInfoInput')
  // // Login to Amazon Orders
  // await login_pay(page)  

//   // Read parameters
//   let parameters = await getParameters()

//   // Declare file content array
//   let fileContent: any[] = []

//   // Read UI Orders to file content
//   let proceed = true
//   while (proceed) {
//     proceed = await readPage(page, fileContent, parameters) ?? false
//     if (proceed) {
//       await expect(page.getByRole('link', { name: 'Next →' })).toBeVisible();
//       await page.getByRole('link', { name: 'Next →' }).click();
//     }
//   }
  
//   // Write data to file
//   writeFile(fileContent)

});

async function login_amazon(page: Page) {
  let target = resolve(__dirname, '..')
  let path = join(target, 'myFolder', 'login.json')
  if (existsSync(path)) {

    // Go to Orders
    await expect(page.getByRole('link', { name: 'Your Account' })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('link', { name: 'Your Account' }).click();
    await expect(page.getByRole('link', { name: 'Returns & Orders' })).toBeVisible();
    await page.getByRole('link', { name: 'Returns & Orders' }).click();
    
    // Login
    let loginData = JSON.parse(readFileSync(path, 'utf8'))
    await expect(page.getByText('Email or mobile phone number', { exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Email or mobile phone number' }).click();
    await page.getByRole('textbox', { name: 'Email or mobile phone number' }).fill(loginData.amazon_user);
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible();
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByText('Password', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill(loginData.amazon_password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  }
};

async function login_pay(page: Page) {
  let target = resolve(__dirname, '..')
  let path = join(target, 'myFolder', 'login.json')
  if (existsSync(path)) {
    let loginData = JSON.parse(readFileSync(path, 'utf8'))
    await expect(page.getByRole('textbox', { name: 'User ID' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In', exact: true })).toBeVisible();
    await page.getByRole('textbox', { name: 'User ID' }).click();
    await page.getByRole('textbox', { name: 'User ID' }).fill('iobertas');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('SerejaSerafim7$');
    await page.getByRole('button', { name: 'Log In', exact: true }).click();
    await page.getByText('Outdated browsers can expose').click();


    await expect(page.getByTestId('user-id-input').getByTestId('dfs-react-ui__input')).toBeVisible();
    await expect(page.getByTestId('password-input').getByTestId('dfs-react-ui__input')).toBeVisible();
    await expect(page.getByTestId('log-in')).toBeVisible();
    await page.getByTestId('user-id-input').getByTestId('dfs-react-ui__input').click();
    await page.getByTestId('user-id-input').getByTestId('dfs-react-ui__input').fill('iobertas');
    await page.getByTestId('password-input').getByTestId('dfs-react-ui__input').click();
    await page.getByTestId('password-input').getByTestId('dfs-react-ui__input').fill('SerejaSerafim7$');
    await page.getByTestId('log-in').click();
    await page.getByTestId('log-in').click();
    
  }
};

async function getParameters() {
  let target = resolve(__dirname, '..')
  let path = join(target, 'myFolder', 'parameters.json')
  if (!existsSync(path)) {
    throw new Error ('Failed to find ../myFolder/parameters.json')  
  }
  let parameters = JSON.parse(readFileSync(path, 'utf8'))
  if (parameters && !parameters.months) {
    throw new Error (`Failed to find 'parameters Month' in ../myFolder/parameters.json`)  
  }
  return parameters
}

async function readPage(page: Page, fileContent: any, parameters: any) {

  //div[@class='a-box-inner']//span[text()='Order placed']
  //div[@class='a-box-inner']//span[text()='Order placed']//..//../div[@class='a-row']//span
  //div[@class='a-box-inner']//span[text()='Total']
  //div[@class='a-box-inner']//span[text()='Total']//..//../div[@class='a-row']//span
  //div[@class='a-box-inner']//span[text()='Ship to']
  //div[@class='a-box-inner']//span[text()='Ship to']//..//..//..//div//a
  //div[@class='a-box-inner']//span[text()='Order #']
  //div[@class='a-box-inner']//span[text()='Order #']//..//span[@dir='ltr']

  //div[@class='a-box delivery-box']//ul//li//div[contains(@class, 'product-title')]//a


  let total = 'Total'
  let orderPlaced = 'Order placed'  
  let shipTo = 'ShipTo'
  let orderN = 'Order #'

  let l_box = `//div[@class='a-box-inner']`
  await expect(page.locator(l_box).first()).toBeVisible({ timeout: 10_000 });

  let l_orderCards = `//li[@class='order-card__list']`
  let l_total = `${l_box}//span[text()='${total}']//..//..//div[@class='a-row']//span`
  let l_orderPlaced = `${l_box}//span[text()='${orderPlaced}']//..//..//div[@class='a-row']//span`  
  // let l_shipTo = `${l_box}//span[text()='${shipTo}']//..//..//..//div//a`  
  let l_orderN = `${l_box}//span[text()='${orderN}']//..//span[@dir='ltr']`  
  let l_grid_rows = `//div[@class='a-box delivery-box']`
  let l_grid_row = `//div[@class='a-row']//h3//span`
  

  await expect(page.locator(l_orderCards).first()).toBeVisible();
  await expect(page.locator(l_orderCards).last()).toBeVisible();
  let count = await page.locator(l_orderCards).count();
  for (let i = 0; i < count; i++) {
    await expect(page.locator(l_orderPlaced).nth(i)).toBeVisible();
    let file_orderPlaced = await page.locator(l_orderPlaced).nth(i).innerText();
    let monthDay = file_orderPlaced.split('=')
    let month = monthDay[0].split(' ')[0].trim()    
    if (!(parameters.months.indexOf(month) >= 0)) {
      return false
    }
    
    await expect(page.locator(l_orderCards).nth(i).locator(l_grid_rows).first()).toBeVisible();
    await expect(page.locator(l_orderCards).nth(i).locator(l_grid_rows).last()).toBeVisible();
    let l_grid_rows_count = await page.locator(l_orderCards).nth(i).locator(l_grid_rows).count();
    let item = ''
    for (let j = 0; j < l_grid_rows_count; j++) {
      await expect(page.locator(l_orderCards).nth(i).locator(l_grid_rows).nth(j).locator(l_grid_row)).toBeVisible();
      let file_delivered: String = await page.locator(l_orderCards).nth(i).locator(l_grid_rows).nth(j).locator(l_grid_row).innerText();
      if (j == 0) {
        await expect(page.locator(l_total).nth(i)).toBeVisible();
        let file_total = await page.locator(l_total).nth(i).innerText();
        await expect(page.locator(l_orderN).nth(i)).toBeVisible();
        let file_orderN = await page.locator(l_orderN).nth(i).innerText();        
        console.log(file_total);
        console.log(file_orderPlaced);
        // console.log(await page.locator(l_shipTo).nth(i).textContent());         
        console.log(file_delivered);
        console.log(file_orderN);
        item = `${total}=${file_total}:Placed=${file_orderPlaced}:${file_delivered}:${orderN}=${file_orderN}`
      } else {
        item = item.replace(orderN, `${file_delivered}:${orderN}`)
      }
      if (j == (l_grid_rows_count - 1)) {
        fileContent.push(item);      
      }      
    }        
  }
  return true
}

async function writeToFile(fileContent: any) {
  let target = resolve(__dirname, '..')
  let path = join(target, 'myFolder', 'AmazonResult')
  if (!existsSync(path)) {
    mkdirSync(path);
  }

  let fileName = `result_${(new Date).toDateString()}.json`
  let pathToFile = join(path, fileName)
  if (existsSync(pathToFile)) {
    unlinkSync(pathToFile)
  }

  let jsonStr = JSON.stringify(fileContent, null, 2);
  writeFileSync(pathToFile, jsonStr, {
    flag: 'w',
  });
}

const puppeteer = require('puppeteer')
const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')

module.exports = class Page {
  static async build() {

    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();

    const customPage = new Page(page, browser);
    return new Proxy(customPage, {
      get: function(target, prop) {
        return customPage[prop] || browser[prop] || page[prop]
      }
    })
  }

  constructor(page, browser) {
    this.page = page;
    this.browser = browser;
  }

  async close() {
    this.browser.close()
  }

  async login() {
    const User = await userFactory();
    const { session, sig } = sessionFactory(User);
  
    await this.page.setCookie({ name: 'session', value: session })
    await this.page.setCookie({ name: 'session.sig', value: sig })
    await this.page.goto('localhost:3000/blogs')
  
    await this.page.waitFor('a[href="/auth/logout"]')
  }

  async getContentsOf(selector) {
    return this.page.$eval(selector, $el => $el.innerHTML)
  }
}

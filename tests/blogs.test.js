const Page = require('./helpers')
let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000')
})

afterEach(async () => {
  await page.close()
})



describe('When Logged In', async () => {
  beforeEach(async () => {
    await page.login()
    await page.click('a.btn-floating')
  })

  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form .title label')
    expect(label).toEqual('Blog Title')
  })

  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'Example Title')
      await page.type('.content input', 'Example Input')

      await page.click('form button')
    })
    test('Submitting takes user to review screen', async () => {
      const header = await page.getContentsOf('h5')
      expect(header).toEqual('Please confirm your entries')
    })

    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green')
      await page.waitFor('.card')
      const cardTitle = await page.getContentsOf('.card-title')
      const cardContent = await page.getContentsOf('p')

      expect(cardTitle).toEqual('Example Title')
      expect(cardContent).toEqual('Example Input')
    })
  })
  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button')
    })
    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text')
      const contentError = await page.getContentsOf('.content .red-text')

      expect(titleError).toEqual('You must provide a value')
      expect(contentError).toEqual('You must provide a value')
    })
  })
})

describe('When not logged in', async () => {
  test('User cannot create blog post', async () => {
    const result = await page.evaluate(() => {
      return fetch('/api/blogs', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Title',
          content: 'content',
        })
      }).then(res => res.json())
    })

    expect(result).toEqual({ error: 'You must log in!'})
  })
})

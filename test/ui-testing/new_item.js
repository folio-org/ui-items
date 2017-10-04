module.exports.test = function(uiTestCtx) {

  describe('Module test: items:new_item', function () {
    const { config, helpers: { openApp }, meta: { testVersion } } = uiTestCtx;
    this.timeout(Number(config.test_timeout))

    const nightmare = new Nightmare(config.nightmare);

    describe("Login > Create new item > Confirm creation > Edit item > Confirm changes > Logout\n", () => {

      var ts = new Date().valueOf()
      var barcode = ts

      flogin = function(un, pw) {
        it('should login as ' + un + '/' + pw, done => {
          nightmare
          .on('page', function(type="alert", message) {
             throw new Error(message)
          })
          .goto(config.url)
          .wait(Number(config.login_wait))
          .insert(config.select.username, un)
          .insert(config.select.password, pw)
          .click('#clickable-login')
          .wait('#UserMenuDropDown')
          .wait(555)
          .then(result => { done() })
          .catch(done)
        }) 
      }
      flogout = function() {
        it('should logout', done => {
          nightmare
          .click('#clickable-logout')
          .wait(config.select.username)
          .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
          .end()
          .then(result => { done() })
          .catch(done)
        })
      }
      flogin(config.username, config.password)
      it('should open items app', done => {
        nightmare
        .use(openApp(nightmare, config, done, 'items', testVersion))
        .then(result => result )
      })
      it('should create item with barcode: ' + barcode, done => {
        nightmare
        .wait('#clickable-new-item')
        .click('#clickable-new-item')
        .wait('#additem_title')
        .wait(200)
        .type('#additem_title', 'Giant steps')
        .type('#additem_materialType', 'b')
        .type('#additem_barcode', barcode)
        .wait(200)
        .type('#additem_location', 'Storage')
        .type('#additem_loanTypePerm', 'c')
        .type('#additem_loanTypeTemp', 'r')
        .click('#clickable-create-item')
        .wait(200)
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 0) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should find item with barcode: ' + barcode, done => {
        nightmare
        .wait('input[placeholder=Search')
        .wait(222)
        .type('input[placeholder=Search', barcode)
        .wait('div[title="' + barcode + '"]')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should edit item', done => {
        nightmare
        .click('div[title="' + barcode + '"]')
        .wait('#clickable-edit-item')
        .click('#clickable-edit-item')
        .wait('#additem_title')
        .type('#additem_title', ' (revised edition)')
        .wait(222)
        .click('#clickable-update-item')
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
        .then(result => { done() })
        .catch(done)
      })
      it('should confirm changes', done => {
        nightmare
        .wait(function(bc) {
          var xp = document.evaluate( '//div[starts-with(@class,"kvValue")][contains(.,"revised")]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          try { 
            var val = xp.singleNodeValue.innerHTML
            return true
          } catch(e) {
            return false
          } 
        }, barcode)
        .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 0) // debugging
        .then(result => { done() })
        .catch(done)
      })
      flogout();
    })
  })
}

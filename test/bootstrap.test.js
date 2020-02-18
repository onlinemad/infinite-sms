global.config = require('./config.mocha.json')

global.now = () => { return (new Date()).toLocaleString() }

before((done) => {
  done()
})

after((done) => {
  done()
})
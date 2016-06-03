import 'babel-polyfill'
import expect from 'expect'
import Promise from 'bluebird'
global.expect = expect
global.Promise = Promise
global.logger = {
  info: () => {return null},
  warn: () => {return null},
  error: () => { return null},
}

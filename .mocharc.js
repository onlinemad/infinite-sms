'use strict'

// Here's a JavaScript-based config file.
// If you need conditional logic, you might want to use this type of config.
// Otherwise, JSON or YAML is recommended.

module.exports = {
  exit: true,
  recursive: true,
  reporter: 'spec',
  require: 'should',
  slow: 300,
  timeout: 100000,
  ui: 'bdd'
}
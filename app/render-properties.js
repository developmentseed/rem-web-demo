
module.exports = function renderProperties (properties) {
  var rows = Object.keys(properties)
  .map(function (key) {
    return '<td>KEY</td><td>VALUE</td>'
      .replace('KEY', key)
      .replace('VALUE', properties[key])
  })
  .map(function (s) { return '<tr>' + s + '</tr>' })
  .join('\n')
  return '<table>\n' + rows + '</table>'
}

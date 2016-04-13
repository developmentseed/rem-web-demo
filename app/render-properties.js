var yo = require('yo-yo')

module.exports = function renderProperties (features) {
  return yo`<div class="feature-properties">
    ${features.map((f) => yo`
      <table>
        ${Object.keys(properties).map((key) => yo`
          <tr>
            <td>${key}</td>
            <td>${properties[key]}</td>
          </tr>
        `)}
      </table>
    `)}
  </div>
  `
}

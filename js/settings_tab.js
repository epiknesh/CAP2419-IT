document.addEventListener('DOMContentLoaded', function () {
  // Ensure the DOM is fully loaded before attaching event listeners
  const settingsTab = document.querySelector('#sidebar .side-menu:last-of-type li:nth-child(1) a');

  settingsTab.addEventListener('click', function (event) {
    event.preventDefault();
    const mainContent = document.querySelector('#content main');
    mainContent.innerHTML = `
      <h1>Work In Progress</h1>
    `;});

});
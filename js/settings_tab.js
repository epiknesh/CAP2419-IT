document.addEventListener('DOMContentLoaded', function () {

  //Import Css 
	const link  = document.createElement('link');
	link.rel='stylesheet';
	link.href='styles/modal.css';
	document.head.appendChild(link);
  
  // Ensure the DOM is fully loaded before attaching event listeners
  const settingsTab = document.querySelector('#sidebar .side-menu:last-of-type li:nth-child(1) a');

  settingsTab.addEventListener('click', function (event) {
    event.preventDefault();
    const mainContent = document.querySelector('#content main');
    mainContent.innerHTML = `
      <div class="head-title">
        <div class="left">
          <h1>Settings</h1>
          <ul class="breadcrumb">
            <li><a href="#">Settings</a></li>
            <li><i class='bx bx-chevron-right'></i></li>
            <li><a class="active" href="#">Settings</a></li>
          </ul>
        </div>
      </div>  
      
      <div class="table-data">
        <div class="order position-relative" id="settingsContent">
          <div class="head">
            <h3>Notification Settings</h3>
          </div>
          <table>
            <tbody>
              <div> 
                <div class="notification-title">
                  Bus Dispatch Notification 
                </div>
                <div class="notification-desc">
                  Be informed when the bus gets dispatched
                </div>
              </div> 
            </tbody>
          </table>
        </div>
      </div>

			 <div id="alertContainer"></div>

    `;});

});
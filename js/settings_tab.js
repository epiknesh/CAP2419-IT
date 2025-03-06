document.addEventListener('DOMContentLoaded', function () {
  // Dynamically import CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/styles.css';
  document.head.appendChild(link);


  const user = JSON.parse(localStorage.getItem('user'));

  const loggedEmail = user.email; // Replace with dynamically logged-in user's email
  const accountID = user.accountid; // Replace with actual logged-in user's accountID
  const service_id = "service_sgqumch";
  const template_id = "template_2rljx4t";

  const settingsTab = document.querySelector('#sidebar .side-menu:last-of-type li:nth-child(1) a');

  settingsTab.addEventListener('click', function (event) {
    event.preventDefault();

    fetch(`http://localhost:3000/settings/${accountID}`)
      .then(res => res.json())
      .then(settings => {
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
  <div class="order" id="settingsContent">
    <div class="head"><h3>Notification Settings</h3></div>
    <table class="table">
      <tbody>
        <tr>
          <td>
            <div class="notification-title">
              Bus Dispatch Notification
              <div class="notification-desc">
                Be notified when the bus is dispatched
              </div>
            </div>
          </td>
          <td>
            <label class="switch">
              <input type="checkbox" class="notification-checkbox" data-notif="dispatch_notif" ${settings.dispatch_notif ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </td>
        </tr>
        <tr>
          <td>
            <div class="notification-title">
              Passenger Load Notification
              <div class="notification-desc">
                Be informed of the load status when the bus reaches full capacity
              </div>
            </div>
          </td>
          <td>
            <label class="switch">
              <input type="checkbox" class="notification-checkbox" data-notif="capacity_notif" ${settings.capacity_notif ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </td>
        </tr>
        <tr>
          <td>
            <div class="notification-title">
              ETA Alert
              <div class="notification-desc">
                Be informed of the estimated time of arrival and its real-time destination update
              </div>
            </div>
          </td>
          <td>
            <label class="switch">
              <input type="checkbox" class="notification-checkbox" data-notif="eta_notif" ${settings.eta_notif ? 'checked' : ''}>
              <span class="slider round"></span>
            </label>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
<div id="alertContainer"></div>

        `;

        // After injecting HTML, attach listeners
        document.querySelectorAll('.notification-checkbox').forEach((checkbox) => {
          checkbox.addEventListener('change', function () {
            const notifField = this.getAttribute('data-notif');
            const state = this.checked;

            // Send email
            const templateParams = {
              to_email: loggedEmail,
              subject: `${notifField.replace('_', ' ')} Notification Changed`,
              message: `Your notification "${notifField}" is now ${state ? 'enabled' : 'disabled'}.`
            };

            emailjs.send(service_id, template_id, templateParams)
              .then(() => console.log('Email sent successfully!'))
              .catch((error) => console.error('Email send failed', error));

            // Update the setting in database via API
            fetch(`http://localhost:3000/settings/${accountID}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ [notifField]: this.checked })
            })
            .then(response => response.json())
            .then(data => console.log("Settings updated:", data))
            .catch(err => console.error('Failed to update setting:', err));
          });
        });
      })
      .catch(error => console.error('Failed to fetch settings:', error));
});

// Ensure EmailJS SDK is loaded before initialization
window.addEventListener('load', function () {
  if (!window.emailjs) {
    console.error("EmailJS SDK did not load. Check your network or script URL.");
    return;
  }
  emailjs.init("-d3fui43Avx0AbMV5"); // Replace with your EmailJS user ID
  
});
});

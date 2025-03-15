// Toast Notification Container
document.addEventListener("DOMContentLoaded", function () {
	//Import Css 
	const link  = document.createElement('link');
	link.rel='stylesheet';
	link.href='styles/modal.css';
	document.head.appendChild(link);

  const incomeBtn = document.getElementById('incomeBtn');
  const incomeTab = document.querySelector('#sidebar .side-menu.top li:nth-child(7) a');

  if (incomeBtn && incomeTab) {
    incomeBtn.addEventListener("click", function () {
      incomeTab.click(); // Simulates a click on the sidebar item
        console.log("Income button clicked");
    });
  } else {
      console.error("Income button or sidebar tab not found");
  }
  
  incomeTab.addEventListener('click', function (event) {
    const startCoords = [121.0253809, 14.5504493]; // [Longitude, Latitude]
const endCoords = [121.0434251, 14.41683]; // [Longitude, Latitude]
    calculateETA(startCoords, endCoords);
    event.preventDefault();
    const mainContent = document.querySelector('#content main');

    const user = JSON.parse(localStorage.getItem('user'));
        if (["2", "3", "4", "5"].includes(user.role)) {
            showAlert('You do not have permission to access this page.', 'danger');
            return;
        }

    mainContent.innerHTML = `
      <div class="head-title">
        <div class="left">
          <h1>Income</h1>
          <ul class="breadcrumb">
            <li><a href="#">Income</a></li>
            <li><i class='bx bx-chevron-right'></i></li>
            <li><a class="active" href="#">Income</a></li>
          </ul>
        </div>
      </div>
  
      <div class="table-data">
        <div class="order position-relative" id="incomeContent">
          <div class="head">
            <h3>Income Report</h3>
          </div>
          <table>
            <thead>
              <tr>
                <th>Bus ID</th>
                <th>Income This Week</th>
                <th>Income This Month</th>
                <th>Total Income</th>
              </tr>
            </thead>
            <tbody id="busIncomeTable">
              <tr><td colspan="5">Loading...</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="table-data">
        <div class="order position-relative" id="dailyIncome">
          <div class="head">
            <h3>Daily Income</h3>
            <a href="#" id="addDailyIncomeBtn" class="btn btn-success mb-4" data-bs-toggle="modal" data-bs-target="#incomeModal">
              <i class='bx bx-plus'></i> Add Daily Income
            </a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Bus ID</th>
                <th>Income Today</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="dailyIncomeTable">
              <tr><td colspan="5">Loading...</td></tr>
            </tbody>
          </table>
      </div>

			 <div id="alertContainer"></div>
    `;

    // Add event listener for the "Add Daily Income" button
    const addDailyIncomeBtn = document.getElementById('addDailyIncomeBtn');
    addDailyIncomeBtn.addEventListener('click', function (event) {
      event.preventDefault();
      showIncomeForm();
    });

    fetchIncomeData(); // Fetch and display data
  });
});

function fetchIncomeData() {
  fetch('http://localhost:3000/income')
    .then(response => response.json())
    .then(data => {
      const busIncomeTable = document.getElementById("busIncomeTable");
      const dailyIncomeTable = document.getElementById("dailyIncomeTable");

      busIncomeTable.innerHTML = ""; // Clear existing data
      dailyIncomeTable.innerHTML = ""; // Clear existing data

      if(data.length === 0){
        busIncomeTable.innerHTML = "<tr><td colspan='5'>No income data available</td></tr>";
        dailyIncomeTable.innerHTML = "<tr><td colspan='5'>No daily income data available</td></tr>";
      }

      data.sort((a, b) => a.busID - b.busID); // Sort bus IDs numerically

      //Populate Bus Income Table
      data.forEach(item => {
        const row = `
          <tr>
            <td>${item.busID}</td>
            <td>₱${item.incomeWeek.toFixed(2)}</td>
            <td>₱${item.incomeMonth.toFixed(2)}</td>
            <td>₱${item.totalIncome.toFixed(2)}</td>
          </tr>
        `;
        busIncomeTable.innerHTML += row;
      });

      //Populate Daily Income Table
      data.forEach(item => {
        if (item.incomeToday > 0) { // Ensure only valid daily income data is displayed
          const dailyRow = `
            <tr>
              <td>${item.busID}</td>
              <td>₱${item.incomeToday.toFixed(2)}</td>
              <td>${new Date().toISOString().split('T')[0]}</td> 
            </tr>
          `;
          dailyIncomeTable.innerHTML += dailyRow;
        }
      });
    })
    .catch(error => {
      console.error("Error fetching income data:", error);
      document.getElementById("busIncomeTable").innerHTML = "<tr><td colspan='5'>Failed to load data</td></tr>";
      document.getElementById("dailyIncomeTable").innerHTML = "<tr><td colspan='5'>Failed to load data</td></tr>";
    });
}

function showIncomeForm() {
  fetch('http://localhost:3000/income')
      .then(response => response.json())
      .then(data => {
        const busOptions = data
            .sort((a, b) => a.busID - b.busID) // Ensure sorting in the frontend
            .map(income => `<option value="${income.busID}">${income.busID}</option>`)
            .join('');


          const formHtml = `
              <div class="modal fade" id="incomeModal" tabindex="-1" aria-labelledby="incomeModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-md modal-dialog-centered">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h5 class="modal-title" id="incomeModalLabel">Add Daily Income</h5>
                      <button type="button" class="btn-close white-text" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <form id="incomeForm">
                         <div class="mb-3">
                          <label for="busId" class="form-label">Bus ID:</label>
                          <select class="form-select" id="busId" name="busId" required>
                            <option value="" selected disabled>Select Bus</option>
                            ${busOptions}
                          </select>
                        </div>
                        <div class="mb-3">
                          <label for="income" class="form-label">Today's Income:</label>
                          <input type="number" class="form-control" id="income" name="income" required>
                        </div>
                      </form>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                      <button type="button" class="btn btn-success" id="submitIncome">Submit</button>
                    </div>
                  </div>
                </div>
              </div>
          `;

          document.body.insertAdjacentHTML('beforeend', formHtml);
          document.getElementById('submitIncome').addEventListener('click', function () {
              const busId = document.getElementById('busId').value;
              const income = document.getElementById('income').value;
              
              if (busId && income) {
                  fetch('http://localhost:3000/update-income', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ busID: Number(busId), incomeToday: Number(income) })
                  })
                  .then(response => response.json())
                  .then(data => {
                      showAlert(data.message, 'success');
                      incomeModal.hide();
                      document.querySelector('#sidebar .side-menu.top li:nth-child(7) a').click();
                  })
                  .catch(error => console.error('Error updating income:', error));
              } else {
                  showAlert('Please fill in all fields.', 'warning');
              }
          });

          const modalElement = document.getElementById('incomeModal');
          const incomeModal = new bootstrap.Modal(modalElement);
          incomeModal.show();

          modalElement.addEventListener('hidden.bs.modal', function () {
              modalElement.remove();
              document.querySelector('.modal-backdrop').remove();
              document.body.classList.remove('modal-open');
              document.body.style = '';
          });
      })
      .catch(error => console.error('Error fetching bus IDs:', error));
}


function showAlert(message, type) {
  let alertContainer = document.getElementById('alertContainer');

  // Create alert container if it doesn't exist
  if (!alertContainer) {
      alertContainer = document.createElement('div');
      alertContainer.id = 'alertContainer';
      document.body.prepend(alertContainer); // Add it at the top of the body
  }

  const alertHtml = `
      <div class="custom-alert alert alert-${type} alert-dismissible fade show" role="alert">
          ${message}
      </div>
  `;
  alertContainer.innerHTML = alertHtml;

  // Auto-dismiss after 3 seconds
  setTimeout(() => {
      alertContainer.innerHTML = '';
  }, 3000);
}

// // TO DO
// 1. Only display Operating buses in the Daily Income table and form
// 2. Reset the "income today" field when date changes

const apiKey = "5b3ce3597851110001cf6248ef6021b6165e4d53935261fad6ed7e96"; // Your ORS API key
const startCoords = [121.0253809, 14.5504493]; // [Longitude, Latitude]
const endCoords = [121.0434251, 14.41683]; // [Longitude, Latitude]
const profile = "driving-car"; // Options: 'driving-car', 'cycling-regular', 'foot-walking'

async function calculateETA(startCoords, endCoords) {
  const url = `https://api.openrouteservice.org/v2/directions/${profile}`;

  console.log(`Fetching ETA from ORS: ${url}`);

  try {
      const response = await fetch(url, {
          method: "POST", // ORS requires a POST request
          headers: {
              "Content-Type": "application/json",
              "Authorization": apiKey // ORS requires API key in headers
          },
          body: JSON.stringify({
              coordinates: [startCoords, endCoords], // Proper format
              format: "json"
          })
      });

      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
          const etaSeconds = data.routes[0].summary.duration; // Get duration in seconds
          const etaMinutes = Math.round(etaSeconds / 60); // Convert to minutes
          console.log(`Estimated Travel Time: ${etaMinutes} minutes`);
          return etaMinutes;
      } else {
          console.error("No route found. Response:", data);
          return null;
      }
  } catch (error) {
      console.error("Error fetching ETA:", error);
      return null;
  }
}




// Call function with start and end coordinates


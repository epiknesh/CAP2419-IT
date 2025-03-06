// Toast Notification Container
document.addEventListener("DOMContentLoaded", function () {
	//Import Css 
	const link  = document.createElement('link');
	link.rel='stylesheet';
	link.href='css/styles.css';
	document.head.appendChild(link);

  const incomeTab = document.querySelector('#sidebar .side-menu.top li:nth-child(7) a');
  
  incomeTab.addEventListener('click', function (event) {
    event.preventDefault();
    const mainContent = document.querySelector('#content main');
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
            <h3>Bus Income</h3>
            <a href="#" id="addDailyIncomeBtn" class="btn btn-success mb-4" data-bs-toggle="modal" data-bs-target="#incomeModal">
              <i class='bx bx-plus'></i> Add Daily Income
            </a>
          </div>
          <table>
            <thead>
              <tr>
                <th>Bus ID</th>
                <th>Income Today</th>
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
      const tableBody = document.getElementById("busIncomeTable");
      tableBody.innerHTML = ""; // Clear existing data

      data.sort((a, b) => a.busID - b.busID); // Sort bus IDs numerically

      data.forEach(item => {
        const row = `
          <tr>
            <td>${item.busID}</td>
            <td>₱${item.incomeToday.toLocaleString()}</td>
            <td>₱${item.incomeWeek.toLocaleString()}</td>
            <td>₱${item.incomeMonth.toLocaleString()}</td>
            <td>₱${item.totalIncome.toLocaleString()}</td>
          </tr>
        `;
        tableBody.innerHTML += row;
      });
    })
    .catch(error => {
      console.error("Error fetching income data:", error);
      document.getElementById("busIncomeTable").innerHTML = "<tr><td colspan='5'>Failed to load data</td></tr>";
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


// Function to Show Alert
function showAlert(message, type) {
  const alertContainer = document.getElementById('alertContainer');
  const alertHtml = `
    <div class="custom-alert alert alert-${type} alert-dismissible fade show" role="alert">
      ${message}
    </div>
  `;
  alertContainer.innerHTML = alertHtml;

  // Auto-dismiss the alert after 3 seconds
  setTimeout(() => {
    const alertElement = alertContainer.querySelector('.alert');
    if (alertElement) {
      alertElement.classList.remove('show');
      alertElement.classList.add('hide');
      setTimeout(() => alertElement.remove(), 500);
    }
  }, 5000);
}

document.addEventListener("DOMContentLoaded", async function () {
    const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(5) a');

    teamTab.addEventListener('click', async function (event) {
        event.preventDefault(); // Prevent default link behavior

        try {
            await loadDispatchData();
        } catch (error) {
            console.error("Error fetching data:", error);
            document.querySelector('#content main').innerHTML = `<p>Error loading dispatch data.</p>`;
        }
    });

    async function loadDispatchData() {
        try {
            // Fetch operative buses from the maintenance database
            const maintenanceResponse = await fetch('http://localhost:3000/maintenance');
            const maintenanceData = await maintenanceResponse.json();

            // Filter to get only operative buses (status = 1)
            const operativeBuses = maintenanceData.filter(bus => bus.status === 1).map(bus => bus.busID);

            // Fetch dispatch data
            const dispatchResponse = await fetch('http://localhost:3000/dispatch');
            const dispatchData = await dispatchResponse.json();

            // Filter dispatch records to include only operative buses
            const operativeDispatches = dispatchData.filter(dispatch => operativeBuses.includes(dispatch.busID));

            // Function to format time without seconds
            const formatTime = (dateString) => {
                const options = { hour: 'numeric', minute: 'numeric', hour12: true };
                return new Date(dateString).toLocaleTimeString('en-US', options);
            };

            // Generate the dispatch boxes dynamically
            let dispatchContent = `
                <div class="head-title">
                    <div class="left">
                        <h1>Dispatch</h1>
                        <ul class="breadcrumb">
                            <li><a href="#">Dispatch</a></li>
                            <li><i class='bx bx-chevron-right'></i></li>
                            <li><a class="active" href="#">Dispatch</a></li>
                        </ul>
                    </div>
                </div>
            `;

            if (operativeDispatches.length === 0) {
                dispatchContent += `<p>No operative buses available for dispatch.</p>`;
            } else {
                operativeDispatches.forEach((dispatch, index) => {
                    if (index % 2 === 0) {
                        if (index !== 0) {
                            dispatchContent += `</div>`; // Close previous "table-data" div
                        }
                        dispatchContent += `<div class="table-data">`; // Open new "table-data" div
                    }

                    dispatchContent += `
                        <div class="order position-relative">
                            <div class="head">
                                <h3>Bus ${dispatch.busID}</h3>
                                <button class="btn btn-primary mt-3 m-2 dispatch-btn" data-busid="${dispatch.busID}">Dispatch</button>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Dispatch Time</th>
                                        <th>Last Dispatch Time</th>
                                        <th>Last Location</th>
                                    </tr>
                                </thead>
                                <tbody class="table">
                                    <tr>
                                        <td><span class="status ${dispatch.status === 1 ? 'in-transit' : 'in-terminal'}">${dispatch.status === 1 ? 'In Transit' : 'In Terminal'}</span></td>
                                        <td>${formatTime(dispatch.nextDispatch)}</td>
                                        <td>${formatTime(dispatch.lastDispatch)}</td>
                                        <td>[${dispatch.coordinates.coordinates[1]}, ${dispatch.coordinates.coordinates[0]}]</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    `;
                });
                dispatchContent += `</div>`; // Close the last "table-data" div
            }

            // Insert generated content into the main section
            document.querySelector('#content main').innerHTML = dispatchContent;

            // Attach event listeners to dispatch buttons
            document.querySelectorAll('.dispatch-btn').forEach(button => {
                button.addEventListener('click', async function () {
                    const busID = this.getAttribute('data-busid');
                    await dispatchBus(busID);
                });
            });

        } catch (error) {
            console.error("Error fetching data:", error);
            document.querySelector('#content main').innerHTML = `<p>Error loading dispatch data.</p>`;
        }
    }

	async function dispatchBus(busID) {
		try {
		  // Fetch the current dispatch data
		  const dispatchResponse = await fetch(`http://localhost:3000/dispatch/${busID}`);
	  
		  if (!dispatchResponse.ok) {
			throw new Error(`Server responded with ${dispatchResponse.status}`);
		  }
	  
		  const dispatchData = await dispatchResponse.json();
	  
		  // Schedule the next dispatch (e.g., 1 hour later)
		  const nextDispatchTime = new Date();
		  nextDispatchTime.setHours(nextDispatchTime.getHours() + 1);
	  
		  // Prepare updated data
		  const updatedData = {
			status: 1,
			lastDispatch: dispatchData.nextDispatch,
			nextDispatch: nextDispatchTime.toISOString(),
		  };
	  
		  // Send the update request
		  const updateResponse = await fetch(`http://localhost:3000/dispatch/${busID}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updatedData),
		  });
	  
		  if (!updateResponse.ok) {
			throw new Error(`Update failed with status ${updateResponse.status}`);
		  }
	  
		  console.log(`Bus ${busID} dispatched successfully.`);
		  await loadDispatchData();
		} catch (error) {
		  console.error(`Error updating dispatch for bus ${busID}:`, error);
		}
	  }
	  
	
});

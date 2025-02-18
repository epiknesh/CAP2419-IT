document.addEventListener("DOMContentLoaded", function () {
    // Ensure the DOM is fully loaded before attaching event listeners
    const teamTab = document.querySelector('#sidebar .side-menu.top li:nth-child(2) a');
    teamTab.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
        const mainContent = document.querySelector('#content main');
        mainContent.innerHTML = `
            <div class="head-title">
                <div class="left">
                    <h1>Team</h1>
                    <ul class="breadcrumb">
                        <li>
                            <a href="#">Team</a>
                        </li>
                        <li><i class='bx bx-chevron-right' ></i></li>
                        <li>
                            <a class="active" href="#">Team</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="table-data">
                <div class="order position-relative">
                    <div class="head">
                        <h3>Team Members</h3>
                        <a href="register.html"  class="btn btn-success mb-4">
                        <i class='bx bx-plus' ></i>
                        Add New Member</a>

                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Birthdate</th>
                                <th>Created At</th>
                                <th>Role</th>         
                                <th>Remove</th>                         
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                <img src="img/noprofile.jpg">
									              John Doe
                                </td>
                                <td>johndoe@dlsu.edu.ph</td> 
                                <td>11/02/2002</td>
                                <td>02/18/2025</td>
                                <td>Conductor</td>
                                <td><button class="btn btn-danger">Remove</button></td>
                            </tr>
                            <tr>
                                <td>
                                <img src="img/noprofile.jpg">
									              Andrei Castillo
                                </td>
                                <td>izar_castillo@dlsu.edu.ph</td> 
                                <td>12/02/2002</td>
                                <td>02/18/2025</td>
                                <td>Dispatcher</td>
                                <td><button class="btn btn-danger">Remove</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    });
});

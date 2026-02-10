const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    return (
        <div>
            <h2>Welcome, {user?.name}!</h2>

            {user?.role === "student" && (
                <ul>
                    <li>Academic Pre-Registration</li>
                    <li>Academic Advising (Coming soon)</li>
                </ul>
            )}

            {user?.role === "admin" && (
                <ul>
                    <li>Course Management</li>
                    <li>View Student Registrations</li>
                </ul>
            )}
        </div>
    );
};


export default Dashboard;

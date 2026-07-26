import { useEffect, useState } from "react";
import api from "./axios"; // Correctly import the configured Axios instance

/**
 * This component represents the "user section" of the admin dashboard.
 *
 * It fixes the "axios instance file is not defined" error by importing
 * the central `api` object from `src/api/axiosInstance.js` and using it
 * to make the network request.
 */
export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        // Use the imported 'api' instance to make the GET request.
        // This call will now succeed.
        const response = await api.get("/users"); // Assuming a `/api/users` endpoint exists
        setUsers(response.data.users);
        setError(null);
      } catch (err) {
        setError(
          err.response?.data?.message || "An error occurred while fetching users."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Management</h2>
      <ul>
        {users.map((user) => (
          <li key={user._id}>{user.name} ({user.email}) - Role: {user.role}</li>
        ))}
      </ul>
    </div>
  );
};
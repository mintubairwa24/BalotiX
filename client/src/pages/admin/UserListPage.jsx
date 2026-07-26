import { UserList } from "../../components/admin/UserManagement/UserList";

export const UserListPage = () => {
  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">View and manage all users.</p>
      </div>
      <UserList />
    </div>
  );
};
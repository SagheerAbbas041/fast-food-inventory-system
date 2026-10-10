import { useEffect, useState } from "react";
import api from "../api";
import { Button, Card, Modal, Status } from "../components/UI";

export default function UsersPage() {
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
    role: "cashier",
  });

  const load = async () => {
    try {
      const response = await api.get("/users");
      setRows(response.data);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      await api.post("/users", form);

      setOpen(false);

      setForm({
        name: "",
        username: "",
        password: "",
        role: "cashier",
      });

      await load();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  };

  return (
    <>
      <div className="page-heading users-page-heading">
        <div className="users-heading-content">
          <h1>Users</h1>

          <p>
            Admin, cashier and kitchen staff accounts
          </p>
        </div>

        <div className="users-heading-action">
          <Button onClick={() => setOpen(true)}>
            + Add User
          </Button>
        </div>
      </div>

      <Card className="table-wrap users-table-wrap">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((x) => (
                <tr key={x._id}>
                  <td>{x.name}</td>

                  <td>{x.username}</td>

                  <td>{x.role}</td>

                  <td>
                    <Status value={x.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open && (
        <Modal
          title="Add User"
          onClose={() => setOpen(false)}
        >
          <form
            className="form-grid users-form-grid"
            onSubmit={save}
          >
            <label>
              Name

              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Username

              <input
                required
                value={form.username}
                onChange={(e) =>
                  setForm({
                    ...form,
                    username: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Password

              <input
                required
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
              />
            </label>

            <label>
              Role

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({
                    ...form,
                    role: e.target.value,
                  })
                }
              >
                <option value="cashier">
                  Cashier
                </option>

                <option value="kitchen">
                  Kitchen Staff
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>
            </label>

            <div className="users-form-action">
              <Button type="submit">
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
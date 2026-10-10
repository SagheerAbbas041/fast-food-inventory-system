import { useEffect, useState } from "react";
import api from "../api";

export default function Customers() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get("/customers").then((r) => setRows(r.data));
  }, []);

  return (
    <Page
      title="Customers"
      sub="Customers with restaurant order history"
    >
      <div className="card table-wrap customers-table-wrap">
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((x) => (
                <tr key={x._id}>
                  <td>{x.name}</td>

                  <td>{x.phone || "—"}</td>

                  <td>{x.totalOrders}</td>

                  <td>
                    PKR {x.totalSpent?.toLocaleString()}
                  </td>

                  <td>
                    {x.lastOrder
                      ? new Date(
                          x.lastOrder
                        ).toLocaleDateString()
                      : "—"}
                  </td>

                  <td>{x.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Page>
  );
}

function Page(p) {
  return (
    <>
      <div className="page-heading customers-page-heading">
        <div>
          <h1>{p.title}</h1>

          <p>{p.sub}</p>
        </div>
      </div>

      {p.children}
    </>
  );
}
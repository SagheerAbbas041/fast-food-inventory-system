import { useState } from "react";
import api from "../api";
import { Button, Card } from "../components/UI";

export default function Backup() {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);

    try {
      const r = await api.get("/backup/export", {
        responseType: "blob",
      });

      const url = URL.createObjectURL(r.data);

      const a = document.createElement("a");

      a.href = url;
      a.download = `restaurant-backup-${Date.now()}.json`;

      a.click();

      URL.revokeObjectURL(url);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-heading backup-page-heading">
        <div>
          <h1>Backup</h1>

          <p>
            Create and download a complete JSON database backup
          </p>
        </div>
      </div>

      <div className="two-col backup-cards">
        <Card>
          <div className="backup-card-content">
            <h3>Create Backup</h3>

            <p>
              Export users, tables, menu, orders, invoices,
              customers, purchases and settings.
            </p>

            <div className="backup-action">
              <Button onClick={download}>
                {busy ? "Creating..." : "Create Backup"}
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="backup-card-content">
            <h3>Restore Backup</h3>

            <p>
              Restore workflow is intentionally protected.
              Add server-side validation and transactional
              restore before enabling production restore.
            </p>

            <div className="backup-action">
              <Button variant="secondary" disabled>
                Restore Backup
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="backup-history">
          <h3>Backup History</h3>

          <div className="empty">
            History storage can be connected to a Backup
            model when persistent audit history is required.
          </div>
        </div>
      </Card>
    </>
  );
}
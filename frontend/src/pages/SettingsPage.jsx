import { useEffect, useState } from "react";
import api from "../api";
import { Button, Card } from "../components/UI";

export default function SettingsPage() {
  const [s, setS] = useState(null);
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/settings");
      setS(response.data);
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {
    e.preventDefault();

    try {
      const response = await api.put("/settings", s);

      setS(response.data);
      setMsg("Settings saved successfully");

      setTimeout(() => {
        setMsg("");
      }, 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
      setMsg("Failed to save settings");
    }
  };

  if (!s) {
    return (
      <div className="loading settings-loading">
        Loading settings...
      </div>
    );
  }

  return (
    <>
      <div className="page-heading settings-page-heading">
        <div>
          <h1>Settings</h1>

          <p>
            Restaurant profile, invoice and tax settings
          </p>
        </div>
      </div>

      <Card className="settings-card">
        <form
          className="form-grid settings-form-grid"
          onSubmit={save}
        >
          {[
            "restaurantName",
            "address",
            "phone",
            "email",
            "currency",
            "taxPercent",
            "invoiceFooter",
          ].map((k) => (
            <label
              key={k}
              className="settings-form-label"
            >
              {k.replace(
                /([A-Z])/g,
                " $1"
              )}

              <input
                value={s[k] ?? ""}
                onChange={(e) =>
                  setS({
                    ...s,
                    [k]: e.target.value,
                  })
                }
              />
            </label>
          ))}

          <div className="settings-form-action">
            <Button type="submit">
              Save Settings
            </Button>
          </div>

          {msg && (
            <div className="success settings-success">
              {msg}
            </div>
          )}
        </form>
      </Card>
    </>
  );
}
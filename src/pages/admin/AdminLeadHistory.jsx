// src/pages/admin/AdminLeadHistory.jsx

import { useEffect, useState } from "react";

import {
  getDocs,
} from "firebase/firestore";

import {
  leadsCollection,
} from "../../firebase/config";

export default function AdminLeadHistory() {

  const [leads, setLeads] =
    useState([]);

  useEffect(() => {

    const loadLeads =
      async () => {

        try {

          const snap =
            await getDocs(
              leadsCollection
            );

          const now =
            Date.now();

          const LIMIT =
            30 *
            24 *
            60 *
            60 *
            1000;

          const filtered =
            snap.docs
              .map((d) => ({
                id: d.id,
                ...d.data(),
              }))
              .filter(
                (l) =>
                  now -
                    new Date(
                      l.contactedAt
                    ).getTime() <=
                  LIMIT
              );

          setLeads(filtered);

        } catch (err) {

          console.error(err);

        }

      };

    loadLeads();

  }, []);

  return (

    <div style={{ padding: 20 }}>

      <h2>
        📊 Lead History
      </h2>

      <p>
        Provider → Worker
        contact history
        (last 30 days)
      </p>

      {leads.length === 0 ? (

        <p>
          No lead history
        </p>

      ) : (

        leads.map((l) => (

          <div
            key={l.id}
            style={{
              border:
                "1px solid #ccc",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
              background: "#fff",
            }}
          >

            <h4>
              🧑‍💼 Provider
            </h4>

            <p>
              Name:{" "}
              {l.providerName}
            </p>

            <p>
              Phone:{" "}
              {l.providerPhone}
            </p>

            <p>
              Pincode:{" "}
              {l.providerPincode}
            </p>

            <hr />

            <h4>
              👷 Worker
            </h4>

            <p>
              Name:{" "}
              {l.workerName}
            </p>

            <p>
              Phone:{" "}
              {l.workerPhone}
            </p>

            <p>
              Category:{" "}
              {l.category}
            </p>

            <p>
              Great:{" "}
              {l.great}
            </p>

            <p>
              ⏰ Contacted
              At:{" "}
              {new Date(
                l.contactedAt
              ).toLocaleString()}
            </p>

          </div>

        ))

      )}

    </div>

  );

}

// src/pages/workers/WorkerLeads.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  getDocs,
} from "firebase/firestore";

import {
  leadsCollection,
} from "../../firebase/config";

export default function WorkerLeads({
  uid,
}) {

  const [leads, setLeads] =
    useState([]);

  useEffect(() => {

    if (!uid) return;

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
                (l) => {

                  return (

                    l.workerId === uid &&

                    l.approved ===
                      true &&

                    now -
                      new Date(
                        l.contactedAt
                      ).getTime() <=
                      LIMIT

                  );

                }
              );

          setLeads(filtered);

        } catch (err) {

          console.error(err);

        }

      };

    loadLeads();

  }, [uid]);

  return (

    <div
      style={{
        marginTop: 30,
      }}
    >

      <h3>
        📞 Recent Leads
      </h3>

      {leads.length ===
      0 ? (

        <p>
          No leads yet
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

            <b>
              🧑‍💼{" "}
              {l.providerName}
            </b>

            <p>
              📞{" "}
              {l.providerPhone}
            </p>

            <p>
              📍{" "}
              {l.providerPincode}
            </p>

            <p>
              ⏰{" "}
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

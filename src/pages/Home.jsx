// src/pages/Home.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CATEGORIES } from "../utils/categories";
import FooterWithLike from "../components/FooterWithLike";
import { doc, setDoc } from "firebase/firestore";
import { providersCollection, auth } from "../firebase/config";
import { signInAnonymously, signOut } from "firebase/auth";

export default function Home() {

  const { user, login } = useAuth();

  const navigate = useNavigate();

  const [showRoleSelect, setShowRoleSelect] = useState(false);

  const [providerStep, setProviderStep] = useState("idle");

  const [providerCategory, setProviderCategory] = useState(null);

  const [categorySearch, setCategorySearch] = useState("");

  const [showCategoryList, setShowCategoryList] = useState(false);

  const [providerPhone, setProviderPhone] = useState("");

  const title = "মিস্ত্রি বন্ধু";

  const subtitle = "বিশ্বাসযোগ্য মিস্ত্রি আপনার পাশে";

  const onSearchClick = () => {

    setShowRoleSelect(true);

    setProviderStep("category");

  };

  const onSelectRole = (role) => {

    if (role === "worker") {

      navigate("/signup/worker");

    }

  };

  const handleCategorySelect = (cat) => {

    setProviderCategory(cat);

    setCategorySearch(cat.en);

    setShowCategoryList(false);

    setProviderStep("phone");

  };

  const handleProviderSignup = async () => {

    if (!providerCategory) {
      return alert("Category required");
    }

    if (!providerPhone || providerPhone.length !== 10) {
      return;
    }

    try {

      if (auth.currentUser) {

        await signOut(auth);

      }

      const res = await signInAnonymously(auth);

      const userAuth = res.user;

      const payload = {

        uid: userAuth.uid,

        role: "provider",

        phone: providerPhone,

        categoryId: providerCategory.id,

        category: providerCategory.en,

        name: `Provider_${providerPhone}`,

        address: "Auto Address",

        pincode: "700001",

        experience: "",

        status: "active",

        createdAt: new Date().toISOString(),

      };

      await setDoc(
        doc(providersCollection, userAuth.uid),
        payload
      );

      login(payload);

      setProviderStep("idle");

    } catch (err) {

      alert(err?.message || JSON.stringify(err));

    }

  };

  useEffect(() => {

    if (
      providerStep === "phone" &&
      providerPhone.length === 10
    ) {

      handleProviderSignup();

    }

  }, [providerPhone]);

  useEffect(() => {

    if (
      user?.role === "provider" &&
      providerStep === "idle"
    ) {

      navigate("/provider/dashboard");

    }

  }, [user, providerStep, navigate]);

  // =========================
  // 🌐 HOME PAGE
  // =========================

  if (
    !user ||
    (
      user.role === "provider" &&
      providerStep !== "idle"
    )
  ) {

    return (

      <>

        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 60,
            paddingBottom: 140,
            background: "#fafafa",
          }}
        >

          <h1
            style={{
              fontSize: 44,
              fontWeight: "800",
              marginBottom: 6,
            }}
          >
            {title}
          </h1>

          <p
            style={{
              color: "#4A90E2",
              fontSize: 18,
              marginBottom: 36,
              fontWeight: "500",
            }}
          >
            {subtitle}
          </p>

          <div
            style={{
              width: "90%",
              maxWidth: 420,
              marginBottom: 36,
            }}
          >

            {/* SEARCH BUTTON */}

            {providerStep === "idle" && (

              <div
                onClick={onSearchClick}
                style={{
                  background: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: 30,
                  padding: "14px 20px",
                  cursor: "pointer",
                  fontSize: 16,
                  color: "#555",
                }}
              >
                🔍 মিস্ত্রি / প্রোভাইডার খুঁজুন...
              </div>

            )}

            {/* CATEGORY */}

            {providerStep === "category" && (

              <div style={{ position: "relative" }}>

                <input
                  autoFocus
                  placeholder="Category লিখুন বা select করুন"
                  value={categorySearch}
                  onChange={(e) => {

                    setCategorySearch(e.target.value);

                    setShowCategoryList(true);

                  }}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 6,
                    border: "1px solid #ccc",
                  }}
                />

                {showCategoryList && (

                  <div
                    style={{
                      position: "absolute",
                      top: 44,
                      left: 0,
                      right: 0,
                      background: "#fff",
                      border: "1px solid #ccc",
                      zIndex: 10,
                      maxHeight: 150,
                      overflowY: "auto",
                    }}
                  >

                    {CATEGORIES
                      .filter((c) =>
                        c.en
                          .toLowerCase()
                          .includes(
                            categorySearch.toLowerCase()
                          )
                      )
                      .map((c) => (

                        <div
                          key={c.id}
                          onClick={() =>
                            handleCategorySelect(c)
                          }
                          style={{
                            padding: "6px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee",
                          }}
                        >
                          {c.en}
                        </div>

                      ))}

                  </div>

                )}

              </div>

            )}

            {/* PHONE */}

            {providerStep === "phone" && (

              <input
                autoFocus
                type="tel"
                maxLength={10}
                placeholder="Phone (10-digit)"
                value={providerPhone}
                onChange={(e) =>
                  setProviderPhone(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                style={{
                  width: "100%",
                  padding: 12,
                  borderRadius: 6,
                  border: "1px solid #ccc",
                }}
              />

            )}

          </div>

          {/* ROLE */}

          {showRoleSelect && (

            <div
              style={{
                width: "90%",
                maxWidth: 420,
              }}
            >

              <p
                style={{
                  marginBottom: 14,
                  fontWeight: "600",
                }}
              >
                আপনি কী খুঁজছেন?
              </p>

              <button
                style={btnStyle}
                onClick={() => onSelectRole("worker")}
              >
                👷 Worker
              </button>

            </div>

          )}

        </div>

        <FooterWithLike userId={user?.uid} />

      </>

    );

  }

  // =========================
  // 🔥 USER PANEL
  // =========================

  return (

    <div style={{ padding: 20 }}>

      <h2>
        Welcome, {user.name}
      </h2>

      <p>
        <b>Role:</b> {user.role}
      </p>

      {/* ADMIN */}

      {user.role === "admin" && (

        <button
          onClick={() =>
            navigate("/admin/workers")
          }
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            background: "#111827",
            color: "#fff",
            border: "none",
            width: "100%",
            fontSize: 16,
          }}
        >
          🛠 Go to Admin Dashboard
        </button>

      )}

      {/* WORKER */}

      {user.role === "worker" && (

        <button
          onClick={() =>
            navigate("/worker/dashboard")
          }
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            background: "green",
            color: "#fff",
            border: "none",
            width: "100%",
            fontSize: 16,
          }}
        >
          👷 Go to Worker Dashboard
        </button>

      )}

      {/* PROVIDER */}

      {user.role === "provider" && (

        <button
          onClick={() =>
            navigate("/provider/dashboard")
          }
          style={{
            marginTop: 20,
            padding: 12,
            borderRadius: 8,
            background: "#4A90E2",
            color: "#fff",
            border: "none",
            width: "100%",
            fontSize: 16,
          }}
        >
          🧑‍💼 Go to Provider Dashboard
        </button>

      )}

    </div>

  );

}

const btnStyle = {

  width: "100%",

  padding: 14,

  marginBottom: 10,

  borderRadius: 10,

  border: "1px solid #ccc",

  background: "#f9f9f9",

  cursor: "pointer",

  fontSize: 16,

};

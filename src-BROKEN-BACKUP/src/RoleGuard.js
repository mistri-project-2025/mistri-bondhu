// utils/role.js  (RoleGuard নাম না দিলেও ভালো)

export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("mb_user"));
  } catch {
    return null;
  }
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const isAdmin = () => getUserRole() === "admin";
export const isWorker = () => getUserRole() === "worker";
export const isProvider = () => getUserRole() === "provider";
export const isLoggedIn = () => !!getUserRole();

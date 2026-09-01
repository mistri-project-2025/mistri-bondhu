import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
const GRADE_ORDER = ["A+", "A", "B+", "B", "C+", "C"];
const buildDynamicGroups = (allWorkers) => {
  if (!allWorkers || allWorkers.length === 0) return [];
  const groupNos = [...new Set(allWorkers.map(w => Number(w.groupNo)).filter(n =>!isNaN(n)))].sort((a,b) => a-b);
  const orderedGroups = [];
  for (const grade of GRADE_ORDER) {
    for (const gNo of groupNos) {
      if (allWorkers.some(w => String(w.groupNo) === String(gNo) && w.great === grade)) {
        orderedGroups.push({ groupNo: gNo, great: grade });
      }
    }
  }
  return orderedGroups;
};
const getProviderPhone = (p) => p.phone || p.mobile || p.phoneNumber || p.contact || p.mobileNumber || "";
const getProviderPincode = (p) => p.providerPincode || p.pincode || p.pin || p.zip || "700001";
const getProviderAddress = (p) => p.providerAddress || p.address || p.providerLocation || p.location || "No Address";
const getProviderName = (p) => p.name || p.providerName || p.fullName || "Provider";

export const sendLeadAuto = async (providerData) => {
  try {
    const category = providerData.searchedCategory;
    const rotationRef = doc(db, "leadRotation", category);
    let snap = await getDoc(rotationRef);
    if (!snap.exists()) {
      await setDoc(rotationRef, { currentIndex: 0, createdAt: new Date().toISOString() });
      snap = await getDoc(rotationRef);
    }
    let rotation = snap.data();
    const q = query(collection(db, "workers"), where("categoryId", "==", category), where("status", "==", "approved"));
    const allSnap = await getDocs(q);
    const allWorkers = allSnap.docs.map(d => ({ id: d.id,...d.data() }));
    if (allWorkers.length === 0) return { success: false, message: `${category} তে Worker নেই` };
    const dynamicGroups = buildDynamicGroups(allWorkers);
    let currentIndex = rotation.currentIndex || 0;
    if (currentIndex >= dynamicGroups.length) currentIndex = 0;
    const currentGroup = dynamicGroups[currentIndex];
    const workers = allWorkers.filter(w => String(w.groupNo) === String(currentGroup.groupNo) && w.great === currentGroup.great);
    if (workers.length === 0) return { success: false, message: `${currentGroup.groupNo}${currentGroup.great} খালি` };

    const leadData = {
      providerId: providerData.providerId,
      providerName: getProviderName(providerData),
      providerPhone: getProviderPhone(providerData),
      providerPincode: getProviderPincode(providerData),
      providerAddress: getProviderAddress(providerData),
      phone: getProviderPhone(providerData),
      pincode: getProviderPincode(providerData),
      address: getProviderAddress(providerData),
      providerLocation: getProviderAddress(providerData),
      district: providerData.district || "",
      area: providerData.area || "",
      category, categoryId: category,
      groupLabel: `${currentGroup.groupNo}${currentGroup.great}`,
      groupNo: currentGroup.groupNo, great: currentGroup.great,
      sentTo: workers.map(w => w.uid || w.id),
      sentToUids: workers.map(w => w.uid || w.id),
      sentToIds: workers.map(w => w.id),
      sentToCount: workers.length,
      sentAt: new Date().toISOString(),
      status: "sent", mode: "auto"
    };
    await addDoc(collection(db, "leads"), leadData);
    let next = currentIndex + 1; if (next >= dynamicGroups.length) next = 0;
    await updateDoc(rotationRef, { currentIndex: next, totalGroups: dynamicGroups.length, lastUpdated: new Date().toISOString() });
    return { success: true, message: `✅ ${leadData.groupLabel} এ ${workers.length} জনকে পাঠানো হলো` };
  } catch (e) { return { success: false, message: "❌ " + e.message }; }
};

export const sendLeadManual = async (providerData, groupNo, great) => {
  try {
    const category = providerData.searchedCategory;
    const q = query(collection(db, "workers"), where("categoryId", "==", category), where("status", "==", "approved"));
    const allSnap = await getDocs(q);
    const workers = allSnap.docs.map(d => ({ id: d.id,...d.data() })).filter(w => String(w.groupNo) === String(groupNo) && w.great === great);
    if (workers.length === 0) return { success: false, message: `${groupNo}${great} তে Worker নেই` };
    const leadData = {
      providerId: providerData.providerId,
      providerName: getProviderName(providerData),
      providerPhone: getProviderPhone(providerData),
      providerPincode: getProviderPincode(providerData),
      providerAddress: getProviderAddress(providerData),
      phone: getProviderPhone(providerData),
      pincode: getProviderPincode(providerData),
      address: getProviderAddress(providerData),
      providerLocation: getProviderAddress(providerData),
      district: providerData.district || "",
      area: providerData.area || "",
      category, categoryId: category,
      groupLabel: `${groupNo}${great}`,
      groupNo: Number(groupNo), great,
      sentTo: workers.map(w => w.uid || w.id),
      sentToUids: workers.map(w => w.uid || w.id),
      sentToIds: workers.map(w => w.id),
      sentToCount: workers.length,
      sentAt: new Date().toISOString(),
      status: "sent", mode: "manual"
    };
    await addDoc(collection(db, "leads"), leadData);
    return { success: true, message: `✅ ${workers.length} জনকে Manual পাঠানো হলো` };
  } catch (e) { return { success: false, message: "❌ " + e.message }; }
};

export const getRotationStatus = async (category) => {
  try {
    const q = query(collection(db, "workers"), where("categoryId", "==", category), where("status", "==", "approved"));
    const allSnap = await getDocs(q);
    const dynamicGroups = buildDynamicGroups(allSnap.docs.map(d => d.data()));
    if (dynamicGroups.length === 0) return { current: null, next: null, all: [], total: 0, currentIndex: 0 };
    const snap = await getDoc(doc(db, "leadRotation", category));
    let idx = snap.exists()? (snap.data().currentIndex || 0) % dynamicGroups.length : 0;
    return { current: dynamicGroups[idx], currentIndex: idx, next: dynamicGroups[(idx + 1) % dynamicGroups.length], all: dynamicGroups, total: dynamicGroups.length };
  } catch (e) { return { current: null, next: null, all: [], total: 0, currentIndex: 0 }; }
};
export const setRotationIndex = async (category, newIndex) => {
  await updateDoc(doc(db, "leadRotation", category), { currentIndex: newIndex });
  return true;
};
export const checkProviderLeadLimit = async () => { return { canContact: true }; };

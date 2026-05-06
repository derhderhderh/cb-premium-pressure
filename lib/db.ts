import {
  deleteApp,
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  type QueryConstraint,
  setDoc,
} from "firebase/firestore";
import { db, firebaseConfig } from "./firebase";
import type {
  Booking,
  User,
  Pricing,
  BusinessSettings,
  ServiceType,
  BookingStatus,
  UserRole,
} from "./types";

// Collection references
const bookingsRef = collection(db, "bookings");
const usersRef = collection(db, "users");
const pricingRef = collection(db, "pricing");
const settingsRef = collection(db, "settings");

// Bookings
export async function createBooking(
  booking: Omit<Booking, "id" | "createdAt" | "updatedAt">
) {
  const now = Timestamp.now();
  const docRef = await addDoc(bookingsRef, {
    ...booking,
    createdAt: now,
    updatedAt: now,
  });
  return docRef.id;
}

export async function getBooking(id: string): Promise<Booking | null> {
  const docSnap = await getDoc(doc(bookingsRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Booking;
}

export async function getBookings(
  filters?: {
    status?: BookingStatus;
    assignedWorker?: string;
  },
  sortBy: "createdAt" | "preferredDate" = "createdAt"
): Promise<Booking[]> {
  const constraints: QueryConstraint[] = [];

  if (filters?.status) {
    constraints.push(where("status", "==", filters.status));
  }
  if (filters?.assignedWorker) {
    constraints.push(where("assignedWorker", "==", filters.assignedWorker));
  }

  constraints.push(orderBy(sortBy, "desc"));

  const q = query(bookingsRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Booking
  );
}

export async function updateBooking(
  id: string,
  data: Partial<Omit<Booking, "id" | "createdAt">>
) {
  await updateDoc(doc(bookingsRef, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

export async function deleteBooking(id: string) {
  await deleteDoc(doc(bookingsRef, id));
}

export async function getAllBookings(): Promise<Booking[]> {
  const q = query(bookingsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Booking
  );
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  await updateDoc(doc(bookingsRef, id), {
    status,
    updatedAt: Timestamp.now(),
  });
}

export async function assignWorkerToBooking(bookingId: string, workerId: string | null) {
  await updateDoc(doc(bookingsRef, bookingId), {
    assignedWorker: workerId,
    updatedAt: Timestamp.now(),
  });
}

export async function claimBooking(bookingId: string, userId: string) {
  await updateDoc(doc(bookingsRef, bookingId), {
    assignedWorker: userId,
    updatedAt: Timestamp.now(),
  });
}

export async function getWorkerBookings(workerId: string): Promise<Booking[]> {
  const q = query(bookingsRef, orderBy("preferredDate", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }) as Booking)
    .filter((booking) => !booking.assignedWorker || booking.assignedWorker === workerId);
}

// Users
export async function getUser(id: string): Promise<User | null> {
  const docSnap = await getDoc(doc(usersRef, id));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
}

export async function getUsers(role?: "admin" | "worker"): Promise<User[]> {
  const constraints: QueryConstraint[] = [];

  if (role) {
    constraints.push(where("role", "==", role));
  }

  constraints.push(where("active", "==", true));

  const q = query(usersRef, ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
}

export async function getAllUsers(): Promise<User[]> {
  const snapshot = await getDocs(usersRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as User);
}

export async function createUser(
  user: Omit<User, "id" | "createdAt"> & { password: string; role: UserRole }
): Promise<User> {
  const secondaryAppName = "team-account-creation";
  const secondaryApp = getApps().some((app) => app.name === secondaryAppName)
    ? getApp(secondaryAppName)
    : initializeApp(firebaseConfig, secondaryAppName);
  const secondaryAuth = getAuth(secondaryApp);
  const { password, ...profile } = user;
  const now = Timestamp.now();

  try {
    const credential = await createUserWithEmailAndPassword(
      secondaryAuth,
      user.email,
      password
    );
    const profileWithDates = {
      ...profile,
      createdAt: now,
    };

    await setDoc(doc(usersRef, credential.user.uid), profileWithDates);

    return { id: credential.user.uid, ...profileWithDates } as User;
  } finally {
    await signOut(secondaryAuth).catch(() => undefined);
    await deleteApp(secondaryApp).catch(() => undefined);
  }
}

export async function updateUserStatus(id: string, active: boolean) {
  await updateDoc(doc(usersRef, id), { active });
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, "id" | "createdAt">>
) {
  await updateDoc(doc(usersRef, id), data);
}

// Pricing
export async function getPricing(): Promise<Pricing[]> {
  const snapshot = await getDocs(pricingRef);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as Pricing
  );
}

export async function getPricingForService(
  serviceType: ServiceType
): Promise<Pricing | null> {
  const q = query(pricingRef, where("serviceType", "==", serviceType));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Pricing;
}

export async function updatePricing(
  id: string,
  data: Partial<Omit<Pricing, "id">>
) {
  await updateDoc(doc(pricingRef, id), {
    ...data,
    updatedAt: Timestamp.now(),
  });
}

// Business Settings
export async function getSettings(): Promise<BusinessSettings | null> {
  const docSnap = await getDoc(doc(settingsRef, "global"));
  if (!docSnap.exists()) return null;
  return { id: "global", ...docSnap.data() } as BusinessSettings;
}

export async function updateSettings(data: Partial<BusinessSettings>) {
  await setDoc(doc(settingsRef, "global"), data, { merge: true });
}

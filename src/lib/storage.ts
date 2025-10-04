// import { User } from "@/types";

// const USERS_KEY = 'civilian_users';
// const RESOURCES_KEY = 'civilian_resources';
// const SESSION_KEY = 'civilian_session';
// const REFERRALS_KEY = 'civilian_referrals';

// // --- USER MANAGEMENT (Mock Database) ---

// /**
//  * Retrieves all registered users from localStorage.
//  */
// export function getUsers(): User[] {
//   if (typeof window === 'undefined') return [];
//   const users = localStorage.getItem(USERS_KEY);
//   return users ? JSON.parse(users) : [];
// }

// /**
//  * Finds a user by their username.
//  */
// export function findUserByUsername(username: string): User | undefined {
//   const users = getUsers();
//   return users.find(user => user.username.toLowerCase() === username.toLowerCase());
// }

// /**
//  * Saves a new user to localStorage, checking for duplicates.
//  * Also handles referral tracking if a referralUserId is provided.
//  * @returns true if successful, false if username already exists.
//  */
// export function saveUser(newUser: User): boolean {
//   const users = getUsers();
//   const userExists = users.some(user => user.username.toLowerCase() === newUser.username.toLowerCase());
//   if (userExists) {
//     return false; // Indicate failure
//   }
//   users.push(newUser);
//   localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
//   // Handle referral tracking
//   if (newUser.referralUserId) {
//     trackReferral(newUser.referralUserId, newUser.id);
//   }
  
//   return true; // Indicate success
// }

// // --- SESSION MANAGEMENT ---

// /**
//  * Sets the currently logged-in user in sessionStorage.
//  */
// export function setCurrentUser(user: User): void {
//   if (typeof window === 'undefined') return;
//   sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
// }

// /**
//  * Retrieves the currently logged-in user from sessionStorage.
//  */
// export function getCurrentUser(): User | null {
//   if (typeof window === 'undefined') return null;
//   const user = sessionStorage.getItem(SESSION_KEY);
//   return user ? JSON.parse(user) : null;
// }

// /**
//  * Logs the user out by clearing the session.
//  */
// export function logout(): void {
//   if (typeof window === 'undefined') return;
//   sessionStorage.removeItem(SESSION_KEY);
// }

// // --- RESOURCE MANAGEMENT ---

// /**
//  * Saves a new resource to localStorage.
//  */
// // export function saveResource(resource: Resource): void {
// //   if (typeof window === 'undefined') return;
// //   const allResources = localStorage.getItem(RESOURCES_KEY);
// //   const resources = allResources ? JSON.parse(allResources) : [];
// //   resources.push(resource);
// //   localStorage.setItem(RESOURCES_KEY, JSON.stringify(resources));
// // }

// /**
//  * Retrieves ALL resources from localStorage, regardless of user.
//  * This is for the global map view.
//  */
// // export function getAllResources(): Resource[] {
// //   if (typeof window === 'undefined') return [];
// //   const resourcesStr = localStorage.getItem(RESOURCES_KEY);
// //   return resourcesStr ? JSON.parse(resourcesStr) : [];
// // }


// /**
//  * Retrieves resources *only for a specific user* from localStorage.
//  */
// // export function getResourcesForUser(userId: string): Resource[] {
// //   if (typeof window === 'undefined') return [];
// //   const allResources = localStorage.getItem(RESOURCES_KEY);
// //   if (!allResources) return [];
// //   const resources: Resource[] = JSON.parse(allResources);
// //   // This is the key filtering logic
// //   return resources.filter(resource => resource.userId === userId);
// // }

// // --- REFERRAL MANAGEMENT ---

// /**
//  * Tracks a referral between users
//  */
// function trackReferral(referrerUserId: string, referredUserId: string): void {
//   if (typeof window === 'undefined') return;
//   const referrals = getReferrals();
//   const referral = {
//     id: crypto.randomUUID(),
//     referrerUserId,
//     referredUserId,
//     timestamp: new Date().toISOString()
//   };
//   referrals.push(referral);
//   localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals));
// }

// /**
//  * Gets all referrals from localStorage
//  */
// export function getReferrals(): any[] {
//   if (typeof window === 'undefined') return [];
//   const referrals = localStorage.getItem(REFERRALS_KEY);
//   return referrals ? JSON.parse(referrals) : [];
// }

// /**
//  * Gets referrals made by a specific user
//  */
// export function getReferralsByUser(userId: string): any[] {
//   const allReferrals = getReferrals();
//   return allReferrals.filter(referral => referral.referrerUserId === userId);
// }

// /**
//  * Gets user statistics including referral count
//  */
// // export function getUserStats(userId: string) {
// //   const resources = getResourcesForUser(userId);
// //   const referrals = getReferralsByUser(userId);
  
// //   // Calculate points: 5 points per resource, 10 points per referral
// //   const resourcePoints = resources.length * 5;
// //   const referralPoints = referrals.length * 10;
// //   const totalScore = resourcePoints + referralPoints;
  
// //   return {
// //     resourcesAdded: resources.length,
// //     peopleAdded: referrals.length,
// //     updates: 0, // Placeholder for future feature
// //     totalScore
// //   };
// // }
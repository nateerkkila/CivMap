# CivMap - Civilian Resource Mapping

A platform for mapping and mobilizing civilian resources to enhance comprehensive security during a crisis. Built for the [Hackathon Name] hackathon.

---

## 🚀 Live Demo is Running!

**Experience CivMap right now. The hosted version is available for the duration of the hackathon.**

### [**https://your-live-demo-url.com**](https://your-live-demo-url.com) 👈

---

## The Concept: Kokonaisturvallisuus (Comprehensive Security)

In Finland, the concept of “kokonaisturvallisuus” underpins national resilience by ensuring the entire society contributes to preparedness and defense. In a heightened security environment, this requires the ability to quickly find, mobilize, and coordinate all available mission-critical resources, both military and civilian.

CivMap is a prototype system that allows for the real-time mapping of civilian-provided resources (e.g., vehicles, generators, skills) and emerging threats, making them visible to authorities in a secure and intuitive way.

## ✨ Key Features

CivMap features a role-based system to serve both civilians and authorities.

### For Civilians 👤
*   **Secure Registration:** Easily register resources you can offer, from vehicles and shelters to professional skills and supplies.
*   **Report Threats:** Anonymously report suspicious activity or direct threats with precise geographic location.
*   **Gamified Contributions:** Earn points and level up your profile by adding resources, referring new users, and confirming the availability of your assets daily.
*   **Interactive Map View:** See all publicly shared resources and threats in your area.

### For Authorities 🛡️
*   **Unified Dashboard:** Get a comprehensive overview of all registered civilian resources and reported threats.
*   **Advanced Filtering:** Filter the resource list by category and geographic distance to quickly find what you need.
*   **Threat Assessment:** View a dedicated list of all reported threats, sorted by the most recent.
*   **Centralized Map View:** Visualize all assets and threats on a single, interactive map with clustering for easy navigation.

## 📸 Screenshots

*(We recommend adding a GIF of the app in action here!)*

| Civilian Dashboard | Authority Dashboard |
| :---: | :---: |
| *(Your Screenshot Here)* | *(Your Screenshot Here)* |

| Map View with Threats | Resource Registration |
| :---: | :---: |
| *(Your Screenshot Here)* | *(Your Screenshot Here)* |


## 🛠️ Tech Stack

*   **Framework:** Next.js (App Router)
*   **Language:** TypeScript
*   **Backend & Database:** Supabase (Auth, Postgres, Storage)
*   **Styling:** Tailwind CSS
*   **Mapping:** Leaflet & React-Leaflet
*   **Deployment:** Vercel

## ⚙️ Getting Started (Running Locally)

To get a local copy up and running, follow these simple steps.

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your-username/civ-map.git
    cd civ-map
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Set up your environment variables:**
    Create a file named `.env.local` in the root of the project and add your Supabase credentials. You can get these from your Supabase project dashboard.
    ```env
    NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

4.  **Run the development server:**
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 💡 Future Ideas

This project is a resilient prototype with a modular foundation. Future enhancements could include:
*   **Direct Communication:** A secure chat system for authorities to contact resource owners.
*   **Resource Allocation:** A system for authorities to "request" or "assign" resources, which would notify the civilian owner.
*   **Offline Capabilities:** Implementing PWA features to ensure functionality with limited connectivity.
*   **Advanced Analytics:** A dashboard for authorities with statistics on resource availability and threat patterns.

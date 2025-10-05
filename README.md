# CivMap - Civilian Resource Mapping

A platform for mapping and mobilizing civilian resources to enhance comprehensive security during a crisis. Built for the [Hackathon Name] hackathon.

---

## 🚀 Live Demo is Running!

**Experience CivMap right now. The hosted version is available for the duration of the hackathon.**

### [**https://civ-map.vercel.app**](https://civ-map.vercel.app) 👈

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

Note: If you need to create the supabase tables, the schema is here:

-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) > 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(id),
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.item (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id bigint NOT NULL,
  general_description text NOT NULL,
  address text,
  lat numeric,
  lon numeric,
  attributes jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT item_pkey PRIMARY KEY (id),
  CONSTRAINT item_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.item_category(id),
  CONSTRAINT item_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
CREATE TABLE public.item_category (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name text NOT NULL UNIQUE,
  CONSTRAINT item_category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text NOT NULL UNIQUE CHECK (char_length(username) >= 3),
  referral_user_id uuid,
  total_score integer NOT NULL DEFAULT 0,
  last_confirmed_at timestamp with time zone,
  security_level bigint DEFAULT '0'::bigint,
  profession text,
  availability_notes text,
  reliability_score numeric DEFAULT 100.00,
  registered_address text,
  phone text,
  updates bigint DEFAULT '0'::bigint,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT profiles_referral_user_id_fkey FOREIGN KEY (referral_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.threats (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  threat_type text NOT NULL,
  description text,
  lat numeric NOT NULL,
  lon numeric NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT threats_pkey PRIMARY KEY (id),
  CONSTRAINT threats_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.votes (
  item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  direction smallint NOT NULL CHECK (direction = ANY (ARRAY['-1'::integer, 1])),
  CONSTRAINT votes_pkey PRIMARY KEY (item_id, user_id),
  CONSTRAINT votes_item_id_fkey FOREIGN KEY (item_id) REFERENCES public.item(id),
  CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);

## 💡 Future Ideas

This project is a resilient prototype with a modular foundation. Future enhancements could include:
*   **Direct Communication:** A secure chat system for authorities to contact resource owners.
*   **Resource Allocation:** A system for authorities to "request" or "assign" resources, which would notify the civilian owner.
*   **Offline Capabilities:** Implementing PWA features to ensure functionality with limited connectivity.
*   **Advanced Analytics:** A dashboard for authorities with statistics on resource availability and threat patterns.

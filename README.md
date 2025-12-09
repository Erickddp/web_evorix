# 🛡️ EVOSEC — Network Security Scanner

**Platform for vulnerability analysis and network scanning for educational and private use.**

EVOSEC is a modern tool that allows you to scan your local network, identify active devices, open ports, and operating systems in real-time. Designed to be accessible, fast, and visually professional.

---

### 🚀 What does EVOSEC do?

- **Network Scanning**: Detects devices connected to your Wi-Fi or LAN.
- **Port Analysis**: Identifies open ports and running services (ssh, http, ftp).
- **Diagnostics**: Includes quick tools like **Ping** and **Traceroute**.
- **Real-Time Logs**: View the execution of commands as if you were in the terminal.

### 🛠️ Key Technologies

- **Frontend**: React, TailwindCSS.
- **Backend**: Fastify (Node.js).
- **Scanner**: Nmap (Network Mapper).
- **Architecture**: Monorepo with TypeScript.

---

### 📦 Installation and Execution

Requirements: `Node.js` and `Nmap` installed on your system.

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/Erickddp/evo-sec.git](https://github.com/Erickddp/evo-sec.git)
    cd evo-sec
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the project (Development):**
    ```bash
    npm run dev
    ```
    - Web Dashboard: `http://localhost:5173`
    - API Server: `http://localhost:4000`

---

### 🎮 How to use

1.  **Scan Network**:
    - Go to the Dashboard.
    - Enter your Network Target (e.g., `192.168.1.0/24`).
    - Select a profile (Quick, Full, or Aggressive) and click **"Start Scan"**.
    - Watch the results populate in real-time.

2.  **Ping & Traceroute**:
    - Open the side panel "Tools".
    - Enter a domain (e.g., `google.com`) or IP.
    - Click run to see latency and route jumps.

---

### ⚠️ Ethical Note

**EVOSEC is designed for defensive security (Blue Team) and education.**
- ✅ Use only on networks you own or have permission to audit.
- ❌ Do not scan government, corporate, or external networks without authorization.

**Author**: Rick (EVORIX) — *Evolving Security.*

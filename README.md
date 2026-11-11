# HET-X1 // Interactive 3D Hall-Effect Plasma Thruster & Orbital Mission Simulator

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![WebGL](https://img.shields.io/badge/WebGL-2.0%20%2F%20Three.js-cyan.svg)](https://threejs.org/)
[![Physics](https://img.shields.io/badge/Physics-Aerospace%20Hall%20Effect-emerald.svg)]()
[![Audio](https://img.shields.io/badge/Audio-Procedural%20Web%20Audio%20API-amber.svg)]()

> An aerospace-grade, interactive 3D Hall-effect plasma propulsion laboratory, multi-species plasma physics solver, astrodynamics trajectory simulator, procedural sound synthesizer, and 6-DOF plasma spacecraft flight simulator built with **Three.js**, **WebGL**, **Tailwind CSS**, and **Chart.js**.

---

## 🌌 Overview

The **HET-X1 Plasma Propulsion Lab** brings advanced spacecraft electric propulsion to life in the browser. Operating at the intersection of aerospace engineering, computational plasma physics, and real-time 3D graphics, HET-X1 simulates closed-electron-drift Hall-effect thrusters used in modern orbital maneuvering and interplanetary missions.

Users can assemble thruster hardware, examine internal electromagnetic cutaways, adjust operational parameters in real time, plan continuous low-thrust orbital transfers around Earth and interplanetary bodies, and pilot a plasma-propelled deep-space spacecraft through asteroid belts and docking corridors.

---

## 🚀 Key Interactive Modes

The application features **5 dedicated operational modes**, switchable instantaneously via the top HUD navigation bar:

### 1. Build Thruster (`Mode A`)
* **Exploded Assembly View**: Continuous slider ($0\%$ to $100\%$) physically separating components along their mechanical mounting axes to expose internal interfaces.
* **Multi-Plane Cutaway View**: Toggle between **Full Cylindrical**, **Half-Section ($180^\circ$)**, and **Quarter-Section ($90^\circ$ cutaway)** to visualize the annular discharge channel, gas distributor, and internal magnetic circuit.
* **Raycast Component Inspection**: Click or hover over any 3D subassembly to highlight it and open detailed engineering specifications:
  * **Anode & Xenon Gas Distributor Ring**: Positive high-voltage electrode and micro-machined porous propellant delivery ring.
  * **Annular Discharge Channel**: Sintered Boron Nitride (BN) ceramic dielectric ring engineered for high thermal conductivity and low secondary electron emission.
  * **Inner & Outer Magnetic Coils**: Oxygen-free high-conductivity (OFHC) copper windings producing the radial magnetic cusp ($B_r$).
  * **Front & Rear Magnetic Pole Pieces**: Ultra-low-carbon soft magnetic iron guiding magnetic flux across the channel gap.
  * **Hollow Cathode Neutralizer**: Lanthanum hexaboride ($\text{LaB}_6$) / barium-oxide thermionic electron source providing beam neutralization and channel ionization electrons.
  * **Titanium Mounting Chassis & Vacuum Chamber Interfaces**: High-strength aerospace structural mountings with thermal decoupling standoffs.

### 2. How It Works (`Mode B`)
A cinematic 4-stage guided walkthrough with smooth orbital camera transitions, dynamic particle animations, and step-by-step physical principles:
1. **Stage 1: Propellant Injection & Electron Emission**: Neutral noble gas ($\text{Xe}^0$, $\text{Kr}^0$, $\text{Ar}^0$) diffuses through the anode distributor while the external hollow cathode discharges a thermionic electron stream.
2. **Stage 2: $\vec{E} \times \vec{B}$ Closed Drift & Ionization**: The axial electric field ($\vec{E}_z$) and radial magnetic field ($\vec{B}_r$) trap magnetized electrons in a closed azimuthal Hall drift ring. Trapped electrons circulate at high velocity, creating a dense ionization collision barrier that bombards incoming neutral atoms.
3. **Stage 3: Axial Ion Beam Acceleration**: Heavy, unmagnetized positive ions ($\text{Xe}^+$, $\text{Kr}^+$, $\text{Ar}^+$) are electrostatically accelerated downstream by the axial potential gradient ($\nabla \Phi$).
4. **Stage 4: Plume Neutralization & Thrust Reaction**: The downstream hollow cathode injects matching electrons into the departing ion beam to prevent spacecraft charging and potential barrier breakdown, generating momentum transfer and continuous thrust.

### 3. Live Physics Lab (`Mode C`)
An interactive laboratory environment with real-time computational telemetry:
* **Real-Time Sliders**:
  * **Discharge Voltage ($V_d$)**: $100\text{ V} - 800\text{ V}$ (controls electric field intensity and ion exhaust velocity).
  * **Propellant Mass Flow Rate ($\dot{m}$)**: $0.5\text{ mg/s} - 12.0\text{ mg/s}$ (controls plasma density and thrust).
  * **Radial Magnetic Flux Density ($B_r$)**: $50\text{ G} - 350\text{ G}$ (controls electron Hall parameter and magnetic confinement).
* **Multi-Propellant Chemistry**:
  * **Xenon ($^{131}\text{Xe}$)**: High atomic mass ($131.29\text{ u}$), low ionization potential ($12.13\text{ eV}$), brilliant azure/cyan-blue luminescence.
  * **Krypton ($^{84}\text{Kr}$)**: Cost-effective alternative ($83.80\text{ u}$), violet/lavender luminescence, higher specific impulse.
  * **Argon ($^{40}\text{Ar}$)**: Ultra-abundant propellant ($39.95\text{ u}$), electric pink/purple plume, extreme $I_{sp}$ at high discharge voltages.
* **Vector Field Overlays**: Toggleable 3D visual vector arrows representing the axial electric field ($\vec{E}_z$, red) and radial magnetic cusp field ($\vec{B}_r$, emerald green).
* **Live Telemetry & Diagnostics**:
  * Exhaust velocity ($v_e$), Specific impulse ($I_{sp}$), Thrust ($T$), Discharge power ($P_d$), Total anode efficiency ($\eta_{\text{total}}$), Electron Larmor radius ($r_{L,e}$), and Ion Hall parameter ($\Omega_i$).
  * Dynamic warning alerts for **Channel Wall Sputtering** and **Plasma Instability** during under-magnetized or over-voltage operations.
* **Dual-Axis Chart.js Curve**: Live graphs plotting $I_{sp}$ and Thrust across varying discharge voltages, dynamically updated as propellant species and mass flow change.

### 4. Orbital Mission Sim (`Mode D`)
A real-time astrodynamics trajectory simulator projecting low-thrust continuous spiral transfers in a 3D Earth and Lunar space environment:
* **Mission Presets**:
  * **LEO Constellation Orbit Raise**: $350\text{ km} \to 550\text{ km}$ orbital altitude insertion.
  * **LEO $\to$ GEO Low-Thrust Spiral**: $400\text{ km} \to 35,786\text{ km}$ geostationary transfer.
  * **Lunar Gateway Cargo Spiral**: High-efficiency cis-lunar transfer orbit.
  * **Deep-Space Asteroid Rendezvous**: Long-duration interplanetary cruise.
* **Numerical Trajectory Visualizer**: 3D multi-revolution spiral line rendered with vertex color gradients indicating active thrust arcs, planned trajectories, and fuel exhaustion points.
* **Dynamic Spacecraft & Propellant Hologram**: Miniature 3D probe with articulated solar arrays and active plasma plume, accompanied by a real-time 3D depleted propellant tank indicator.
* **Interactive Mission Scrubbing**: Play, pause, reset, and scrub through burn timelines with acceleration from $1\times$ to $10,000\times$.

### 5. Pilot & Gimbal Game (`Mode E`)
A full 3D 6-DOF plasma spacecraft flight simulator:
* **Articulated Dual-Axis Gimbal**: Visual thruster gimbal mount responding in real time to pitch and yaw flight inputs.
* **Procedural Aerospace Spacecraft**: High-detail spacecraft featuring a thermal protection nose cone, docking mechanism, dual high-efficiency photovoltaic wings, and omnidirectional RCS thrusters.
* **Deep-Space Corridor Navigation**: Fly through orbital transit rings, dodge space debris and asteroid fields, and dock with orbital stations.
* **Capacitor Pulse Injection**: Trigger high-voltage capacitive discharge pulses for temporary surge thrust.
* **Channel Repair & Auto-Mag System**: In-flight automatic magnetic tuning (`Auto-Mag Sync`) and emergency ceramic channel sputtering repair.

---

## 🧮 Governing Physics Equations

The simulation implements first-principles aerospace electric propulsion and astrodynamic formulas:

### 1. Lorentz Force & Closed Azimuthal Hall Drift
Electrons and ions in the discharge channel experience the electromagnetic Lorentz force:
$$\vec{F} = q \left(\vec{E} + \vec{v} \times \vec{B}\right)$$

In the annular channel, an axial electric field $\vec{E} = E_z \hat{z}$ is established between the anode and the cathode plume, while magnetic coils generate a predominantly radial magnetic field $\vec{B} = B_r \hat{r}$.

Because electrons are strongly magnetized while ions are unmagnetized:
$$r_{L,e} = \frac{m_e v_{\perp,e}}{e B_r} \ll L_{\text{channel}} \ll r_{L,i} = \frac{m_i v_i}{e B_r}$$

Electrons are trapped into a closed azimuthal drift ($\vec{E} \times \vec{B}$) perpendicular to both fields:
$$\vec{v}_{\text{Hall}} = \frac{\vec{E} \times \vec{B}}{B^2} = \frac{E_z}{B_r} \hat{\theta}$$

### 2. Ion Exhaust Velocity ($v_e$)
Accelerated positive ions exit the thruster at exhaust velocity determined by the net accelerating potential:
$$v_e = \sqrt{\frac{2 q V_d \eta_v}{m_i}}$$
* $q = e = 1.602 \times 10^{-19}\text{ C}$ (elementary charge)
* $V_d$ = Discharge voltage ($\text{V}$)
* $\eta_v$ = Voltage utilization efficiency (accounting for plasma sheath drop and ionization energy cost)
* $m_i$ = Mass of the propellant ion ($\text{kg}$)

### 3. Specific Impulse ($I_{sp}$)
Specific impulse represents the propellant efficiency of the propulsion system:
$$I_{sp} = \frac{v_e}{g_0} \cdot \eta_{\text{mag}} = \frac{1}{g_0} \sqrt{\frac{2 e V_d \eta_v}{m_i}} \cdot \eta_{\text{mag}}$$
* $g_0 = 9.80665\text{ m/s}^2$ (standard gravitational acceleration)
* $\eta_{\text{mag}}$ = Magnetic confinement efficiency factor

### 4. Electrostatic Thrust ($T$)
The continuous thrust produced by the accelerated ion beam:
$$T = \dot{m} v_e \eta_{\text{mag}} = \dot{m} \sqrt{\frac{2 e V_d \eta_v}{m_i}} \cdot \eta_{\text{mag}}$$
* $\dot{m}$ = Propellant mass flow rate ($\text{kg/s}$)

### 5. Discharge Power ($P_d$) & Total Anode Efficiency ($\eta_{\text{total}}$)
The relationship between input electrical discharge power and kinetic jet power:
$$P_d = V_d I_d = \frac{T \cdot v_e}{2 \eta_{\text{total}}}$$
$$\eta_{\text{total}} = \frac{T^2}{2 \dot{m} P_d} = \eta_v \cdot \eta_{\text{mag}}^2 \cdot \eta_m$$
* $\eta_m$ = Mass utilization efficiency (fraction of propellant converted to accelerated ions)

### 6. Low-Thrust Orbital Spiral Transfer (Edelbaum)
For continuous, coplanar, quasi-circular low-thrust transfers between initial orbit radius $r_1$ and final orbit radius $r_2$:
$$\Delta v_{\text{Edelbaum}} = |v_1 - v_2| = \left| \sqrt{\frac{\mu_{\oplus}}{r_1}} - \sqrt{\frac{\mu_{\oplus}}{r_2}} \right|$$
* $\mu_{\oplus} = 3.986004418 \times 10^{14}\text{ m}^3/\text{s}^2$ (standard gravitational parameter of Earth)

### 7. Tsiolkovsky Rocket Equation & Propellant Budget
Maximum achievable velocity increment ($\Delta v_{\max}$) from initial wet mass $m_0$ to dry mass $m_f$:
$$\Delta v_{\max} = v_e \ln\left(\frac{m_0}{m_f}\right) = I_{sp} g_0 \ln\left(\frac{m_{\text{dry}} + m_{\text{prop}}}{m_{\text{dry}}}\right)$$

The required propellant mass ($m_{\text{prop,req}}$) and continuous burn duration ($t_{\text{burn}}$):
$$m_{\text{prop,req}} = m_0 \left(1 - \exp\left(-\frac{\Delta v_{\text{req}}}{v_e}\right)\right)$$
$$t_{\text{burn}} = \frac{m_{\text{prop,req}}}{N_{\text{thrusters}} \cdot \dot{m}}$$

---

## 🧪 Propellant Characteristics

| Propellant Species | Atomic Mass ($u$) | 1st Ionization Energy | Optimum $B_r$ Scale | Plume Luminescence Color | Typical Application |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Xenon ($^{131}\text{Xe}$)** | $131.29$ | $12.13\text{ eV}$ | Standard ($1.0\times$) | Cyan / Azure Blue | High-thrust, flight-proven orbital missions |
| **Krypton ($^{84}\text{Kr}$)** | $83.80$ | $14.00\text{ eV}$ | Elevated ($1.04\times$) | Lavender / Deep Violet | Cost-efficient commercial satellite constellations |
| **Argon ($^{40}\text{Ar}$)** | $39.95$ | $15.76\text{ eV}$ | High ($1.10\times$) | Electric Purple / Magenta | High-$I_{sp}$ long-range deep-space missions |

---

## 🔊 Procedural Web Audio Engine

The lab includes a custom zero-sample, real-time procedural audio synthesis engine (`PlasmaAudioEngine`) implemented using the browser's native **Web Audio API**:
* **High-Voltage Anode Hum**: Low-frequency multi-oscillator hum modulated with subtle 50/60 Hz harmonics.
* **Plasma Discharge Hiss & Crackle**: Filtered pink/white noise processed through dynamic bandpass and highpass filters to emulate turbulent plasma boundary layers.
* **Electron Gyrofrequency Pitch Shift**: The primary synthesis pitch dynamically tracks the cyclotron frequency ($\omega_{ce} = \frac{e B}{m_e}$), pitch-shifting upwards as magnetic field or voltage increases.
* **Dynamic Throttle Rumble & Audio Ducking**: Real-time gain scheduling responding to throttle changes, capacitor pulse discharges, and camera proximity.

---

## 🎮 Flight Simulator Controls (Mode 5)

| Key / Input | Action |
| :--- | :--- |
| **`W` / `ArrowUp`** | Pitch Down / Gimbal Forward Tilt |
| **`S` / `ArrowDown`** | Pitch Up / Gimbal Aft Tilt |
| **`A` / `ArrowLeft`** | Yaw Left / Gimbal Left |
| **`D` / `ArrowRight`** | Yaw Right / Gimbal Right |
| **`Space`** | Fire High-Voltage Capacitor Surge Pulse |
| **`1` / `2` / `3`** | In-flight Propellant Hot-Swap (`1`: Xenon, `2`: Krypton, `3`: Argon) |
| **`C`** | Cycle Camera View (Chase Cam, Cockpit Nose Cam, Orbital Orbit Cam) |
| **`F`** | Toggle Auto-Magnetic Tuning (`Auto-Mag Sync`) |
| **`R`** | Emergency Field Repair (Ceramic Boron Nitride Wall Sputtering) |
| **`LMB Drag`** | 3D Orbit Camera (Mode A, B, C, D) |
| **`RMB Drag`** | Pan Viewport |
| **`Scroll`** | Zoom In / Out |

---

## 🛠️ Tech Stack & Architecture

* **3D Graphics Engine**: [Three.js](https://threejs.org/) (r128) WebGL rendering pipeline
* **Post-Processing Shaders**: `EffectComposer`, `RenderPass`, `UnrealBloomPass`, `ShaderPass`, `CopyShader`, `LuminosityHighPassShader` for authentic plasma glow and bloom
* **Styling & HUD**: [Tailwind CSS](https://tailwindcss.com/) with custom glassmorphism panels, scanline overlays, and telemetry readouts
* **Data Visualization**: [Chart.js](https://www.chartjs.org/) (v4.4.1) dual-axis performance curve tracking
* **Audio Synthesis**: Procedural Web Audio API (`AudioContext`, `BiquadFilterNode`, `OscillatorNode`, `GainNode`)
* **Typography & Icons**: [FontAwesome 6](https://fontawesome.com/) + Google Fonts (`JetBrains Mono`, `Inter`)
* **Zero External Build Step**: Pure ES6 vanilla JavaScript with standard CDN imports. Runs out-of-the-box in any modern browser without npm build steps or compilation.

---

## 💻 Local Run Instructions

Because HET-X1 uses standard web technologies without bundlers or transpilation, you can run it with any static web server:

### Option 1: Python 3 (Recommended)
```bash
# Clone the repository
git clone https://github.com/ant877931-dotcom/het-x1-plasma-thruster.git
cd het-x1-plasma-thruster

# Start local HTTP server
python -m http.server 8080
```
Open your browser and navigate to:
```
http://localhost:8080
```

### Option 2: Node.js `npx serve`
```bash
npx serve .
```

### Option 3: VS Code Live Server
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (`ritwickdey.LiveServer`).
3. Right-click `index.html` and select **"Open with Live Server"**.

---

## 📜 License

This project is open-source and released under the [MIT License](LICENSE).
Feel free to use it for aerospace education, physics demonstrations, and simulation research.

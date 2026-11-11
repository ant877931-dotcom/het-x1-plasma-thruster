/* ==========================================================================
   HET-X1 // HALL-EFFECT PLASMA THRUSTER INTERACTIVE 3D SIMULATOR
   Principal WebGL/Three.js Graphics & Aerospace Plasma Propulsion Engine
   ========================================================================== */

(function () {
  'use strict';

  // ========================================================================
  // 1. PHYSICAL CONSTANTS & PROPELLANT DATABASE
  // ========================================================================
  const PHYSICS_CONSTANTS = {
    AMU_TO_KG: 1.66054e-27,      // Atomic mass unit (kg)
    ELEM_CHARGE: 1.60218e-19,    // Elementary charge e (Coulombs)
    G0: 9.80665,                 // Standard gravity (m/s^2)
    MU_EARTH: 3.986004418e14,    // Earth gravitational parameter mu (m^3/s^2)
    R_EARTH_KM: 6371.0,          // Earth mean radius (km)
    R_EARTH_M: 6371000.0,        // Earth mean radius (m)
  };

  const PROPELLANTS = {
    Xe: {
      key: 'Xe',
      name: 'Xenon',
      symbol: 'Xe',
      ionSymbol: 'Xe⁺',
      neutralSymbol: 'Xe⁰',
      atomicMass: 131.29,        // u
      ionizationEnergy: 12.13,   // eV
      baseVoltageEff: 0.91,
      baseMassEff: 0.92,
      primaryHex: '#3b82f6',
      secondaryHex: '#6366f1',
      coreHex: '#3b82f6',
      primaryColor: new THREE.Color(0x3b82f6),
      secondaryColor: new THREE.Color(0x6366f1),
      coreColor: new THREE.Color(0x3b82f6),
    },
    Kr: {
      key: 'Kr',
      name: 'Krypton',
      symbol: 'Kr',
      ionSymbol: 'Kr⁺',
      neutralSymbol: 'Kr⁰',
      atomicMass: 83.80,         // u
      ionizationEnergy: 14.00,   // eV
      baseVoltageEff: 0.87,
      baseMassEff: 0.88,
      primaryHex: '#06b6d4',
      secondaryHex: '#0284c7',
      coreHex: '#06b6d4',
      primaryColor: new THREE.Color(0x06b6d4),
      secondaryColor: new THREE.Color(0x0284c7),
      coreColor: new THREE.Color(0x06b6d4),
    },
    Ar: {
      key: 'Ar',
      name: 'Argon',
      symbol: 'Ar',
      ionSymbol: 'Ar⁺',
      neutralSymbol: 'Ar⁰',
      atomicMass: 39.95,         // u
      ionizationEnergy: 15.76,   // eV
      baseVoltageEff: 0.82,
      baseMassEff: 0.83,
      primaryHex: '#a855f7',
      secondaryHex: '#9333ea',
      coreHex: '#a855f7',
      primaryColor: new THREE.Color(0xa855f7),
      secondaryColor: new THREE.Color(0x9333ea),
      coreColor: new THREE.Color(0xa855f7),
    },
  };

  // ========================================================================
  // 2. COMPONENT ENGINEERING SPECIFICATIONS (FOR MODE A: BUILD & INSPECT)
  // ========================================================================
  const THRUSTER_COMPONENTS = [
    {
      id: 'backplate',
      order: 1,
      name: 'Magnetic Circuit & Backplate',
      shortName: '1. Ferromagnetic Core & Backplate',
      icon: 'fa-shield-halved',
      material: 'Ferromagnetic Iron-Cobalt Steel (1018)',
      operatingTemp: '450 K – 620 K',
      physicsFunction:
        'Forms the low-reluctance magnetic flux return path linking the inner pole piece and outer coils to concentrate radial magnetic flux (Br) at the nozzle exit.',
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, 0, -3.4),
      installed: true,
    },
    {
      id: 'ceramic_channel',
      order: 2,
      name: 'Coaxial Discharge Channel (BN Ring)',
      shortName: '2. Boron Nitride Ceramic Channel',
      icon: 'fa-circle-dot',
      material: 'Hot-Pressed Boron Nitride (HP-BN / SiO₂)',
      operatingTemp: '700 K – 1,150 K',
      physicsFunction:
        'Annular dielectric chamber where propellant ionization and electrostatic acceleration occur. Insulates the high-voltage anode (+300–800 V) from the grounded frame.',
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, 0, 2.9),
      installed: true,
    },
    {
      id: 'anode_ring',
      order: 3,
      name: 'Anode & Propellant Distributor Ring',
      shortName: '3. Copper Anode & Gas Distributor',
      icon: 'fa-ring',
      material: 'OFHC Copper / Tungsten-Coated Stainless',
      operatingTemp: '650 K – 900 K',
      physicsFunction:
        'Biased at high positive potential (+Vd) to establish the axial electric field (Ez) while injecting neutral propellant gas uniformly through 24 swirl orifices.',
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(-2.8, 1.3, -0.8),
      installed: true,
    },
    {
      id: 'magnet_coils',
      order: 4,
      name: 'Radial Electromagnet Coils (1 Inner + 4 Outer)',
      shortName: '4. Radial Electromagnet Coils (Br)',
      icon: 'fa-magnet',
      material: 'Polyimide-Insulated AWG-14 Copper Solenoids',
      operatingTemp: '480 K – 680 K',
      physicsFunction:
        'Generates the radial magnetic barrier (Br = 50–350 G) across the channel exit that traps lightweight electrons in an azimuthal E×B Hall drift current.',
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(2.9, 1.2, 0.6),
      installed: true,
    },
    {
      id: 'hollow_cathode',
      order: 5,
      name: 'External Hollow Cathode (Neutralizer)',
      shortName: '5. External Hollow Cathode (LaB₆)',
      icon: 'fa-wand-magic-sparkles',
      material: 'Lanthanum Hexaboride (LaB₆) in Mo Tube',
      operatingTemp: '1,450 K – 1,900 K',
      physicsFunction:
        'Emits thermionic electrons: ~18% enter the channel to ionize neutral propellant, while ~82% neutralize the positive ion exhaust beam to prevent spacecraft charging.',
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, 2.4, 1.6),
      installed: true,
    },
    {
      id: 'propellant_supply',
      order: 6,
      name: 'Propellant Tank & Mass Flow Manifold',
      shortName: '6. Propellant Tank Supply (Xe/Kr/Ar)',
      icon: 'fa-gauge-simple-high',
      material: 'Carbon-Overwrapped Ti-6Al-4V Vessel + MFC',
      operatingTemp: '275 K – 315 K',
      physicsFunction:
        'Stores high-pressure inert gas and regulates precision mass flow (ṁ = 1.0–20.0 mg/s) through stainless-steel feedlines to the anode manifold and hollow cathode.',
      assembledPos: new THREE.Vector3(0, 0, 0),
      explodedPos: new THREE.Vector3(0, -2.1, -1.8),
      installed: true,
    },
  ];

  // ========================================================================
  // 3. MODE B: 4-STAGE GUIDED PHYSICS WALKTHROUGH DATA
  // ========================================================================
  const LEARN_STAGES = [
    {
      stage: 1,
      tag: 'STAGE 1 OF 4 // POTENTIAL & CATHODE IGNITION',
      cameraHint: 'Cathode & Anode Focus',
      title: 'Cathode Ignition & Axial Electric Field (E<sub>z</sub>)',
      body:
        'A DC power processing unit biases the perforated copper Anode Ring at +300 V relative to the External Hollow Cathode (0 V). The heated LaB₆ hollow cathode emits primary electrons into vacuum, which are immediately drawn upstream into the Boron Nitride ceramic channel by the axial electric field (E<sub>z</sub>, red arrows).',
      equation: 'E_z = -dV_d / dz ≈ V_d / L_accel  (Anode +300V → Exit 0V)',
      subequation:
        'Force on primary electrons: F_e = -e · E_z (accelerating electrons into the channel toward the anode).',
      highlights: [
        { color: 'bg-red-500', text: 'Red 3D Arrows: Axial Electric Field (Ez) pointing from Anode (+Vd) to Nozzle Exit.' },
        { color: 'bg-amber-300', text: 'Cyan-Gold Stream: Primary electrons emitted from the top External Hollow Cathode.' },
        { color: 'bg-amber-500', text: 'Copper Anode Base: Biased at high positive potential at the back of the BN channel.' },
      ],
      cameraPos: new THREE.Vector3(4.3, 2.3, 2.8),
      cameraTarget: new THREE.Vector3(0.0, 0.65, -0.15),
      showCutaway: true,
      showEz: true,
      showBr: false,
    },
    {
      stage: 2,
      tag: 'STAGE 2 OF 4 // LORENTZ FORCE & HALL CURRENT',
      cameraHint: 'Channel Exit Magnetic Lens',
      title: 'Radial Magnetic Confinement & The Hall Effect (E × B)',
      body:
        'Before electrons can reach the anode, they encounter a strong Radial Magnetic Field (B<sub>r</sub>, green lines) generated between the inner solenoid core and outer electromagnet poles. By the Lorentz force, perpendicular axial E<sub>z</sub> and radial B<sub>r</sub> fields lock lightweight electrons into a high-speed azimuthal circular orbit—the Hall Current!',
      equation: 'v_E×B = (E_z × B_r) / B_r²   |   r_Le = (m_e · v_e) / (e · B_r) ≪ L',
      subequation:
        'Electron Larmor radius r_Le is ~1 mm, trapping electrons in a dense swirling ring near the channel exit.',
      highlights: [
        { color: 'bg-emerald-400', text: 'Green Curved Lines: Radial Magnetic Field (Br) spanning inner to outer magnetic poles.' },
        { color: 'bg-yellow-300', text: 'Glowing Azimuthal Ring: Trapped Hall electrons orbiting at >1,000 km/s around the channel.' },
        { color: 'bg-cyan-400', text: 'Cross-Field Barrier: Prevents electrons from shorting directly to the anode.' },
      ],
      cameraPos: new THREE.Vector3(3.1, 1.35, 3.2),
      cameraTarget: new THREE.Vector3(0.0, 0.1, 0.25),
      showCutaway: true,
      showEz: true,
      showBr: true,
    },
    {
      stage: 3,
      tag: 'STAGE 3 OF 4 // ELECTRON-NEUTRAL COLLISIONAL IONIZATION',
      cameraHint: 'Internal BN Ionization Zone',
      title: 'Propellant Injection & Collisional Ionization',
      body:
        'Neutral propellant gas atoms (Xe⁰, grey-white particles) are injected slowly through 24 micro-orifices in the Anode ring. As neutral atoms diffuse forward into the dense, buzzing cloud of trapped Hall electrons, energetic electron-atom collisions knock off valence electrons—converting >90% of the gas into positively charged plasma ions (Xe⁺).',
      equation: 'e⁻ (fast Hall drift) + Xe⁰ → Xe⁺ + 2e⁻   (ΔE_ion = 12.13 eV)',
      subequation:
        'Because electrons are magnetically trapped, a single electron orbits hundreds of times until it ionizes a neutral atom.',
      highlights: [
        { color: 'bg-slate-300', text: 'Slow White/Grey Particles: Neutral gas atoms diffusing from the perforated Anode ring.' },
        { color: 'bg-cyan-200', text: 'Ionization Flashes: High-energy collisions stripping electrons inside the BN ceramic ring.' },
        { color: 'bg-blue-400', text: 'Newly Born Positive Ions (Xe⁺): Created right inside the peak electric field region.' },
      ],
      cameraPos: new THREE.Vector3(3.4, 1.05, 0.85),
      cameraTarget: new THREE.Vector3(0.0, 0.15, -0.35),
      showCutaway: true,
      showEz: true,
      showBr: true,
    },
    {
      stage: 4,
      tag: 'STAGE 4 OF 4 // ELECTROSTATIC THRUST & PLUME NEUTRALIZATION',
      cameraHint: 'Full Thruster & Exhaust Plume',
      title: 'Electrostatic Acceleration & Plume Neutralization',
      body:
        'Because a Xenon ion is ~240,000 times heavier than an electron, its Larmor radius is huge (r_Li ≫ L) and it is barely deflected by the magnetic field. The axial electric field (E<sub>z</sub>) violently shoots the positive ions out of the nozzle at 15–30 km/s, generating thrust! Simultaneously, secondary electrons from the External Cathode neutralize the exhaust plume.',
      equation: 'v_e = √(2 · e · V_d · η_v / m_i)   |   T = ṁ · v_e · η_mag',
      subequation:
        'Cathode neutralization keeps the exhaust beam quasi-neutral (n_e ≈ n_i) so ions never snap back to the spacecraft.',
      highlights: [
        { color: 'bg-blue-500', text: 'High-Velocity Glowing Plume: Unmagnetized heavy ions accelerated axially at 15–30 km/s.' },
        { color: 'bg-amber-300', text: 'Neutralizing Electron Stream: Cathode electrons injecting directly into the exhaust beam.' },
        { color: 'bg-indigo-400', text: 'Collimated Plasma Core: Focused annular jet producing continuous deep-space thrust.' },
      ],
      cameraPos: new THREE.Vector3(6.8, 3.0, 7.2),
      cameraTarget: new THREE.Vector3(0.0, 0.0, 2.2),
      showCutaway: true,
      showEz: true,
      showBr: true,
    },
  ];

  // ========================================================================
  // 4. APPLICATION STATE
  // ========================================================================
  const state = {
    mode: 'sim', // 'build' | 'learn' | 'sim' | 'orbit' | 'game'
    learnStage: 1,
    autoTourActive: false,
    autoTourTimer: 0,

    // Global Anti-Dazzle & Eye-Comfort Rendering Controls
    bloomEnabled: false,      // Bypass EffectComposer / UnrealBloomPass by default
    plasmaBrightness: 0.45,   // Live Plasma Brightness Dimmer (0.10 to 1.00, default 45%)

    // Viewport & Chart Toggles
    isCutaway: false,
    showVectorFields: true,
    chartMode: 'thruster', // 'thruster' | 'mission'

    // Physics Control Parameters
    propellant: 'Xe',
    voltage: 300,     // V (100 - 800)
    massFlow: 5.0,    // mg/s (1.0 - 20.0)
    magField: 180,    // Gauss (50 - 350)

    // Build Mode Validation & Failure Simulation State
    selectedPartId: 'ceramic_channel',
    hoveredPartId: null,
    buildIgnited: false,
    activeFailureMode: null, // null | 'short_circuit' | 'no_magnetic_lock' | 'no_cathode' | 'no_anode' | 'no_backplate' | 'no_propellant'
    failureTimer: 0,

    // Mode D: Orbital Maneuver & Delta-V Mission Simulator State
    orbit: {
      presetKey: 'starlink_leo',
      dryMass: 260,         // kg (100 - 5000)
      propMass: 20,         // kg (5 - 1200)
      h1: 350,              // km (200 - 2000)
      h2: 550,              // km (300 - 36000)
      clusterCount: 1,      // N (1 - 8)
      dvReqOverride: null,  // null (Edelbaum formula) or explicit mission target m/s
      warpSpeed: 1000,      // 100 | 1000 | 10000
      isBurning: false,
      burnProgress: 0.0,    // 0.0 -> 1.0 along mission trajectory
      elapsedSimHours: 0.0,
      remainingPropKg: 20.0,
      currentAltKm: 350.0,
      telemetry: {
        dvReq: 112.1,
        dvMax: 1295.0,
        propReqKg: 1.8,
        reservePropKg: 18.2,
        totalThrustMn: 83.4,
        burnTimeHours: 100.0,
        burnTimeDays: 4.2,
        accelMmS2: 0.30,
        isFeasible: true,
        achievableFraction: 1.0,
      },
    },

    // Mode E (Mode 5): Pilot & Gimbal Game State
    game: {
      missionKey: 'slalom',         // 'slalom' | 'debris' | 'docking'
      cameraView: 'chase',          // 'chase' | 'nozzle' | 'cockpit'
      throttlePct: 65.0,            // 0% -> 125% OVERDRIVE
      gimbalPitchDeg: 0.0,          // -15 -> +15 deg (W / S)
      gimbalYawDeg: 0.0,            // -15 -> +15 deg (A / D)
      autoMagSync: false,           // F toggle (auto-tracks Br = B_opt at extra capacitor cost)
      channelIntegrity: 100.0,      // 0% -> 100% Boron Nitride HP
      capacitorPct: 100.0,          // 0% -> 100% Capacitor & Solar Power
      propTankKg: 12.0,             // Remaining propellant (kg)
      maxPropTankKg: 12.0,
      pulseBoostTimer: 0.0,         // > 0 while SPACE burst thrust is active
      pulseCooldown: 0.0,
      channelShutdownTimer: 0.0,    // > 0 when BN channel integrity hits 0%
      solarStormBiasG: 0.0,         // Solar storm magnetic perturbation in Mission 2
      score: 0,
      elapsedSec: 0.0,
      gatesCleared: 0,
      totalGates: 12,
      debrisDodged: 0,
      totalDebrisWaves: 12,
      dockingLockSec: 0.0,
      targetDockingSec: 30.0,
      isFinished: false,
      bestRanks: {
        slalom: null,
        debris: null,
        docking: null,
      },
    },

    // Computed Real-Time Telemetry Outputs
    telemetry: {
      ionMassKg: 0,
      etaV: 0.9,
      optimalB: 180,
      etaMag: 0.94,
      exhaustVelocityMs: 19800,
      exhaustVelocityKms: 19.8,
      isp: 1900,
      thrustMn: 93,
      etaTotal: 0.65,
      powerW: 1350,
      currentA: 4.5,
      divergenceDeg: 14.0,
      isSputtering: false,
      erosionSeverity: 0.0,
    },
  };

  // ========================================================================
  // 5. REAL-TIME HALL THRUSTER PHYSICS SOLVER
  // ========================================================================
  function computeThrusterPhysics(propKey, Vd, mDotMgS, Br) {
    const prop = PROPELLANTS[propKey] || PROPELLANTS.Xe;
    const m_i = prop.atomicMass * PHYSICS_CONSTANTS.AMU_TO_KG;
    const e = PHYSICS_CONSTANTS.ELEM_CHARGE;
    const g0 = PHYSICS_CONSTANTS.G0;

    // 1. Voltage utilization efficiency (accounts for ionization cost & anode sheath)
    const ionLossRatio = (2.1 * prop.ionizationEnergy) / Math.max(Vd, 80);
    const etaV = Math.max(0.55, Math.min(0.94, prop.baseVoltageEff * (1.0 - ionLossRatio)));

    // 2. Optimal radial magnetic field strength scales with sqrt(Vd)
    // Lighter ions / higher electron temperature require slightly tuned B field
    const massFactor = Math.pow(131.29 / prop.atomicMass, 0.08);
    const optimalB = 180.0 * Math.sqrt(Vd / 300.0) * massFactor;

    // 3. Magnetic Confinement Efficiency Factor (eta_mag)
    const rB = Br / optimalB;
    let etaMag;
    if (rB < 0.85) {
      // Insufficient magnetic confinement: electrons rush axially to anode, ions bombard walls
      const norm = Math.max(0, rB / 0.85);
      etaMag = 0.28 + 0.65 * Math.pow(norm, 1.75);
    } else if (rB <= 1.30) {
      // Optimal Hall confinement plateau
      const plateauPhase = (rB - 0.85) / 0.45;
      etaMag = 0.93 + 0.032 * Math.sin(plateauPhase * Math.PI);
    } else {
      // Slight over-magnetization spoke oscillation dip
      etaMag = Math.max(0.84, 0.93 - 0.075 * (rB - 1.30));
    }
    etaMag = Math.max(0.25, Math.min(0.965, etaMag));

    // 4. Exhaust Velocity: v_e = sqrt((2 * e * Vd * eta_v) / m_i)
    const exhaustVelocityMs = Math.sqrt((2.0 * e * Vd * etaV) / m_i);
    const exhaustVelocityKms = exhaustVelocityMs / 1000.0;

    // 5. Specific Impulse: Isp = (v_e / 9.80665) * eta_mag
    const isp = (exhaustVelocityMs / g0) * etaMag;

    // 6. Thrust: T = m_dot * v_e * eta_mag (displayed in mN)
    // mDotMgS is in mg/s = 1e-6 kg/s; multiplying by 1e3 gives mN -> 1e-3 * mDotMgS * v_e * etaMag
    const thrustMn = mDotMgS * 1e-3 * exhaustVelocityMs * etaMag;
    const thrustN = thrustMn * 1e-3;

    // 7. Total Efficiency & Discharge Power: P = (T * v_e) / (2 * eta_total)
    const massUtilEff = Math.min(0.95, prop.baseMassEff * (0.88 + 0.12 * Math.min(1, mDotMgS / 6.0)));
    const etaTotal = Math.max(0.18, Math.min(0.72, etaV * etaMag * etaMag * massUtilEff));
    const powerW = (thrustN * exhaustVelocityMs) / (2.0 * etaTotal);
    const currentA = powerW / Math.max(Vd, 1);

    // 8. Plume Divergence Half-Angle & Wall Sputtering Assessment
    const divergenceDeg = 11.5 + Math.pow(1.0 - etaMag, 1.35) * 48.0;
    const isSputtering = etaMag < 0.76 || (Vd > 480 && rB < 0.80);
    let erosionSeverity = 0.0;
    if (etaMag < 0.78) {
      erosionSeverity = Math.min(1.0, (0.78 - etaMag) / 0.36);
    }
    if (Vd > 450 && rB < 0.82) {
      const highVoltErosion = ((Vd - 450) / 350) * ((0.82 - rB) / 0.45);
      erosionSeverity = Math.min(1.0, Math.max(erosionSeverity, highVoltErosion));
    }

    return {
      ionMassKg: m_i,
      etaV,
      optimalB,
      etaMag,
      exhaustVelocityMs,
      exhaustVelocityKms,
      isp,
      thrustMn,
      etaTotal,
      powerW,
      currentA,
      divergenceDeg,
      isSputtering,
      erosionSeverity,
    };
  }

  // ========================================================================
  // 5B. PROCEDURAL WEB AUDIO SYNTHESIZER (PlasmaAudioEngine)
  // ========================================================================
  class PlasmaAudioEngine {
    constructor() {
      this.ctx = null;
      this.isInitialized = false;
      this.isMuted = false;
      this.masterVolume = 0.65;

      // Master & Bus Nodes
      this.masterGain = null;
      this.plasmaBusGain = null;
      this.noiseBuffer = null;

      // 1. Base Plasma Discharge Hum (50 - 180 Hz)
      this.humOscSaw = null;
      this.humOscTri = null;
      this.humWaveShaper = null;
      this.humFilter = null;
      this.humGain = null;

      // 2. Hall Current E×B Cyclotron Whine (400 - 2400 Hz)
      this.cyclotronOsc = null;
      this.cyclotronFilter = null;
      this.cyclotronGain = null;
      this.cyclotronPanner = null;
      this.breathingLfo = null;
      this.breathingLfoGain = null;

      // 3. Accelerated Ion Plume Jet Hiss (800 - 4500 Hz bandpass)
      this.plumeSource = null;
      this.plumeFilter = null;
      this.plumeGain = null;
      this.plumePanner = null;

      // Timers for stochastic crackles & arc zaps
      this.sputterAccum = 0;
      this.arcZapAccum = 0;
    }

    ensureContext() {
      if (!this.isInitialized) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return false;
        this.ctx = new AudioCtx();
        this._buildAudioGraph();
        this.isInitialized = true;
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.isInitialized;
    }

    _createPinkWhiteNoiseBuffer(durationSec = 3.0) {
      const sr = this.ctx.sampleRate;
      const length = Math.floor(sr * durationSec);
      const buffer = this.ctx.createBuffer(1, length, sr);
      const data = buffer.getChannelData(0);
      // Paul Kellet pink noise filter blended with crisp white noise
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < length; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.045;
        b6 = white * 0.115926;
        data[i] = pink * 0.65 + white * 0.35;
      }
      return buffer;
    }

    _createWarmSaturationCurve(amount = 24) {
      const nSamples = 1024;
      const curve = new Float32Array(nSamples);
      const deg = Math.PI / 180;
      for (let i = 0; i < nSamples; i++) {
        const x = (i * 2) / nSamples - 1;
        curve[i] = ((3 + amount) * x * 20 * deg) / (Math.PI + amount * Math.abs(x));
      }
      return curve;
    }

    _buildAudioGraph() {
      const now = this.ctx.currentTime;

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, now);
      this.masterGain.connect(this.ctx.destination);

      this.plasmaBusGain = this.ctx.createGain();
      this.plasmaBusGain.gain.setValueAtTime(0.0, now);
      this.plasmaBusGain.connect(this.masterGain);

      this.noiseBuffer = this._createPinkWhiteNoiseBuffer(3.0);

      // ------------------------------------------------------------------
      // 1. Base Plasma Discharge Hum (50-180 Hz): Dual detuned sawtooth + triangle
      // ------------------------------------------------------------------
      this.humOscSaw = this.ctx.createOscillator();
      this.humOscSaw.type = 'sawtooth';
      this.humOscSaw.frequency.setValueAtTime(87, now);

      this.humOscTri = this.ctx.createOscillator();
      this.humOscTri.type = 'triangle';
      this.humOscTri.frequency.setValueAtTime(87.8, now);
      this.humOscTri.detune.setValueAtTime(7, now);

      this.humWaveShaper = this.ctx.createWaveShaper();
      this.humWaveShaper.curve = this._createWarmSaturationCurve(18);
      this.humWaveShaper.oversample = '2x';

      this.humFilter = this.ctx.createBiquadFilter();
      this.humFilter.type = 'lowpass';
      this.humFilter.frequency.setValueAtTime(240, now);
      this.humFilter.Q.setValueAtTime(2.4, now);

      this.humGain = this.ctx.createGain();
      this.humGain.gain.setValueAtTime(0.14, now);

      this.humOscSaw.connect(this.humWaveShaper);
      this.humOscTri.connect(this.humWaveShaper);
      this.humWaveShaper.connect(this.humFilter);
      this.humFilter.connect(this.humGain);
      this.humGain.connect(this.plasmaBusGain);

      this.humOscSaw.start(now);
      this.humOscTri.start(now);

      // ------------------------------------------------------------------
      // 2. Hall Current E×B Cyclotron Whine (400-2400 Hz) + Breathing LFO
      // ------------------------------------------------------------------
      this.cyclotronOsc = this.ctx.createOscillator();
      this.cyclotronOsc.type = 'sine';
      this.cyclotronOsc.frequency.setValueAtTime(1150, now);

      // Breathing mode oscillation LFO (15-25 kHz scaled into audible 16-24 Hz FM)
      this.breathingLfo = this.ctx.createOscillator();
      this.breathingLfo.type = 'sine';
      this.breathingLfo.frequency.setValueAtTime(19.5, now);

      this.breathingLfoGain = this.ctx.createGain();
      this.breathingLfoGain.gain.setValueAtTime(14.0, now);
      this.breathingLfo.connect(this.breathingLfoGain);
      this.breathingLfoGain.connect(this.cyclotronOsc.frequency);

      this.cyclotronFilter = this.ctx.createBiquadFilter();
      this.cyclotronFilter.type = 'bandpass';
      this.cyclotronFilter.frequency.setValueAtTime(1150, now);
      this.cyclotronFilter.Q.setValueAtTime(6.5, now);

      this.cyclotronGain = this.ctx.createGain();
      this.cyclotronGain.gain.setValueAtTime(0.06, now);

      this.cyclotronPanner = this.ctx.createStereoPanner
        ? this.ctx.createStereoPanner()
        : null;

      this.cyclotronOsc.connect(this.cyclotronFilter);
      this.cyclotronFilter.connect(this.cyclotronGain);
      if (this.cyclotronPanner) {
        this.cyclotronGain.connect(this.cyclotronPanner);
        this.cyclotronPanner.connect(this.plasmaBusGain);
      } else {
        this.cyclotronGain.connect(this.plasmaBusGain);
      }

      this.cyclotronOsc.start(now);
      this.breathingLfo.start(now);

      // ------------------------------------------------------------------
      // 3. Accelerated Ion Plume Jet Hiss (Bandpass-filtered noise)
      // ------------------------------------------------------------------
      this.plumeSource = this.ctx.createBufferSource();
      this.plumeSource.buffer = this.noiseBuffer;
      this.plumeSource.loop = true;

      this.plumeFilter = this.ctx.createBiquadFilter();
      this.plumeFilter.type = 'bandpass';
      this.plumeFilter.frequency.setValueAtTime(1600, now);
      this.plumeFilter.Q.setValueAtTime(2.2, now);

      this.plumeGain = this.ctx.createGain();
      this.plumeGain.gain.setValueAtTime(0.12, now);

      this.plumePanner = this.ctx.createStereoPanner
        ? this.ctx.createStereoPanner()
        : null;

      this.plumeSource.connect(this.plumeFilter);
      this.plumeFilter.connect(this.plumeGain);
      if (this.plumePanner) {
        this.plumeGain.connect(this.plumePanner);
        this.plumePanner.connect(this.plasmaBusGain);
      } else {
        this.plumeGain.connect(this.plasmaBusGain);
      }

      this.plumeSource.start(now);

      // ------------------------------------------------------------------
      // 4. Mode 5: 2-Axis Gimbal Servo Actuator Motor Whine (180 - 540 Hz)
      // ------------------------------------------------------------------
      this.servoOsc = this.ctx.createOscillator();
      this.servoOsc.type = 'sawtooth';
      this.servoOsc.frequency.setValueAtTime(220, now);

      this.servoFilter = this.ctx.createBiquadFilter();
      this.servoFilter.type = 'bandpass';
      this.servoFilter.frequency.setValueAtTime(420, now);
      this.servoFilter.Q.setValueAtTime(4.5, now);

      this.servoGain = this.ctx.createGain();
      this.servoGain.gain.setValueAtTime(0.0, now);

      this.servoOsc.connect(this.servoFilter);
      this.servoFilter.connect(this.servoGain);
      this.servoGain.connect(this.masterGain);
      this.servoOsc.start(now);
    }

    setMuted(muted) {
      this.ensureContext();
      this.isMuted = Boolean(muted);
      if (this.isInitialized && this.masterGain) {
        const now = this.ctx.currentTime;
        const target = this.isMuted ? 0.0 : this.masterVolume;
        this.masterGain.gain.setTargetAtTime(target, now, 0.03);
      }
      this.syncNavbarAudioUI();
    }

    toggleMute() {
      this.setMuted(!this.isMuted);
      if (!this.isMuted) {
        this.playUIChirp('nav');
      }
    }

    setMasterVolume(percentValue) {
      this.ensureContext();
      const clamped = Math.max(0, Math.min(100, Number(percentValue)));
      this.masterVolume = clamped / 100.0;
      if (clamped > 0 && this.isMuted) {
        this.isMuted = false;
      }
      if (this.isInitialized && this.masterGain) {
        const now = this.ctx.currentTime;
        const target = this.isMuted ? 0.0 : this.masterVolume;
        this.masterGain.gain.setTargetAtTime(target, now, 0.025);
      }
      this.syncNavbarAudioUI();
    }

    syncNavbarAudioUI() {
      const iconEl = document.getElementById('icon-audio-state');
      const eqEl = document.getElementById('audio-eq-indicator');
      const valEl = document.getElementById('val-master-volume');
      const sliderEl = document.getElementById('slider-master-volume');

      const pct = Math.round(this.masterVolume * 100);
      if (valEl) valEl.textContent = this.isMuted ? 'MUTE' : `${pct}%`;
      if (sliderEl && Number(sliderEl.value) !== pct) {
        sliderEl.value = String(pct);
      }

      const activeAudio = !this.isMuted && pct > 0;
      if (iconEl) {
        if (!activeAudio) {
          iconEl.className = 'fa-solid fa-volume-xmark text-slate-400';
        } else if (pct < 45) {
          iconEl.className = 'fa-solid fa-volume-low text-cyan-400';
        } else {
          iconEl.className = 'fa-solid fa-volume-high text-cyan-400';
        }
      }
      if (eqEl) {
        eqEl.classList.toggle('audio-active', activeAudio);
        eqEl.style.opacity = activeAudio ? '1' : '0.35';
      }
    }

    // --------------------------------------------------------------------
    // Continuous Real-Time Physics Soundscape Modulation (Called in animate)
    // --------------------------------------------------------------------
    updateContinuousSound(dt, elapsed, appState, isPlasmaRunning) {
      if (!this.isInitialized || !this.ctx || this.ctx.state !== 'running') return;

      const now = this.ctx.currentTime;
      const tel = appState.telemetry;

      // Determine whether Mode D or Mode E fuel exhaustion / shutdown has occurred
      const orbitFuelExhausted =
        appState.mode === 'orbit' &&
        appState.orbit.remainingPropKg <= 0.001 &&
        appState.orbit.burnProgress > 0.01;

      const gamePlasmaCut =
        appState.mode === 'game' &&
        (appState.game.throttlePct <= 0.5 ||
          appState.game.channelShutdownTimer > 0 ||
          appState.game.propTankKg <= 0.005);

      const shouldSoundPlasma = isPlasmaRunning && !orbitFuelExhausted && !gamePlasmaCut;

      // Smoothly gate continuous plasma bus gain
      let targetBusGain = 0.0;
      if (shouldSoundPlasma) {
        if (appState.mode === 'orbit' && appState.orbit.isBurning) {
          targetBusGain = 1.15;
        } else if (appState.mode === 'game') {
          const thrGain = Math.min(1.25, 0.25 + (appState.game.throttlePct / 100.0) * 0.85);
          const pulseBoostAdd = appState.game.pulseBoostTimer > 0 ? 0.35 : 0.0;
          targetBusGain = thrGain + pulseBoostAdd;
        } else {
          targetBusGain = 0.90;
        }
      }
      this.plasmaBusGain.gain.setTargetAtTime(targetBusGain, now, 0.06);

      // Silence gimbal servo when not in Mode 5
      if (appState.mode !== 'game' && this.servoGain) {
        this.servoGain.gain.setTargetAtTime(0.0, now, 0.04);
      }

      if (shouldSoundPlasma) {
        // 1. Base Plasma Discharge Hum (50-180 Hz): scales with Vd (100V -> 800V)
        const vdNorm = Math.max(0, Math.min(1, (appState.voltage - 100) / 700));
        const humFreq = 50.0 + vdNorm * 130.0;
        this.humOscSaw.frequency.setTargetAtTime(humFreq, now, 0.04);
        this.humOscTri.frequency.setTargetAtTime(humFreq * 1.006 + 0.45, now, 0.04);

        const powerNorm = Math.max(0, Math.min(1, tel.powerW / 4500));
        const thrustNorm = Math.max(0, Math.min(1, tel.thrustMn / 260));
        const humCutoff = 155 + vdNorm * 260 + powerNorm * 120;
        this.humFilter.frequency.setTargetAtTime(humCutoff, now, 0.05);

        const humAmp = 0.075 + (0.55 * powerNorm + 0.45 * thrustNorm) * 0.165;
        this.humGain.gain.setTargetAtTime(humAmp, now, 0.05);

        // 2. Hall Current E×B Cyclotron Whine (400-2400 Hz): tracks Br & etaMag
        const brNorm = Math.max(0, Math.min(1, (appState.magField - 50) / 300));
        const cycFreq = 400.0 + (0.68 * brNorm + 0.32 * tel.etaMag) * 2000.0;
        this.cyclotronOsc.frequency.setTargetAtTime(cycFreq, now, 0.04);
        this.cyclotronFilter.frequency.setTargetAtTime(cycFreq, now, 0.04);
        this.cyclotronFilter.Q.setTargetAtTime(3.5 + tel.etaMag * 6.5, now, 0.05);

        // Breathing mode oscillation (15-25 kHz scaled into audible LFO 15-25 Hz)
        const breathingRate = 15.0 + vdNorm * 10.0;
        const breathingDepth = 8.0 + (1.0 - tel.etaMag) * 32.0 + powerNorm * 10.0;
        this.breathingLfo.frequency.setTargetAtTime(breathingRate, now, 0.05);
        this.breathingLfoGain.gain.setTargetAtTime(breathingDepth, now, 0.05);

        const stageCycMult =
          appState.mode === 'learn' && appState.learnStage === 1 ? 0.25 : 1.0;
        const cycAmp = (0.025 + tel.etaMag * 0.055) * stageCycMult;
        this.cyclotronGain.gain.setTargetAtTime(cycAmp, now, 0.05);

        if (this.cyclotronPanner) {
          this.cyclotronPanner.pan.setValueAtTime(Math.sin(elapsed * 2.8) * 0.28, now);
        }

        // 3. Accelerated Ion Plume Jet Hiss: cutoff (800-4500 Hz) scales with Exhaust Velocity v_e
        const veNorm = Math.max(0, Math.min(1, (tel.exhaustVelocityKms - 9.5) / 42.0));
        const plumeCutoff = 800.0 + veNorm * 3700.0;
        this.plumeFilter.frequency.setTargetAtTime(plumeCutoff, now, 0.04);

        // Filter Q-factor scales with beam collimation / divergence angle
        const collimation = Math.max(0, Math.min(1, (48.0 - tel.divergenceDeg) / 36.0));
        const plumeQ = 0.85 + collimation * 3.8;
        this.plumeFilter.Q.setTargetAtTime(plumeQ, now, 0.05);

        const flowNorm = Math.max(0, Math.min(1, appState.massFlow / 20.0));
        const stagePlumeMult =
          appState.mode === 'learn' && appState.learnStage < 3 ? 0.12 : 1.0;
        const plumeAmp = (0.055 + (0.6 * flowNorm + 0.4 * thrustNorm) * 0.18) * stagePlumeMult;
        this.plumeGain.gain.setTargetAtTime(plumeAmp, now, 0.05);

        if (this.plumePanner) {
          this.plumePanner.pan.setValueAtTime(Math.cos(elapsed * 1.7) * 0.15, now);
        }

        // 4. Wall Sputtering & Ceramic Erosion Crackle (3000 - 7000 Hz impulses)
        if (tel.isSputtering || tel.erosionSeverity > 0.05) {
          const severity = Math.max(0.15, tel.erosionSeverity);
          const crackleRate = 5.0 + severity * 24.0; // impulses per second
          this.sputterAccum += dt * crackleRate;
          if (this.sputterAccum >= 1.0) {
            this.sputterAccum -= 1.0;
            if (Math.random() < 0.78) {
              this._triggerSputterCrackleImpulse(severity);
            }
          }
        } else {
          this.sputterAccum = 0;
        }
      }

      // 5. Short-Circuit Electrical Buzz & Arc-Zap Bursts in Build Mode Failure
      if (
        appState.mode === 'build' &&
        appState.activeFailureMode === 'short_circuit' &&
        appState.failureTimer > 0
      ) {
        this.arcZapAccum += dt * 9.5;
        if (this.arcZapAccum >= 1.0) {
          this.arcZapAccum -= 1.0;
          if (Math.random() < 0.8) {
            this._triggerShortCircuitArcZap();
          }
        }
      } else {
        this.arcZapAccum = 0;
      }
    }

    _triggerSputterCrackleImpulse(severity) {
      if (!this.isInitialized || this.isMuted) return;
      const now = this.ctx.currentTime;
      const dur = 0.012 + Math.random() * 0.022;

      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer;

      const hp = this.ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(3000 + Math.random() * 4000, now);
      hp.Q.setValueAtTime(3.0 + Math.random() * 4.0, now);

      const env = this.ctx.createGain();
      const peak = (0.06 + severity * 0.16) * (0.7 + Math.random() * 0.6);
      env.gain.setValueAtTime(peak, now);
      env.gain.exponentialRampToValueAtTime(0.001, now + dur);

      src.connect(hp);
      hp.connect(env);

      if (this.ctx.createStereoPanner) {
        const pan = this.ctx.createStereoPanner();
        pan.pan.setValueAtTime((Math.random() - 0.5) * 1.4, now);
        env.connect(pan);
        pan.connect(this.masterGain);
      } else {
        env.connect(this.masterGain);
      }

      const offset = Math.random() * 2.5;
      src.start(now, offset, dur);
      src.stop(now + dur + 0.005);
    }

    _triggerShortCircuitArcZap() {
      if (!this.isInitialized || this.isMuted) return;
      const now = this.ctx.currentTime;
      const dur = 0.055 + Math.random() * 0.065;

      // Erratic 60 Hz / 120 Hz transformer buzz oscillator
      const buzzOsc = this.ctx.createOscillator();
      buzzOsc.type = 'sawtooth';
      buzzOsc.frequency.setValueAtTime(60, now);
      buzzOsc.frequency.linearRampToValueAtTime(120 + Math.random() * 90, now + dur);

      const buzzGain = this.ctx.createGain();
      buzzGain.gain.setValueAtTime(0.14, now);
      buzzGain.gain.exponentialRampToValueAtTime(0.002, now + dur);

      buzzOsc.connect(buzzGain);
      buzzGain.connect(this.masterGain);
      buzzOsc.start(now);
      buzzOsc.stop(now + dur);

      // High-voltage arc snap noise burst
      const snapSrc = this.ctx.createBufferSource();
      snapSrc.buffer = this.noiseBuffer;

      const bp = this.ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2200 + Math.random() * 3200, now);
      bp.Q.setValueAtTime(2.5, now);

      const snapGain = this.ctx.createGain();
      snapGain.gain.setValueAtTime(0.18, now);
      snapGain.gain.exponentialRampToValueAtTime(0.002, now + dur);

      snapSrc.connect(bp);
      bp.connect(snapGain);
      snapGain.connect(this.masterGain);
      snapSrc.start(now, Math.random() * 2.0, dur);
      snapSrc.stop(now + dur + 0.01);
    }

    // --------------------------------------------------------------------
    // Interactive Event & Failure Diagnostic One-Shot SFX
    // --------------------------------------------------------------------
    installPart() {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;

      // 1. Low-frequency mechanical thud at 90 Hz
      const thudOsc = this.ctx.createOscillator();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(90, now);
      thudOsc.frequency.exponentialRampToValueAtTime(42, now + 0.11);

      const thudGain = this.ctx.createGain();
      thudGain.gain.setValueAtTime(0.28, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      thudOsc.connect(thudGain);
      thudGain.connect(this.masterGain);
      thudOsc.start(now);
      thudOsc.stop(now + 0.125);

      // 2. Crisp high-frequency metallic latch click (+32 ms)
      const clickOsc = this.ctx.createOscillator();
      clickOsc.type = 'sine';
      clickOsc.frequency.setValueAtTime(2950, now + 0.032);
      clickOsc.frequency.exponentialRampToValueAtTime(1480, now + 0.075);

      const clickGain = this.ctx.createGain();
      clickGain.gain.setValueAtTime(0.001, now);
      clickGain.gain.setValueAtTime(0.16, now + 0.032);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      clickOsc.connect(clickGain);
      clickGain.connect(this.masterGain);
      clickOsc.start(now + 0.03);
      clickOsc.stop(now + 0.085);

      // 3. Short pneumatic servo lock air-release noise burst (+48 ms)
      if (this.noiseBuffer) {
        const airSrc = this.ctx.createBufferSource();
        airSrc.buffer = this.noiseBuffer;

        const airFilter = this.ctx.createBiquadFilter();
        airFilter.type = 'bandpass';
        airFilter.frequency.setValueAtTime(2400, now + 0.048);
        airFilter.frequency.exponentialRampToValueAtTime(950, now + 0.17);
        airFilter.Q.setValueAtTime(2.0, now + 0.048);

        const airGain = this.ctx.createGain();
        airGain.gain.setValueAtTime(0.001, now);
        airGain.gain.setValueAtTime(0.12, now + 0.048);
        airGain.gain.exponentialRampToValueAtTime(0.001, now + 0.175);

        airSrc.connect(airFilter);
        airFilter.connect(airGain);
        airGain.connect(this.masterGain);
        airSrc.start(now + 0.048, 0.2, 0.14);
        airSrc.stop(now + 0.19);
      }
    }

    removePart() {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;

      // Reverse mechanical unlatch sweep
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(115, now + 0.16);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.18);

      if (this.noiseBuffer) {
        const airSrc = this.ctx.createBufferSource();
        airSrc.buffer = this.noiseBuffer;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(900, now);
        bp.frequency.exponentialRampToValueAtTime(2600, now + 0.14);
        bp.Q.setValueAtTime(2.5, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.09, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        airSrc.connect(bp);
        bp.connect(nGain);
        nGain.connect(this.masterGain);
        airSrc.start(now, 0.5, 0.16);
        airSrc.stop(now + 0.165);
      }
    }

    playIgnitionSequence() {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;

      // 1. High-voltage capacitor bank charge-up pitch sweep (120 Hz -> 1,200 Hz over 450 ms)
      const capOsc = this.ctx.createOscillator();
      capOsc.type = 'sawtooth';
      capOsc.frequency.setValueAtTime(120, now);
      capOsc.frequency.exponentialRampToValueAtTime(1200, now + 0.45);

      const capFilter = this.ctx.createBiquadFilter();
      capFilter.type = 'bandpass';
      capFilter.frequency.setValueAtTime(240, now);
      capFilter.frequency.exponentialRampToValueAtTime(2400, now + 0.45);
      capFilter.Q.setValueAtTime(4.0, now);

      const capGain = this.ctx.createGain();
      capGain.gain.setValueAtTime(0.02, now);
      capGain.gain.linearRampToValueAtTime(0.20, now + 0.42);
      capGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      capOsc.connect(capFilter);
      capFilter.connect(capGain);
      capGain.connect(this.masterGain);
      capOsc.start(now);
      capOsc.stop(now + 0.56);

      // 2. Resonant plasma ignition whoosh at t = +430 ms
      if (this.noiseBuffer) {
        const whooshSrc = this.ctx.createBufferSource();
        whooshSrc.buffer = this.noiseBuffer;

        const whooshFilter = this.ctx.createBiquadFilter();
        whooshFilter.type = 'bandpass';
        whooshFilter.frequency.setValueAtTime(320, now + 0.42);
        whooshFilter.frequency.exponentialRampToValueAtTime(2600, now + 0.58);
        whooshFilter.frequency.exponentialRampToValueAtTime(950, now + 0.95);
        whooshFilter.Q.setValueAtTime(2.2, now + 0.42);

        const whooshGain = this.ctx.createGain();
        whooshGain.gain.setValueAtTime(0.001, now);
        whooshGain.gain.setValueAtTime(0.28, now + 0.43);
        whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.98);

        whooshSrc.connect(whooshFilter);
        whooshFilter.connect(whooshGain);
        whooshGain.connect(this.masterGain);
        whooshSrc.start(now + 0.42, 0.1, 0.6);
        whooshSrc.stop(now + 1.0);
      }

      // 3. Sub-bass magnetic lock thump at ignition peak (+440 ms)
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(135, now + 0.43);
      subOsc.frequency.exponentialRampToValueAtTime(48, now + 0.78);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.setValueAtTime(0.26, now + 0.43);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.80);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now + 0.43);
      subOsc.stop(now + 0.82);
    }

    playFailureDiagnostic(failureMode) {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;

      if (failureMode === 'short_circuit') {
        // Immediate harsh 60 Hz transformer buzz + dual arc zaps
        const buzz = this.ctx.createOscillator();
        buzz.type = 'sawtooth';
        buzz.frequency.setValueAtTime(60, now);

        const shaper = this.ctx.createWaveShaper();
        shaper.curve = this._createWarmSaturationCurve(60);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.24, now);
        gain.gain.setValueAtTime(0.22, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

        buzz.connect(shaper);
        shaper.connect(gain);
        gain.connect(this.masterGain);
        buzz.start(now);
        buzz.stop(now + 0.66);

        this._triggerShortCircuitArcZap();
        return;
      }

      // Master Caution Two-Tone Aerospace Alarm Beep (880 Hz / 660 Hz) + Formant Synth Chime
      const tones = [
        { freq: 880, start: 0.0, dur: 0.14 },
        { freq: 660, start: 0.15, dur: 0.14 },
        { freq: 880, start: 0.30, dur: 0.14 },
        { freq: 660, start: 0.45, dur: 0.22 },
      ];

      tones.forEach((t) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(t.freq, now + t.start);

        // Diagnostic voice-style formant filter
        const formant = this.ctx.createBiquadFilter();
        formant.type = 'bandpass';
        formant.frequency.setValueAtTime(t.freq * 1.5, now + t.start);
        formant.Q.setValueAtTime(3.2, now + t.start);

        const g = this.ctx.createGain();
        g.gain.setValueAtTime(0.001, now + t.start);
        g.gain.linearRampToValueAtTime(0.20, now + t.start + 0.015);
        g.gain.exponentialRampToValueAtTime(0.001, now + t.start + t.dur);

        osc.connect(formant);
        formant.connect(g);
        g.connect(this.masterGain);
        osc.start(now + t.start);
        osc.stop(now + t.start + t.dur + 0.01);
      });
    }

    playUIChirp(variant = 'nav') {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (variant === 'nav') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(740, now);
        osc.frequency.exponentialRampToValueAtTime(1180, now + 0.065);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (variant === 'stage') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.exponentialRampToValueAtTime(920, now + 0.055);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (variant === 'preset') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.setValueAtTime(990, now + 0.04);
        gain.gain.setValueAtTime(0.075, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.10);
      } else if (variant === 'hover') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1420, now);
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    }

    // --------------------------------------------------------------------
    // Mode 5 (Pilot & Gimbal Game) Dedicated Procedural Audio Methods
    // --------------------------------------------------------------------
    updateGimbalServoSound(gimbalSpeedNorm, gimbalAngleNorm) {
      if (!this.isInitialized || !this.ctx || this.ctx.state !== 'running' || !this.servoOsc) return;
      const now = this.ctx.currentTime;
      const activeMotion = Math.max(0, Math.min(1, gimbalSpeedNorm));
      const angleLoad = Math.max(0, Math.min(1, gimbalAngleNorm));

      // Servo actuator pitch bends from 185 Hz up to 520 Hz as nozzle slews & deflects
      const targetFreq = 185 + angleLoad * 145 + activeMotion * 190;
      this.servoOsc.frequency.setTargetAtTime(targetFreq, now, 0.03);
      this.servoFilter.frequency.setTargetAtTime(targetFreq * 1.8, now, 0.03);

      const targetGain = activeMotion > 0.04 ? 0.022 + activeMotion * 0.055 : 0.0;
      this.servoGain.gain.setTargetAtTime(targetGain, now, 0.035);
    }

    playCapacitorPulseBoost() {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;

      // 1. High-energy capacitor discharge pitch-bend zap
      const zapOsc = this.ctx.createOscillator();
      zapOsc.type = 'sawtooth';
      zapOsc.frequency.setValueAtTime(980, now);
      zapOsc.frequency.exponentialRampToValueAtTime(160, now + 0.38);

      const zapGain = this.ctx.createGain();
      zapGain.gain.setValueAtTime(0.24, now);
      zapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      zapOsc.connect(zapGain);
      zapGain.connect(this.masterGain);
      zapOsc.start(now);
      zapOsc.stop(now + 0.44);

      // 2. Deep sub-bass plasma shockwave thump
      const subOsc = this.ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(165, now);
      subOsc.frequency.exponentialRampToValueAtTime(38, now + 0.55);

      const subGain = this.ctx.createGain();
      subGain.gain.setValueAtTime(0.32, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 0.60);

      // 3. Broadband plasma burst whoosh
      if (this.noiseBuffer) {
        const src = this.ctx.createBufferSource();
        src.buffer = this.noiseBuffer;

        const bp = this.ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.setValueAtTime(2800, now);
        bp.frequency.exponentialRampToValueAtTime(620, now + 0.55);
        bp.Q.setValueAtTime(1.8, now);

        const nGain = this.ctx.createGain();
        nGain.gain.setValueAtTime(0.28, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.58);

        src.connect(bp);
        bp.connect(nGain);
        nGain.connect(this.masterGain);
        src.start(now, 0.2, 0.60);
        src.stop(now + 0.62);
      }
    }

    playGatePassChime(isBonus = true) {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;
      const notes = isBonus ? [587.33, 880.0, 1174.66, 1760.0] : [523.25, 659.25, 783.99];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        const tStart = now + idx * 0.055;
        osc.frequency.setValueAtTime(freq, tStart);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, tStart);
        gain.gain.linearRampToValueAtTime(0.14, tStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, tStart + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(tStart);
        osc.stop(tStart + 0.30);
      });
    }

    playSolarRechargeChime() {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;
      const notes = [659.25, 830.61, 987.77, 1318.51];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        const tStart = now + idx * 0.045;
        osc.frequency.setValueAtTime(freq, tStart);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.001, tStart);
        gain.gain.linearRampToValueAtTime(0.11, tStart + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, tStart + 0.24);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(tStart);
        osc.stop(tStart + 0.26);
      });
    }

    playDebrisProximityBeep(urgency = 0.5) {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      const freq = 1320 + urgency * 480;
      osc.frequency.setValueAtTime(freq, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.08 + urgency * 0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.08);
    }

    playDebrisImpact() {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.40);

      this._triggerShortCircuitArcZap();
    }

    playOverheatKlaxon() {
      if (!this.ensureContext() || this.isMuted) return;
      const now = this.ctx.currentTime;
      [0.0, 0.20].forEach((offset, idx) => {
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(idx === 0 ? 740 : 520, now + offset);
        osc.frequency.linearRampToValueAtTime(idx === 0 ? 880 : 440, now + offset + 0.16);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1600, now + offset);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.18);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.19);
      });
    }
  }

  const plasmaAudio = new PlasmaAudioEngine();

  // ========================================================================
  // 6. THREE.JS SCENE, CAMERA, RENDERER & POST-PROCESSING INITIALIZATION
  // ========================================================================
  const container = document.getElementById('webgl-container');
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030712, 0.018);

  const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  );
  camera.position.set(6.5, 3.2, 6.8);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.70;
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.4;
  controls.maxDistance = 26.0;
  controls.target.set(0, 0.0, 0.8);

  // Smooth Camera Transition State
  const cameraTransition = {
    active: false,
    startPos: new THREE.Vector3(),
    endPos: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    progress: 0,
    duration: 1.1,
  };

  function animateCameraTo(targetPos, lookAtTarget, duration = 1.1) {
    cameraTransition.startPos.copy(camera.position);
    cameraTransition.endPos.copy(targetPos);
    cameraTransition.startTarget.copy(controls.target);
    cameraTransition.endTarget.copy(lookAtTarget);
    cameraTransition.progress = 0;
    cameraTransition.duration = duration;
    cameraTransition.active = true;
  }

  // Interrupt camera transition if user manually grabs OrbitControls
  controls.addEventListener('start', () => {
    cameraTransition.active = false;
  });

  // Post-Processing: RenderPass + UnrealBloomPass (Bypassed by default: state.bloomEnabled = false)
  const renderScene = new THREE.RenderPass(scene, camera);
  const bloomPass = new THREE.UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.14, // strength (strictly capped <= 0.14)
    0.20, // radius
    0.88  // threshold
  );

  const composer = new THREE.EffectComposer(renderer);
  composer.addPass(renderScene);
  composer.addPass(bloomPass);

  // ========================================================================
  // 7. LIGHTING & VACUUM TEST CHAMBER ENVIRONMENT
  // ========================================================================
  const ambientLight = new THREE.AmbientLight(0x1e293b, 0.90);
  scene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0xf8fafc, 1.05);
  keyLight.position.set(8, 12, 10);
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.65);
  rimLight.position.set(-9, 5, -8);
  scene.add(rimLight);

  const bottomFillLight = new THREE.DirectionalLight(0x334155, 0.40);
  bottomFillLight.position.set(0, -10, 2);
  scene.add(bottomFillLight);

  // Dynamic Plasma Point Lights (reduced by 80%, capped <= 0.60 so ceramic & metal never wash out)
  const channelPlasmaLight = new THREE.PointLight(0x3b82f6, 0.32, 10, 1.8);
  channelPlasmaLight.position.set(0, 0, 0.55);
  scene.add(channelPlasmaLight);

  const plumeCoreLight = new THREE.PointLight(0x8b5cf6, 0.26, 14, 1.6);
  plumeCoreLight.position.set(0, 0, 3.2);
  scene.add(plumeCoreLight);

  const cathodeGlowLight = new THREE.PointLight(0x38bdf8, 0.16, 4, 2.0);
  cathodeGlowLight.position.set(0, 2.38, 0.68);
  scene.add(cathodeGlowLight);

  // Build Vacuum Test Chamber Environment & Multi-Axis Thrust Stand
  let vacuumChamberGroup = null;
  function createVacuumChamberEnvironment() {
    const envGroup = new THREE.Group();
    vacuumChamberGroup = envGroup;

    // 1. Vacuum Chamber Floor Grid & Circular Diagnostic Platform
    const gridHelper = new THREE.GridHelper(36, 36, 0x0ea5e9, 0x0f172a);
    gridHelper.position.y = -3.25;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.28;
    envGroup.add(gridHelper);

    // Circular Base Deck Ring under test stand
    const baseRingGeo = new THREE.RingGeometry(2.6, 2.85, 64);
    baseRingGeo.rotateX(-Math.PI / 2);
    const baseRingMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.16,
    });
    const baseRing = new THREE.Mesh(baseRingGeo, baseRingMat);
    baseRing.position.set(0, -3.23, -0.5);
    envGroup.add(baseRing);

    // 2. Vacuum Chamber Cylindrical Cryo-Shroud Ribs in Background
    const ribMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.35,
    });
    for (let z = -8; z <= 16; z += 6) {
      const ribGeo = new THREE.TorusGeometry(11.5, 0.08, 12, 64);
      const rib = new THREE.Mesh(ribGeo, ribMat);
      rib.position.set(0, 0, z);
      envGroup.add(rib);
    }

    // 3. Thruster Pedestal & Flexure Thrust Stand (Stationary Support Base)
    const standMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3,
    });
    const standAccentMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.7,
      roughness: 0.4,
    });

    // Base plate on chamber floor
    const basePlate = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.22, 3.6),
      standMetalMat
    );
    basePlate.position.set(0, -3.14, -1.0);
    envGroup.add(basePlate);

    // Twin vertical flexure struts supporting the thruster mount cradle
    const leftStrut = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 1.6, 0.45),
      standAccentMat
    );
    leftStrut.position.set(-0.95, -2.25, -1.1);
    envGroup.add(leftStrut);

    const rightStrut = new THREE.Mesh(
      new THREE.BoxGeometry(0.24, 1.6, 0.45),
      standAccentMat
    );
    rightStrut.position.set(0.95, -2.25, -1.1);
    envGroup.add(rightStrut);

    // Upper cradle saddle
    const cradleBar = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.2, 1.3),
      standMetalMat
    );
    cradleBar.position.set(0, -1.45, -1.1);
    envGroup.add(cradleBar);

    scene.add(envGroup);
  }
  createVacuumChamberEnvironment();

  // ========================================================================
  // 8. PROCEDURAL 3D HALL-EFFECT THRUSTER BUILDER (WITH CUTAWAY SUPPORT)
  // ========================================================================
  const thrusterRoot = new THREE.Group();
  scene.add(thrusterRoot);

  // Maps component id -> { group, fullMeshGroup, cutawayMeshGroup, ghostGroup, materials, spec }
  const componentObjects = {};
  const raycastTargets = []; // All interactive meshes with userData.componentId
  let sputterRimGlowMesh = null;
  let cathodeOrificeGlowMesh = null;
  let anodeInnerGlowMesh = null;
  let tankFluidFillMesh = null;
  let tankFluidRingMesh = null;
  let tankFluidMat = null;

  // Shared Procedural Materials
  const matFerroSteel = new THREE.MeshStandardMaterial({
    color: 0x334155,
    metalness: 0.88,
    roughness: 0.26,
  });
  const matDarkHousing = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.82,
    roughness: 0.32,
  });
  const matChromePole = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    metalness: 0.92,
    roughness: 0.18,
  });
  const matBoronNitride = new THREE.MeshPhysicalMaterial({
    color: 0xcbd5e1,
    roughness: 0.34,
    metalness: 0.04,
    transmission: 0.06,
    thickness: 0.4,
    clearcoat: 0.12,
    side: THREE.DoubleSide,
  });
  const matBoronCutFace = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.35,
    metalness: 0.05,
    emissive: 0x0ea5e9,
    emissiveIntensity: 0.10,
    side: THREE.DoubleSide,
  });
  const matAnodeCopper = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    metalness: 0.88,
    roughness: 0.22,
    emissive: 0x78350f,
    emissiveIntensity: 0.12,
  });
  const matCoilCopper = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    metalness: 0.85,
    roughness: 0.28,
  });
  const matCathodeMoly = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    metalness: 0.85,
    roughness: 0.24,
  });
  const matTankComposite = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.65,
    roughness: 0.35,
  });

  // Helper to create hollow cylinder / annular ring segment with solid end caps for cutaway
  // Cutaway removes 90 degrees in the top-right (+X, +Y) quadrant facing the camera (phi from Math.PI/2 to Math.PI)
  const CUT_START = Math.PI;              // 180 deg (+Y top vertical)
  const CUT_LENGTH = Math.PI * 1.5;       // 270 deg (wraps around to +X horizontal, leaving top-right 90-deg slice open!)

  function createAnnularSleeve(innerR, outerR, length, zCenter, thetaStart, thetaLength, mainMat, capMat) {
    const group = new THREE.Group();
    const halfL = length / 2;

    // Lathe profile in (r, y) where y maps to Z after rotation
    const points = [
      new THREE.Vector2(innerR, -halfL),
      new THREE.Vector2(outerR, -halfL),
      new THREE.Vector2(outerR, halfL),
      new THREE.Vector2(innerR, halfL),
      new THREE.Vector2(innerR, -halfL),
    ];

    const latheGeo = new THREE.LatheGeometry(points, 64, thetaStart, thetaLength);
    latheGeo.rotateX(Math.PI / 2);
    const sleeveMesh = new THREE.Mesh(latheGeo, mainMat);
    sleeveMesh.position.z = zCenter;
    group.add(sleeveMesh);

    // If cutaway (< 2*PI), add rectangular cross-section end caps at thetaStart and thetaStart + thetaLength
    if (thetaLength < Math.PI * 1.99) {
      // Exact vertex quad builder for the two cut cross-sections of LatheGeometry after rotateX(Math.PI/2):
      // Before rotateX: x = r * sin(phi), y = y_pt, z = r * cos(phi)
      // After rotateX(PI/2): x = r * sin(phi), y = -r * cos(phi), z = y_pt
      [thetaStart, thetaStart + thetaLength].forEach((phi) => {
        const sinP = Math.sin(phi);
        const cosP = Math.cos(phi);
        const verts = new Float32Array([
          innerR * sinP, -innerR * cosP, zCenter - halfL,
          outerR * sinP, -outerR * cosP, zCenter - halfL,
          outerR * sinP, -outerR * cosP, zCenter + halfL,

          innerR * sinP, -innerR * cosP, zCenter - halfL,
          outerR * sinP, -outerR * cosP, zCenter + halfL,
          innerR * sinP, -innerR * cosP, zCenter + halfL,
        ]);
        const cutGeo = new THREE.BufferGeometry();
        cutGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
        cutGeo.computeVertexNormals();
        const cutMesh = new THREE.Mesh(cutGeo, capMat || mainMat);
        group.add(cutMesh);
      });
    }

    return group;
  }

  function tagComponentMeshes(rootObj, componentId) {
    rootObj.traverse((child) => {
      if (child.isMesh) {
        child.userData.componentId = componentId;
        raycastTargets.push(child);
      }
    });
  }

  function buildAllThrusterComponents() {
    THRUSTER_COMPONENTS.forEach((spec) => {
      const compRoot = new THREE.Group();
      compRoot.name = spec.id;
      const fullGroup = new THREE.Group();
      const cutawayGroup = new THREE.Group();
      const sharedGroup = new THREE.Group(); // Parts identical in both full & cutaway

      // Clone per-component materials so hover/selection emissive highlights work independently
      if (spec.id === 'backplate') {
        const matBase = matFerroSteel.clone();
        const matShroud = matDarkHousing.clone();
        const matPole = matChromePole.clone();

        // Solid heavy ferromagnetic backplate disc (z = -2.05 to -1.55)
        const backDisc = new THREE.Mesh(
          new THREE.CylinderGeometry(2.55, 2.65, 0.5, 48).rotateX(Math.PI / 2),
          matBase
        );
        backDisc.position.z = -1.80;
        sharedGroup.add(backDisc);

        // Rear heat-sink cooling fins
        for (let i = 0; i < 3; i++) {
          const fin = new THREE.Mesh(
            new THREE.CylinderGeometry(2.35 - i * 0.15, 2.35 - i * 0.15, 0.08, 40).rotateX(Math.PI / 2),
            matPole
          );
          fin.position.z = -2.12 - i * 0.14;
          sharedGroup.add(fin);
        }

        // Central ferromagnetic core stem (r = 0.72, z = -1.55 to +0.52)
        const centerStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.68, 0.72, 2.05, 36).rotateX(Math.PI / 2),
          matBase
        );
        centerStem.position.z = -0.52;
        sharedGroup.add(centerStem);

        // Inner front magnetic pole cap + conical ceramic nose cap (z = +0.52)
        const innerPoleCap = new THREE.Mesh(
          new THREE.CylinderGeometry(1.12, 1.05, 0.14, 40).rotateX(Math.PI / 2),
          matPole
        );
        innerPoleCap.position.z = 0.48;
        sharedGroup.add(innerPoleCap);

        const noseCone = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45, 0.95, 0.18, 36).rotateX(Math.PI / 2),
          matShroud
        );
        noseCone.position.z = 0.62;
        sharedGroup.add(noseCone);

        // Outer Cylindrical Magnetic Screen Shroud (r = 2.48 to 2.58, z = -1.55 to +0.48)
        // Full 360 version vs Cutaway 270 version
        fullGroup.add(
          createAnnularSleeve(2.46, 2.58, 2.02, -0.54, 0, Math.PI * 2, matShroud, matPole)
        );
        cutawayGroup.add(
          createAnnularSleeve(2.46, 2.58, 2.02, -0.54, CUT_START, CUT_LENGTH, matShroud, matPole)
        );
      }

      if (spec.id === 'ceramic_channel') {
        const matBN = matBoronNitride.clone();
        const matCut = matBoronCutFace.clone();

        // Coaxial Boron Nitride Discharge Channel
        // Inner wall: r = 1.08 to 1.20; Outer wall: r = 1.80 to 1.94; Base wall: z = -1.52 to -1.35
        // Channel annular cavity spans r = 1.20 to 1.80, z = -1.35 to +0.52
        // Inner ceramic wall (always 360 so the central core looks solid and clean)
        sharedGroup.add(
          createAnnularSleeve(1.06, 1.20, 2.04, -0.50, 0, Math.PI * 2, matBN, matCut)
        );

        // Base ceramic insulator ring at back of channel (z = -1.52 to -1.36)
        fullGroup.add(
          createAnnularSleeve(1.18, 1.94, 0.18, -1.43, 0, Math.PI * 2, matBN, matCut)
        );
        cutawayGroup.add(
          createAnnularSleeve(1.18, 1.94, 0.18, -1.43, CUT_START, CUT_LENGTH, matBN, matCut)
        );

        // Outer Boron Nitride ceramic wall (r = 1.80 to 1.95, z = -1.52 to +0.54)
        // In Cutaway Mode, 90 degrees of the outer BN wall is sliced open!
        fullGroup.add(
          createAnnularSleeve(1.80, 1.95, 2.06, -0.49, 0, Math.PI * 2, matBN, matCut)
        );
        cutawayGroup.add(
          createAnnularSleeve(1.80, 1.95, 2.06, -0.49, CUT_START, CUT_LENGTH, matBN, matCut)
        );

        // Channel Wall Sputtering / Erosion Glow Overlay at the exit rim (z = +0.48)
        const sputterMat = new THREE.MeshBasicMaterial({
          color: 0xff3b00,
          transparent: true,
          opacity: 0.0,
          side: THREE.DoubleSide,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        const sputterGroup = new THREE.Group();
        const outerLipGlow = new THREE.Mesh(
          new THREE.TorusGeometry(1.83, 0.065, 16, 64),
          sputterMat
        );
        outerLipGlow.position.z = 0.50;
        const innerLipGlow = new THREE.Mesh(
          new THREE.TorusGeometry(1.17, 0.055, 16, 64),
          sputterMat
        );
        innerLipGlow.position.z = 0.50;
        sputterGroup.add(outerLipGlow, innerLipGlow);
        sputterRimGlowMesh = sputterMat;
        sharedGroup.add(sputterGroup);
      }

      if (spec.id === 'anode_ring') {
        const matCu = matAnodeCopper.clone();

        // Perforated Copper-Gold Anode & Propellant Distributor Ring at z = -1.25 inside channel (r = 1.24 to 1.76)
        const anodeBody = createAnnularSleeve(1.24, 1.76, 0.22, -1.24, 0, Math.PI * 2, matCu, matCu);
        sharedGroup.add(anodeBody);

        // 24 Swirl Propellant Injector Nozzles / Orifices around the front face of the Anode Ring
        const orificeMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          metalness: 0.9,
          roughness: 0.18,
          emissive: 0xd97706,
          emissiveIntensity: 0.20,
        });
        const numOrifices = 24;
        for (let i = 0; i < numOrifices; i++) {
          const angle = (i / numOrifices) * Math.PI * 2;
          const rMid = 1.50;
          const nozzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.05, 0.08, 12).rotateX(Math.PI / 2),
            orificeMat
          );
          nozzle.position.set(Math.cos(angle) * rMid, Math.sin(angle) * rMid, -1.11);
          sharedGroup.add(nozzle);
        }

        // Subtle Anode Bias Glow Ring (NormalBlending, low opacity <= 0.15)
        const anodeGlowMat = new THREE.MeshBasicMaterial({
          color: 0xf59e0b,
          transparent: true,
          opacity: 0.12,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        const anodeGlow = new THREE.Mesh(
          new THREE.TorusGeometry(1.50, 0.035, 12, 48),
          anodeGlowMat
        );
        anodeGlow.position.z = -1.10;
        anodeInnerGlowMesh = anodeGlowMat;
        sharedGroup.add(anodeGlow);
      }

      if (spec.id === 'magnet_coils') {
        const matWire = matCoilCopper.clone();
        const matBobbin = matChromePole.clone();

        // 1. Inner Solenoid Coil wrapped around central core (r = 0.74 to 1.02, z = -1.35 to +0.35)
        const innerSolenoid = new THREE.Mesh(
          new THREE.CylinderGeometry(0.98, 0.98, 1.55, 36).rotateX(Math.PI / 2),
          matWire
        );
        innerSolenoid.position.z = -0.45;
        sharedGroup.add(innerSolenoid);

        // Grooved copper winding rings on the inner solenoid for realistic coil texture
        for (let z = -1.15; z <= 0.25; z += 0.14) {
          const winding = new THREE.Mesh(
            new THREE.TorusGeometry(0.98, 0.042, 10, 36),
            matWire
          );
          winding.position.z = z;
          sharedGroup.add(winding);
        }

        // 2. Four Outer Radial Electromagnet Coils positioned at 45°, 135°, 225°, 315°
        // Wait: 45° is in the top-right cutaway quadrant! Let's place the 4 outer coils at
        // 75°, 155°, 225°, 315° OR place the 4 coils at 90°, 180°, 270°, 0° with the top-right coil in fullGroup if cutaway overlaps,
        // OR place the 4 outer coils at angles 105°, 175°, 245°, 315° in cutaway and 45°, 135°, 225°, 315° in full!
        // Even better: if the 4 outer coils are at 45°, 135°, 225°, 315°, placing the 3 coils (135°, 225°, 315°) in sharedGroup and the 45° front-top-right coil in fullGroup means in Cutaway Mode the 45° coil is neatly hidden so it NEVER blocks the 90° cutaway window into the Boron Nitride channel!
        const coilAngles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];
        coilAngles.forEach((ang, idx) => {
          const singleCoilGroup = new THREE.Group();
          const rCoil = 2.18;
          const cx = Math.cos(ang) * rCoil;
          const cy = Math.sin(ang) * rCoil;

          // Coil core cylinder
          const core = new THREE.Mesh(
            new THREE.CylinderGeometry(0.30, 0.30, 1.78, 24).rotateX(Math.PI / 2),
            matWire
          );
          core.position.set(cx, cy, -0.52);
          singleCoilGroup.add(core);

          // Winding turns
          for (let z = -1.28; z <= 0.22; z += 0.15) {
            const turn = new THREE.Mesh(
              new THREE.TorusGeometry(0.30, 0.04, 10, 24),
              matWire
            );
            turn.position.set(cx, cy, z);
            singleCoilGroup.add(turn);
          }

          // Front & Rear Bobbin Flanges
          [-1.42, 0.36].forEach((zf) => {
            const flange = new THREE.Mesh(
              new THREE.CylinderGeometry(0.38, 0.38, 0.06, 24).rotateX(Math.PI / 2),
              matBobbin
            );
            flange.position.set(cx, cy, zf);
            singleCoilGroup.add(flange);
          });

          if (idx === 0) {
            // The 45-degree coil sits right in front of the cutaway window, so put it in fullGroup
            fullGroup.add(singleCoilGroup);
          } else {
            sharedGroup.add(singleCoilGroup);
          }
        });

        // 3. Front Outer Ferromagnetic Pole Plate (focuses radial magnetic field Br at z = +0.48)
        fullGroup.add(
          createAnnularSleeve(1.88, 2.56, 0.14, 0.46, 0, Math.PI * 2, matBobbin, matBobbin)
        );
        cutawayGroup.add(
          createAnnularSleeve(1.88, 2.56, 0.14, 0.46, CUT_START, CUT_LENGTH, matBobbin, matBobbin)
        );
      }

      if (spec.id === 'hollow_cathode') {
        const matBody = matCathodeMoly.clone();
        const matTip = matAnodeCopper.clone();

        // Mounted outside the top edge of the thruster nozzle at (x=0, y=2.55, z=0.20), angled 22° downward toward the plume
        const cathodeAssembly = new THREE.Group();
        cathodeAssembly.position.set(0, 2.52, 0.25);
        cathodeAssembly.rotation.x = 0.38; // Tilted downward toward the thruster axis (+Z)

        // Mounting bracket to outer thruster housing
        const bracket = new THREE.Mesh(
          new THREE.BoxGeometry(0.38, 0.55, 0.32),
          matBody
        );
        bracket.position.set(0, -0.22, -0.35);
        cathodeAssembly.add(bracket);

        // Main Molybdenum Hollow Cathode Barrel
        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.21, 1.05, 24).rotateX(Math.PI / 2),
          matBody
        );
        barrel.position.set(0, 0.05, -0.05);
        cathodeAssembly.add(barrel);

        // Keeper Electrode Ring & Orifice Plate
        const keeper = new THREE.Mesh(
          new THREE.CylinderGeometry(0.13, 0.17, 0.18, 24).rotateX(Math.PI / 2),
          matTip
        );
        keeper.position.set(0, 0.05, 0.52);
        cathodeAssembly.add(keeper);

        // Glowing LaB6 Thermionic Emitter Orifice Tip (capped <= 0.25 opacity, NormalBlending)
        const orificeGlowMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.22,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        const orificeTip = new THREE.Mesh(
          new THREE.SphereGeometry(0.085, 16, 16),
          orificeGlowMat
        );
        orificeTip.position.set(0, 0.05, 0.62);
        cathodeOrificeGlowMesh = orificeGlowMat;
        cathodeAssembly.add(orificeTip);

        sharedGroup.add(cathodeAssembly);
      }

      if (spec.id === 'propellant_supply') {
        const matTank = matTankComposite.clone();
        const matValve = matChromePole.clone();
        const matBand = matAnodeCopper.clone();

        const supplyGroup = new THREE.Group();

        // High-Pressure COPV Propellant Tank mounted on the lower rear deck (y = -2.4, z = -2.1)
        const tankCyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.52, 0.52, 1.65, 32).rotateZ(Math.PI / 2),
          matTank
        );
        tankCyl.position.set(0, -2.45, -2.35);
        supplyGroup.add(tankCyl);

        // Hemispherical tank end-caps
        [-0.82, 0.82].forEach((dx) => {
          const cap = new THREE.Mesh(
            new THREE.SphereGeometry(0.52, 24, 24),
            matTank
          );
          cap.position.set(dx, -2.45, -2.35);
          supplyGroup.add(cap);
        });

        // Metallic mounting straps around tank
        [-0.45, 0.45].forEach((dx) => {
          const strap = new THREE.Mesh(
            new THREE.TorusGeometry(0.535, 0.03, 12, 32).rotateY(Math.PI / 2),
            matBand
          );
          strap.position.set(dx, -2.45, -2.35);
          supplyGroup.add(strap);
        });

        // Emissive Propellant Fluid Level Sight-Glass Indicator on 3D Tank
        const sightBackingMat = new THREE.MeshBasicMaterial({
          color: 0x020617,
          transparent: true,
          opacity: 0.85,
        });
        const sightBacking = new THREE.Mesh(
          new THREE.BoxGeometry(1.48, 0.14, 0.10),
          sightBackingMat
        );
        sightBacking.position.set(0, -2.08, -1.92);
        supplyGroup.add(sightBacking);

        tankFluidMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.65,
        });
        tankFluidFillMesh = new THREE.Mesh(
          new THREE.BoxGeometry(1.40, 0.095, 0.11),
          tankFluidMat
        );
        tankFluidFillMesh.position.set(0, -2.08, -1.91);
        supplyGroup.add(tankFluidFillMesh);

        tankFluidRingMesh = new THREE.Mesh(
          new THREE.TorusGeometry(0.548, 0.024, 12, 32).rotateY(Math.PI / 2),
          tankFluidMat
        );
        tankFluidRingMesh.position.set(0.70, -2.45, -2.35);
        supplyGroup.add(tankFluidRingMesh);

        // Mass Flow Controller (MFC) Manifold Block
        const mfcBlock = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.35, 0.42),
          matValve
        );
        mfcBlock.position.set(0, -1.78, -2.15);
        supplyGroup.add(mfcBlock);

        // Stainless Braided Feed Tube from MFC to Anode Backplate
        const anodeTubeCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, -1.62, -2.15),
          new THREE.Vector3(0, -0.95, -2.30),
          new THREE.Vector3(0, -0.45, -2.05),
          new THREE.Vector3(0, 0.0, -1.85),
        ]);
        const anodeTube = new THREE.Mesh(
          new THREE.TubeGeometry(anodeTubeCurve, 24, 0.045, 12, false),
          matValve
        );
        supplyGroup.add(anodeTube);

        // Secondary Feed Tube from MFC up to the External Hollow Cathode
        const cathodeTubeCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2, -1.62, -2.15),
          new THREE.Vector3(-1.85, -0.8, -2.10),
          new THREE.Vector3(-2.15, 1.4, -1.20),
          new THREE.Vector3(-0.35, 2.45, -0.25),
          new THREE.Vector3(0, 2.52, -0.10),
        ]);
        const cathodeTube = new THREE.Mesh(
          new THREE.TubeGeometry(cathodeTubeCurve, 32, 0.03, 10, false),
          matValve
        );
        supplyGroup.add(cathodeTube);

        sharedGroup.add(supplyGroup);
      }

      compRoot.add(sharedGroup);
      compRoot.add(fullGroup);
      compRoot.add(cutawayGroup);
      cutawayGroup.visible = state.isCutaway;
      fullGroup.visible = !state.isCutaway;

      // Tag all meshes for raycasting
      tagComponentMeshes(compRoot, spec.id);

      // Collect standard materials for hover/selection emissive highlighting
      const materials = [];
      compRoot.traverse((c) => {
        if (c.isMesh && c.material && c.material.emissive) {
          materials.push({
            mat: c.material,
            baseEmissiveHex: c.material.emissive.getHex(),
            baseEmissiveIntensity: c.material.emissiveIntensity || 0,
          });
        }
      });

      // Create a translucent Cyan Wireframe Ghost Slot at assembledPos (shown when part is uninstalled in Build Mode)
      const ghostGroup = new THREE.Group();
      const ghostMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      });
      sharedGroup.traverse((c) => {
        if (c.isMesh) {
          const gm = new THREE.Mesh(c.geometry, ghostMat);
          gm.position.copy(c.position);
          gm.rotation.copy(c.rotation);
          gm.scale.copy(c.scale);
          ghostGroup.add(gm);
        }
      });
      ghostGroup.visible = false;
      thrusterRoot.add(ghostGroup);

      thrusterRoot.add(compRoot);
      componentObjects[spec.id] = {
        spec,
        group: compRoot,
        fullGroup,
        cutawayGroup,
        ghostGroup,
        materials,
        targetPos: spec.assembledPos.clone(),
      };
    });
  }

  buildAllThrusterComponents();

  function updateCutawayGeometryVisibility() {
    Object.values(componentObjects).forEach((obj) => {
      obj.fullGroup.visible = !state.isCutaway;
      obj.cutawayGroup.visible = state.isCutaway;
    });
    const btnCutaway = document.getElementById('btn-toggle-cutaway');
    if (btnCutaway) {
      btnCutaway.classList.toggle('active', state.isCutaway);
    }
  }

  // ========================================================================
  // 9. TOGGLEABLE 3D VECTOR FIELD OVERLAYS (AXIAL Ez & RADIAL Br)
  // ========================================================================
  const vectorFieldsGroup = new THREE.Group();
  const ezFieldGroup = new THREE.Group();
  const brFieldGroup = new THREE.Group();
  vectorFieldsGroup.add(ezFieldGroup);
  vectorFieldsGroup.add(brFieldGroup);
  scene.add(vectorFieldsGroup);

  const ezArrowMeshes = [];
  const brFieldMeshes = [];

  function buildVectorFieldOverlays() {
    // 1. Axial Electric Field (Ez): 12 Red 3D Arrow Vectors inside the channel pointing from Anode (z=-1.05) to Exit (z=+0.45)
    const numEzArrows = 12;
    const rMid = 1.50;
    const ezMat = new THREE.MeshBasicMaterial({
      color: 0xff3344,
      transparent: true,
      opacity: 0.88,
    });

    for (let i = 0; i < numEzArrows; i++) {
      const angle = (i / numEzArrows) * Math.PI * 2;
      const x = Math.cos(angle) * rMid;
      const y = Math.sin(angle) * rMid;

      const arrowGroup = new THREE.Group();
      arrowGroup.position.set(x, y, -0.95);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 1.15, 8).rotateX(Math.PI / 2),
        ezMat
      );
      shaft.position.z = 0.575;
      arrowGroup.add(shaft);

      const head = new THREE.Mesh(
        new THREE.ConeGeometry(0.055, 0.18, 12).rotateX(Math.PI / 2),
        ezMat
      );
      head.position.z = 1.22;
      arrowGroup.add(head);

      ezFieldGroup.add(arrowGroup);
      ezArrowMeshes.push({ group: arrowGroup, head, baseZ: -0.95, phase: i * 0.5 });
    }

    // 2. Radial Magnetic Field (Br): 16 Green Curved 3D Field Lines spanning radially from Inner Pole (r=1.14) to Outer Pole (r=1.86)
    const numBrLines = 16;
    const brMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.85,
    });

    for (let i = 0; i < numBrLines; i++) {
      const angle = (i / numBrLines) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Create two arched magnetic flux lines per angle (slightly upstream and downstream of channel exit z=0.35)
      [0.22, 0.44].forEach((zPlane, archIdx) => {
        const zBulge = archIdx === 0 ? -0.12 : 0.14;
        const curve = new THREE.QuadraticBezierCurve3(
          new THREE.Vector3(cosA * 1.15, sinA * 1.15, zPlane),
          new THREE.Vector3(cosA * 1.50, sinA * 1.50, zPlane + zBulge),
          new THREE.Vector3(cosA * 1.85, sinA * 1.85, zPlane)
        );
        const tubeGeo = new THREE.TubeGeometry(curve, 16, 0.016, 8, false);
        const tubeMesh = new THREE.Mesh(tubeGeo, brMat);
        brFieldGroup.add(tubeMesh);

        // Radial direction cone at midpoint pointing outward
        const midPt = curve.getPoint(0.55);
        const tangent = curve.getTangent(0.55).normalize();
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.13, 10), brMat);
        cone.position.copy(midPt);
        cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
        brFieldGroup.add(cone);

        brFieldMeshes.push(tubeMesh, cone);
      });
    }
  }
  buildVectorFieldOverlays();

  // ========================================================================
  // 10. MULTI-SPECIES BUFFERGEOMETRY PARTICLE ENGINE & VOLUMETRIC PLUME
  // ========================================================================
  // Create a soft procedural radial glow sprite texture in memory (anti-dazzle soft falloff)
  function createParticleGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0.0, 'rgba(255, 255, 255, 0.82)');
    grad.addColorStop(0.28, 'rgba(255, 255, 255, 0.58)');
    grad.addColorStop(0.60, 'rgba(255, 255, 255, 0.20)');
    grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
  }

  const particleSpriteTex = createParticleGlowTexture();
  const plasmaSystemsGroup = new THREE.Group();
  scene.add(plasmaSystemsGroup);

  // ------------------------------------------------------------------------
  // SPECIES 1: Neutral Propellant Atoms (Injected from Anode Base z = -1.12)
  // ------------------------------------------------------------------------
  const NEUTRAL_COUNT = 480;
  const neutralPositions = new Float32Array(NEUTRAL_COUNT * 3);
  const neutralData = [];

  for (let i = 0; i < NEUTRAL_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 1.24 + Math.random() * 0.52;
    const z = -1.12 + Math.random() * 1.25;
    neutralPositions[i * 3] = Math.cos(angle) * radius;
    neutralPositions[i * 3 + 1] = Math.sin(angle) * radius;
    neutralPositions[i * 3 + 2] = z;
    neutralData.push({
      angle,
      radius,
      z,
      speedZ: 0.45 + Math.random() * 0.45,
      wobbleFreq: 2.0 + Math.random() * 3.0,
      wobblePhase: Math.random() * Math.PI * 2,
    });
  }

  const neutralGeo = new THREE.BufferGeometry();
  neutralGeo.setAttribute('position', new THREE.BufferAttribute(neutralPositions, 3));
  const neutralMat = new THREE.PointsMaterial({
    color: 0xcbd5e1,
    size: 0.05, // Reduced by 45% from 0.09
    map: particleSpriteTex,
    transparent: true,
    opacity: 0.14, // Capped <= 0.18 max
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const neutralPoints = new THREE.Points(neutralGeo, neutralMat);
  plasmaSystemsGroup.add(neutralPoints);

  // ------------------------------------------------------------------------
  // SPECIES 2: Trapped Hall Electrons (E×B Drift Ring + Cathode Electron Streams)
  // ------------------------------------------------------------------------
  const ELECTRON_COUNT = 950;
  const electronPositions = new Float32Array(ELECTRON_COUNT * 3);
  const electronColors = new Float32Array(ELECTRON_COUNT * 3);
  const electronData = [];

  for (let i = 0; i < ELECTRON_COUNT; i++) {
    // 72% Hall Ring trapped electrons, 14% Cathode-to-Channel primary stream, 14% Cathode-to-Plume neutralizer stream
    let role = 'hall_ring';
    if (i >= ELECTRON_COUNT * 0.72 && i < ELECTRON_COUNT * 0.86) {
      role = 'cathode_to_channel';
    } else if (i >= ELECTRON_COUNT * 0.86) {
      role = 'cathode_to_plume';
    }

    const angle = Math.random() * Math.PI * 2;
    const radius = 1.22 + Math.random() * 0.56;
    const z = 0.05 + Math.random() * 0.42;

    electronPositions[i * 3] = Math.cos(angle) * radius;
    electronPositions[i * 3 + 1] = Math.sin(angle) * radius;
    electronPositions[i * 3 + 2] = z;

    // Rich golden-amber & cyan colors for energetic electrons (never white)
    const isCyan = i % 4 === 0;
    electronColors[i * 3] = isCyan ? 0.02 : 0.96;
    electronColors[i * 3 + 1] = isCyan ? 0.71 : 0.62;
    electronColors[i * 3 + 2] = isCyan ? 0.83 : 0.04;

    electronData.push({
      role,
      angle,
      radius,
      z,
      t: Math.random(), // path progress for cathode stream particles
      angularVel: 8.5 + Math.random() * 6.0,
      targetAngle: (Math.random() - 0.5) * Math.PI * 0.9 + Math.PI * 0.5,
    });
  }

  const electronGeo = new THREE.BufferGeometry();
  electronGeo.setAttribute('position', new THREE.BufferAttribute(electronPositions, 3));
  electronGeo.setAttribute('color', new THREE.BufferAttribute(electronColors, 3));
  const electronMat = new THREE.PointsMaterial({
    size: 0.06, // Reduced by 45% from 0.11
    map: particleSpriteTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.22, // Capped <= 0.28 max
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const electronPoints = new THREE.Points(electronGeo, electronMat);
  plasmaSystemsGroup.add(electronPoints);

  // ------------------------------------------------------------------------
  // SPECIES 3: Accelerated Plasma Ions (Xe+, Kr+, Ar+ Exhaust Plume)
  // ------------------------------------------------------------------------
  const ION_COUNT = 2200;
  const ionPositions = new Float32Array(ION_COUNT * 3);
  const ionColors = new Float32Array(ION_COUNT * 3);
  const ionData = [];

  for (let i = 0; i < ION_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const baseRadius = 1.22 + Math.random() * 0.56;
    const life = Math.random(); // 0 (at ionization zone) -> 1 (plume tail)

    ionData.push({
      angle,
      baseRadius,
      life,
      speedFactor: 0.78 + Math.random() * 0.44,
      radialSpreadSeed: (Math.random() - 0.5) * 2.0,
      swirlSeed: (Math.random() - 0.5) * 0.5,
    });

    ionPositions[i * 3] = Math.cos(angle) * baseRadius;
    ionPositions[i * 3 + 1] = Math.sin(angle) * baseRadius;
    ionPositions[i * 3 + 2] = life * 10.0;

    ionColors[i * 3] = 0.23;
    ionColors[i * 3 + 1] = 0.51;
    ionColors[i * 3 + 2] = 0.96;
  }

  const ionGeo = new THREE.BufferGeometry();
  ionGeo.setAttribute('position', new THREE.BufferAttribute(ionPositions, 3));
  ionGeo.setAttribute('color', new THREE.BufferAttribute(ionColors, 3));
  const ionMat = new THREE.PointsMaterial({
    size: 0.088, // Reduced by 45% from 0.16
    map: particleSpriteTex,
    vertexColors: true,
    transparent: true,
    opacity: 0.18, // Capped <= 0.22 max
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const ionPoints = new THREE.Points(ionGeo, ionMat);
  plasmaSystemsGroup.add(ionPoints);

  // ------------------------------------------------------------------------
  // VOLUMETRIC PLUME CORE & ANNULAR PLASMA TORCH CONES (NormalBlending, 0.05-0.15)
  // ------------------------------------------------------------------------
  const volumetricPlumeGroup = new THREE.Group();
  plasmaSystemsGroup.add(volumetricPlumeGroup);

  // Glowing Hall Ring Torus inside channel exit
  const hallRingGlowMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.09,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const hallRingGlowMesh = new THREE.Mesh(
    new THREE.TorusGeometry(1.50, 0.22, 20, 64),
    hallRingGlowMat
  );
  hallRingGlowMesh.position.z = 0.28;
  volumetricPlumeGroup.add(hallRingGlowMesh);

  // Outer Annular Plasma Jet Cone
  const outerPlumeConeMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.08,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const outerPlumeCone = new THREE.Mesh(
    new THREE.CylinderGeometry(2.6, 1.52, 9.5, 48, 1, true).rotateX(Math.PI / 2),
    outerPlumeConeMat
  );
  outerPlumeCone.position.z = 5.1;
  volumetricPlumeGroup.add(outerPlumeCone);

  // Inner Collimated Central Plasma Core Spike (Mach / Beam Focus Core)
  const coreSpikeMat = new THREE.MeshBasicMaterial({
    color: 0x3b82f6,
    transparent: true,
    opacity: 0.09,
    side: THREE.DoubleSide,
    blending: THREE.NormalBlending,
    depthWrite: false,
  });
  const coreSpikeMesh = new THREE.Mesh(
    new THREE.ConeGeometry(0.68, 7.5, 36, 1, true).rotateX(Math.PI / 2),
    coreSpikeMat
  );
  coreSpikeMesh.position.z = 4.2;
  const innerCoreCone = coreSpikeMesh;
  const machCone = coreSpikeMesh;
  volumetricPlumeGroup.add(coreSpikeMesh);

  // ------------------------------------------------------------------------
  // SPECIES 4: Ceramic Wall Sputtering Sparks & Short-Circuit Lightning Arcs
  // ------------------------------------------------------------------------
  const SPUTTER_COUNT = 260;
  const sputterPositions = new Float32Array(SPUTTER_COUNT * 3);
  const sputterData = [];
  for (let i = 0; i < SPUTTER_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const isOuter = Math.random() > 0.35;
    const r = isOuter ? 1.82 : 1.18;
    sputterPositions[i * 3] = Math.cos(angle) * r;
    sputterPositions[i * 3 + 1] = Math.sin(angle) * r;
    sputterPositions[i * 3 + 2] = 0.50;
    sputterData.push({
      angle,
      baseR: r,
      life: Math.random(),
      vr: (isOuter ? -1 : 1) * (0.4 + Math.random() * 0.9),
      vz: 0.8 + Math.random() * 2.2,
    });
  }
  const sputterGeo = new THREE.BufferGeometry();
  sputterGeo.setAttribute('position', new THREE.BufferAttribute(sputterPositions, 3));
  const sputterPointsMat = new THREE.PointsMaterial({
    color: 0xff5500,
    size: 0.06, // Reduced by 45% from 0.11
    map: particleSpriteTex,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    blending: THREE.NormalBlending,
  });
  const sputterPoints = new THREE.Points(sputterGeo, sputterPointsMat);
  scene.add(sputterPoints);

  // Short-Circuit Electrical Arc Group (for Missing Ceramic Channel failure simulation)
  const shortCircuitArcGroup = new THREE.Group();
  shortCircuitArcGroup.visible = false;
  scene.add(shortCircuitArcGroup);

  const arcLines = [];
  for (let a = 0; a < 8; a++) {
    const pts = [];
    for (let s = 0; s <= 10; s++) {
      pts.push(new THREE.Vector3(0, 0, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color: a % 2 === 0 ? 0x67e8f9 : 0xfef08a,
      linewidth: 2,
    });
    const line = new THREE.Line(geo, mat);
    shortCircuitArcGroup.add(line);
    arcLines.push({ line, baseAngle: (a / 8) * Math.PI * 2 });
  }

  // ========================================================================
  // 10B. MODE D: ORBITAL MANEUVER & DELTA-V MISSION SIMULATOR
  // ========================================================================
  const MISSION_PRESETS = {
    starlink_leo: {
      key: 'starlink_leo',
      label: 'Starlink LEO Raise',
      h1: 350,
      h2: 550,
      dryMass: 260,
      propMass: 20,
      clusterCount: 1,
      dvReqOverride: null,
    },
    leo_geo: {
      key: 'leo_geo',
      label: 'LEO → GEO Spiral',
      h1: 400,
      h2: 35786,
      dryMass: 1200,
      propMass: 380,
      clusterCount: 4,
      dvReqOverride: null,
    },
    lunar_gateway: {
      key: 'lunar_gateway',
      label: 'Lunar Gateway Cargo',
      h1: 400,
      h2: 36000,
      dryMass: 2500,
      propMass: 850,
      clusterCount: 6,
      dvReqOverride: 3850,
    },
    psyche_asteroid: {
      key: 'psyche_asteroid',
      label: 'Psyche Rendezvous',
      h1: 500,
      h2: 36000,
      dryMass: 1600,
      propMass: 950,
      clusterCount: 4,
      dvReqOverride: 4500,
    },
  };

  class OrbitalMissionSimulator {
    constructor(parentScene) {
      this.scene = parentScene;
      this.group = new THREE.Group();
      this.group.name = 'orbital_mission_hologram';
      this.group.position.set(0.0, 0.25, 3.25);
      this.group.visible = false;
      this.scene.add(this.group);

      // Tilted orbital plane group so 3D spiral revolutions have rich perspective
      this.orbitalPlane = new THREE.Group();
      this.orbitalPlane.rotation.x = 0.34;
      this.orbitalPlane.rotation.z = -0.10;
      this.group.add(this.orbitalPlane);

      this.spiralPointsCount = 720;
      this.spiralPositions = new Float32Array(this.spiralPointsCount * 3);
      this.spiralColors = new Float32Array(this.spiralPointsCount * 3);

      this.earthMesh = null;
      this.earthWireMesh = null;
      this.equatorialRing = null;
      this.r1RingMesh = null;
      this.r2RingMesh = null;
      this.r2RingMat = null;
      this.spiralLine = null;
      this.spiralGeo = null;
      this.exhaustionMarker = null;
      this.spacecraftGroup = null;
      this.scPlumeConeMat = null;
      this.scPlumeCoreMat = null;
      this.scPlumeLight = null;
      this.holoFuelFillMesh = null;
      this.holoFuelMat = null;

      this._buildHolographicScene();
    }

    _createProceduralEarthTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      // Deep holographic ocean background
      const grad = ctx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#041e3a');
      grad.addColorStop(0.5, '#083358');
      grad.addColorStop(1, '#041e3a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 256);

      // Lat/Lon holographic grid lines
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.24)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 256);
        ctx.stroke();
      }
      for (let y = 0; y <= 256; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
      }

      // Brighter equator line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(512, 128);
      ctx.stroke();

      // Stylized holographic continental landmass polygons
      ctx.fillStyle = 'rgba(14, 165, 233, 0.38)';
      ctx.strokeStyle = 'rgba(103, 232, 249, 0.75)';
      ctx.lineWidth = 1.5;

      const continents = [
        // North America
        [[75, 52], [135, 48], [150, 88], [118, 118], [82, 98]],
        // South America
        [[132, 132], [168, 144], [158, 208], [138, 218], [126, 168]],
        // Eurasia
        [[245, 44], [385, 42], [418, 86], [372, 122], [295, 112], [248, 86]],
        // Africa
        [[242, 106], [296, 112], [308, 162], [282, 204], [252, 172]],
        // Australia
        [[382, 164], [432, 162], [438, 198], [388, 202]],
      ];

      continents.forEach((poly) => {
        ctx.beginPath();
        poly.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });

      return new THREE.CanvasTexture(canvas);
    }

    _buildHolographicScene() {
      // 1. Holographic Floor Projector Ring & Beam Cone
      const projRingGeo = new THREE.RingGeometry(1.85, 2.05, 64);
      projRingGeo.rotateX(-Math.PI / 2);
      const projRingMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.22,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const projRing = new THREE.Mesh(projRingGeo, projRingMat);
      projRing.position.set(0, -3.45, 0);
      this.group.add(projRing);

      const projConeGeo = new THREE.CylinderGeometry(2.5, 1.85, 3.4, 48, 1, true);
      const projConeMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.04,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const projCone = new THREE.Mesh(projConeGeo, projConeMat);
      projCone.position.set(0, -1.75, 0);
      this.group.add(projCone);

      // 2. Holographic Earth Sphere + Wireframe Geodesic + Atmosphere Rim Glow
      const earthTex = this._createProceduralEarthTexture();
      const earthMat = new THREE.MeshStandardMaterial({
        map: earthTex,
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveMap: earthTex,
        emissiveIntensity: 0.22,
        roughness: 0.35,
        metalness: 0.15,
        transparent: true,
        opacity: 0.42,
      });
      this.earthMesh = new THREE.Mesh(new THREE.SphereGeometry(0.76, 48, 32), earthMat);
      this.orbitalPlane.add(this.earthMesh);

      const wireMat = new THREE.MeshBasicMaterial({
        color: 0x67e8f9,
        wireframe: true,
        transparent: true,
        opacity: 0.14,
      });
      this.earthWireMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.775, 3), wireMat);
      this.orbitalPlane.add(this.earthWireMesh);

      // Atmosphere outer halo shell
      const atmoMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const atmoShell = new THREE.Mesh(new THREE.SphereGeometry(0.86, 36, 36), atmoMat);
      this.orbitalPlane.add(atmoShell);

      // Equatorial grid ring around Earth
      const eqRingGeo = new THREE.RingGeometry(0.89, 0.92, 64);
      eqRingGeo.rotateX(Math.PI / 2);
      const eqRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.26,
      });
      this.equatorialRing = new THREE.Mesh(eqRingGeo, eqRingMat);
      this.orbitalPlane.add(this.equatorialRing);

      // 3. Initial Orbit Ring (r1 - Cyan) & Target Orbit Ring (r2 - Emerald/Gold)
      const r1Mat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.38,
      });
      this.r1RingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.016, 12, 96).rotateX(Math.PI / 2),
        r1Mat
      );
      this.orbitalPlane.add(this.r1RingMesh);

      this.r2RingMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.40,
      });
      this.r2RingMesh = new THREE.Mesh(
        new THREE.TorusGeometry(1.0, 0.018, 12, 128).rotateX(Math.PI / 2),
        this.r2RingMat
      );
      this.orbitalPlane.add(this.r2RingMesh);

      // 4. Dynamic 3D Multi-Revolution Spiral Trajectory Curve
      this.spiralGeo = new THREE.BufferGeometry();
      this.spiralGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(this.spiralPositions, 3)
      );
      this.spiralGeo.setAttribute(
        'color',
        new THREE.BufferAttribute(this.spiralColors, 3)
      );
      const spiralMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.42,
        linewidth: 2,
      });
      this.spiralLine = new THREE.Line(this.spiralGeo, spiralMat);
      this.orbitalPlane.add(this.spiralLine);

      // 5. Fuel Exhaustion Beacon Marker (shown on spiral when dvMax < dvReq)
      this.exhaustionMarker = new THREE.Group();
      const exSphere = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.075, 0),
        new THREE.MeshBasicMaterial({ color: 0xef4444 })
      );
      const exHalo = new THREE.Mesh(
        new THREE.RingGeometry(0.09, 0.14, 24).rotateX(Math.PI / 2),
        new THREE.MeshBasicMaterial({
          color: 0xef4444,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.38,
        })
      );
      this.exhaustionMarker.add(exSphere, exHalo);
      this.exhaustionMarker.visible = false;
      this.orbitalPlane.add(this.exhaustionMarker);

      // 6. Miniature 3D Spacecraft Marker with Glowing Plasma Plume
      this.spacecraftGroup = new THREE.Group();

      // Spacecraft metallic foil bus
      const busMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        metalness: 0.85,
        roughness: 0.22,
        emissive: 0x78350f,
        emissiveIntensity: 0.20,
      });
      const busMesh = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.09, 0.15), busMat);
      this.spacecraftGroup.add(busMesh);

      // Twin Photovoltaic Solar Array Wings
      const panelMat = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        metalness: 0.75,
        roughness: 0.2,
        emissive: 0x0284c7,
        emissiveIntensity: 0.22,
      });
      const solarWing = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.014, 0.11), panelMat);
      this.spacecraftGroup.add(solarWing);

      // Miniature Hall Thruster Nozzle at -Z aft end of spacecraft
      const nozzleMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.045, 0.04, 16).rotateX(Math.PI / 2),
        new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
      );
      nozzleMesh.position.z = -0.09;
      this.spacecraftGroup.add(nozzleMesh);

      // Spacecraft Active Glowing Plasma Plume (points along -Z behind spacecraft)
      this.scPlumeConeMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.10,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const scPlumeCone = new THREE.Mesh(
        new THREE.ConeGeometry(0.085, 0.42, 20, 1, true).rotateX(Math.PI / 2),
        this.scPlumeConeMat
      );
      scPlumeCone.position.z = -0.30;
      this.spacecraftGroup.add(scPlumeCone);

      this.scPlumeCoreMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.14,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const scPlumeCore = new THREE.Mesh(
        new THREE.ConeGeometry(0.038, 0.26, 16).rotateX(Math.PI / 2),
        this.scPlumeCoreMat
      );
      scPlumeCore.position.z = -0.22;
      this.spacecraftGroup.add(scPlumeCore);

      this.scPlumeLight = new THREE.PointLight(0x3b82f6, 0.24, 2.5, 2.0);
      this.scPlumeLight.position.set(0, 0, -0.20);
      this.spacecraftGroup.add(this.scPlumeLight);

      this.orbitalPlane.add(this.spacecraftGroup);

      // 7. 3D Holographic Propellant Tank Column Indicator (Beside Orbital Display)
      const holoTankGroup = new THREE.Group();
      holoTankGroup.position.set(-2.65, -0.1, -0.3);

      const holoShell = new THREE.Mesh(
        new THREE.CylinderGeometry(0.22, 0.22, 1.45, 24),
        new THREE.MeshBasicMaterial({
          color: 0x22d3ee,
          wireframe: true,
          transparent: true,
          opacity: 0.20,
        })
      );
      holoTankGroup.add(holoShell);

      this.holoFuelMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.42,
      });
      this.holoFuelFillMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.18, 1.36, 24),
        this.holoFuelMat
      );
      holoTankGroup.add(this.holoFuelFillMesh);
      this.group.add(holoTankGroup);
    }

    // Map physical altitude (200 km -> 36,000 km) to clean 3D visual radius (1.08 -> 2.48)
    _altitudeToVisualRadius(altKm) {
      const clamped = Math.max(150, Math.min(36500, altKm));
      // Logarithmic blend so both LEO (350->550 km) and GEO (400->35,786 km) have clear radial separation
      const logNorm =
        Math.log(1 + (clamped - 150) / 450) / Math.log(1 + (36000 - 150) / 450);
      return 1.06 + logNorm * 1.42;
    }

    computeAstrodynamics() {
      const orb = state.orbit;
      const tel = state.telemetry;
      const mu = PHYSICS_CONSTANTS.MU_EARTH;
      const rEarthM = PHYSICS_CONSTANTS.R_EARTH_M;

      const r1M = rEarthM + orb.h1 * 1000.0;
      const r2M = rEarthM + orb.h2 * 1000.0;

      // 1. Low-Thrust Spiral Transfer Required Delta-V (Edelbaum Circular-to-Circular Coplanar Transfer)
      // dv_req = |sqrt(mu / (R_earth + h1)) - sqrt(mu / (R_earth + h2))|
      const v1 = Math.sqrt(mu / r1M);
      const v2 = Math.sqrt(mu / r2M);
      const edelbaumDvReq = Math.abs(v1 - v2);
      const dvReq =
        orb.dvReqOverride !== null ? orb.dvReqOverride : Math.max(1.0, edelbaumDvReq);

      // 2. Maximum Available Spacecraft Delta-V (Tsiolkovsky Rocket Equation)
      // dv_max = v_e * eta_mag * ln((m_dry + m_prop) / m_dry)
      const veEff = Math.max(100.0, tel.exhaustVelocityMs * tel.etaMag);
      const m0 = orb.dryMass + orb.propMass;
      const dvMax = veEff * Math.log(m0 / Math.max(1.0, orb.dryMass));

      // 3. Required Propellant Mass for Mission (m_prop,req)
      // m_prop,req = (m_dry + m_prop) * (1 - exp(-dv_req / (v_e * eta_mag)))
      const propReqKg = m0 * (1.0 - Math.exp(-dvReq / veEff));

      // 4. Total Continuous Thrust & Burn Duration (t_burn)
      // T_total = N_thrusters * T,  t_burn = m_prop,req / (N_thrusters * m_dot)
      const totalThrustMn = orb.clusterCount * tel.thrustMn;
      const totalThrustN = totalThrustMn * 1e-3;
      const totalMassFlowKgS = Math.max(1e-9, orb.clusterCount * (state.massFlow * 1e-6));
      const burnTimeSec = propReqKg / totalMassFlowKgS;
      const burnTimeHours = burnTimeSec / 3600.0;
      const burnTimeDays = burnTimeHours / 24.0;

      // 5. Initial Spacecraft Acceleration (a_0) in mm/s^2
      // a_0 = T_total / (m_dry + m_prop)
      const accelMmS2 = (totalThrustN / m0) * 1000.0;

      // Feasibility & Reserve Margin
      const isFeasible = dvMax >= dvReq;
      const reservePropKg = orb.propMass - propReqKg;
      const achievableFraction = dvReq > 0 ? Math.min(1.0, dvMax / dvReq) : 1.0;

      orb.telemetry = {
        dvReq,
        dvMax,
        propReqKg,
        reservePropKg,
        totalThrustMn,
        burnTimeHours,
        burnTimeDays,
        accelMmS2,
        isFeasible,
        achievableFraction,
      };

      // Update current burn state readouts based on burnProgress
      const activeProgress = Math.min(orb.burnProgress, achievableFraction);
      const fuelUsedKg = Math.min(orb.propMass, activeProgress * propReqKg);
      orb.remainingPropKg = Math.max(0.0, orb.propMass - fuelUsedKg);
      orb.elapsedSimHours = activeProgress * burnTimeHours;
      orb.currentAltKm = THREE.MathUtils.lerp(orb.h1, orb.h2, activeProgress);

      return orb.telemetry;
    }

    updateSpiralGeometryAndVisuals() {
      const orb = state.orbit;
      const oTel = orb.telemetry;
      const prop = PROPELLANTS[state.propellant];

      let r1Vis = this._altitudeToVisualRadius(orb.h1);
      let r2Vis = this._altitudeToVisualRadius(orb.h2);
      // Ensure visible separation between r1 and r2 rings even for close LEO maneuvers
      if (Math.abs(r2Vis - r1Vis) < 0.36) {
        if (orb.h2 >= orb.h1) {
          r2Vis = Math.min(2.52, r1Vis + 0.42);
        } else {
          r2Vis = Math.max(0.98, r1Vis - 0.42);
        }
      }

      this.r1RingMesh.scale.set(r1Vis, 1, r1Vis);
      this.r2RingMesh.scale.set(r2Vis, 1, r2Vis);
      this.r2RingMat.color.setHex(oTel.isFeasible ? 0x10b981 : 0xf59e0b);

      // Multi-revolution spiral parameters
      const numRevs = Math.max(3.5, Math.min(8.5, 3.2 + (oTel.dvReq / 1000.0) * 1.15));
      const totalAngle = numRevs * Math.PI * 2;
      const achievableFrac = oTel.achievableFraction;
      const activeProg = Math.min(orb.burnProgress, achievableFrac);

      const posArr = this.spiralPositions;
      const colArr = this.spiralColors;

      for (let i = 0; i < this.spiralPointsCount; i++) {
        const s = i / (this.spiralPointsCount - 1);
        const theta = s * totalAngle;
        const r = THREE.MathUtils.lerp(r1Vis, r2Vis, s);
        const yLift = Math.sin(s * Math.PI) * 0.04;

        posArr[i * 3] = Math.cos(theta) * r;
        posArr[i * 3 + 1] = yLift;
        posArr[i * 3 + 2] = Math.sin(theta) * r;

        if (s <= achievableFrac) {
          if (s <= activeProg && activeProg > 0.001) {
            // Already burned trajectory segment: soft cyan to emerald
            colArr[i * 3] = THREE.MathUtils.lerp(0.22, 0.14, s);
            colArr[i * 3 + 1] = 0.78;
            colArr[i * 3 + 2] = THREE.MathUtils.lerp(0.82, 0.56, s);
          } else {
            // Achievable planned spiral segment: cyan -> emerald
            colArr[i * 3] = THREE.MathUtils.lerp(0.06, 0.05, s);
            colArr[i * 3 + 1] = THREE.MathUtils.lerp(0.68, 0.64, s);
            colArr[i * 3 + 2] = THREE.MathUtils.lerp(0.80, 0.46, s);
          }
        } else {
          // Unachievable segment after propellant exhaustion: crimson red
          colArr[i * 3] = 0.85;
          colArr[i * 3 + 1] = 0.18;
          colArr[i * 3 + 2] = 0.22;
        }
      }

      this.spiralGeo.attributes.position.needsUpdate = true;
      this.spiralGeo.attributes.color.needsUpdate = true;

      // Position Fuel Exhaustion Marker if Delta-V Deficit exists
      if (!oTel.isFeasible) {
        const exTheta = achievableFrac * totalAngle;
        const exR = THREE.MathUtils.lerp(r1Vis, r2Vis, achievableFrac);
        const exY = Math.sin(achievableFrac * Math.PI) * 0.04;
        this.exhaustionMarker.position.set(
          Math.cos(exTheta) * exR,
          exY,
          Math.sin(exTheta) * exR
        );
        this.exhaustionMarker.visible = true;
      } else {
        this.exhaustionMarker.visible = false;
      }

      // Position & Orient 3D Spacecraft Marker along the Spiral Curve
      const scTheta = activeProg * totalAngle;
      const scR = THREE.MathUtils.lerp(r1Vis, r2Vis, activeProg);
      const scY = Math.sin(activeProg * Math.PI) * 0.04;
      this.spacecraftGroup.position.set(
        Math.cos(scTheta) * scR,
        scY,
        Math.sin(scTheta) * scR
      );

      // Compute forward tangent direction along the spiral
      const dTheta = 0.04;
      const nextS = Math.min(1.0, activeProg + dTheta / totalAngle);
      const nextTheta = scTheta + dTheta;
      const nextR = THREE.MathUtils.lerp(r1Vis, r2Vis, nextS);
      const tangentTarget = new THREE.Vector3(
        Math.cos(nextTheta) * nextR,
        scY,
        Math.sin(nextTheta) * nextR
      );
      this.spacecraftGroup.lookAt(tangentTarget);

      // Update spacecraft plume color & intensity (scaled by plasmaBrightness, strictly capped)
      this.scPlumeConeMat.color.copy(prop.primaryColor);
      this.scPlumeCoreMat.color.copy(prop.coreColor);
      this.scPlumeLight.color.copy(prop.primaryColor);

      const bScale = state.plasmaBrightness;
      const hasFuelRemaining = orb.remainingPropKg > 0.01;
      const plumeActive = hasFuelRemaining && (orb.isBurning || orb.burnProgress < 0.999);
      this.scPlumeConeMat.opacity = plumeActive
        ? Math.min(0.12, (orb.isBurning ? 0.12 : 0.08) * bScale)
        : 0.0;
      this.scPlumeCoreMat.opacity = plumeActive
        ? Math.min(0.15, (orb.isBurning ? 0.15 : 0.10) * bScale)
        : 0.0;
      this.scPlumeLight.intensity = plumeActive
        ? Math.min(0.35, (orb.isBurning ? 0.35 : 0.18) * bScale)
        : 0.0;

      // Update 3D Tank Depletion Visuals on both `propellant_supply` component and holographic gauge
      const fuelFrac = Math.max(0.0, Math.min(1.0, orb.remainingPropKg / Math.max(0.1, orb.propMass)));
      this.update3DTankFluidIndicator(fuelFrac);
    }

    update3DTankFluidIndicator(fuelFraction) {
      const clamped = Math.max(0.0, Math.min(1.0, fuelFraction));
      let hexColor = 0x10b981; // Emerald nominal
      if (clamped <= 0.02) {
        hexColor = 0xef4444;   // Red empty
      } else if (clamped < 0.30) {
        hexColor = 0xf59e0b;   // Amber low reserve
      }

      if (tankFluidMat && tankFluidFillMesh && tankFluidRingMesh) {
        tankFluidMat.color.setHex(hexColor);
        const scaleX = Math.max(0.03, clamped);
        tankFluidFillMesh.scale.set(scaleX, 1, 1);
        tankFluidFillMesh.position.x = -0.70 * (1.0 - scaleX);
        tankFluidRingMesh.position.x = -0.70 + 1.40 * clamped;
      }

      if (this.holoFuelMat && this.holoFuelFillMesh) {
        this.holoFuelMat.color.setHex(hexColor);
        const scaleY = Math.max(0.03, clamped);
        this.holoFuelFillMesh.scale.set(1, scaleY, 1);
        this.holoFuelFillMesh.position.y = -0.68 * (1.0 - scaleY);
      }
    }

    updateUI() {
      const orb = state.orbit;
      const oTel = this.computeAstrodynamics();
      const prop = PROPELLANTS[state.propellant];

      // Sync Mode D Propellant Quick-Switcher Buttons
      document.querySelectorAll('.orbit-prop-btn').forEach((btn) => {
        const key = btn.getAttribute('data-orbit-prop');
        const isActive = key === state.propellant;
        if (isActive) {
          btn.className =
            'orbit-prop-btn px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-400/50';
        } else {
          btn.className =
            'orbit-prop-btn px-2 py-0.5 rounded text-[10px] font-mono font-bold text-slate-400 hover:text-white border border-transparent';
        }
      });

      // Sync Slider Readout Labels
      const dryEl = document.getElementById('val-orbit-drymass');
      const propEl = document.getElementById('val-orbit-propmass');
      const h1El = document.getElementById('val-orbit-h1');
      const h2El = document.getElementById('val-orbit-h2');
      const clusEl = document.getElementById('val-orbit-cluster');

      if (dryEl) dryEl.textContent = `${orb.dryMass.toLocaleString()} kg`;
      if (propEl) propEl.textContent = `${orb.propMass.toLocaleString()} kg`;
      if (h1El) h1El.textContent = `${orb.h1.toLocaleString()} km`;
      if (h2El) h2El.textContent = `${orb.h2.toLocaleString()} km`;
      if (clusEl) {
        clusEl.textContent = `${orb.clusterCount} ${orb.clusterCount === 1 ? 'Unit' : 'Units'}`;
      }

      // Sync Fuel Gauge Bar & Burn Telemetry
      const fuelPct = Math.max(0, Math.min(100, (orb.remainingPropKg / Math.max(0.1, orb.propMass)) * 100));
      const fuelReadoutEl = document.getElementById('orbit-fuel-readout');
      const fuelBarEl = document.getElementById('orbit-fuel-bar');
      const currAltEl = document.getElementById('orbit-current-alt');
      const elapsedEl = document.getElementById('orbit-elapsed-time');

      if (fuelReadoutEl) {
        fuelReadoutEl.textContent = `${orb.remainingPropKg.toFixed(1)} kg (${Math.round(fuelPct)}%)`;
        fuelReadoutEl.className =
          fuelPct <= 2
            ? 'text-red-400 font-bold'
            : fuelPct < 30
            ? 'text-amber-300 font-bold'
            : 'text-emerald-300 font-bold';
      }
      if (fuelBarEl) {
        fuelBarEl.style.width = `${fuelPct.toFixed(1)}%`;
        fuelBarEl.className =
          fuelPct <= 2
            ? 'h-full bg-red-500 transition-all duration-150'
            : fuelPct < 30
            ? 'h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-150'
            : 'h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-150';
      }
      if (currAltEl) {
        currAltEl.textContent = `Current Alt: ${Math.round(orb.currentAltKm).toLocaleString()} km`;
      }
      if (elapsedEl) {
        const hrs = orb.elapsedSimHours;
        elapsedEl.textContent =
          hrs >= 48
            ? `Elapsed: ${(hrs / 24).toFixed(1)} days (${Math.round(hrs)}h)`
            : `Elapsed: ${hrs.toFixed(1)} hrs`;
      }

      // Sync Mission Feasibility Banner
      const bannerEl = document.getElementById('orbit-feasibility-banner');
      const subEl = document.getElementById('orbit-feasibility-sub');
      if (bannerEl && subEl) {
        if (oTel.isFeasible) {
          bannerEl.className =
            'p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-xs text-emerald-200 leading-relaxed';
          bannerEl.innerHTML = `
            <div class="font-bold text-emerald-300 flex items-center gap-1.5">
              <i class="fa-solid fa-circle-check"></i> MISSION FEASIBLE — TARGET ORBIT ACHIEVED
            </div>
            <div id="orbit-feasibility-sub" class="text-[11px] mt-0.5">
              Available Δv (${Math.round(oTel.dvMax).toLocaleString()} m/s) exceeds requirement with <strong>+${oTel.reservePropKg.toFixed(1)} kg</strong> ${prop.symbol} reserve margin.
            </div>
          `;
        } else {
          const deficitDv = Math.round(oTel.dvReq - oTel.dvMax);
          const extraPropNeeded = Math.max(0.1, oTel.propReqKg - orb.propMass);
          const hintText =
            state.propellant === 'Xe'
              ? 'Switch to higher-Isp Argon (Ar) / Krypton (Kr), raise Discharge Voltage (Vd), or add propellant mass.'
              : state.voltage < 600
              ? `Increase Discharge Voltage (Vd > ${state.voltage}V) for higher Isp or increase Propellant Load (+${extraPropNeeded.toFixed(0)} kg).`
              : `Increase Propellant Tank Load by at least +${extraPropNeeded.toFixed(0)} kg or reduce Spacecraft Dry Mass.`;

          bannerEl.className =
            'p-2.5 rounded-lg bg-red-950/70 border border-red-500/60 text-xs text-red-200 leading-relaxed';
          bannerEl.innerHTML = `
            <div class="font-bold text-red-400 flex items-center gap-1.5">
              <i class="fa-solid fa-triangle-exclamation"></i> DELTA-V DEFICIT — PROPELLANT EXHAUSTED
            </div>
            <div id="orbit-feasibility-sub" class="text-[11px] mt-0.5">
              Short by <strong>-${deficitDv.toLocaleString()} m/s</strong> (exhausted at ${Math.round(oTel.achievableFraction * 100)}% transfer). ${hintText}
            </div>
          `;
        }
      }

      // Sync Astrodynamics KPI Cards
      const kpiDvReq = document.getElementById('orbit-kpi-dvreq');
      const kpiDvMax = document.getElementById('orbit-kpi-dvmax');
      const kpiPropNeed = document.getElementById('orbit-kpi-propneed');
      const kpiBurnTime = document.getElementById('orbit-kpi-burntime');
      const kpiBurnDays = document.getElementById('orbit-kpi-burndays');
      const kpiAccel = document.getElementById('orbit-kpi-accel');
      const kpiTotalThrust = document.getElementById('orbit-kpi-totalthrust');

      if (kpiDvReq) kpiDvReq.textContent = `${Math.round(oTel.dvReq).toLocaleString()} m/s`;
      if (kpiDvMax) {
        kpiDvMax.textContent = `${Math.round(oTel.dvMax).toLocaleString()} m/s`;
        kpiDvMax.className = oTel.isFeasible
          ? 'text-sm font-mono font-bold text-cyan-300 mt-0.5'
          : 'text-sm font-mono font-bold text-red-400 mt-0.5';
      }
      if (kpiPropNeed) {
        kpiPropNeed.textContent = `Need: ${oTel.propReqKg.toFixed(1)} kg (${prop.symbol})`;
      }
      if (kpiBurnTime) {
        kpiBurnTime.textContent =
          oTel.burnTimeHours >= 1000
            ? `${Math.round(oTel.burnTimeHours).toLocaleString()} hrs`
            : `${oTel.burnTimeHours.toFixed(1)} hrs`;
      }
      if (kpiBurnDays) {
        kpiBurnDays.textContent = `${oTel.burnTimeDays.toFixed(1)} Days Continuous`;
      }
      if (kpiAccel) {
        kpiAccel.textContent = `${oTel.accelMmS2.toFixed(2)} mm/s²`;
      }
      if (kpiTotalThrust) {
        kpiTotalThrust.textContent = `Cluster T = ${oTel.totalThrustMn.toFixed(1)} mN`;
      }

      this.syncBurnButtonUI();
      this.updateSpiralGeometryAndVisuals();
    }

    syncBurnButtonUI() {
      const iconEl = document.getElementById('icon-orbit-burn');
      const labelEl = document.getElementById('label-orbit-burn');
      if (!iconEl || !labelEl) return;

      const orb = state.orbit;
      const maxProg = orb.telemetry.achievableFraction;
      if (orb.isBurning) {
        iconEl.className = 'fa-solid fa-pause';
        labelEl.textContent = 'Pause Time-Warp Burn';
      } else if (orb.burnProgress >= maxProg - 0.001 && orb.burnProgress > 0) {
        iconEl.className = 'fa-solid fa-rotate-right';
        labelEl.textContent = orb.telemetry.isFeasible
          ? 'Burn Complete (Replay)'
          : 'Tank Depleted (Replay)';
      } else if (orb.burnProgress > 0.001) {
        iconEl.className = 'fa-solid fa-play';
        labelEl.textContent = 'Resume Time-Warp Burn';
      } else {
        iconEl.className = 'fa-solid fa-play';
        labelEl.textContent = 'Start Time-Warp Burn';
      }
    }

    applyMissionPreset(presetKey) {
      const p = MISSION_PRESETS[presetKey];
      if (!p) return;

      const orb = state.orbit;
      orb.presetKey = p.key;
      orb.h1 = p.h1;
      orb.h2 = p.h2;
      orb.dryMass = p.dryMass;
      orb.propMass = p.propMass;
      orb.clusterCount = p.clusterCount;
      orb.dvReqOverride = p.dvReqOverride;
      orb.isBurning = false;
      orb.burnProgress = 0.0;

      // Sync Slider Inputs
      const sDry = document.getElementById('slider-orbit-drymass');
      const sProp = document.getElementById('slider-orbit-propmass');
      const sH1 = document.getElementById('slider-orbit-h1');
      const sH2 = document.getElementById('slider-orbit-h2');
      const sClus = document.getElementById('slider-orbit-cluster');
      if (sDry) sDry.value = String(p.dryMass);
      if (sProp) sProp.value = String(p.propMass);
      if (sH1) sH1.value = String(p.h1);
      if (sH2) sH2.value = String(p.h2);
      if (sClus) sClus.value = String(p.clusterCount);

      const labelEl = document.getElementById('orbit-active-preset-label');
      if (labelEl) labelEl.textContent = p.label;

      document.querySelectorAll('.mission-preset-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-mission') === presetKey);
      });

      this.updateUI();
      updateTelemetryChart();
    }

    toggleBurn() {
      const orb = state.orbit;
      const maxProg = orb.telemetry.achievableFraction;
      if (orb.burnProgress >= maxProg - 0.001) {
        orb.burnProgress = 0.0;
        orb.isBurning = true;
      } else {
        orb.isBurning = !orb.isBurning;
      }
      if (orb.isBurning) {
        plasmaAudio.playIgnitionSequence();
      } else {
        plasmaAudio.playUIChirp('nav');
      }
      this.updateUI();
    }

    resetOrbit() {
      const orb = state.orbit;
      orb.isBurning = false;
      orb.burnProgress = 0.0;
      plasmaAudio.playUIChirp('stage');
      this.updateUI();
    }

    update(dt, elapsed) {
      const orb = state.orbit;

      // Slowly rotate holographic Earth & equatorial ring
      if (this.earthMesh) {
        this.earthMesh.rotation.y = elapsed * 0.18;
      }
      if (this.earthWireMesh) {
        this.earthWireMesh.rotation.y = elapsed * 0.18;
      }
      if (this.equatorialRing) {
        this.equatorialRing.rotation.z = -elapsed * 0.12;
      }

      // Pulse fuel exhaustion beacon if visible
      if (this.exhaustionMarker && this.exhaustionMarker.visible) {
        const s = 0.85 + 0.30 * Math.sin(elapsed * 7.5);
        this.exhaustionMarker.scale.set(s, s, s);
      }

      // Advance Time-Warp Burn Simulation
      if (orb.isBurning) {
        const maxProg = orb.telemetry.achievableFraction;
        // Scale rate with warpSpeed (100x, 1000x, 10000x) so transfers animate smoothly
        const warpFactor =
          orb.warpSpeed === 100 ? 0.045 : orb.warpSpeed === 1000 ? 0.125 : 0.34;
        orb.burnProgress += dt * warpFactor;

        if (orb.burnProgress >= maxProg) {
          orb.burnProgress = maxProg;
          orb.isBurning = false;
          if (orb.telemetry.isFeasible) {
            plasmaAudio.playUIChirp('preset');
          } else {
            // Audible caution alarm when tank runs dry before reaching target orbit!
            plasmaAudio.playFailureDiagnostic('no_propellant');
          }
        }
        this.updateUI();
      }
    }
  }

  const orbitalSimulator = new OrbitalMissionSimulator(scene);

  // ========================================================================
  // 10C. MODE E (MODE 5): PROCEDURAL 3D PLASMA-PROPELLED ROCKET & FLIGHT SIM
  // ========================================================================
  const playerRocketGroup = new THREE.Group();
  playerRocketGroup.name = 'player_plasma_rocket';
  playerRocketGroup.visible = false;
  scene.add(playerRocketGroup);

  function buildPlayerPlasmaRocket() {
    const rocket = playerRocketGroup;

    // Shared Aerospace Spacecraft Materials
    const matHullWhite = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.55,
      roughness: 0.28,
    });
    const matTitanium = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.86,
      roughness: 0.24,
    });
    const matDarkTps = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.45,
      roughness: 0.52,
    });
    const matChrome = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.94,
      roughness: 0.14,
    });
    const matGoldMli = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.88,
      roughness: 0.22,
      emissive: 0x78350f,
      emissiveIntensity: 0.14,
    });
    const matVisor = new THREE.MeshPhysicalMaterial({
      color: 0x0284c7,
      metalness: 0.2,
      roughness: 0.08,
      transmission: 0.35,
      clearcoat: 1.0,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.22,
    });
    const matRadiator = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.78,
      roughness: 0.32,
      emissive: 0x0284c7,
      emissiveIntensity: 0.12,
    });

    // ----------------------------------------------------------------------
    // 1. AEROSPACE ROCKET FUSELAGE, NOSE CONE & FORWARD DOCKING RING (-Z)
    // ----------------------------------------------------------------------
    const fuselageGroup = new THREE.Group();
    rocket.add(fuselageGroup);

    // Ogive / Parabolic Aerospace Nose Cone (z = -3.55 to -1.85) via LatheGeometry
    // In LatheGeometry before rotateX(-PI/2), y_lathe maps to -Z
    const nosePts = [];
    const noseSteps = 18;
    for (let i = 0; i <= noseSteps; i++) {
      const t = i / noseSteps; // 0 (tip at z=-3.55) -> 1 (base at z=-1.85)
      const r = 0.24 + (0.76 - 0.24) * Math.pow(t, 0.68);
      const yLathe = 3.55 - t * 1.70;
      nosePts.push(new THREE.Vector2(r, yLathe));
    }
    const noseGeo = new THREE.LatheGeometry(nosePts, 48);
    noseGeo.rotateX(-Math.PI / 2);
    const noseMesh = new THREE.Mesh(noseGeo, matHullWhite);
    fuselageGroup.add(noseMesh);

    // Dark Thermal Protection System (TPS) Forward Nose Cap (z = -3.58 to -3.05)
    const tpsCapGeo = new THREE.CylinderGeometry(0.24, 0.45, 0.54, 40).rotateX(Math.PI / 2);
    const tpsCapMesh = new THREE.Mesh(tpsCapGeo, matDarkTps);
    tpsCapMesh.position.z = -3.30;
    fuselageGroup.add(tpsCapMesh);

    // Forward Active Docking Ring & Capture Latches at Rocket Nose (z = -3.76)
    const dockCollar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.27, 0.24, 36).rotateX(Math.PI / 2),
      matChrome
    );
    dockCollar.position.z = -3.66;
    fuselageGroup.add(dockCollar);

    const dockLedMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.45,
    });
    const dockLedRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.26, 0.025, 12, 36),
      dockLedMat
    );
    dockLedRing.position.z = -3.78;
    fuselageGroup.add(dockLedRing);

    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + Math.PI / 6;
      const latch = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.14), matGoldMli);
      latch.position.set(Math.cos(a) * 0.25, Math.sin(a) * 0.25, -3.76);
      latch.rotation.z = a;
      fuselageGroup.add(latch);
    }

    // Illuminated Cockpit / Avionics Sensor Visor on Upper Forward Fuselage (z = -2.45)
    const visorMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.54, 0.67, 0.68, 32, 1, false, -Math.PI * 0.32, Math.PI * 0.64).rotateX(
        Math.PI / 2
      ),
      matVisor
    );
    visorMesh.position.set(0, 0.12, -2.42);
    visorMesh.rotation.z = Math.PI; // Orient arc upward (+Y)
    fuselageGroup.add(visorMesh);

    // Main Cylindrical Pressurized Spacecraft Hull (z = -1.85 to +0.35, r = 0.76)
    const mainHull = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.76, 2.20, 48).rotateX(Math.PI / 2),
      matHullWhite
    );
    mainHull.position.z = -0.75;
    fuselageGroup.add(mainHull);

    // Thermal Protection Tile Belly & Dorsal Avionics Spine
    const bellyTps = new THREE.Mesh(
      new THREE.CylinderGeometry(0.772, 0.772, 2.16, 36, 1, false, -Math.PI * 0.28, Math.PI * 0.56).rotateX(
        Math.PI / 2
      ),
      matDarkTps
    );
    bellyTps.position.z = -0.75;
    fuselageGroup.add(bellyTps);

    const dorsalSpine = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 2.85), matTitanium);
    dorsalSpine.position.set(0, 0.76, -0.35);
    fuselageGroup.add(dorsalSpine);

    // Port & Starboard Avionics Cable Raceways + Gold MLI Foil Equipment Panels
    [-1, 1].forEach((side) => {
      const raceway = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.14, 2.65), matTitanium);
      raceway.position.set(side * 0.75, 0.0, -0.45);
      fuselageGroup.add(raceway);

      const mliPanel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.85), matGoldMli);
      mliPanel.position.set(side * 0.74, 0.32, -0.75);
      fuselageGroup.add(mliPanel);
    });

    // Circumferential Structural Hull Rings
    [-1.85, -1.10, -0.35, 0.35, 1.35].forEach((zRing) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.775, 0.028, 12, 48),
        matTitanium
      );
      ring.position.z = zRing;
      fuselageGroup.add(ring);
    });

    // Aft Engineering & Cryo-Propellant Tank Section (z = +0.35 to +1.35)
    const aftBayCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.68, 0.72, 1.0, 36).rotateX(Math.PI / 2),
      matDarkTps
    );
    aftBayCore.position.z = 0.85;
    fuselageGroup.add(aftBayCore);

    // Glowing Propellant Tank Core Visible Through Aft Engineering Rib Cage
    const propCoreMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.45,
    });
    const propCoreCyl = new THREE.Mesh(
      new THREE.CylinderGeometry(0.705, 0.705, 0.74, 32).rotateX(Math.PI / 2),
      propCoreMat
    );
    propCoreCyl.position.z = 0.85;
    fuselageGroup.add(propCoreCyl);

    // 8 Longitudinal Titanium Struts Around Propellant Bay
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 1.02), matTitanium);
      strut.position.set(Math.cos(a) * 0.74, Math.sin(a) * 0.74, 0.85);
      strut.rotation.z = a;
      fuselageGroup.add(strut);
    }

    // Tapered Aft Thrust Boattail Skirt (z = +1.35 to +1.95, r = 0.76 -> 0.94)
    const boattail = new THREE.Mesh(
      new THREE.CylinderGeometry(0.76, 0.94, 0.60, 48).rotateX(Math.PI / 2),
      matTitanium
    );
    boattail.position.z = 1.65;
    fuselageGroup.add(boattail);

    // ----------------------------------------------------------------------
    // 2. DEPLOYABLE PHOTOVOLTAIC SOLAR ARRAY WINGS & 4 TAIL RADIATOR FINS
    // ----------------------------------------------------------------------
    // Custom GLSL ShaderMaterial for Glowing Blue Photovoltaic Solar Cell Grid
    const solarShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0.0 },
        uGlowLevel: { value: 0.55 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;
        uniform float uGlowLevel;
        void main() {
          vec2 cellUv = fract(vUv * vec2(14.0, 4.0));
          float gx = step(0.91, cellUv.x) + step(cellUv.x, 0.05);
          float gy = step(0.88, cellUv.y) + step(cellUv.y, 0.06);
          float grid = clamp(gx + gy, 0.0, 1.0);
          float busbar = step(0.47, vUv.y) * step(vUv.y, 0.53);
          float wave = 0.5 + 0.5 * sin(vUv.x * 16.0 - uTime * 3.2);
          vec3 cellCol = mix(vec3(0.03, 0.13, 0.34), vec3(0.06, 0.38, 0.78), 0.35 + 0.35 * wave);
          vec3 lineCol = mix(vec3(0.14, 0.62, 0.85), vec3(0.28, 0.72, 0.92), wave) * uGlowLevel;
          vec3 finalCol = mix(cellCol, lineCol, max(grid * 0.65, busbar * 0.75));
          gl_FragColor = vec4(finalCol, 0.92);
        }
      `,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const solarWingsGroup = new THREE.Group();
    solarWingsGroup.position.set(0, 0, -0.35);
    rocket.add(solarWingsGroup);

    [-1, 1].forEach((side) => {
      const wingRoot = new THREE.Group();
      // Rotary alpha-gimbal hub
      const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.36, 20).rotateZ(Math.PI / 2),
        matChrome
      );
      hub.position.set(side * 0.88, 0, 0);
      wingRoot.add(hub);

      // Structural deployment boom
      const boom = new THREE.Mesh(new THREE.BoxGeometry(4.1, 0.06, 0.12), matTitanium);
      boom.position.set(side * 2.95, 0, 0);
      wingRoot.add(boom);

      // Photovoltaic Solar Panel Blanket (2 segments per wing)
      [1.95, 3.92].forEach((xOff) => {
        const frame = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.035, 0.96), matDarkTps);
        frame.position.set(side * xOff, 0, 0);
        wingRoot.add(frame);

        const cellPlane = new THREE.Mesh(new THREE.PlaneGeometry(1.78, 0.88), solarShaderMat);
        cellPlane.rotation.x = Math.PI / 2;
        cellPlane.position.set(side * xOff, 0.022, 0);
        wingRoot.add(cellPlane);

        const cellPlaneBottom = new THREE.Mesh(
          new THREE.PlaneGeometry(1.78, 0.88),
          solarShaderMat
        );
        cellPlaneBottom.rotation.x = -Math.PI / 2;
        cellPlaneBottom.position.set(side * xOff, -0.022, 0);
        wingRoot.add(cellPlaneBottom);
      });

      // Wingtip Navigation Strobe Beacon (Port = Red/Amber, Starboard = Cyan/Emerald)
      const tipMat = new THREE.MeshBasicMaterial({
        color: side < 0 ? 0xf43f5e : 0x22d3ee,
      });
      const tipBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), tipMat);
      tipBeacon.position.set(side * 4.98, 0, 0);
      wingRoot.add(tipBeacon);

      solarWingsGroup.add(wingRoot);
    });

    // 4 Rear Aerodynamic / Thermal Radiator Tail Fins at 45°, 135°, 225°, 315° (z = +1.05)
    for (let i = 0; i < 4; i++) {
      const ang = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
      const finHolder = new THREE.Group();
      finHolder.rotation.z = ang;

      const finPanel = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.045, 0.92), matRadiator);
      finPanel.position.set(1.28, 0, 1.15);
      finPanel.rotation.y = -0.18; // Swept back toward +Z
      finHolder.add(finPanel);

      const finTip = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.09, 1.05),
        new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
      );
      finTip.position.set(1.90, 0, 1.22);
      finHolder.add(finTip);

      fuselageGroup.add(finHolder);
    }

    // ----------------------------------------------------------------------
    // 3. 4 FORWARD & 4 AFT RCS ATTITUDE THRUSTER PODS + GAS PUFF JETS
    // ----------------------------------------------------------------------
    const rcsPuffs = {
      up: [],    // Fires when pitching nose UP (W)
      down: [],  // Fires when pitching nose DOWN (S)
      left: [],  // Fires when steering/banking LEFT (A)
      right: [], // Fires when steering/banking RIGHT (D)
    };

    const createRcsPuffCone = (pos, dirVec) => {
      const puffMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.0,
        blending: THREE.NormalBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      // ConeGeometry points toward +Y by default; shift so apex is at nozzle and flare extends along dirVec
      const coneGeo = new THREE.ConeGeometry(0.22, 0.85, 16, 1, true);
      coneGeo.translate(0, -0.425, 0);
      coneGeo.rotateZ(Math.PI); // Now apex at origin, flaring toward +Y
      const mesh = new THREE.Mesh(coneGeo, puffMat);
      mesh.position.copy(pos);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dirVec.clone().normalize());
      fuselageGroup.add(mesh);
      return { mesh, mat: puffMat };
    };

    // Nose & Aft RCS Thruster Blocks
    const rcsPositions = [
      { z: -2.85, r: 0.56 },
      { z: 1.25, r: 0.76 },
    ];
    rcsPositions.forEach(({ z, r }) => {
      [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((a) => {
        const pod = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, 0.22), matChrome);
        pod.position.set(Math.cos(a) * r, Math.sin(a) * r, z);
        pod.rotation.z = a;
        fuselageGroup.add(pod);
      });
    });

    // Coupled Attitude Control Puff Jets (Nose + Aft pairs)
    // Pitch UP (W): bottom nose jet fires downward (-Y) + top aft jet fires upward (+Y)
    rcsPuffs.up.push(
      createRcsPuffCone(new THREE.Vector3(0, -0.60, -2.85), new THREE.Vector3(0, -1, 0)),
      createRcsPuffCone(new THREE.Vector3(0, 0.80, 1.25), new THREE.Vector3(0, 1, 0))
    );
    // Pitch DOWN (S): top nose jet fires upward (+Y) + bottom aft jet fires downward (-Y)
    rcsPuffs.down.push(
      createRcsPuffCone(new THREE.Vector3(0, 0.60, -2.85), new THREE.Vector3(0, 1, 0)),
      createRcsPuffCone(new THREE.Vector3(0, -0.80, 1.25), new THREE.Vector3(0, -1, 0))
    );
    // Steer LEFT (A): starboard (+X) nose jet fires right (+X) + port (-X) aft jet fires left (-X)
    rcsPuffs.left.push(
      createRcsPuffCone(new THREE.Vector3(0.60, 0, -2.85), new THREE.Vector3(1, 0, 0)),
      createRcsPuffCone(new THREE.Vector3(-0.80, 0, 1.25), new THREE.Vector3(-1, 0, 0))
    );
    // Steer RIGHT (D): port (-X) nose jet fires left (-X) + starboard (+X) aft jet fires right (+X)
    rcsPuffs.right.push(
      createRcsPuffCone(new THREE.Vector3(-0.60, 0, -2.85), new THREE.Vector3(-1, 0, 0)),
      createRcsPuffCone(new THREE.Vector3(0.80, 0, 1.25), new THREE.Vector3(1, 0, 0))
    );

    // ----------------------------------------------------------------------
    // 4. REAR-MOUNTED 2-AXIS GIMBALED HALL-EFFECT PLASMA THRUSTER (+Z TAIL)
    // ----------------------------------------------------------------------
    // Stationary Aft Gimbal Ring & 4 Servo Actuator Mounts at z = +1.95
    const aftAdapterRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.98, 0.045, 14, 48),
      matTitanium
    );
    aftAdapterRing.position.z = 1.96;
    fuselageGroup.add(aftAdapterRing);

    const servoStruts = [];
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
      const servo = new THREE.Mesh(
        new THREE.CylinderGeometry(0.032, 0.042, 0.58, 12).rotateX(Math.PI / 2),
        matGoldMli
      );
      servo.position.set(Math.cos(a) * 0.88, Math.sin(a) * 0.88, 2.12);
      fuselageGroup.add(servo);
      servoStruts.push({ mesh: servo, angle: a });
    }

    // 2-Axis Gimbal Pivot Group at Rocket Tail (z = +2.05)
    const yawGimbalGroup = new THREE.Group();
    yawGimbalGroup.position.set(0, 0, 2.05);
    rocket.add(yawGimbalGroup);

    const clevisRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.90, 0.035, 12, 48),
      new THREE.MeshStandardMaterial({
        color: 0x0ea5e9,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x0284c7,
        emissiveIntensity: 0.22,
      })
    );
    clevisRing.position.z = 0.12;
    yawGimbalGroup.add(clevisRing);

    const pitchNozzleGroup = new THREE.Group();
    yawGimbalGroup.add(pitchNozzleGroup);

    // Scaled HET-X1 Coaxial Hall-Effect Thruster Nozzle Assembly (z_local = 0.0 to +0.92)
    // Outer ferromagnetic magnetic housing shroud
    const hetOuterShroud = new THREE.Mesh(
      new THREE.CylinderGeometry(0.84, 0.88, 0.78, 48).rotateX(Math.PI / 2),
      matDarkTps
    );
    hetOuterShroud.position.z = 0.42;
    pitchNozzleGroup.add(hetOuterShroud);

    // 4 Outer Radial Electromagnet Coils around the Tail Thruster
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI * 0.25;
      const coil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.68, 20).rotateX(Math.PI / 2),
        matAnodeCopper
      );
      coil.position.set(Math.cos(a) * 0.78, Math.sin(a) * 0.78, 0.42);
      pitchNozzleGroup.add(coil);
    }

    // Front Chrome Magnetic Pole Faceplate (z_local = +0.82)
    const polePlate = new THREE.Mesh(
      new THREE.RingGeometry(0.68, 0.86, 48),
      matChrome
    );
    polePlate.position.z = 0.82;
    pitchNozzleGroup.add(polePlate);

    // Coaxial Boron Nitride (HP-BN) Ceramic Discharge Channel Walls (r = 0.42 to 0.66)
    const bnOuterWall = new THREE.Mesh(
      new THREE.CylinderGeometry(0.66, 0.66, 0.72, 48, 1, true).rotateX(Math.PI / 2),
      matBoronNitride
    );
    bnOuterWall.position.z = 0.48;
    pitchNozzleGroup.add(bnOuterWall);

    const bnInnerWall = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.42, 0.72, 48, 1, true).rotateX(Math.PI / 2),
      matBoronNitride
    );
    bnInnerWall.position.z = 0.48;
    pitchNozzleGroup.add(bnInnerWall);

    // Perforated Copper Anode Ring deep inside the BN Channel (z_local = +0.25)
    const tailAnodeRing = new THREE.Mesh(
      new THREE.RingGeometry(0.43, 0.65, 40),
      matAnodeCopper
    );
    tailAnodeRing.position.z = 0.25;
    pitchNozzleGroup.add(tailAnodeRing);

    // Central Magnetic Core Pole & Ceramic Nose Cone (r = 0.40, z_local = +0.88)
    const centerCoreCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.41, 0.34, 36).rotateX(Math.PI / 2),
      matChrome
    );
    centerCoreCone.position.z = 0.86;
    pitchNozzleGroup.add(centerCoreCone);

    // Dynamic Boron Nitride Wall Sputtering Rim Glow at Nozzle Exit (z_local = +0.84)
    const tailSputterRimMat = new THREE.MeshBasicMaterial({
      color: 0xff3b00,
      transparent: true,
      opacity: 0.0,
      blending: THREE.NormalBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const tailSputterOuter = new THREE.Mesh(
      new THREE.TorusGeometry(0.66, 0.032, 14, 48),
      tailSputterRimMat
    );
    tailSputterOuter.position.z = 0.84;
    const tailSputterInner = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.028, 14, 48),
      tailSputterRimMat
    );
    tailSputterInner.position.z = 0.84;
    pitchNozzleGroup.add(tailSputterOuter, tailSputterInner);

    // External Hollow Cathode Neutralizer (LaB6) mounted at top-right of Tail Nozzle
    const tailCathodeGroup = new THREE.Group();
    tailCathodeGroup.position.set(0.32, 0.88, 0.65);
    tailCathodeGroup.rotation.x = 0.32;
    tailCathodeGroup.rotation.y = -0.15;

    const cathBarrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.085, 0.46, 16).rotateX(Math.PI / 2),
      matChrome
    );
    tailCathodeGroup.add(cathBarrel);

    const cathOrificeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
    });
    const cathOrificeTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.048, 12, 12),
      cathOrificeMat
    );
    cathOrificeTip.position.z = 0.25;
    tailCathodeGroup.add(cathOrificeTip);
    pitchNozzleGroup.add(tailCathodeGroup);

    // ----------------------------------------------------------------------
    // 5. TRAILING 3D PLASMA EXHAUST PLUME (+Z OUT OF ROCKET TAIL)
    // ----------------------------------------------------------------------
    const tailPlumeGroup = new THREE.Group();
    tailPlumeGroup.position.z = 0.82; // Starts right at BN channel exit
    pitchNozzleGroup.add(tailPlumeGroup);

    // Glowing Azimuthal E×B Hall Ring Torus at Nozzle Exit
    const tailHallRingMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.12,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const tailHallRingMesh = new THREE.Mesh(
      new THREE.TorusGeometry(0.54, 0.095, 18, 64),
      tailHallRingMat
    );
    tailPlumeGroup.add(tailHallRingMesh);

    // Outer Annular Plasma Plume Cone shooting backward (+Z)
    const tailOuterConeMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const tailOuterConeGeo = new THREE.CylinderGeometry(1.15, 0.55, 6.0, 40, 1, true);
    tailOuterConeGeo.translate(0, 3.0, 0);
    tailOuterConeGeo.rotateX(Math.PI / 2); // Base at z=0 (r=0.55), expanding to z=+6.0 (r=1.15)
    const tailOuterConeMesh = new THREE.Mesh(tailOuterConeGeo, tailOuterConeMat);
    tailPlumeGroup.add(tailOuterConeMesh);

    // Inner Collimated Mach Core Spike shooting backward (+Z)
    const tailCoreSpikeMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const tailCoreSpikeGeo = new THREE.ConeGeometry(0.32, 4.8, 32, 1, true);
    tailCoreSpikeGeo.translate(0, 2.4, 0);
    tailCoreSpikeGeo.rotateX(Math.PI / 2); // Base at z=0, apex at z=+4.8
    const tailCoreSpikeMesh = new THREE.Mesh(tailCoreSpikeGeo, tailCoreSpikeMat);
    tailPlumeGroup.add(tailCoreSpikeMesh);

    // 3 Mach Shock Diamond Rings along the inner plasma core
    const shockRings = [];
    for (let s = 0; s < 3; s++) {
      const srMat = new THREE.MeshBasicMaterial({
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.10,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const srMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.38 - s * 0.07, 0.025, 12, 36),
        srMat
      );
      srMesh.position.z = 0.9 + s * 1.1;
      tailPlumeGroup.add(srMesh);
      shockRings.push({ mesh: srMesh, mat: srMat, baseZ: 0.9 + s * 1.1 });
    }

    // Pulsed Plasma Afterburner Shockwave Ring (expands along +Z when SPACE is pressed)
    const pulseWaveMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.0,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const pulseWaveRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.65, 0.06, 16, 48),
      pulseWaveMat
    );
    tailPlumeGroup.add(pulseWaveRing);

    // 3D Particle Stream 1: Accelerated Plasma Ion Beam (1,200 particles shooting toward +Z)
    const ROCKET_ION_COUNT = 1200;
    const rIonPos = new Float32Array(ROCKET_ION_COUNT * 3);
    const rIonCol = new Float32Array(ROCKET_ION_COUNT * 3);
    const rIonData = [];
    for (let i = 0; i < ROCKET_ION_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const baseR = 0.43 + Math.random() * 0.22;
      const life = Math.random();
      rIonData.push({
        angle,
        baseR,
        life,
        speed: 0.8 + Math.random() * 0.5,
        spread: (Math.random() - 0.5) * 1.8,
        swirl: (Math.random() - 0.5) * 0.6,
      });
      rIonPos[i * 3] = Math.cos(angle) * baseR;
      rIonPos[i * 3 + 1] = Math.sin(angle) * baseR;
      rIonPos[i * 3 + 2] = life * 5.0;
      rIonCol[i * 3] = 0.23;
      rIonCol[i * 3 + 1] = 0.51;
      rIonCol[i * 3 + 2] = 0.96;
    }
    const rIonGeo = new THREE.BufferGeometry();
    rIonGeo.setAttribute('position', new THREE.BufferAttribute(rIonPos, 3));
    rIonGeo.setAttribute('color', new THREE.BufferAttribute(rIonCol, 3));
    const rIonMat = new THREE.PointsMaterial({
      size: 0.077,
      map: particleSpriteTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.20,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const rIonPoints = new THREE.Points(rIonGeo, rIonMat);
    tailPlumeGroup.add(rIonPoints);

    // 3D Particle Stream 2: Azimuthal Hall Electrons & Cathode Neutralizer Stream (320 particles)
    const ROCKET_ELEC_COUNT = 320;
    const rElecPos = new Float32Array(ROCKET_ELEC_COUNT * 3);
    const rElecData = [];
    for (let i = 0; i < ROCKET_ELEC_COUNT; i++) {
      const isCathode = i >= ROCKET_ELEC_COUNT * 0.75;
      const angle = Math.random() * Math.PI * 2;
      const r = 0.44 + Math.random() * 0.20;
      rElecData.push({
        isCathode,
        angle,
        r,
        t: Math.random(),
        omega: 10.0 + Math.random() * 6.0,
      });
      rElecPos[i * 3] = Math.cos(angle) * r;
      rElecPos[i * 3 + 1] = Math.sin(angle) * r;
      rElecPos[i * 3 + 2] = 0.05;
    }
    const rElecGeo = new THREE.BufferGeometry();
    rElecGeo.setAttribute('position', new THREE.BufferAttribute(rElecPos, 3));
    const rElecMat = new THREE.PointsMaterial({
      color: 0xfde047,
      size: 0.047,
      map: particleSpriteTex,
      transparent: true,
      opacity: 0.25,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const rElecPoints = new THREE.Points(rElecGeo, rElecMat);
    tailPlumeGroup.add(rElecPoints);

    // 3D Particle Stream 3: BN Channel Wall Sputtering Sparks (140 particles)
    const ROCKET_SPUT_COUNT = 140;
    const rSputPos = new Float32Array(ROCKET_SPUT_COUNT * 3);
    const rSputData = [];
    for (let i = 0; i < ROCKET_SPUT_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const isOuter = Math.random() > 0.35;
      const baseR = isOuter ? 0.65 : 0.43;
      rSputData.push({
        angle,
        baseR,
        life: Math.random(),
        vr: (isOuter ? -1 : 1) * (0.25 + Math.random() * 0.55),
        vz: 0.6 + Math.random() * 1.6,
      });
      rSputPos[i * 3] = Math.cos(angle) * baseR;
      rSputPos[i * 3 + 1] = Math.sin(angle) * baseR;
      rSputPos[i * 3 + 2] = 0.02;
    }
    const rSputGeo = new THREE.BufferGeometry();
    rSputGeo.setAttribute('position', new THREE.BufferAttribute(rSputPos, 3));
    const rSputMat = new THREE.PointsMaterial({
      color: 0xff5500,
      size: 0.05,
      map: particleSpriteTex,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });
    const rSputPoints = new THREE.Points(rSputGeo, rSputMat);
    tailPlumeGroup.add(rSputPoints);

    // Dynamic PointLight at Rocket Tail Engine to illuminate aft boattail, fins & solar wings (dimmed by 80%)
    const tailPlasmaLight = new THREE.PointLight(0x3b82f6, 0.35, 14.0, 1.6);
    tailPlasmaLight.position.set(0, 0, 0.9);
    tailPlumeGroup.add(tailPlasmaLight);

    rocket.rotation.order = 'YXZ';

    return {
      group: rocket,
      fuselageGroup,
      solarWingsGroup,
      solarShaderMat,
      dockLedMat,
      propCoreMat,
      propCoreCyl,
      rcsPuffs,
      servoStruts,
      yawGimbalGroup,
      pitchNozzleGroup,
      tailSputterRimMat,
      tailPlumeGroup,
      tailPlasmaLight,
      tailHallRingMat,
      tailHallRingMesh,
      tailOuterConeMat,
      tailOuterConeMesh,
      tailCoreSpikeMat,
      tailCoreSpikeMesh,
      shockRings,
      pulseWaveMat,
      pulseWaveRing,
      rIonGeo,
      rIonMat,
      rIonPoints,
      rIonData,
      rIonCount: ROCKET_ION_COUNT,
      rElecGeo,
      rElecMat,
      rElecPoints,
      rElecData,
      rElecCount: ROCKET_ELEC_COUNT,
      rSputGeo,
      rSputMat,
      rSputPoints,
      rSputData,
      rSputCount: ROCKET_SPUT_COUNT,
    };
  }

  const playerRocket = buildPlayerPlasmaRocket();

  class ThrusterGameSimulator {
    constructor(parentScene) {
      this.scene = parentScene;
      this.group = new THREE.Group();
      this.group.name = 'thruster_game_environment';
      this.group.visible = false;
      this.scene.add(this.group);

      this.rocket = playerRocket;

      // World Corridor Group (contains forward-scrolling gates, solar rings, asteroids/debris, orbital station)
      this.worldCorridorGroup = new THREE.Group();
      this.group.add(this.worldCorridorGroup);

      // Keyboard & Virtual Button Input State
      this.keys = {
        KeyW: false,
        KeyS: false,
        KeyA: false,
        KeyD: false,
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
        ShiftLeft: false,
        ShiftRight: false,
        ControlLeft: false,
        ControlRight: false,
        KeyQ: false,
        KeyE: false,
      };

      // True 3D Rocket Flight Kinematics (Rocket nose points toward -Z; +X is Right, +Y is Up)
      this.posX = 0.0;
      this.posY = 0.0;
      this.posZ = 0.0; // Total forward distance traveled along -Z
      this.vx = 0.0;
      this.vy = 0.0;
      this.vz = -18.0;
      this.forwardSpeed = 18.0;
      this.pitchAngleRad = 0.0;
      this.yawAngleRad = 0.0;
      this.rollAngleRad = 0.0; // Aerodynamic bank angle (-25° to +25°)
      this.prevPitchDeg = 0.0;
      this.prevYawDeg = 0.0;
      this.cameraShake = 0.0;
      this.toastTimer = 0.0;
      this.radarBeepTimer = 0.0;
      this.klaxonTimer = 0.0;
      this.chartSyncTimer = 0.0;

      // Scene Object Pools
      this.starCount = 1500;
      this.starPositions = new Float32Array(this.starCount * 3);
      this.starColors = new Float32Array(this.starCount * 3);
      this.starGeo = null;
      this.starPoints = null;

      this.speedLineCount = 56;
      this.speedLinePositions = new Float32Array(this.speedLineCount * 6);
      this.speedLineGeo = null;
      this.speedLines = null;

      this.trajectoryPointsCount = 24;
      this.trajectoryPositions = new Float32Array(this.trajectoryPointsCount * 3);
      this.trajectoryGeo = null;
      this.trajectoryLine = null;

      this.gates = [];
      this.gateRibbonLine = null;
      this.gateRibbonGeo = null;
      this.solarZones = [];
      this.debrisWaves = [];
      this.stationGroup = null;
      this.stationHabRing = null;
      this.dockingRings = [];
      this.dockingLaserLine = null;
      this.dockingTargetX = 0.0;
      this.dockingTargetY = 0.0;

      this._buildDeepSpaceStarfield();
      this._buildTrajectoryGuideLine();
      this._buildOrbitalDockingStation();
    }

    _buildDeepSpaceStarfield() {
      // 1. 1,500 3D Deep-Space Stars ahead of and around the rocket (z from -150 to +18)
      for (let i = 0; i < this.starCount; i++) {
        const r = 4.0 + Math.random() * 42.0;
        const theta = Math.random() * Math.PI * 2;
        this.starPositions[i * 3] = Math.cos(theta) * r;
        this.starPositions[i * 3 + 1] = Math.sin(theta) * r * 0.78;
        this.starPositions[i * 3 + 2] = -150.0 + Math.random() * 168.0;

        const tint = Math.random();
        if (tint < 0.55) {
          this.starColors[i * 3] = 0.88;
          this.starColors[i * 3 + 1] = 0.95;
          this.starColors[i * 3 + 2] = 1.0;
        } else if (tint < 0.82) {
          this.starColors[i * 3] = 0.22;
          this.starColors[i * 3 + 1] = 0.85;
          this.starColors[i * 3 + 2] = 1.0;
        } else {
          this.starColors[i * 3] = 0.98;
          this.starColors[i * 3 + 1] = 0.82;
          this.starColors[i * 3 + 2] = 0.48;
        }
      }

      this.starGeo = new THREE.BufferGeometry();
      this.starGeo.setAttribute('position', new THREE.BufferAttribute(this.starPositions, 3));
      this.starGeo.setAttribute('color', new THREE.BufferAttribute(this.starColors, 3));

      const starMat = new THREE.PointsMaterial({
        size: 0.132,
        map: particleSpriteTex,
        vertexColors: true,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
        blending: THREE.NormalBlending,
      });
      this.starPoints = new THREE.Points(this.starGeo, starMat);
      this.group.add(this.starPoints);

      // 2. High-Velocity Space Dust Streak Lines rushing from -Z toward +Z
      for (let i = 0; i < this.speedLineCount; i++) {
        const r = 4.5 + Math.random() * 22.0;
        const ang = Math.random() * Math.PI * 2;
        const x = Math.cos(ang) * r;
        const y = Math.sin(ang) * r * 0.75;
        const z = -120.0 + Math.random() * 135.0;
        const idx = i * 6;
        this.speedLinePositions[idx] = x;
        this.speedLinePositions[idx + 1] = y;
        this.speedLinePositions[idx + 2] = z;
        this.speedLinePositions[idx + 3] = x;
        this.speedLinePositions[idx + 4] = y;
        this.speedLinePositions[idx + 5] = z - 3.5;
      }
      this.speedLineGeo = new THREE.BufferGeometry();
      this.speedLineGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(this.speedLinePositions, 3)
      );
      const speedLineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.18,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      this.speedLines = new THREE.LineSegments(this.speedLineGeo, speedLineMat);
      this.group.add(this.speedLines);
    }

    _buildTrajectoryGuideLine() {
      this.trajectoryGeo = new THREE.BufferGeometry();
      this.trajectoryGeo.setAttribute(
        'position',
        new THREE.BufferAttribute(this.trajectoryPositions, 3)
      );
      const trajMat = new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.28,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      this.trajectoryLine = new THREE.Line(this.trajectoryGeo, trajMat);
      this.group.add(this.trajectoryLine);
    }

    _createGateMesh(index) {
      const gateGroup = new THREE.Group();

      // Outer glowing holographic corridor ring (r = 3.15 so the full 3D winged rocket flies cleanly through!)
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.35,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const outerRing = new THREE.Mesh(new THREE.TorusGeometry(3.15, 0.08, 16, 64), ringMat);
      gateGroup.add(outerRing);

      // Inner counter-rotating target ring
      const innerMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      });
      const innerRing = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.035, 8, 28), innerMat);
      gateGroup.add(innerRing);

      // Translucent portal energy membrane
      const discMat = new THREE.MeshBasicMaterial({
        color: 0x06b6d4,
        transparent: true,
        opacity: 0.05,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const disc = new THREE.Mesh(new THREE.CircleGeometry(3.05, 40), discMat);
      gateGroup.add(disc);

      // 4 Cardinal Emitter Pylons around Gate
      const pylonMat = new THREE.MeshBasicMaterial({ color: 0x94a3b8 });
      for (let c = 0; c < 4; c++) {
        const a = (c / 4) * Math.PI * 2;
        const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.46, 0.22), pylonMat);
        pylon.position.set(Math.cos(a) * 3.22, Math.sin(a) * 3.22, 0);
        pylon.rotation.z = a;
        gateGroup.add(pylon);
      }

      return {
        group: gateGroup,
        outerRing,
        innerRing,
        ringMat,
        discMat,
        index,
        posX: 0,
        posY: 0,
        posZ: 0,
        cleared: false,
        burstProgress: 0,
      };
    }

    _createSolarZoneMesh() {
      const zoneGroup = new THREE.Group();
      const goldMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.35,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.065, 12, 6), goldMat);
      zoneGroup.add(ring);

      const haloMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide,
        blending: THREE.NormalBlending,
        depthWrite: false,
      });
      const halo = new THREE.Mesh(new THREE.RingGeometry(1.55, 2.45, 6), haloMat);
      zoneGroup.add(halo);

      return {
        group: zoneGroup,
        ring,
        goldMat,
        posX: 0,
        posY: 0,
        posZ: 0,
        collected: false,
      };
    }

    _createDebrisClusterMesh() {
      const clusterGroup = new THREE.Group();

      // Multi-faceted rocky 3D asteroid boulder
      const rockMat = new THREE.MeshStandardMaterial({
        color: 0x64748b,
        metalness: 0.55,
        roughness: 0.65,
        emissive: 0x7c2d12,
        emissiveIntensity: 0.18,
      });
      const coreMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(1.25, 1), rockMat);
      coreMesh.scale.set(1.2, 0.88, 1.05);
      clusterGroup.add(coreMesh);

      const subRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.68, 0), rockMat);
      subRock.position.set(0.75, 0.42, -0.3);
      clusterGroup.add(subRock);

      // Broken satellite solar panel wreckage shard sticking out
      const shardMat = new THREE.MeshStandardMaterial({
        color: 0x1e3a8a,
        metalness: 0.85,
        roughness: 0.25,
        emissive: 0xef4444,
        emissiveIntensity: 0.18,
      });
      const shard = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.08, 0.68), shardMat);
      shard.rotation.set(0.4, 0.3, -0.5);
      clusterGroup.add(shard);

      // Red Hazard Wireframe Sphere around Asteroid/Debris
      const hazardMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        wireframe: true,
        transparent: true,
        opacity: 0.28,
      });
      const hazardSphere = new THREE.Mesh(new THREE.IcosahedronGeometry(1.75, 1), hazardMat);
      clusterGroup.add(hazardSphere);

      return {
        group: clusterGroup,
        coreMesh,
        hazardMat,
        posX: 0,
        posY: 0,
        posZ: 0,
        vx: 0,
        vy: 0,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 2.4,
          (Math.random() - 0.5) * 2.4,
          (Math.random() - 0.5) * 2.4
        ),
        evaluated: false,
        hit: false,
      };
    }

    _buildOrbitalDockingStation() {
      // Large 3D Orbital Space Station positioned ahead of the rocket in -Z (facing +Z toward approaching rocket nose)
      this.stationGroup = new THREE.Group();
      this.stationGroup.visible = false;
      this.dockingRings = [];

      const stMetal = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.85,
        roughness: 0.25,
      });
      const stDark = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        metalness: 0.78,
        roughness: 0.35,
      });
      const stSolar = new THREE.MeshStandardMaterial({
        color: 0x1d4ed8,
        metalness: 0.6,
        roughness: 0.2,
        emissive: 0x0284c7,
        emissiveIntensity: 0.22,
      });

      // Central Pressurized Station Core Module (at z_local = -24.0)
      const coreHub = new THREE.Mesh(
        new THREE.CylinderGeometry(1.65, 1.65, 6.5, 36).rotateX(Math.PI / 2),
        stMetal
      );
      coreHub.position.z = -24.0;
      this.stationGroup.add(coreHub);

      // Forward-Facing Illuminated Docking Adapter Cone & Port Ring (at z_local = -20.2, facing +Z)
      const dockAdapter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 1.55, 1.6, 36).rotateX(Math.PI / 2),
        stDark
      );
      dockAdapter.position.z = -20.0;
      this.stationGroup.add(dockAdapter);

      // Rotating Centrifugal Habitat Ring + 4 Radial Spokes (at z_local = -23.5)
      this.stationHabRing = new THREE.Group();
      this.stationHabRing.position.z = -23.5;
      const habTorus = new THREE.Mesh(
        new THREE.TorusGeometry(5.6, 0.48, 20, 64),
        stMetal
      );
      this.stationHabRing.add(habTorus);

      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 11.0, 16), stDark);
        spoke.rotation.z = a;
        this.stationHabRing.add(spoke);

        const winGlow = new THREE.Mesh(
          new THREE.BoxGeometry(0.95, 0.22, 0.98),
          new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
        );
        winGlow.position.set(Math.cos(a + 0.4) * 5.6, Math.sin(a + 0.4) * 5.6, 0);
        winGlow.rotation.z = a + 0.4;
        this.stationHabRing.add(winGlow);
      }
      this.stationGroup.add(this.stationHabRing);

      // Massive Station Solar Array Wings extending Left & Right at z_local = -25.5
      [-1, 1].forEach((side) => {
        const truss = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.25, 0.25), stDark);
        truss.position.set(side * 5.8, 0, -25.5);
        this.stationGroup.add(truss);

        [-1.4, 1.4].forEach((yOff) => {
          const panel = new THREE.Mesh(new THREE.BoxGeometry(6.8, 2.1, 0.06), stSolar);
          panel.position.set(side * 6.4, yOff, -25.5);
          this.stationGroup.add(panel);
        });
      });

      // 3 Concentric Holographic Approach Corridor Rings ahead of the Rocket Nose (z_local = -9.5, -14.2, -19.0)
      [-9.5, -14.2, -19.0].forEach((zOff, idx) => {
        const r = 2.35 - idx * 0.32;
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x10b981,
          transparent: true,
          opacity: 0.35 - idx * 0.05,
          blending: THREE.NormalBlending,
          depthWrite: false,
        });
        const torus = new THREE.Mesh(new THREE.TorusGeometry(r, 0.055, 14, 64), ringMat);
        torus.position.z = zOff;
        this.stationGroup.add(torus);

        const wireRing = new THREE.Mesh(
          new THREE.RingGeometry(r - 0.25, r - 0.18, 16),
          new THREE.MeshBasicMaterial({
            color: 0x22d3ee,
            wireframe: true,
            transparent: true,
            opacity: 0.25,
            side: THREE.DoubleSide,
          })
        );
        wireRing.position.z = zOff;
        this.stationGroup.add(wireRing);

        this.dockingRings.push({ torus, wireRing, ringMat });
      });

      // Longitudinal Approach Tunnel Wireframe Cage
      const cylMat = new THREE.MeshBasicMaterial({
        color: 0x10b981,
        wireframe: true,
        transparent: true,
        opacity: 0.16,
      });
      const cylCage = new THREE.Mesh(
        new THREE.CylinderGeometry(1.7, 2.35, 9.5, 12, 2, true).rotateX(Math.PI / 2),
        cylMat
      );
      cylCage.position.z = -14.25;
      this.stationGroup.add(cylCage);
      this.dockingCylMat = cylMat;

      // Nose-to-Station Laser Alignment Beam
      const laserGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, -3.78),
        new THREE.Vector3(0, 0, -19.2),
      ]);
      this.dockingLaserMat = new THREE.LineBasicMaterial({
        color: 0x10b981,
        transparent: true,
        opacity: 0.0,
      });
      this.dockingLaserLine = new THREE.Line(laserGeo, this.dockingLaserMat);
      this.group.add(this.dockingLaserLine);

      this.worldCorridorGroup.add(this.stationGroup);
    }

    _clearCorridorPools() {
      this.gates.forEach((g) => this.worldCorridorGroup.remove(g.group));
      this.gates = [];
      if (this.gateRibbonLine) {
        this.worldCorridorGroup.remove(this.gateRibbonLine);
        this.gateRibbonLine = null;
      }
      this.solarZones.forEach((s) => this.worldCorridorGroup.remove(s.group));
      this.solarZones = [];
      this.debrisWaves.forEach((d) => this.worldCorridorGroup.remove(d.group));
      this.debrisWaves = [];
      if (this.stationGroup) this.stationGroup.visible = false;
      if (this.dockingLaserLine) this.dockingLaserMat.opacity = 0.0;
    }

    startMission(missionKey = state.game.missionKey, playSound = true) {
      const g = state.game;
      g.missionKey = missionKey;
      g.throttlePct = 68.0;
      g.gimbalPitchDeg = 0.0;
      g.gimbalYawDeg = 0.0;
      g.channelIntegrity = 100.0;
      g.capacitorPct = 100.0;
      g.maxPropTankKg = 12.0;
      g.propTankKg = 12.0;
      g.pulseBoostTimer = 0.0;
      g.pulseCooldown = 0.0;
      g.channelShutdownTimer = 0.0;
      g.solarStormBiasG = 0.0;
      g.score = 0;
      g.elapsedSec = 0.0;
      g.gatesCleared = 0;
      g.totalGates = 12;
      g.debrisDodged = 0;
      g.totalDebrisWaves = 12;
      g.dockingLockSec = 0.0;
      g.isFinished = false;

      this.posX = 0.0;
      this.posY = 0.0;
      this.posZ = 0.0;
      this.vx = 0.0;
      this.vy = 0.0;
      this.vz = -18.0;
      this.pitchAngleRad = 0.0;
      this.yawAngleRad = 0.0;
      this.rollAngleRad = 0.0;
      this.cameraShake = 0.0;

      playerRocketGroup.position.set(0, 0, 0);
      playerRocketGroup.rotation.set(0, 0, 0);

      // Sync physics to clean starting sweet spot
      state.voltage = 380;
      state.massFlow = 8.5;
      const optRes = computeThrusterPhysics(state.propellant, state.voltage, state.massFlow, 180);
      state.magField = Math.round(optRes.optimalB);

      this._clearCorridorPools();

      if (missionKey === 'slalom') {
        // Spawn 12 Holographic Slalom Gates AHEAD of the rocket (-Z direction) + 4 Solar Recharge Rings
        const slalomOffsets = [
          [0.0, 0.0],
          [3.2, 1.4],
          [-3.0, 1.8],
          [-3.6, -1.6],
          [3.4, -1.5],
          [0.6, 2.5],
          [-3.4, 1.0],
          [3.6, 1.8],
          [-2.4, -2.0],
          [2.8, -0.8],
          [-2.2, 1.6],
          [0.0, 0.4],
        ];
        slalomOffsets.forEach(([ox, oy], i) => {
          const gate = this._createGateMesh(i);
          gate.posX = ox;
          gate.posY = oy;
          gate.posZ = -(28.0 + i * 24.0); // Negative Z is ahead of the rocket nose!
          gate.group.position.set(gate.posX, gate.posY, gate.posZ);
          this.worldCorridorGroup.add(gate.group);
          this.gates.push(gate);

          if (i % 3 === 1) {
            const sz = this._createSolarZoneMesh();
            sz.posX = ox * 0.55;
            sz.posY = oy * 0.55;
            sz.posZ = gate.posZ - 12.0;
            sz.group.position.set(sz.posX, sz.posY, sz.posZ);
            this.worldCorridorGroup.add(sz.group);
            this.solarZones.push(sz);
          }
        });

        // Build 3D Ribbon connecting the 12 slalom gates ahead
        const ribbonPositions = new Float32Array(this.gates.length * 3);
        this.gateRibbonGeo = new THREE.BufferGeometry();
        this.gateRibbonGeo.setAttribute(
          'position',
          new THREE.BufferAttribute(ribbonPositions, 3)
        );
        this.gateRibbonLine = new THREE.Line(
          this.gateRibbonGeo,
          new THREE.LineBasicMaterial({
            color: 0x0ea5e9,
            transparent: true,
            opacity: 0.38,
          })
        );
        this.worldCorridorGroup.add(this.gateRibbonLine);
      } else if (missionKey === 'debris') {
        // Spawn 12 Waves of 3D Rocky Asteroids & Satellite Debris AHEAD of the rocket (-Z) + Solar Recharge Rings
        for (let w = 0; w < g.totalDebrisWaves; w++) {
          const zWave = -(32.0 + w * 23.0);
          for (let c = 0; c < 3; c++) {
            const deb = this._createDebrisClusterMesh();
            const angle = w * 1.35 + c * ((Math.PI * 2) / 3) + (Math.random() - 0.5) * 0.5;
            const rad = c === 0 ? 0.8 + (w % 3) * 0.85 : 2.8 + Math.random() * 2.2;
            deb.posX = Math.cos(angle) * rad;
            deb.posY = Math.sin(angle) * rad * 0.78;
            deb.posZ = zWave - c * 3.4;
            deb.vx = (Math.random() - 0.5) * 0.75;
            deb.vy = (Math.random() - 0.5) * 0.65;
            deb.waveIndex = w;
            deb.isPrimaryInWave = c === 0;
            deb.group.position.set(deb.posX, deb.posY, deb.posZ);
            this.worldCorridorGroup.add(deb.group);
            this.debrisWaves.push(deb);
          }

          if (w % 3 === 1) {
            const sz = this._createSolarZoneMesh();
            sz.posX = Math.sin(w * 1.7) * 2.8;
            sz.posY = Math.cos(w * 1.3) * 1.8;
            sz.posZ = zWave - 11.5;
            sz.group.position.set(sz.posX, sz.posY, sz.posZ);
            this.worldCorridorGroup.add(sz.group);
            this.solarZones.push(sz);
          }
        }
      } else if (missionKey === 'docking') {
        // Activate 3D Orbital Space Station ahead of the rocket + periodic Solar Recharge Zones
        this.stationGroup.visible = true;
        this.dockingTargetX = 0.0;
        this.dockingTargetY = 0.0;
        for (let s = 0; s < 5; s++) {
          const sz = this._createSolarZoneMesh();
          sz.posX = Math.sin(s * 1.5) * 2.0;
          sz.posY = Math.cos(s * 1.5) * 1.4;
          sz.posZ = -(34.0 + s * 32.0);
          sz.group.position.set(sz.posX, sz.posY, sz.posZ);
          this.worldCorridorGroup.add(sz.group);
          this.solarZones.push(sz);
        }
      }

      // Update Mission Selector Buttons in Left Panel
      document.querySelectorAll('.game-mission-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.getAttribute('data-game-mission') === missionKey);
      });
      const tagEl = document.getElementById('game-active-mission-tag');
      if (tagEl) {
        const titles = {
          slalom: 'Mission 1: Gate Slalom',
          debris: 'Mission 2: Asteroid Dodge',
          docking: 'Mission 3: Station Docking',
        };
        tagEl.textContent = titles[missionKey] || 'Mission Active';
      }

      if (playSound) {
        plasmaAudio.playIgnitionSequence();
      }
      this.showToast(
        missionKey === 'slalom'
          ? 'MISSION 1: FLY ROCKET THROUGH 12 GATES (WASD TO PITCH/STEER)'
          : missionKey === 'debris'
          ? 'MISSION 2: DODGE ASTEROIDS & TRIM MAGNETIC FIELD (Q/E)'
          : 'MISSION 3: ALIGN ROCKET NOSE WITH ORBITAL STATION DOCKING PORT',
        'cyan'
      );
      this.updateHUDAndPanel();
    }

    setCameraView(viewMode, playSound = true) {
      if (viewMode === 'tactical') viewMode = 'cockpit';
      const valid = ['chase', 'nozzle', 'cockpit'];
      if (!valid.includes(viewMode)) viewMode = 'chase';
      state.game.cameraView = viewMode;

      const badgeEl = document.getElementById('game-cam-badge');
      if (badgeEl) {
        badgeEl.textContent =
          viewMode === 'chase'
            ? 'CHASE [C]'
            : viewMode === 'nozzle'
            ? 'TAIL GIMBAL [C]'
            : 'COCKPIT [C]';
      }

      document.querySelectorAll('.game-cam-btn').forEach((btn) => {
        const attr = btn.getAttribute('data-game-cam');
        const isAct = attr === viewMode || (viewMode === 'cockpit' && attr === 'tactical');
        btn.classList.toggle('active', isAct);
      });

      // Hide fuselage nose cone in first-person cockpit cam if needed, or keep nose probe visible just below sightline
      if (this.rocket && this.rocket.group) {
        this.rocket.group.visible = state.mode === 'game';
      }

      if (playSound) {
        plasmaAudio.playUIChirp('nav');
      }

      if (state.mode === 'game') {
        const camTargets = this._getCameraVectorsForView(viewMode);
        animateCameraTo(camTargets.pos, camTargets.lookAt, 0.55);
      }
    }

    cycleCameraView() {
      const order = ['chase', 'nozzle', 'cockpit'];
      const curr = state.game.cameraView === 'tactical' ? 'cockpit' : state.game.cameraView;
      const nextIdx = (order.indexOf(curr) + 1) % order.length;
      this.setCameraView(order[nextIdx], true);
    }

    _getCameraVectorsForView(viewMode) {
      const rx = this.posX;
      const ry = this.posY;
      const lagX = -this.vx * 0.14;
      const lagY = -this.vy * 0.12;
      const speedPullback = Math.max(0, (this.forwardSpeed - 14.0) * 0.12);

      if (viewMode === 'nozzle') {
        // 2. Tail Engine Gimbal Cam: Over-the-shoulder close-up of rear Hall thruster gimbal & plasma plume
        return {
          pos: new THREE.Vector3(rx - 2.35 + lagX * 0.4, ry + 1.05 + lagY * 0.4, 5.15),
          lookAt: new THREE.Vector3(rx + 0.15, ry - 0.05, -6.5),
        };
      } else if (viewMode === 'cockpit' || viewMode === 'tactical') {
        // 3. Nose / Cockpit Cam: First-person view from above rocket nose looking straight ahead along flight vector (-Z)
        const pitchLookY = Math.sin(this.pitchAngleRad) * 26.0;
        const yawLookX = -Math.sin(this.yawAngleRad) * 26.0;
        return {
          pos: new THREE.Vector3(rx, ry + 0.62, -2.55),
          lookAt: new THREE.Vector3(rx + yawLookX, ry + 0.62 + pitchLookY, -32.0),
        };
      }
      // 1. Default Chase Cam: Positioned behind (+Z) and slightly above (+Y) the rocket's tail, looking forward (-Z)
      return {
        pos: new THREE.Vector3(
          rx + lagX,
          ry + 2.35 + lagY * 0.6,
          9.4 + speedPullback
        ),
        lookAt: new THREE.Vector3(
          rx + this.vx * 0.28,
          ry + 0.25 + this.vy * 0.25,
          -18.0
        ),
      };
    }

    triggerCapacitorPulse() {
      const g = state.game;
      if (g.channelShutdownTimer > 0) {
        this.showToast('BN CHANNEL IN COOLDOWN — CANNOT PULSE!', 'red');
        plasmaAudio.playFailureDiagnostic('short_circuit');
        return;
      }
      if (g.pulseCooldown > 0 || g.capacitorPct < 18.0) {
        this.showToast('CAPACITOR RECHARGING — NEED 18% ENERGY', 'amber');
        return;
      }
      g.capacitorPct = Math.max(0, g.capacitorPct - 20.0);
      g.pulseBoostTimer = 0.85;
      g.pulseCooldown = 1.35;
      this.cameraShake = 0.24;
      plasmaAudio.playCapacitorPulseBoost();
      this.showToast('PULSED PLASMA AFTERBURNER BOOST! (2.4x THRUST)', 'amber');
    }

    toggleAutoMagSync() {
      state.game.autoMagSync = !state.game.autoMagSync;
      plasmaAudio.playUIChirp('preset');
      this.showToast(
        state.game.autoMagSync
          ? 'AUTO-MAGNETIC SYNC ENGAGED (OPTIMAL Br LOCKED)'
          : 'MANUAL MAGNETIC FIELD TRIM (USE Q / E)',
        state.game.autoMagSync ? 'emerald' : 'cyan'
      );
      this.updateHUDAndPanel();
    }

    repairChannelIntegrity() {
      const g = state.game;
      g.channelIntegrity = 100.0;
      g.channelShutdownTimer = 0.0;
      if (g.throttlePct < 35) g.throttlePct = 55;
      plasmaAudio.installPart();
      this.showToast('BORON NITRIDE CERAMIC CHANNEL RESTORED TO 100%', 'emerald');
      this.updateHUDAndPanel();
    }

    showToast(message, tone = 'cyan') {
      const toastEl = document.getElementById('hud-event-toast');
      if (!toastEl) return;
      toastEl.textContent = message;
      const styles = {
        cyan: 'bg-cyan-500/25 text-cyan-200 border-cyan-400/60',
        emerald: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/60',
        amber: 'bg-amber-500/25 text-amber-200 border-amber-400/60',
        red: 'bg-red-500/30 text-red-200 border-red-400/70',
      };
      toastEl.className = `absolute -top-11 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-full text-[11px] font-mono font-bold border shadow-lg ${
        styles[tone] || styles.cyan
      }`;
      toastEl.classList.remove('hidden');
      this.toastTimer = 2.4;
    }

    _computeLiveRank() {
      const g = state.game;
      const healthBonus = g.channelIntegrity * 8;
      const totalEval = g.score + healthBonus;
      if (totalEval >= 2600 && g.channelIntegrity >= 75) return 'S';
      if (totalEval >= 1800 && g.channelIntegrity >= 45) return 'A';
      if (totalEval >= 1000) return 'B';
      return 'C';
    }

    _completeMission() {
      const g = state.game;
      if (g.isFinished) return;
      g.isFinished = true;
      const rank = this._computeLiveRank();
      const rankOrder = { S: 4, A: 3, B: 2, C: 1 };
      const prevBest = g.bestRanks[g.missionKey];
      if (!prevBest || rankOrder[rank] > rankOrder[prevBest]) {
        g.bestRanks[g.missionKey] = rank;
      }

      const bestBadgeEl = document.getElementById(`mission-best-${g.missionKey}`);
      if (bestBadgeEl) {
        bestBadgeEl.textContent = `RANK ${g.bestRanks[g.missionKey]}`;
      }

      plasmaAudio.playGatePassChime(true);
      this.showToast(`MISSION COMPLETE! FINAL RANK: ${rank} (SCORE: ${g.score})`, 'emerald');
      this.updateHUDAndPanel();
    }

    resetThrusterTransforms() {
      thrusterRoot.rotation.set(0, 0, 0);
      thrusterRoot.position.set(0, 0, 0);
      plasmaSystemsGroup.rotation.set(0, 0, 0);
      plasmaSystemsGroup.position.set(0, 0, 0);
      vectorFieldsGroup.rotation.set(0, 0, 0);
      vectorFieldsGroup.position.set(0, 0, 0);
      sputterPoints.rotation.set(0, 0, 0);
      sputterPoints.position.set(0, 0, 0);
      playerRocketGroup.position.set(0, 0, 0);
      playerRocketGroup.rotation.set(0, 0, 0);
      if (this.rocket && this.rocket.yawGimbalGroup && this.rocket.pitchNozzleGroup) {
        this.rocket.yawGimbalGroup.rotation.set(0, 0, 0);
        this.rocket.pitchNozzleGroup.rotation.set(0, 0, 0);
      }
      camera.up.set(0, 1, 0);
      if (camera.fov !== 45) {
        camera.fov = 45;
        camera.updateProjectionMatrix();
      }
    }

    _updateRocketPlumeAndHardware(dt, elapsed, phys, prop, isPulse) {
      const g = state.game;
      const rkt = this.rocket;
      if (!rkt) return;

      // 1. Solar Array Shader & Propellant Core Glow
      if (rkt.solarShaderMat) {
        rkt.solarShaderMat.uniforms.uTime.value = elapsed;
        rkt.solarShaderMat.uniforms.uGlowLevel.value = 0.75 + (g.capacitorPct / 100.0) * 0.55;
      }
      if (rkt.propCoreMat && rkt.propCoreCyl) {
        rkt.propCoreMat.color.copy(prop.primaryColor);
        const fuelRatio = Math.max(0.05, g.propTankKg / g.maxPropTankKg);
        rkt.propCoreCyl.scale.set(1, 1, fuelRatio);
      }

      // 2. Cold-Gas RCS Attitude Thruster Puff Jets (Fire when Pitching W/S or Steering/Banking A/D)
      const upPressed = this.keys.KeyW || this.keys.ArrowUp || g.gimbalPitchDeg > 1.8;
      const downPressed = this.keys.KeyS || this.keys.ArrowDown || g.gimbalPitchDeg < -1.8;
      const leftPressed = this.keys.KeyA || this.keys.ArrowLeft || g.gimbalYawDeg < -1.8;
      const rightPressed = this.keys.KeyD || this.keys.ArrowRight || g.gimbalYawDeg > 1.8;

      const updateRcsGroup = (puffList, isActive, intensityScale) => {
        const flicker = 0.72 + 0.28 * Math.sin(elapsed * 42.0);
        const targetOp = isActive ? Math.min(0.85, intensityScale * flicker) : 0.0;
        puffList.forEach((p) => {
          p.mat.opacity = THREE.MathUtils.lerp(p.mat.opacity, targetOp, Math.min(1, dt * 18.0));
          const s = 0.75 + p.mat.opacity * 0.65;
          p.mesh.scale.set(s, 0.65 + p.mat.opacity * 0.85, s);
        });
      };

      const pitchStrength = Math.max(0.35, Math.abs(g.gimbalPitchDeg) / 15.0);
      const yawStrength = Math.max(0.35, Math.abs(g.gimbalYawDeg) / 15.0);
      updateRcsGroup(rkt.rcsPuffs.up, upPressed && !downPressed, pitchStrength);
      updateRcsGroup(rkt.rcsPuffs.down, downPressed && !upPressed, pitchStrength);
      updateRcsGroup(rkt.rcsPuffs.left, leftPressed && !rightPressed, yawStrength);
      updateRcsGroup(rkt.rcsPuffs.right, rightPressed && !leftPressed, yawStrength);

      // 3. Rear-Mounted 2-Axis Gimbaled Hall-Effect Thruster Nozzle Tilt
      const pitchRad = THREE.MathUtils.degToRad(g.gimbalPitchDeg);
      const yawRad = THREE.MathUtils.degToRad(g.gimbalYawDeg);

      // Visible 2-axis mechanical gimbal deflection at the rocket's tail (+Z)
      // Pitch UP (+W): nozzle deflects slightly to vector thrust and pitch nose up
      // Steer RIGHT (+D): nozzle deflects to yaw nose right
      rkt.yawGimbalGroup.rotation.y = yawRad * 1.35;
      rkt.pitchNozzleGroup.rotation.x = -pitchRad * 1.35;

      rkt.servoStruts.forEach((st, idx) => {
        st.mesh.rotation.x = Math.sin(st.angle) * pitchRad * 0.55;
        st.mesh.rotation.y = Math.cos(st.angle) * yawRad * 0.55;
      });

      // 4. Trailing 3D Plasma Exhaust Plume & Volumetric Mach Core (+Z out of Rocket Tail)
      const isPlasmaOn =
        g.channelShutdownTimer <= 0 && g.throttlePct > 0.5 && g.propTankKg > 0.005;
      rkt.tailPlumeGroup.visible = isPlasmaOn;

      const activeErosion = isPlasmaOn ? phys.erosionSeverity : 0.0;
      rkt.tailSputterRimMat.opacity =
        activeErosion > 0.02
          ? activeErosion * (0.62 + 0.28 * Math.sin(elapsed * 14.0))
          : 0.0;

      if (!isPlasmaOn) {
        if (rkt.tailPlasmaLight) rkt.tailPlasmaLight.intensity = 0.0;
        return;
      }

      const thrFactor = Math.max(0.18, g.throttlePct / 100.0) * (isPulse ? 1.55 : 1.0);
      const veNorm = Math.max(0.45, Math.min(2.4, phys.exhaustVelocityKms / 18.0));
      const plumeLen = (3.4 + veNorm * 2.6) * thrFactor;
      const divTan = Math.tan(THREE.MathUtils.degToRad(phys.divergenceDeg));
      const massNorm = Math.max(0.15, Math.min(1.0, state.massFlow / 16.0));

      const cPrimary = prop.primaryColor;
      const cSecondary = prop.secondaryColor;
      const cCore = prop.coreColor;

      // Dynamic PointLight on Rocket Tail
      if (rkt.tailPlasmaLight) {
        rkt.tailPlasmaLight.color.copy(isPulse ? new THREE.Color(0xfbbf24) : cPrimary);
        rkt.tailPlasmaLight.intensity = (1.6 + thrFactor * 2.2) * (isPulse ? 1.8 : 1.0);
      }

      // Glowing Azimuthal Hall Ring at Rocket Tail Nozzle Exit
      rkt.tailHallRingMat.color.copy(cCore);
      rkt.tailHallRingMat.opacity = Math.min(0.95, (0.42 + massNorm * 0.45) * phys.etaMag);

      // Outer Volumetric Plasma Cone & Inner Mach Core Spike shooting backward (+Z)
      rkt.tailOuterConeMat.color.copy(cPrimary);
      rkt.tailOuterConeMat.opacity = 0.14 + massNorm * 0.20 + (isPulse ? 0.12 : 0.0);
      const spreadScale = 0.85 + divTan * 1.45;
      rkt.tailOuterConeMesh.scale.set(spreadScale, spreadScale, plumeLen / 6.0);

      rkt.tailCoreSpikeMat.color.copy(isPulse ? new THREE.Color(0xfef08a) : cCore);
      rkt.tailCoreSpikeMat.opacity = Math.max(
        0.08,
        (phys.etaMag - 0.55) * 0.95 * (0.45 + massNorm * 0.55)
      );
      rkt.tailCoreSpikeMesh.scale.set(1.0, 1.0, (plumeLen * 0.82) / 4.8);

      // 3 Mach Shock Diamond Rings pulsing along the exhaust core
      rkt.shockRings.forEach((sr, idx) => {
        sr.mat.color.copy(isPulse ? new THREE.Color(0xfde047) : cCore);
        sr.mat.opacity =
          Math.max(0.0, (phys.etaMag - 0.62) * 0.85) *
          (0.6 + 0.4 * Math.sin(elapsed * 18.0 - idx * 1.4));
        sr.mesh.position.z = sr.baseZ * (plumeLen / 4.8);
        const pulseScale = 0.9 + 0.14 * Math.sin(elapsed * 15.0 + idx);
        sr.mesh.scale.set(pulseScale, pulseScale, 1.0);
      });

      // Pulsed Plasma Afterburner Shockwave Ring (SPACE)
      if (isPulse) {
        const waveProg = 1.0 - g.pulseBoostTimer / 0.85;
        rkt.pulseWaveMat.opacity = Math.max(0.0, (1.0 - waveProg) * 0.9);
        rkt.pulseWaveRing.position.z = 0.2 + waveProg * 7.5;
        const wScale = 1.0 + waveProg * 3.2;
        rkt.pulseWaveRing.scale.set(wScale, wScale, 1.0);
      } else {
        rkt.pulseWaveMat.opacity = 0.0;
      }

      // Update 1,200 Accelerated Rocket Tail Ion Particles shooting toward +Z
      const iPos = rkt.rIonGeo.attributes.position.array;
      const iCol = rkt.rIonGeo.attributes.color.array;
      rkt.rIonMat.opacity = 0.55 + massNorm * 0.42;
      rkt.rIonMat.size = 0.12 + massNorm * 0.06 + (isPulse ? 0.05 : 0.0);

      for (let i = 0; i < rkt.rIonCount; i++) {
        const d = rkt.rIonData[i];
        d.life += dt * (0.95 + veNorm * 1.25) * d.speed * (isPulse ? 1.65 : 1.0);
        if (d.life >= 1.0) {
          d.life %= 1.0;
          d.angle = Math.random() * Math.PI * 2;
        }

        const z = d.life * plumeLen;
        const focusPinch =
          phys.etaMag > 0.8 ? Math.sin(Math.min(1, d.life * 2.2) * Math.PI) * 0.22 : 0;
        const radialExp = z * divTan * 0.42 * d.spread;
        const r = Math.max(0.06, d.baseR * (1.0 - focusPinch) + radialExp);
        const a = d.angle + d.swirl * d.life;

        iPos[i * 3] = Math.cos(a) * r;
        iPos[i * 3 + 1] = Math.sin(a) * r;
        iPos[i * 3 + 2] = z;

        const fade = Math.pow(1.0 - d.life, 0.7);
        if (d.life < 0.20) {
          const t = d.life / 0.20;
          iCol[i * 3] = THREE.MathUtils.lerp(cCore.r, cPrimary.r, t);
          iCol[i * 3 + 1] = THREE.MathUtils.lerp(cCore.g, cPrimary.g, t);
          iCol[i * 3 + 2] = THREE.MathUtils.lerp(cCore.b, cPrimary.b, t);
        } else {
          const t = (d.life - 0.20) / 0.80;
          iCol[i * 3] = THREE.MathUtils.lerp(cPrimary.r, cSecondary.r, t) * fade;
          iCol[i * 3 + 1] = THREE.MathUtils.lerp(cPrimary.g, cSecondary.g, t) * fade;
          iCol[i * 3 + 2] = THREE.MathUtils.lerp(cPrimary.b, cSecondary.b, t) * fade;
        }
      }
      rkt.rIonGeo.attributes.position.needsUpdate = true;
      rkt.rIonGeo.attributes.color.needsUpdate = true;

      // Update 320 Azimuthal Hall Electrons & Hollow Cathode Neutralizer Electrons at Tail
      const ePos = rkt.rElecGeo.attributes.position.array;
      const hallSpeed = 0.9 + (state.magField / 180.0) * 1.6;
      for (let i = 0; i < rkt.rElecCount; i++) {
        const d = rkt.rElecData[i];
        if (!d.isCathode) {
          d.angle += d.omega * hallSpeed * dt;
          ePos[i * 3] = Math.cos(d.angle) * d.r;
          ePos[i * 3 + 1] = Math.sin(d.angle) * d.r;
          ePos[i * 3 + 2] = 0.04 + Math.sin(d.angle * 3.0 + i) * 0.08;
        } else {
          d.t = (d.t + dt * 1.9) % 1.0;
          // Stream from top-right external hollow cathode (0.32, 0.88, 0.08) into the ion plume
          const targetX = Math.cos(d.angle + elapsed * 3.0) * 0.42 * d.t;
          const targetY = Math.sin(d.angle + elapsed * 3.0) * 0.42 * d.t;
          ePos[i * 3] = THREE.MathUtils.lerp(0.32, targetX, d.t);
          ePos[i * 3 + 1] = THREE.MathUtils.lerp(0.88, targetY, Math.min(1, d.t * 1.5));
          ePos[i * 3 + 2] = 0.08 + d.t * (plumeLen * 0.65);
        }
      }
      rkt.rElecGeo.attributes.position.needsUpdate = true;

      // Update 140 BN Wall Sputtering Sparks at Tail Nozzle Exit
      if (activeErosion > 0.05) {
        rkt.rSputPoints.visible = true;
        rkt.rSputMat.opacity = Math.min(0.95, activeErosion * 1.2);
        const sPos = rkt.rSputGeo.attributes.position.array;
        for (let i = 0; i < rkt.rSputCount; i++) {
          const d = rkt.rSputData[i];
          d.life += dt * 2.1;
          if (d.life > 1.0) {
            d.life = 0;
            d.angle = Math.random() * Math.PI * 2;
          }
          const currR = d.baseR + d.vr * d.life;
          sPos[i * 3] = Math.cos(d.angle) * currR;
          sPos[i * 3 + 1] = Math.sin(d.angle) * currR;
          sPos[i * 3 + 2] = 0.02 + d.vz * d.life;
        }
        rkt.rSputGeo.attributes.position.needsUpdate = true;
      } else {
        rkt.rSputPoints.visible = false;
      }
    }

    update(dt, elapsed) {
      const g = state.game;
      const prop = PROPELLANTS[state.propellant];

      // 1. Toast & Cooldown Timers
      if (this.toastTimer > 0) {
        this.toastTimer -= dt;
        if (this.toastTimer <= 0) {
          const toastEl = document.getElementById('hud-event-toast');
          if (toastEl) toastEl.classList.add('hidden');
        }
      }
      if (g.pulseBoostTimer > 0) g.pulseBoostTimer = Math.max(0, g.pulseBoostTimer - dt);
      if (g.pulseCooldown > 0) g.pulseCooldown = Math.max(0, g.pulseCooldown - dt);
      if (this.radarBeepTimer > 0) this.radarBeepTimer = Math.max(0, this.radarBeepTimer - dt);
      if (this.klaxonTimer > 0) this.klaxonTimer = Math.max(0, this.klaxonTimer - dt);
      if (this.cameraShake > 0) this.cameraShake = Math.max(0, this.cameraShake - dt * 0.85);

      if (!g.isFinished) {
        g.elapsedSec += dt;
      }

      // 2. Handle Ceramic Channel Failure / Emergency Shutdown Cooldown
      if (g.channelShutdownTimer > 0) {
        g.channelShutdownTimer -= dt;
        g.throttlePct = Math.max(0, g.throttlePct - dt * 95);
        g.channelIntegrity = Math.min(55, g.channelIntegrity + dt * 12.5);
        if (g.channelShutdownTimer <= 0) {
          g.channelShutdownTimer = 0;
          g.throttlePct = 55;
          this.showToast('BN CERAMIC CHANNEL COOLED — ROCKET ENGINE RE-IGNITED', 'emerald');
          plasmaAudio.playIgnitionSequence();
        }
      }

      // 3. Process Flight Controls: Pitch (W/S or Up/Down), Yaw/Bank (A/D or Left/Right), Throttle (SHIFT/CTRL), Mag Trim (Q/E)
      const slewRate = 48.0; // deg/s when holding WASD
      const returnRate = 30.0; // smooth auto-centering when WASD released

      const pitchUpHeld = this.keys.KeyW || this.keys.ArrowUp;
      const pitchDownHeld = this.keys.KeyS || this.keys.ArrowDown;
      const steerRightHeld = this.keys.KeyD || this.keys.ArrowRight;
      const steerLeftHeld = this.keys.KeyA || this.keys.ArrowLeft;

      if (pitchUpHeld && !pitchDownHeld) {
        g.gimbalPitchDeg = Math.min(15.0, g.gimbalPitchDeg + slewRate * dt);
      } else if (pitchDownHeld && !pitchUpHeld) {
        g.gimbalPitchDeg = Math.max(-15.0, g.gimbalPitchDeg - slewRate * dt);
      } else {
        if (Math.abs(g.gimbalPitchDeg) < 0.25) g.gimbalPitchDeg = 0;
        else g.gimbalPitchDeg -= Math.sign(g.gimbalPitchDeg) * returnRate * dt;
      }

      if (steerRightHeld && !steerLeftHeld) {
        g.gimbalYawDeg = Math.min(15.0, g.gimbalYawDeg + slewRate * dt);
      } else if (steerLeftHeld && !steerRightHeld) {
        g.gimbalYawDeg = Math.max(-15.0, g.gimbalYawDeg - slewRate * dt);
      } else {
        if (Math.abs(g.gimbalYawDeg) < 0.25) g.gimbalYawDeg = 0;
        else g.gimbalYawDeg -= Math.sign(g.gimbalYawDeg) * returnRate * dt;
      }

      // Gimbal Servo Audio Modulation
      const dPitch = Math.abs(g.gimbalPitchDeg - this.prevPitchDeg) / Math.max(0.001, dt);
      const dYaw = Math.abs(g.gimbalYawDeg - this.prevYawDeg) / Math.max(0.001, dt);
      this.prevPitchDeg = g.gimbalPitchDeg;
      this.prevYawDeg = g.gimbalYawDeg;
      const gimbalSpeedNorm = Math.min(1.0, (dPitch + dYaw) / 55.0);
      const gimbalAngleNorm = Math.hypot(g.gimbalPitchDeg, g.gimbalYawDeg) / 21.2;
      plasmaAudio.updateGimbalServoSound(gimbalSpeedNorm, gimbalAngleNorm);

      // Throttle Control (SHIFT = Up to 125% OVERDRIVE, CTRL = Down to 0%)
      if (g.channelShutdownTimer <= 0) {
        const shiftHeld = this.keys.ShiftLeft || this.keys.ShiftRight;
        const ctrlHeld = this.keys.ControlLeft || this.keys.ControlRight;
        if (shiftHeld && !ctrlHeld) {
          g.throttlePct = Math.min(125.0, g.throttlePct + 42.0 * dt);
        } else if (ctrlHeld && !shiftHeld) {
          g.throttlePct = Math.max(0.0, g.throttlePct - 48.0 * dt);
        }
      }

      // Map Throttle (0% - 125%) -> Discharge Voltage Vd (100V - 800V) & Mass Flow m_dot (1.0 - 20.0 mg/s)
      const thrNorm = g.throttlePct / 100.0; // 0.0 -> 1.25
      state.voltage = Math.round(100 + (thrNorm / 1.25) * 700);
      state.massFlow = Number((1.0 + (thrNorm / 1.25) * 19.0).toFixed(1));

      // Mission 2 Solar Storm Magnetic Perturbation
      if (g.missionKey === 'debris') {
        g.solarStormBiasG = Math.sin(elapsed * 0.95) * 52.0 + Math.cos(elapsed * 2.1) * 22.0;
      } else {
        g.solarStormBiasG = 0.0;
      }

      // Magnetic Field Control (Q / E Manual Trim vs. F Auto-Mag Sync)
      const massFactor = Math.pow(131.29 / prop.atomicMass, 0.08);
      const baseOptB = 180.0 * Math.sqrt(state.voltage / 300.0) * massFactor;
      const targetOptB = Math.max(55, Math.min(345, baseOptB + g.solarStormBiasG));

      if (g.autoMagSync && g.capacitorPct > 2.0) {
        state.magField = Math.round(
          THREE.MathUtils.lerp(state.magField, targetOptB, Math.min(1, dt * 8.0))
        );
      } else {
        if (this.keys.KeyQ && !this.keys.KeyE) {
          state.magField = Math.max(50, Math.round(state.magField - 95 * dt));
        } else if (this.keys.KeyE && !this.keys.KeyQ) {
          state.magField = Math.min(350, Math.round(state.magField + 95 * dt));
        }
      }

      // Compute Real-Time Hall Thruster Physics with Solar Storm effective B offset
      const effectiveBr = Math.max(50, Math.min(350, state.magField - g.solarStormBiasG));
      const phys = computeThrusterPhysics(state.propellant, state.voltage, state.massFlow, effectiveBr);
      phys.optimalB = targetOptB;
      state.telemetry = phys;

      // 4. Update Engineering Resource Bars (BN Channel Integrity, Capacitor Bank, Propellant Tank)
      const isPulse = g.pulseBoostTimer > 0;
      const overdriveStress = g.throttlePct > 102 ? (g.throttlePct - 102) / 23.0 : 0.0;
      if (overdriveStress > 0.1) {
        phys.isSputtering = true;
        phys.erosionSeverity = Math.min(1.0, Math.max(phys.erosionSeverity, overdriveStress * 0.85));
      }

      // BN Channel Integrity HP Depletion & Slow Thermal Recovery
      if (g.channelShutdownTimer <= 0 && g.throttlePct > 5) {
        const sputterDmgRate =
          (phys.erosionSeverity > 0.05 ? phys.erosionSeverity * 7.2 : 0) +
          overdriveStress * 5.8;
        if (sputterDmgRate > 0) {
          g.channelIntegrity = Math.max(0.0, g.channelIntegrity - sputterDmgRate * dt);
          if (g.channelIntegrity < 32 && this.klaxonTimer <= 0) {
            this.klaxonTimer = 2.2;
            plasmaAudio.playOverheatKlaxon();
            this.showToast('WARNING: BN CERAMIC CHANNEL EROSION CRITICAL! TRIM Br (Q/E)', 'red');
          }
          if (g.channelIntegrity <= 0.01) {
            g.channelIntegrity = 0.0;
            g.channelShutdownTimer = 4.2;
            plasmaAudio.playOverheatKlaxon();
            this.showToast('CERAMIC CHANNEL FAILURE! EMERGENCY COOLDOWN (4s)', 'red');
          }
        } else if (phys.etaMag >= 0.85 && g.throttlePct <= 95) {
          g.channelIntegrity = Math.min(100.0, g.channelIntegrity + 0.8 * dt);
        }
      }

      // Capacitor Bank & Solar Array Balance
      const powerDrawKw = phys.powerW / 1000.0;
      const autoMagDrain = g.autoMagSync ? 2.4 : 0.0;
      const overdriveDrain = overdriveStress * 5.5;
      const netCapRate = (2.4 - powerDrawKw) * 1.8 - autoMagDrain - overdriveDrain;
      g.capacitorPct = Math.max(0.0, Math.min(100.0, g.capacitorPct + netCapRate * dt));
      if (g.capacitorPct <= 1.0 && g.autoMagSync) {
        g.autoMagSync = false;
        this.showToast('CAPACITOR LOW — AUTO-MAG SYNC DISENGAGED', 'amber');
      }

      // Propellant Tank Depletion
      if (g.throttlePct > 1 && g.channelShutdownTimer <= 0) {
        const speciesMassBurnFactor =
          state.propellant === 'Xe' ? 1.35 : state.propellant === 'Kr' ? 1.0 : 0.68;
        const kgPerSec = (state.massFlow / 1000.0) * speciesMassBurnFactor * 5.2;
        g.propTankKg = Math.max(0.0, g.propTankKg - kgPerSec * dt);
        if (g.propTankKg <= 0.01) {
          g.propTankKg = g.maxPropTankKg * 0.5;
          g.score = Math.max(0, g.score - 200);
          this.showToast('TANK DEPLETED! EMERGENCY RESERVE TANK OPENED (-200 PTS)', 'amber');
        }
      }
      orbitalSimulator.update3DTankFluidIndicator(g.propTankKg / g.maxPropTankKg);

      // 5. True 3D Rocket Flight Kinematics & Attitude (Position, Velocity, Pitch, Yaw & Aerodynamic Bank)
      const pitchRad = THREE.MathUtils.degToRad(g.gimbalPitchDeg);
      const yawRad = THREE.MathUtils.degToRad(g.gimbalYawDeg);

      const pulseMult = isPulse ? 2.4 : 1.0;
      const activeThrustMn =
        g.channelShutdownTimer > 0 || g.throttlePct <= 0.5 ? 0.0 : phys.thrustMn * pulseMult;

      // Xenon gives higher thrust/turning authority; Argon gives higher Isp/cruise speed
      const lateralAuthority =
        state.propellant === 'Xe' ? 1.32 : state.propellant === 'Kr' ? 1.08 : 0.86;
      const thrustNorm = Math.min(2.2, activeThrustMn / 95.0);

      const ax = Math.sin(yawRad) * (18.0 + thrustNorm * 24.0) * lateralAuthority;
      const ay = Math.sin(pitchRad) * (18.0 + thrustNorm * 24.0) * lateralAuthority;

      // Mission 3 Orbital Perturbations (gentle lateral drift forces)
      let perturbX = 0.0;
      let perturbY = 0.0;
      if (g.missionKey === 'docking') {
        perturbX = Math.sin(elapsed * 1.15) * 2.2 + Math.cos(elapsed * 2.3) * 1.2;
        perturbY = Math.cos(elapsed * 0.95) * 1.9 + Math.sin(elapsed * 1.85) * 1.1;
      }

      this.vx = (this.vx + (ax + perturbX) * dt) * Math.pow(0.16, dt);
      this.vy = (this.vy + (ay + perturbY) * dt) * Math.pow(0.16, dt);

      this.posX = THREE.MathUtils.clamp(this.posX + this.vx * dt, -8.5, 8.5);
      this.posY = THREE.MathUtils.clamp(this.posY + this.vy * dt, -5.2, 5.2);

      this.forwardSpeed =
        g.channelShutdownTimer > 0
          ? 4.0
          : (7.5 + thrustNorm * 12.5 + (phys.exhaustVelocityKms / 25.0) * 4.2) *
            (isPulse ? 1.72 : 1.0);
      this.vz = -this.forwardSpeed;
      this.posZ -= this.forwardSpeed * dt;

      // Smoothly interpolate Rocket Pitch, Yaw & Bank/Roll (-25° to +25°)
      const targetPitchRad = pitchRad * 0.95 + THREE.MathUtils.clamp(this.vy * 0.035, -0.25, 0.25);
      const targetYawRad = yawRad * 0.95 + THREE.MathUtils.clamp(this.vx * 0.035, -0.25, 0.25);
      const targetBankRad = THREE.MathUtils.clamp(
        (g.gimbalYawDeg / 15.0) * THREE.MathUtils.degToRad(25.0) + this.vx * 0.045,
        -THREE.MathUtils.degToRad(26.0),
        THREE.MathUtils.degToRad(26.0)
      );

      this.pitchAngleRad = THREE.MathUtils.lerp(this.pitchAngleRad, targetPitchRad, Math.min(1, dt * 8.5));
      this.yawAngleRad = THREE.MathUtils.lerp(this.yawAngleRad, targetYawRad, Math.min(1, dt * 8.5));
      this.rollAngleRad = THREE.MathUtils.lerp(this.rollAngleRad, targetBankRad, Math.min(1, dt * 7.5));

      // Apply 3D position and attitude to playerRocketGroup (nose points -Z)
      playerRocketGroup.position.set(this.posX, this.posY, 0.0);
      // With rotation.order = 'YXZ':
      // +pitchAngleRad around X tilts -Z nose UP (+Y)
      // -yawAngleRad around Y turns -Z nose RIGHT (+X)
      // -rollAngleRad around Z banks starboard (+X) wing DOWN (-Y) when turning right
      playerRocketGroup.rotation.set(this.pitchAngleRad, -this.yawAngleRad, -this.rollAngleRad);

      // Update 3D Rocket Gimbal Hardware, RCS Puffs & Trailing Plasma Plume
      this._updateRocketPlumeAndHardware(dt, elapsed, phys, prop, isPulse);

      // 6. Update Third-Person Chase / Tail Gimbal / Cockpit Camera & Dynamic FOV Speed-Stretch
      if (!cameraTransition.active) {
        const camTargets = this._getCameraVectorsForView(g.cameraView);
        if (this.cameraShake > 0) {
          camTargets.pos.x += (Math.random() - 0.5) * this.cameraShake;
          camTargets.pos.y += (Math.random() - 0.5) * this.cameraShake;
        }
        camera.position.lerp(camTargets.pos, Math.min(1.0, dt * 7.5));
        controls.target.lerp(camTargets.lookAt, Math.min(1.0, dt * 8.5));
        camera.lookAt(controls.target);

        // Subtle aerodynamic camera roll bank
        const camRoll =
          g.cameraView === 'cockpit' ? -this.rollAngleRad * 0.65 : -this.rollAngleRad * 0.22;
        camera.up.set(Math.sin(camRoll), Math.cos(camRoll), 0).normalize();
      }

      // Dynamic FOV Speed-Stretch Effect (45° nominal -> up to 58° in Overdrive / Pulse Boost)
      const targetFov = THREE.MathUtils.clamp(
        45.0 + Math.max(0, this.forwardSpeed - 12.0) * 0.52 + (isPulse ? 6.5 : 0.0),
        45.0,
        59.0
      );
      if (Math.abs(camera.fov - targetFov) > 0.05) {
        camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, Math.min(1, dt * 6.0));
        camera.updateProjectionMatrix();
      }

      // 7. Forward-Scrolling 3D Starfield & Space Dust Streak Lines (-Z ahead -> +Z behind rocket)
      const sPos = this.starGeo.attributes.position.array;
      for (let i = 0; i < this.starCount; i++) {
        sPos[i * 3 + 2] += this.forwardSpeed * dt * 2.15;

        if (sPos[i * 3 + 2] > 18.0) {
          sPos[i * 3 + 2] -= 168.0;
          const r = 4.0 + Math.random() * 42.0;
          const ang = Math.random() * Math.PI * 2;
          sPos[i * 3] = this.posX + Math.cos(ang) * r;
          sPos[i * 3 + 1] = this.posY + Math.sin(ang) * r * 0.78;
        }
      }
      this.starGeo.attributes.position.needsUpdate = true;

      const lPos = this.speedLineGeo.attributes.position.array;
      const streakLen = 1.6 + (this.forwardSpeed / 14.0) * (isPulse ? 7.5 : 3.2);
      for (let i = 0; i < this.speedLineCount; i++) {
        const idx = i * 6;
        lPos[idx + 2] += this.forwardSpeed * dt * 2.95;
        if (lPos[idx + 2] > 16.0) {
          const r = 4.2 + Math.random() * 22.0;
          const ang = Math.random() * Math.PI * 2;
          const x = this.posX + Math.cos(ang) * r;
          const y = this.posY + Math.sin(ang) * r * 0.75;
          lPos[idx] = x;
          lPos[idx + 1] = y;
          lPos[idx + 2] = -125.0 - Math.random() * 25.0;
          lPos[idx + 3] = x;
          lPos[idx + 4] = y;
        }
        lPos[idx + 5] = lPos[idx + 2] - streakLen;
      }
      this.speedLineGeo.attributes.position.needsUpdate = true;

      // 8. Update Forward 3D Flight Trajectory / Prograde Guide Line ahead of Rocket Nose (-Z)
      const tPos = this.trajectoryGeo.attributes.position.array;
      for (let i = 0; i < this.trajectoryPointsCount; i++) {
        const frac = i / (this.trajectoryPointsCount - 1);
        const z = -3.78 - frac * 26.0;
        const distAhead = frac * 26.0;
        tPos[i * 3] =
          this.posX + Math.sin(this.yawAngleRad) * distAhead * 0.85 + this.vx * frac * 0.45;
        tPos[i * 3 + 1] =
          this.posY + Math.sin(this.pitchAngleRad) * distAhead * 0.85 + this.vy * frac * 0.45;
        tPos[i * 3 + 2] = z;
      }
      this.trajectoryGeo.attributes.position.needsUpdate = true;

      // 9. Update Forward-Scrolling Solar Recharge Rings (-Z -> +Z)
      this.solarZones.forEach((sz) => {
        sz.posZ += this.forwardSpeed * dt;
        sz.ring.rotation.z = elapsed * 1.8;
        sz.group.position.set(sz.posX, sz.posY, sz.posZ);

        if (!sz.collected && sz.posZ >= -3.8 && sz.posZ <= 2.2) {
          const dist = Math.hypot(sz.posX - this.posX, sz.posY - this.posY);
          if (dist <= 2.85) {
            sz.collected = true;
            g.capacitorPct = Math.min(100.0, g.capacitorPct + 32.0);
            g.score += 120;
            plasmaAudio.playSolarRechargeChime();
            this.showToast('SOLAR RECHARGE RING! CAPACITOR +32% (+120 PTS)', 'amber');
          }
        }
        if (sz.posZ > 12.0) {
          sz.posZ -= 115.0;
          sz.collected = false;
        }
      });

      // 10. Step Active Mission Scenario Logic (1. Slalom Gates, 2. Asteroid/Debris Dodge, 3. Orbital Station Nose Docking)
      let targetHudX = 0.0;
      let targetHudY = 0.0;
      let targetDistM = 0;

      if (g.missionKey === 'slalom') {
        let nextGate = null;
        let closestAheadZ = -Infinity;

        this.gates.forEach((gate, idx) => {
          if (!gate.cleared) {
            gate.posZ += this.forwardSpeed * dt;
          } else if (gate.burstProgress < 1.0) {
            gate.posZ += this.forwardSpeed * dt * 0.4;
            gate.burstProgress += dt * 2.5;
            const s = 1.0 + gate.burstProgress * 1.4;
            gate.group.scale.set(s, s, 1);
            gate.ringMat.opacity = Math.max(0, 1.0 - gate.burstProgress);
            gate.discMat.opacity = 0;
          }

          gate.innerRing.rotation.z = elapsed * (idx % 2 === 0 ? 1.2 : -1.2);
          gate.group.position.set(gate.posX, gate.posY, gate.posZ);

          // Check Gate Crossing as the 3D Rocket flies through z = 0 (nose at -3.78, tail at +2.8)
          if (!gate.cleared && gate.posZ >= -3.6 && gate.posZ <= 2.2) {
            const radialErr = Math.hypot(gate.posX - this.posX, gate.posY - this.posY);
            if (radialErr <= 3.35) {
              gate.cleared = true;
              g.gatesCleared++;
              const isSweetSpot = phys.etaMag >= 0.80;
              const pts = isSweetSpot ? 350 : 200;
              g.score += pts;
              gate.ringMat.color.setHex(0x10b981);
              plasmaAudio.playGatePassChime(isSweetSpot);
              this.showToast(
                isSweetSpot
                  ? `GATE ${g.gatesCleared}/${g.totalGates} CLEARED! +${pts} PTS (η_mag > 80% BONUS!)`
                  : `GATE ${g.gatesCleared}/${g.totalGates} CLEARED! +${pts} PTS (TRIM Br FOR BONUS)`,
                isSweetSpot ? 'emerald' : 'cyan'
              );
              if (g.gatesCleared >= g.totalGates) {
                this._completeMission();
              }
            }
          } else if (!gate.cleared && gate.posZ > 3.2) {
            // Re-queue missed gate ahead of the furthest gate in -Z so all 12 gates remain completable
            const minZ = Math.min(...this.gates.map((gt) => gt.posZ), -24.0);
            gate.posZ = minZ - 24.0;
            gate.group.position.z = gate.posZ;
            this.showToast('GATE MISSED — RE-ROUTED AHEAD ON FLIGHT CORRIDOR', 'amber');
          }

          if (!gate.cleared && gate.posZ <= 2.2 && gate.posZ > closestAheadZ) {
            closestAheadZ = gate.posZ;
            nextGate = gate;
          }
        });

        // Update 3D Gate Ribbon Line connecting upcoming gates
        if (this.gateRibbonLine && this.gateRibbonGeo) {
          const rArr = this.gateRibbonGeo.attributes.position.array;
          this.gates.forEach((gt, i) => {
            rArr[i * 3] = gt.group.position.x;
            rArr[i * 3 + 1] = gt.group.position.y;
            rArr[i * 3 + 2] = gt.group.position.z;
          });
          this.gateRibbonGeo.attributes.position.needsUpdate = true;
        }

        if (nextGate) {
          targetHudX = nextGate.posX - this.posX;
          targetHudY = nextGate.posY - this.posY;
          targetDistM = Math.max(0, Math.round(Math.abs(nextGate.posZ) * 8.5));
          nextGate.ringMat.color.setHex(0x10b981);
        }
      } else if (g.missionKey === 'debris') {
        let closestThreat = null;
        let minThreatDist = Infinity;

        this.debrisWaves.forEach((deb) => {
          deb.posZ += this.forwardSpeed * dt;
          deb.posX += deb.vx * dt;
          deb.posY += deb.vy * dt;

          deb.group.rotation.x += deb.rotSpeed.x * dt;
          deb.group.rotation.y += deb.rotSpeed.y * dt;
          deb.group.rotation.z += deb.rotSpeed.z * dt;
          deb.group.position.set(deb.posX, deb.posY, deb.posZ);

          const lateralDist = Math.hypot(deb.posX - this.posX, deb.posY - this.posY);
          const distAhead = -deb.posZ; // positive when ahead of rocket

          // Proximity Radar Detection for approaching asteroids/debris ahead (-Z)
          if (distAhead > 1.0 && distAhead < 28.0 && lateralDist < 3.6) {
            if (distAhead < minThreatDist) {
              minThreatDist = distAhead;
              closestThreat = deb;
            }
          }

          // Collision & Evasion Evaluation as debris passes the 3D rocket hull (z in [-3.4, +1.8])
          if (!deb.evaluated && deb.posZ >= -3.4 && deb.posZ <= 1.8) {
            deb.evaluated = true;
            if (lateralDist < 1.85) {
              deb.hit = true;
              g.channelIntegrity = Math.max(0.0, g.channelIntegrity - 18.0);
              this.cameraShake = 0.42;
              plasmaAudio.playDebrisImpact();
              this.showToast('ASTEROID / DEBRIS IMPACT! BN CHANNEL -18% HP', 'red');
              if (g.channelIntegrity <= 0.01) {
                g.channelShutdownTimer = 4.2;
              }
            } else if (deb.isPrimaryInWave) {
              g.debrisDodged++;
              const isArCruise = state.propellant === 'Ar';
              const pts = 220 + (isArCruise ? 80 : 0);
              g.score += pts;
              plasmaAudio.playGatePassChime(isArCruise);
              this.showToast(
                `ASTEROID WAVE ${g.debrisDodged}/${g.totalDebrisWaves} EVADED! +${pts} PTS`,
                'emerald'
              );
              if (g.debrisDodged >= g.totalDebrisWaves) {
                this._completeMission();
              }
            }
          }

          // Recycle debris wave ahead if it passed behind and mission is not yet complete
          if (deb.posZ > 8.0 && !g.isFinished) {
            const minZ = Math.min(...this.debrisWaves.map((d) => d.posZ), -28.0);
            deb.posZ = minZ - 23.0;
            deb.evaluated = false;
            deb.hit = false;
          }
        });

        if (closestThreat) {
          targetHudX = closestThreat.posX - this.posX;
          targetHudY = closestThreat.posY - this.posY;
          targetDistM = Math.max(0, Math.round(Math.abs(closestThreat.posZ) * 8.0));
          if (this.radarBeepTimer <= 0) {
            const urgency = Math.max(0.1, Math.min(1.0, (28.0 - Math.abs(closestThreat.posZ)) / 26.0));
            this.radarBeepTimer = 0.16 + (1.0 - urgency) * 0.32;
            plasmaAudio.playDebrisProximityBeep(urgency);
          }
        }
      } else if (g.missionKey === 'docking') {
        // 3D Orbital Space Station ahead of the rocket (-Z) weaves smoothly in lateral (X, Y) orbit
        this.dockingTargetX = Math.sin(elapsed * 0.52) * 2.5 + Math.cos(elapsed * 0.27) * 1.1;
        this.dockingTargetY = Math.cos(elapsed * 0.46) * 1.7 + Math.sin(elapsed * 0.33) * 0.8;

        if (this.stationGroup) {
          this.stationGroup.position.set(this.dockingTargetX, this.dockingTargetY, 0);
        }
        if (this.stationHabRing) {
          this.stationHabRing.rotation.z = elapsed * 0.28;
        }

        const radialErr = Math.hypot(
          this.dockingTargetX - this.posX,
          this.dockingTargetY - this.posY
        );
        const isLocked =
          radialErr <= 1.95 && g.channelShutdownTimer <= 0 && g.throttlePct >= 10.0;

        if (this.rocket && this.rocket.dockLedMat) {
          this.rocket.dockLedMat.color.setHex(isLocked ? 0x10b981 : 0x22d3ee);
        }

        this.dockingRings.forEach((rObj, idx) => {
          rObj.torus.rotation.z = elapsed * (idx % 2 === 0 ? 0.9 : -0.9);
          rObj.wireRing.rotation.z = -elapsed * 0.6;
          rObj.ringMat.color.setHex(isLocked ? 0x10b981 : 0xf59e0b);
        });
        if (this.dockingCylMat) {
          this.dockingCylMat.color.setHex(isLocked ? 0x10b981 : 0xf59e0b);
        }

        if (isLocked && !g.isFinished) {
          g.dockingLockSec = Math.min(g.targetDockingSec, g.dockingLockSec + dt);
          const lockRatePts = phys.etaMag >= 0.80 ? 115 : 70;
          g.score += Math.round(lockRatePts * dt);
          this.dockingLaserMat.opacity = 0.85;
          const lArr = this.dockingLaserLine.geometry.attributes.position.array;
          lArr[0] = this.posX;
          lArr[1] = this.posY;
          lArr[2] = -3.78; // Rocket forward docking ring nose
          lArr[3] = this.dockingTargetX;
          lArr[4] = this.dockingTargetY;
          lArr[5] = -19.2; // Orbital station docking port
          this.dockingLaserLine.geometry.attributes.position.needsUpdate = true;

          if (g.dockingLockSec >= g.targetDockingSec) {
            this._completeMission();
          }
        } else {
          this.dockingLaserMat.opacity = 0.0;
        }

        targetHudX = this.dockingTargetX - this.posX;
        targetHudY = this.dockingTargetY - this.posY;
        targetDistM = Math.round(radialErr * 10);
      }

      // 11. Update HUD Reticle Markers, Resource Gauges, Left Panel & Right Telemetry Panel
      this.updateHUDAndPanel(targetHudX, targetHudY, targetDistM);

      // Sync Mode C sliders & Right-Hand Telemetry Panel KPIs at 60 FPS (throttle Chart.js redraws to every 140ms)
      this.chartSyncTimer += dt;
      const shouldRedrawChart = this.chartSyncTimer >= 0.14;
      if (shouldRedrawChart) {
        this.chartSyncTimer = 0;
      }
      updatePhysicsAndTelemetryUI(!shouldRedrawChart);
    }

    updateHUDAndPanel(targetHudX = 0, targetHudY = 0, targetDistVal = 0) {
      const g = state.game;
      const tel = state.telemetry;
      const prop = PROPELLANTS[state.propellant];

      // 1. Center HUD Reticle Positions & Avionics Pitch/Roll Ladder
      const gimbalEl = document.getElementById('hud-reticle-gimbal');
      const gimbalRingEl = document.getElementById('hud-gimbal-ring');
      const progradeEl = document.getElementById('hud-reticle-prograde');
      const targetEl = document.getElementById('hud-reticle-target');
      const pitchLadderEl = document.getElementById('hud-pitch-ladder');
      const anglesEl = document.getElementById('hud-gimbal-angles');
      const speedEl = document.getElementById('hud-rocket-speed');
      const distEl = document.getElementById('hud-target-dist');

      if (gimbalEl) {
        const gx = g.gimbalYawDeg * 6.5;
        const gy = -g.gimbalPitchDeg * 6.5;
        gimbalEl.style.transform = `translate(${gx.toFixed(1)}px, ${gy.toFixed(1)}px)`;
      }
      if (gimbalRingEl) {
        gimbalRingEl.style.borderColor =
          g.pulseBoostTimer > 0 ? '#fbbf24' : prop.primaryHex;
        gimbalRingEl.style.boxShadow = `0 0 14px ${
          g.pulseBoostTimer > 0 ? '#fbbf24' : prop.primaryHex
        }`;
      }
      if (progradeEl) {
        const px = THREE.MathUtils.clamp(this.vx * 11.0, -98, 98);
        const py = THREE.MathUtils.clamp(-this.vy * 11.0, -98, 98);
        progradeEl.style.transform = `translate(${px.toFixed(1)}px, ${py.toFixed(1)}px)`;
      }
      if (targetEl) {
        const tx = THREE.MathUtils.clamp(targetHudX * 18.0, -102, 102);
        const ty = THREE.MathUtils.clamp(-targetHudY * 18.0, -102, 102);
        targetEl.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
      }
      if (pitchLadderEl) {
        const rollDeg = THREE.MathUtils.radToDeg(this.rollAngleRad);
        const pitchShiftY = THREE.MathUtils.clamp(g.gimbalPitchDeg * 2.2, -34, 34);
        pitchLadderEl.setAttribute(
          'transform',
          `translate(0, ${pitchShiftY.toFixed(1)}) rotate(${(-rollDeg).toFixed(1)})`
        );
      }
      if (anglesEl) {
        const pSign = g.gimbalPitchDeg >= 0 ? '+' : '';
        const ySign = g.gimbalYawDeg >= 0 ? '+' : '';
        anglesEl.textContent = `GIMBAL P: ${pSign}${g.gimbalPitchDeg.toFixed(1)}° · Y: ${ySign}${g.gimbalYawDeg.toFixed(1)}°`;
      }
      if (speedEl) {
        const dispSpeedKms = (this.forwardSpeed * 1.15).toFixed(1);
        speedEl.textContent = `VEL: ${dispSpeedKms} km/s`;
      }
      if (distEl) {
        if (g.missionKey === 'docking') {
          distEl.textContent = `DOCK LOCK: ${g.dockingLockSec.toFixed(1)}s / 30.0s`;
        } else if (g.missionKey === 'debris') {
          distEl.textContent = `THREAT RANGE: ${targetDistVal} m`;
        } else {
          distEl.textContent = `GATE DIST: ${targetDistVal} m`;
        }
      }

      // 2. Top-Center 5 Engineering Resource Gauges
      const thrValEl = document.getElementById('hud-throttle-val');
      const thrBarEl = document.getElementById('hud-throttle-bar');
      const propBadgeEl = document.getElementById('hud-prop-badge');
      const thrustValEl = document.getElementById('hud-thrust-val');

      const isOverdrive = g.throttlePct > 100.5;
      if (thrValEl) {
        thrValEl.textContent = isOverdrive
          ? `${Math.round(g.throttlePct)}% OVERDRIVE (${state.voltage}V)`
          : `${Math.round(g.throttlePct)}% (${state.voltage}V)`;
        thrValEl.className = isOverdrive
          ? 'font-bold text-amber-300 animate-pulse'
          : 'font-bold text-cyan-300';
      }
      if (thrBarEl) {
        const barPct = Math.min(100, (g.throttlePct / 125.0) * 100);
        thrBarEl.style.width = `${barPct.toFixed(1)}%`;
        thrBarEl.className = isOverdrive
          ? 'h-full bg-gradient-to-r from-amber-500 to-red-500 transition-all duration-75'
          : 'h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-75';
      }
      if (propBadgeEl) {
        propBadgeEl.textContent = prop.symbol;
      }
      if (thrustValEl) {
        const liveT =
          g.channelShutdownTimer > 0
            ? 0
            : tel.thrustMn * (g.pulseBoostTimer > 0 ? 2.4 : 1.0);
        thrustValEl.textContent = `T = ${liveT.toFixed(1)} mN`;
      }

      // Gauge 2: BN Channel Integrity
      const hpValEl = document.getElementById('hud-integrity-val');
      const hpBarEl = document.getElementById('hud-integrity-bar');
      const hpStatusEl = document.getElementById('hud-integrity-status');
      const sputterRateEl = document.getElementById('hud-sputter-rate');

      if (hpValEl) hpValEl.textContent = `${Math.round(g.channelIntegrity)}%`;
      if (hpBarEl) {
        hpBarEl.style.width = `${g.channelIntegrity.toFixed(1)}%`;
        hpBarEl.className =
          g.channelIntegrity < 35
            ? 'h-full bg-red-500 transition-all duration-100'
            : g.channelIntegrity < 70
            ? 'h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-100'
            : 'h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100';
      }
      if (hpStatusEl) {
        if (g.channelShutdownTimer > 0) {
          hpStatusEl.textContent = `SHUTDOWN (${g.channelShutdownTimer.toFixed(1)}s)`;
          hpStatusEl.className = 'text-red-400 font-bold animate-pulse';
        } else if (tel.isSputtering) {
          hpStatusEl.textContent = 'SPUTTERING!';
          hpStatusEl.className = 'text-amber-400 font-bold';
        } else {
          hpStatusEl.textContent = 'NOMINAL';
          hpStatusEl.className = 'text-emerald-400';
        }
      }
      if (sputterRateEl) {
        sputterRateEl.textContent = `Erosion: ${Math.round(tel.erosionSeverity * 100)}%`;
      }

      // Gauge 3: Capacitor Bank & Solar Power
      const capValEl = document.getElementById('hud-cap-val');
      const capBarEl = document.getElementById('hud-cap-bar');
      const pulseStatEl = document.getElementById('hud-pulse-status');
      const pwrDrawEl = document.getElementById('hud-power-draw');

      if (capValEl) capValEl.textContent = `${Math.round(g.capacitorPct)}%`;
      if (capBarEl) capBarEl.style.width = `${g.capacitorPct.toFixed(1)}%`;
      if (pulseStatEl) {
        if (g.pulseBoostTimer > 0) {
          pulseStatEl.textContent = 'BOOST FIRING!';
          pulseStatEl.className = 'text-amber-300 font-bold';
        } else if (g.capacitorPct >= 18 && g.pulseCooldown <= 0) {
          pulseStatEl.textContent = 'PULSE READY';
          pulseStatEl.className = 'text-cyan-300';
        } else {
          pulseStatEl.textContent = 'CHARGING...';
          pulseStatEl.className = 'text-slate-400';
        }
      }
      if (pwrDrawEl) pwrDrawEl.textContent = `${(tel.powerW / 1000).toFixed(2)} kW`;

      // Gauge 4: Propellant Tank
      const fuelValEl = document.getElementById('hud-fuel-val');
      const fuelBarEl = document.getElementById('hud-fuel-bar');
      const mdotValEl = document.getElementById('hud-mdot-val');
      const veValEl = document.getElementById('hud-ve-val');

      if (fuelValEl) fuelValEl.textContent = `${g.propTankKg.toFixed(2)} kg`;
      if (fuelBarEl) {
        fuelBarEl.style.width = `${((g.propTankKg / g.maxPropTankKg) * 100).toFixed(1)}%`;
      }
      if (mdotValEl) mdotValEl.textContent = `ṁ = ${state.massFlow.toFixed(1)} mg/s`;
      if (veValEl) veValEl.textContent = `${tel.exhaustVelocityKms.toFixed(1)} km/s`;

      // Gauge 5: Hall Confinement Sweet-Spot (eta_mag & Br)
      const etaValEl = document.getElementById('hud-etamag-val');
      const etaBarEl = document.getElementById('hud-etamag-bar');
      const brValEl = document.getElementById('hud-br-val');
      const autoMagBadgeEl = document.getElementById('hud-automag-badge');

      const etaPct = tel.etaMag * 100;
      if (etaValEl) {
        etaValEl.textContent = `${etaPct.toFixed(1)}%`;
        etaValEl.className =
          etaPct >= 80 ? 'font-bold text-emerald-300' : 'font-bold text-amber-400';
      }
      if (etaBarEl) {
        etaBarEl.style.width = `${etaPct.toFixed(1)}%`;
        etaBarEl.className =
          etaPct >= 80
            ? 'h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-100'
            : 'h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-100';
      }
      if (brValEl) {
        brValEl.textContent = `${state.magField}G / Opt ${Math.round(tel.optimalB)}G`;
      }
      if (autoMagBadgeEl) {
        autoMagBadgeEl.textContent = g.autoMagSync ? 'AUTO [F]' : 'MANUAL';
        autoMagBadgeEl.className = g.autoMagSync
          ? 'text-emerald-300 font-bold'
          : 'text-slate-400';
      }

      // 3. Left Panel Scoreboard, Timer, Rank & Objective Progress
      const scoreEl = document.getElementById('game-score-val');
      const timerEl = document.getElementById('game-timer-val');
      const rankEl = document.getElementById('game-rank-badge');
      const objLabelEl = document.getElementById('game-objective-label');
      const objValEl = document.getElementById('game-objective-val');
      const objBarEl = document.getElementById('game-objective-bar');
      const autoMagBtnLabel = document.getElementById('label-game-automag');
      const stormIndEl = document.getElementById('game-storm-indicator');
      const statusSubEl = document.getElementById('game-status-sub');

      if (scoreEl) scoreEl.textContent = g.score.toLocaleString();
      if (timerEl) {
        const mins = Math.floor(g.elapsedSec / 60);
        const secs = (g.elapsedSec % 60).toFixed(1).padStart(4, '0');
        timerEl.textContent = `${String(mins).padStart(2, '0')}:${secs}`;
      }
      if (rankEl) {
        const liveRank = this._computeLiveRank();
        rankEl.textContent = liveRank;
        rankEl.className =
          liveRank === 'S'
            ? 'text-sm font-mono font-extrabold text-amber-400'
            : liveRank === 'A'
            ? 'text-sm font-mono font-extrabold text-emerald-400'
            : 'text-sm font-mono font-extrabold text-cyan-300';
      }
      if (autoMagBtnLabel) {
        autoMagBtnLabel.textContent = `Auto-Mag [F]: ${g.autoMagSync ? 'ON' : 'OFF'}`;
      }
      if (stormIndEl) {
        stormIndEl.classList.toggle('hidden', g.missionKey !== 'debris');
      }

      if (objLabelEl && objValEl && objBarEl) {
        if (g.missionKey === 'slalom') {
          objLabelEl.textContent = 'Plasma Gates Cleared:';
          objValEl.textContent = `${g.gatesCleared} / ${g.totalGates}`;
          objBarEl.style.width = `${(g.gatesCleared / g.totalGates) * 100}%`;
        } else if (g.missionKey === 'debris') {
          objLabelEl.textContent = 'Asteroid Waves Evaded:';
          objValEl.textContent = `${g.debrisDodged} / ${g.totalDebrisWaves}`;
          objBarEl.style.width = `${(g.debrisDodged / g.totalDebrisWaves) * 100}%`;
        } else {
          objLabelEl.textContent = 'Nose Docking Lock:';
          objValEl.textContent = `${g.dockingLockSec.toFixed(1)}s / ${g.targetDockingSec.toFixed(0)}s`;
          objBarEl.style.width = `${(g.dockingLockSec / g.targetDockingSec) * 100}%`;
        }
      }

      if (statusSubEl) {
        if (g.isFinished) {
          const finalRank = this._computeLiveRank();
          statusSubEl.innerHTML = `<strong class="text-emerald-300">MISSION COMPLETE!</strong> Achieved <strong>Rank ${finalRank}</strong> with ${g.score.toLocaleString()} pts and ${Math.round(g.channelIntegrity)}% BN Channel Integrity. Click <strong>Restart Mission</strong> or select another scenario!`;
        } else if (g.channelShutdownTimer > 0) {
          statusSubEl.innerHTML = `<strong class="text-red-400">EMERGENCY SHUTDOWN:</strong> Boron Nitride channel overheated from wall sputtering! Cooling down (${g.channelShutdownTimer.toFixed(1)}s) or press <strong>R</strong> to repair.`;
        } else if (g.missionKey === 'debris') {
          statusSubEl.innerHTML = `Solar Storm Perturbation: <strong>${g.solarStormBiasG >= 0 ? '+' : ''}${Math.round(g.solarStormBiasG)} G</strong>. Trim B<sub>r</sub> with <strong>Q/E</strong> (or <strong>F</strong> Auto-Mag), bank around asteroids with <strong>Xe (1) + SPACE</strong>, cruise with <strong>Ar (3)</strong>.`;
        } else if (g.missionKey === 'docking') {
          statusSubEl.innerHTML = `Fly the rocket toward the rotating <strong>Orbital Space Station</strong> ahead and align the rocket nose cone inside the glowing docking rings for 30.0s.`;
        } else {
          statusSubEl.innerHTML = `Pitch &amp; bank the 3D plasma rocket with <strong>WASD</strong>, throttle with <strong>SHIFT/CTRL</strong>, and keep Hall efficiency η<sub>mag</sub> &gt; 80% for gate bonus points.`;
        }
      }

      // Sync HUD Propellant Pills
      document.querySelectorAll('.game-prop-pill').forEach((pill) => {
        const pk = pill.getAttribute('data-game-prop');
        const isAct = pk === state.propellant;
        pill.classList.toggle('ring-2', isAct);
        pill.classList.toggle('ring-cyan-400', isAct);
      });
    }
  }

  const gameSimulator = new ThrusterGameSimulator(scene);

  // ========================================================================
  // 11. CHART.JS DUAL-AXIS LIVE PERFORMANCE GRAPH & MISSION DELTA-V SWITCHER
  // ========================================================================
  let telemetryChart = null;
  const VOLTAGE_AXIS_POINTS = [100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800];
  const MISSION_PROP_MASS_POINTS = [5, 20, 50, 100, 200, 350, 500, 700, 950, 1200];

  function initTelemetryChart() {
    const ctx = document.getElementById('telemetry-chart');
    if (!ctx) return;

    telemetryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: VOLTAGE_AXIS_POINTS.map((v) => `${v}V`),
        datasets: [],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 180 },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            labels: {
              color: '#cbd5e1',
              font: { family: 'Inter', size: 10 },
              boxWidth: 12,
              padding: 8,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#22d3ee',
            bodyColor: '#f1f5f9',
            borderColor: 'rgba(34, 211, 238, 0.4)',
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#94a3b8',
              font: { family: 'JetBrains Mono', size: 9 },
              maxRotation: 0,
            },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
          },
          yThrust: {
            type: 'linear',
            position: 'left',
            title: {
              display: true,
              text: 'Thrust (mN)',
              color: '#22d3ee',
              font: { family: 'JetBrains Mono', size: 9 },
            },
            ticks: {
              color: '#22d3ee',
              font: { family: 'JetBrains Mono', size: 9 },
            },
            grid: { color: 'rgba(148, 163, 184, 0.08)' },
          },
          yIsp: {
            type: 'linear',
            position: 'right',
            display: true,
            title: {
              display: true,
              text: 'Isp (s)',
              color: '#c084fc',
              font: { family: 'JetBrains Mono', size: 9 },
            },
            ticks: {
              color: '#c084fc',
              font: { family: 'JetBrains Mono', size: 9 },
            },
            grid: { drawOnChartArea: false },
          },
        },
      },
    });
  }

  function updateTelemetryChart() {
    if (!telemetryChart) return;
    const prop = PROPELLANTS[state.propellant];
    const titleEl = document.getElementById('chart-title');
    const subtitleEl = document.getElementById('chart-subtitle');

    if (state.chartMode === 'mission') {
      // Mode 2: Mission Delta-V vs. Propellant Mass comparing Xe, Kr, and Ar side-by-side
      if (titleEl) {
        titleEl.innerHTML = 'Achievable Δv vs. Propellant Mass (Xe / Kr / Ar)';
      }
      if (subtitleEl) {
        subtitleEl.textContent = `Tsiolkovsky Curve @ Vd = ${state.voltage}V, m_dry = ${state.orbit.dryMass}kg (Req Δv = ${Math.round(state.orbit.telemetry.dvReq)} m/s)`;
      }

      telemetryChart.data.labels = MISSION_PROP_MASS_POINTS.map((m) => `${m}kg`);

      let closestIdx = 0;
      let minDiff = Infinity;
      MISSION_PROP_MASS_POINTS.forEach((m, idx) => {
        const diff = Math.abs(m - state.orbit.propMass);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = idx;
        }
      });

      const speciesList = [
        { key: 'Xe', label: 'Xenon (Xe)', color: '#3b82f6' },
        { key: 'Kr', label: 'Krypton (Kr)', color: '#06b6d4' },
        { key: 'Ar', label: 'Argon (Ar)', color: '#d946ef' },
      ];

      telemetryChart.data.datasets = speciesList.map((sp) => {
        const res = computeThrusterPhysics(sp.key, state.voltage, state.massFlow, state.magField);
        const veEff = res.exhaustVelocityMs * res.etaMag;
        const dvPoints = [];
        const radii = [];

        MISSION_PROP_MASS_POINTS.forEach((mProp, idx) => {
          const dv = veEff * Math.log((state.orbit.dryMass + mProp) / state.orbit.dryMass);
          dvPoints.push(Math.round(dv));
          const isCurrent = idx === closestIdx && sp.key === state.propellant;
          radii.push(isCurrent ? 6.5 : 2.2);
        });

        return {
          label: sp.label,
          data: dvPoints,
          borderColor: sp.color,
          backgroundColor: 'transparent',
          borderWidth: sp.key === state.propellant ? 2.6 : 1.7,
          borderDash: sp.key === state.propellant ? [] : [4, 2],
          pointRadius: radii,
          pointBackgroundColor: sp.color,
          pointBorderColor: '#ffffff',
          tension: 0.32,
          fill: false,
          yAxisID: 'yThrust',
        };
      });

      telemetryChart.options.scales.yThrust.title.text = 'Δv (m/s)';
      telemetryChart.options.scales.yIsp.display = false;
      telemetryChart.update('none');
      return;
    }

    // Mode 1 (Default): Thruster Curve — Thrust (mN) & Isp (s) vs. Discharge Voltage (Vd)
    if (titleEl) {
      titleEl.innerHTML = 'Thrust &amp; I<sub>sp</sub> vs. Discharge Voltage (V<sub>d</sub>)';
    }
    if (subtitleEl) {
      subtitleEl.textContent = `Active Curve: ${prop.name} (${prop.symbol}) @ ṁ = ${state.massFlow.toFixed(1)} mg/s, Br = ${state.magField} G`;
    }

    telemetryChart.data.labels = VOLTAGE_AXIS_POINTS.map((v) => `${v}V`);

    const thrustCurve = [];
    const ispCurve = [];
    const thrustRadii = [];
    const ispRadii = [];

    let closestIdx = 0;
    let minDiff = Infinity;
    VOLTAGE_AXIS_POINTS.forEach((v, idx) => {
      const diff = Math.abs(v - state.voltage);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    VOLTAGE_AXIS_POINTS.forEach((v, idx) => {
      const res = computeThrusterPhysics(state.propellant, v, state.massFlow, state.magField);
      thrustCurve.push(Number(res.thrustMn.toFixed(1)));
      ispCurve.push(Math.round(res.isp));
      const isCurrent = idx === closestIdx;
      thrustRadii.push(isCurrent ? 6.5 : 2.0);
      ispRadii.push(isCurrent ? 6.5 : 2.0);
    });

    telemetryChart.data.datasets = [
      {
        label: 'Thrust (mN)',
        data: thrustCurve,
        borderColor: prop.primaryHex,
        backgroundColor: 'rgba(34, 211, 238, 0.12)',
        borderWidth: 2.2,
        pointRadius: thrustRadii,
        pointBackgroundColor: prop.primaryHex,
        pointBorderColor: '#ffffff',
        tension: 0.35,
        fill: true,
        yAxisID: 'yThrust',
      },
      {
        label: 'Specific Impulse Isp (s)',
        data: ispCurve,
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        borderWidth: 2.2,
        borderDash: [4, 3],
        pointRadius: ispRadii,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#ffffff',
        tension: 0.35,
        fill: false,
        yAxisID: 'yIsp',
      },
    ];

    telemetryChart.options.scales.yThrust.title.text = 'Thrust (mN)';
    telemetryChart.options.scales.yIsp.display = true;
    telemetryChart.update('none');
  }

  // ========================================================================
  // 12. UI SYNCHRONIZATION, TELEMETRY KPI UPDATES & DIAGNOSTICS
  // ========================================================================
  function isAllPartsInstalled() {
    return THRUSTER_COMPONENTS.every((c) => c.installed);
  }

  function updatePhysicsAndTelemetryUI(skipChartUpdate = false) {
    const effectiveB =
      state.mode === 'game'
        ? Math.max(50, Math.min(350, state.magField - state.game.solarStormBiasG))
        : state.magField;
    const res = computeThrusterPhysics(
      state.propellant,
      state.voltage,
      state.massFlow,
      effectiveB
    );
    const prop = PROPELLANTS[state.propellant];

    if (state.mode === 'game') {
      const mFactor = Math.pow(131.29 / prop.atomicMass, 0.08);
      res.optimalB = Math.max(
        55,
        Math.min(345, 180.0 * Math.sqrt(state.voltage / 300.0) * mFactor + state.game.solarStormBiasG)
      );
      if (state.game.throttlePct > 102) {
        const odStress = (state.game.throttlePct - 102) / 23.0;
        res.isSputtering = true;
        res.erosionSeverity = Math.min(1.0, Math.max(res.erosionSeverity, odStress * 0.85));
      }
      // Keep Mode C sliders synchronized when flying in Mode 5
      const sV = document.getElementById('slider-voltage');
      const sM = document.getElementById('slider-massflow');
      const sB = document.getElementById('slider-magfield');
      if (sV) sV.value = String(state.voltage);
      if (sM) sM.value = String(state.massFlow);
      if (sB) sB.value = String(state.magField);
    }

    state.telemetry = res;

    // Update Control Deck Labels
    document.getElementById('val-voltage').textContent = `${state.voltage} V`;
    document.getElementById('val-massflow').textContent = `${state.massFlow.toFixed(1)} mg/s`;
    document.getElementById('val-magfield').textContent = `${state.magField} G`;
    document.getElementById('optimal-b-hint').innerHTML = `Optimal B<sub>opt</sub> ≈ ${Math.round(res.optimalB)} G`;
    document.getElementById('sim-active-gas-badge').textContent = `${prop.symbol} // ${prop.atomicMass} u`;
    document.getElementById('propellant-ion-energy').innerHTML = `E<sub>ion</sub> = ${prop.ionizationEnergy.toFixed(2)} eV`;

    // Update Bottom Legend Ion Dot & Label
    const legendIonDot = document.getElementById('legend-ion-dot');
    const legendIonLabel = document.getElementById('legend-ion-label');
    if (legendIonDot && legendIonLabel) {
      legendIonDot.style.backgroundColor = prop.primaryHex;
      legendIonDot.style.boxShadow = `0 0 10px ${prop.primaryHex}`;
      legendIonLabel.textContent = `Accelerated Ions (${prop.ionSymbol} Beam)`;
    }

    // Check if thruster is currently unassembled in Build Mode or shut down in Game Mode
    const allAssembled = isAllPartsInstalled();
    const gameShutDown =
      state.mode === 'game' &&
      (state.game.channelShutdownTimer > 0 || state.game.throttlePct <= 0.5);
    const plasmaActive =
      (state.mode !== 'build' && !gameShutDown) || (allAssembled && state.buildIgnited);
    const pulseMult =
      state.mode === 'game' && state.game.pulseBoostTimer > 0 ? 2.4 : 1.0;

    // Update Right Panel KPI Readouts
    document.getElementById('kpi-thrust').textContent = plasmaActive
      ? (res.thrustMn * pulseMult).toFixed(1)
      : '0.0';
    document.getElementById('kpi-thrust-sub').textContent =
      pulseMult > 1.0
        ? `PULSE BOOST 2.4x (${prop.symbol})`
        : `Force @ ${state.massFlow.toFixed(1)} mg/s (${prop.symbol})`;

    document.getElementById('kpi-isp').textContent = plasmaActive ? Math.round(res.isp).toLocaleString() : '0';
    document.getElementById('kpi-isp-sub').textContent = `Total Eff η = ${(res.etaTotal * 100).toFixed(1)}%`;

    document.getElementById('kpi-ve').textContent = plasmaActive ? res.exhaustVelocityKms.toFixed(1) : '0.0';
    document.getElementById('kpi-ve-sub').textContent = `${prop.ionSymbol} Ion Beam Velocity`;

    const powerDisp = plasmaActive ? Math.round(res.powerW * pulseMult).toLocaleString() : '0';
    document.getElementById('kpi-power').textContent = powerDisp;
    document.getElementById('kpi-power-sub').textContent = plasmaActive
      ? `Id = ${(res.currentA * pulseMult).toFixed(2)} A · ${((res.powerW * pulseMult) / 1000).toFixed(2)} kW`
      : 'Standby (PPU Idle)';

    const etaMagPct = (res.etaMag * 100).toFixed(1);
    const kpiEtaMagEl = document.getElementById('kpi-etamag');
    const barEtaMagEl = document.getElementById('bar-etamag');
    kpiEtaMagEl.textContent = `${etaMagPct}%`;
    barEtaMagEl.style.width = `${etaMagPct}%`;

    document.getElementById('kpi-divergence').textContent = `Plume Half-Angle: ${res.divergenceDeg.toFixed(1)}°`;

    // Update Diagnostic Status Badge & Message Banner
    const badgeEl = document.getElementById('status-badge');
    const dotEl = document.getElementById('status-dot');
    const textEl = document.getElementById('status-text');
    const bannerEl = document.getElementById('diagnostic-banner');
    const iconEl = document.getElementById('diagnostic-icon');
    const msgEl = document.getElementById('diagnostic-message');
    const erosionRateEl = document.getElementById('kpi-erosion-rate');

    if (state.mode === 'build' && !allAssembled) {
      badgeEl.className = 'px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-600 flex items-center gap-1.5';
      dotEl.className = 'w-2 h-2 rounded-full bg-slate-400';
      textEl.textContent = 'UNASSEMBLED';
      bannerEl.className = 'p-2.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-slate-300 flex items-start gap-2.5 leading-relaxed';
      iconEl.className = 'fa-solid fa-screwdriver-wrench text-cyan-400 mt-0.5';
      const installedCount = THRUSTER_COMPONENTS.filter((c) => c.installed).length;
      msgEl.innerHTML = `Assembly in progress (<strong>${installedCount}/6</strong> systems installed). Install all components or click <strong>Ignite Thruster</strong> to test failure diagnostics.`;
      erosionRateEl.textContent = 'Thruster Offline';
      erosionRateEl.className = 'text-slate-400';
    } else if (res.isSputtering) {
      badgeEl.className = 'badge-warning px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/60 flex items-center gap-1.5';
      dotEl.className = 'w-2 h-2 rounded-full bg-amber-400 animate-ping';
      textEl.textContent = 'WALL SPUTTERING WARNING';
      bannerEl.className = 'p-2.5 rounded-lg bg-amber-950/60 border border-amber-500/50 text-xs text-amber-200 flex items-start gap-2.5 leading-relaxed';
      iconEl.className = 'fa-solid fa-triangle-exclamation text-amber-400 mt-0.5';
      msgEl.innerHTML = `<strong>Suboptimal Magnetic Confinement (B<sub>r</sub> = ${state.magField} G vs B<sub>opt</sub> ≈ ${Math.round(res.optimalB)} G):</strong> Electron Hall trapping is degrading! Wide plume divergence (${res.divergenceDeg.toFixed(1)}°) is bombarding and eroding the Boron Nitride ceramic channel walls.`;
      kpiEtaMagEl.className = 'text-sm font-mono font-bold text-amber-400';
      barEtaMagEl.className = 'h-full bg-gradient-to-r from-red-500 to-amber-400 transition-all duration-200';
      erosionRateEl.textContent = 'Wall Sputtering: CRITICAL';
      erosionRateEl.className = 'text-amber-400 font-semibold';
    } else {
      badgeEl.className = 'badge-nominal px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/50 flex items-center gap-1.5';
      dotEl.className = 'w-2 h-2 rounded-full bg-emerald-400';
      textEl.textContent = 'NOMINAL';
      bannerEl.className = 'p-2.5 rounded-lg bg-slate-900/90 border border-emerald-500/30 text-xs text-slate-200 flex items-start gap-2.5 leading-relaxed';
      iconEl.className = 'fa-solid fa-circle-check text-emerald-400 mt-0.5';
      msgEl.innerHTML = `Optimal <strong>E×B Hall confinement</strong> (${etaMagPct}%). ${prop.name} (${prop.ionSymbol}) beam is tightly collimated at <strong>${res.exhaustVelocityKms.toFixed(1)} km/s</strong> with minimal Boron Nitride channel wall erosion.`;
      kpiEtaMagEl.className = 'text-sm font-mono font-bold text-emerald-400';
      barEtaMagEl.className = 'h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-200';
      erosionRateEl.textContent = 'Wall Sputtering: NOMINAL (LOW)';
      erosionRateEl.className = 'text-emerald-400';
    }

    if (!skipChartUpdate) {
      if (state.mode !== 'game') {
        orbitalSimulator.updateUI();
      }
      updateTelemetryChart();
    }
  }

  function setChartMode(mode, silent = false) {
    state.chartMode = mode === 'mission' ? 'mission' : 'thruster';
    document.querySelectorAll('.chart-mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-chart-mode') === state.chartMode);
    });
    if (!silent) {
      plasmaAudio.playUIChirp('nav');
    }
    updateTelemetryChart();
  }

  function setActivePropellant(propKey, playSound = true) {
    if (!PROPELLANTS[propKey]) return;
    state.propellant = propKey;
    document.querySelectorAll('.propellant-card').forEach((c) => {
      c.classList.remove('active-xe', 'active-kr', 'active-ar');
      if (c.getAttribute('data-propellant') === propKey) {
        c.classList.add(`active-${propKey.toLowerCase()}`);
      }
    });
    if (playSound) {
      plasmaAudio.playUIChirp('preset');
    }
    updatePhysicsAndTelemetryUI();
  }

  // ========================================================================
  // 13. MODE A: "BUILD YOUR THRUSTER" UI, CHECKLIST & FAILURE VALIDATION
  // ========================================================================
  function renderBuildChecklist() {
    const listEl = document.getElementById('build-parts-list');
    if (!listEl) return;

    const installedCount = THRUSTER_COMPONENTS.filter((c) => c.installed).length;
    document.getElementById('build-progress-badge').textContent = `${installedCount} / 6 Installed`;
    document.getElementById('build-progress-bar').style.width = `${(installedCount / 6) * 100}%`;

    listEl.innerHTML = '';
    THRUSTER_COMPONENTS.forEach((comp) => {
      const isSelected = state.selectedPartId === comp.id;
      const item = document.createElement('div');
      item.className = `part-item p-2.5 rounded-xl border cursor-pointer flex items-center justify-between gap-2 ${
        isSelected ? 'selected border-cyan-400' : 'border-slate-800 bg-slate-900/75'
      }`;

      item.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
            comp.installed
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              : 'bg-slate-800 text-slate-400 border border-slate-700'
          }">
            <i class="fa-solid ${comp.installed ? 'fa-check' : comp.icon} text-xs"></i>
          </div>
          <div class="truncate">
            <div class="text-xs font-semibold text-white truncate">${comp.shortName}</div>
            <div class="text-[10px] font-mono text-slate-400 truncate">${comp.material}</div>
          </div>
        </div>
        <button data-toggle-part="${comp.id}" class="px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold shrink-0 transition ${
          comp.installed
            ? 'bg-slate-800 hover:bg-red-950/70 text-slate-300 hover:text-red-300 border border-slate-700'
            : 'bg-cyan-500/20 hover:bg-cyan-500/35 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
        }">
          ${comp.installed ? 'Remove' : 'Install'}
        </button>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('[data-toggle-part]')) return;
        selectComponentForInspection(comp.id);
      });

      const toggleBtn = item.querySelector('[data-toggle-part]');
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleComponentInstallation(comp.id);
      });

      listEl.appendChild(item);
    });

    updateInspectorCard(state.selectedPartId);
  }

  function updateInspectorCard(partId) {
    const comp = THRUSTER_COMPONENTS.find((c) => c.id === partId) || THRUSTER_COMPONENTS[1];
    document.getElementById('inspector-name').textContent = comp.name;
    document.getElementById('inspector-material').textContent = comp.material;
    document.getElementById('inspector-temp').textContent = comp.operatingTemp;
    document.getElementById('inspector-desc').textContent = comp.physicsFunction;

    const statusEl = document.getElementById('inspector-status');
    if (comp.installed) {
      statusEl.textContent = 'INSTALLED';
      statusEl.className = 'text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
    } else {
      statusEl.textContent = 'UNINSTALLED (FLOATING)';
      statusEl.className = 'text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30';
    }
  }

  function selectComponentForInspection(partId) {
    state.selectedPartId = partId;
    plasmaAudio.playUIChirp('stage');
    renderBuildChecklist();
    updatePartHighlightMaterials();
  }

  function installPart(partId, forceState = true, silent = false) {
    const comp = THRUSTER_COMPONENTS.find((c) => c.id === partId);
    if (!comp) return;
    comp.installed = forceState !== null ? forceState : !comp.installed;
    state.selectedPartId = partId;
    state.activeFailureMode = null;
    shortCircuitArcGroup.visible = false;

    const obj = componentObjects[partId];
    if (obj) {
      obj.targetPos.copy(comp.installed ? comp.assembledPos : comp.explodedPos);
      obj.ghostGroup.visible = state.mode === 'build' && !comp.installed;
    }

    if (!isAllPartsInstalled()) {
      state.buildIgnited = false;
    }

    if (!silent) {
      if (comp.installed) {
        plasmaAudio.installPart();
      } else {
        plasmaAudio.removePart();
      }
    }

    renderBuildChecklist();
    updatePartHighlightMaterials();
    updatePhysicsAndTelemetryUI();
  }

  function toggleComponentInstallation(partId, forceState = null, silent = false) {
    installPart(partId, forceState, silent);
  }

  function setAllComponentsInstalled(installed, silent = false) {
    THRUSTER_COMPONENTS.forEach((comp) => {
      comp.installed = installed;
      const obj = componentObjects[comp.id];
      if (obj) {
        obj.targetPos.copy(installed ? comp.assembledPos : comp.explodedPos);
        obj.ghostGroup.visible = state.mode === 'build' && !installed;
      }
    });
    state.activeFailureMode = null;
    shortCircuitArcGroup.visible = false;
    state.buildIgnited = installed;
    if (!silent) {
      if (installed) {
        plasmaAudio.installPart();
      } else {
        plasmaAudio.removePart();
      }
    }
    renderBuildChecklist();
    updatePartHighlightMaterials();
    updatePhysicsAndTelemetryUI();
  }

  // Interactive Engineering Failure & Validation Logic when clicking "Ignite Thruster"
  function validateAndIgniteThruster() {
    const box = document.getElementById('build-validation-box');
    box.classList.remove('hidden');

    const missing = THRUSTER_COMPONENTS.filter((c) => !c.installed).map((c) => c.id);

    if (missing.length === 0) {
      state.buildIgnited = true;
      state.activeFailureMode = null;
      shortCircuitArcGroup.visible = false;
      plasmaAudio.playIgnitionSequence();
      box.className = 'p-3 rounded-lg border bg-emerald-950/60 border-emerald-500/50 text-emerald-200 text-xs leading-relaxed';
      box.innerHTML = `
        <div class="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-circle-check"></i> IGNITION SEQUENCE NOMINAL // HALL PLASMA LOCK ACHIEVED
        </div>
        All 6 mechanical, magnetic, and propellant subsystems verified! E×B Hall current ring established and ion beam neutralization is nominal.
      `;
      updatePhysicsAndTelemetryUI();
      return;
    }

    // Trigger specific realistic physics failure mode based on priority of missing part!
    state.buildIgnited = false;
    state.failureTimer = 6.5; // Show visual failure simulation in 3D scene for 6.5 seconds

    if (missing.includes('ceramic_channel')) {
      state.activeFailureMode = 'short_circuit';
      shortCircuitArcGroup.visible = true;
      box.className = 'p-3 rounded-lg border bg-red-950/75 border-red-500/60 text-red-200 text-xs leading-relaxed';
      box.innerHTML = `
        <div class="font-bold text-red-400 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-bolt-lightning"></i> CRITICAL FAULT: HIGH-VOLTAGE SHORT CIRCUIT!
        </div>
        <strong>Missing Boron Nitride Ceramic Channel:</strong> Without the dielectric ceramic liner, the +${state.voltage}V copper anode arcs directly into the grounded ferromagnetic steel frame! Observe the 3D electrical short-circuit arcs inside the core.
      `;
    } else if (missing.includes('magnet_coils')) {
      state.activeFailureMode = 'no_magnetic_lock';
      shortCircuitArcGroup.visible = false;
      box.className = 'p-3 rounded-lg border bg-amber-950/75 border-amber-500/60 text-amber-200 text-xs leading-relaxed';
      box.innerHTML = `
        <div class="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-magnet"></i> FAILURE: ZERO MAGNETIC CONFINEMENT (NO HALL EFFECT)
        </div>
        <strong>Missing Radial Electromagnet Coils (B<sub>r</sub> = 0 G):</strong> Watch the 3D channel—electrons rush straight from the cathode into the anode without orbiting azimuthally! Ionization efficiency collapses to &lt;2%, producing zero Hall lock.
      `;
    } else if (missing.includes('hollow_cathode')) {
      state.activeFailureMode = 'no_cathode';
      shortCircuitArcGroup.visible = false;
      box.className = 'p-3 rounded-lg border bg-amber-950/75 border-amber-500/60 text-amber-200 text-xs leading-relaxed';
      box.innerHTML = `
        <div class="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-triangle-exclamation"></i> FAILURE: NO ELECTRON SOURCE &amp; SPACECRAFT CHARGING WARNING
        </div>
        <strong>Missing External Hollow Cathode:</strong> No primary electrons can enter the channel to ignite plasma ionization, and no neutralizing electrons can balance the exhaust plume—causing severe spacecraft charging!
      `;
    } else if (missing.includes('anode_ring')) {
      state.activeFailureMode = 'no_anode';
      shortCircuitArcGroup.visible = false;
      box.className = 'p-3 rounded-lg border bg-red-950/75 border-red-500/60 text-red-200 text-xs leading-relaxed';
      box.innerHTML = `
        <div class="font-bold text-red-400 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-circle-xmark"></i> FAILURE: NO AXIAL ELECTRIC FIELD (E<sub>z</sub> = 0 V/m)
        </div>
        <strong>Missing Anode &amp; Propellant Distributor Ring:</strong> Cannot establish the +${state.voltage}V electrostatic potential or distribute propellant uniformly at the base of the channel.
      `;
    } else if (missing.includes('propellant_supply')) {
      state.activeFailureMode = 'no_propellant';
      shortCircuitArcGroup.visible = false;
      box.className = 'p-3 rounded-lg border bg-amber-950/75 border-amber-500/60 text-amber-200 text-xs leading-relaxed';
      box.innerHTML = `
        <div class="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-gauge"></i> FAILURE: PROPELLANT STARVATION (ṁ = 0.0 mg/s)
        </div>
        <strong>Missing Propellant Tank Supply:</strong> High voltage and magnetic fields are active, but no neutral ${state.propellant} gas atoms are injected to form plasma!
      `;
    } else {
      state.activeFailureMode = 'no_backplate';
      shortCircuitArcGroup.visible = false;
      box.className = 'p-3 rounded-lg border bg-red-950/75 border-red-500/60 text-red-200 text-xs leading-relaxed';
      box.innerHTML = `
        <div class="font-bold text-red-400 flex items-center gap-1.5 mb-1">
          <i class="fa-solid fa-shield-halved"></i> FAILURE: OPEN MAGNETIC CIRCUIT &amp; UNMOUNTED CORE
        </div>
        <strong>Missing Ferromagnetic Backplate:</strong> Magnetic flux cannot complete its return circuit between the inner core and outer coils, dispersing the radial magnetic lens.
      `;
    }

    plasmaAudio.playFailureDiagnostic(state.activeFailureMode);
    updatePhysicsAndTelemetryUI();
  }

  // ========================================================================
  // 14. 3D RAYCASTING (HOVER HIGHLIGHT, TOOLTIP & CLICK-TO-INSTALL/INSPECT)
  // ========================================================================
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  const pointerDownPos = new THREE.Vector2();
  const tooltipEl = document.getElementById('part-hover-tooltip');
  const tooltipTitleEl = document.getElementById('tooltip-title');
  const tooltipSubEl = document.getElementById('tooltip-subtitle');

  function updatePartHighlightMaterials() {
    Object.values(componentObjects).forEach((obj) => {
      const isHovered = state.hoveredPartId === obj.spec.id;
      const isSelected = state.mode === 'build' && state.selectedPartId === obj.spec.id;
      obj.materials.forEach((m) => {
        if (isHovered) {
          m.mat.emissive.setHex(0x22d3ee);
          m.mat.emissiveIntensity = 0.45;
        } else if (isSelected) {
          m.mat.emissive.setHex(0x0ea5e9);
          m.mat.emissiveIntensity = 0.22;
        } else {
          m.mat.emissive.setHex(m.baseEmissiveHex);
          m.mat.emissiveIntensity = m.baseEmissiveIntensity;
        }
      });
    });
  }

  renderer.domElement.addEventListener('pointermove', (e) => {
    if (state.mode === 'game') {
      if (state.hoveredPartId !== null) {
        state.hoveredPartId = null;
        updatePartHighlightMaterials();
      }
      if (tooltipEl) tooltipEl.classList.add('hidden');
      renderer.domElement.style.cursor = 'crosshair';
      return;
    }

    const rect = renderer.domElement.getBoundingClientRect();
    mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(raycastTargets, false);
    const visibleHit = hits.find((h) => {
      let p = h.object;
      while (p) {
        if (p.visible === false) return false;
        p = p.parent;
      }
      return true;
    });

    if (visibleHit && visibleHit.object.userData.componentId) {
      const partId = visibleHit.object.userData.componentId;
      if (state.hoveredPartId !== partId) {
        state.hoveredPartId = partId;
        plasmaAudio.playUIChirp('hover');
        updatePartHighlightMaterials();
      }
      const comp = THRUSTER_COMPONENTS.find((c) => c.id === partId);
      if (comp && tooltipEl) {
        tooltipEl.classList.remove('hidden');
        tooltipEl.style.left = `${e.clientX + 16}px`;
        tooltipEl.style.top = `${e.clientY + 14}px`;
        tooltipTitleEl.textContent = comp.name;
        tooltipSubEl.textContent =
          state.mode === 'build'
            ? comp.installed
              ? `${comp.material} · Click to inspect`
              : 'Floating Part · Click to INSTALL into thruster core'
            : `${comp.material} · ${comp.operatingTemp}`;
      }
      renderer.domElement.style.cursor = 'pointer';
    } else {
      if (state.hoveredPartId !== null) {
        state.hoveredPartId = null;
        updatePartHighlightMaterials();
      }
      if (tooltipEl) tooltipEl.classList.add('hidden');
      renderer.domElement.style.cursor = 'grab';
    }
  });

  renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerDownPos.set(e.clientX, e.clientY);
  });

  renderer.domElement.addEventListener('pointerup', (e) => {
    if (state.mode === 'game') return;
    const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
    if (dist > 6) return; // Ignore camera orbit drags

    if (state.hoveredPartId) {
      const partId = state.hoveredPartId;
      const comp = THRUSTER_COMPONENTS.find((c) => c.id === partId);
      selectComponentForInspection(partId);
      // In Build Mode, clicking an uninstalled floating 3D component smoothly installs it!
      if (state.mode === 'build' && comp && !comp.installed) {
        installPart(partId, true);
      }
    }
  });

  // ========================================================================
  // 15. MODE B: "HOW IT WORKS" 4-STAGE WALKTHROUGH CONTROLLER
  // ========================================================================
  function applyLearnStage(stageNum) {
    const stageIdx = Math.max(1, Math.min(4, stageNum)) - 1;
    const stageData = LEARN_STAGES[stageIdx];
    state.learnStage = stageData.stage;
    plasmaAudio.playUIChirp('stage');

    // Update Stage Scrubber Pill Buttons
    document.querySelectorAll('.stage-pill').forEach((btn) => {
      const s = Number(btn.getAttribute('data-stage'));
      if (s === state.learnStage) {
        btn.className = 'stage-pill py-2 rounded-lg text-xs font-mono font-bold transition bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.2)]';
      } else {
        btn.className = 'stage-pill py-2 rounded-lg text-xs font-mono font-bold transition text-slate-400 hover:text-white border border-transparent';
      }
    });

    // Update Stage Text, Formula & Highlights
    document.getElementById('learn-stage-tag').textContent = stageData.tag;
    document.getElementById('learn-camera-hint').innerHTML = `<i class="fa-solid fa-camera text-cyan-400 mr-1"></i>${stageData.cameraHint}`;
    document.getElementById('learn-stage-title').innerHTML = stageData.title;
    document.getElementById('learn-stage-body').innerHTML = stageData.body;
    document.getElementById('learn-stage-equation').textContent = stageData.equation;
    document.getElementById('learn-stage-subequation').textContent = stageData.subequation;

    const highlightsContainer = document.getElementById('learn-stage-highlights');
    highlightsContainer.innerHTML = stageData.highlights
      .map(
        (h) => `
        <div class="flex items-start gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
          <span class="w-2.5 h-2.5 rounded-full ${h.color} mt-1 shrink-0"></span>
          <span class="text-slate-200 leading-snug">${h.text}</span>
        </div>
      `
      )
      .join('');

    // Enable Cutaway View automatically in Mode B so internal stage physics are visible
    state.isCutaway = stageData.showCutaway;
    updateCutawayGeometryVisibility();

    state.showVectorFields = true;
    document.getElementById('btn-toggle-fields').classList.add('active');
    ezFieldGroup.visible = stageData.showEz;
    brFieldGroup.visible = stageData.showBr;

    // Smoothly animate 3D camera to stage focus target
    animateCameraTo(stageData.cameraPos, stageData.cameraTarget, 1.15);
  }

  // ========================================================================
  // 16. MODE SWITCHER CONTROLLER (MODES A, B, C, D, E)
  // ========================================================================
  function switchApplicationMode(newMode) {
    state.mode = newMode;
    state.autoTourActive = false;
    updateAutoTourButtonUI();
    plasmaAudio.playUIChirp('nav');

    // Update Navbar Mode Tabs
    document.querySelectorAll('.mode-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.getAttribute('data-mode') === newMode);
    });

    // Toggle Left Contextual Panels
    const panelBuild = document.getElementById('panel-build');
    const panelLearn = document.getElementById('panel-learn');
    const panelSim = document.getElementById('panel-sim');
    const panelOrbit = document.getElementById('panel-orbit');
    const panelGame = document.getElementById('panel-game');
    const gameHudOverlay = document.getElementById('game-hud-overlay');

    panelBuild.classList.toggle('hidden', newMode !== 'build');
    panelBuild.classList.toggle('flex', newMode === 'build');

    panelLearn.classList.toggle('hidden', newMode !== 'learn');
    panelLearn.classList.toggle('flex', newMode === 'learn');

    panelSim.classList.toggle('hidden', newMode !== 'sim');
    panelSim.classList.toggle('flex', newMode === 'sim');

    if (panelOrbit) {
      panelOrbit.classList.toggle('hidden', newMode !== 'orbit');
      panelOrbit.classList.toggle('flex', newMode === 'orbit');
    }

    if (panelGame) {
      panelGame.classList.toggle('hidden', newMode !== 'game');
      panelGame.classList.toggle('flex', newMode === 'game');
    }

    if (gameHudOverlay) {
      gameHudOverlay.classList.toggle('hidden', newMode !== 'game');
    }

    // Show 3D Holographic Orbital Visualizer only in Mode D ('orbit')
    orbitalSimulator.group.visible = newMode === 'orbit';
    if (newMode !== 'orbit') {
      state.orbit.isBurning = false;
    }

    // Clean Scene Transition Between Modes 1-4 (Stationary Lab Thruster) and Mode 5 (3D Plasma Rocket Flight)
    const isGameMode = newMode === 'game';
    thrusterRoot.visible = !isGameMode;
    plasmaSystemsGroup.visible = !isGameMode;
    vectorFieldsGroup.visible = !isGameMode && state.showVectorFields;
    if (isGameMode) {
      sputterPoints.visible = false;
      shortCircuitArcGroup.visible = false;
    }
    if (vacuumChamberGroup) {
      vacuumChamberGroup.visible = !isGameMode;
    }
    playerRocketGroup.visible = isGameMode;
    gameSimulator.group.visible = isGameMode;
    controls.enabled = !isGameMode;

    if (!isGameMode) {
      Object.keys(gameSimulator.keys).forEach((k) => {
        gameSimulator.keys[k] = false;
      });
      document.querySelectorAll('.vkey-btn').forEach((b) => b.classList.remove('pressed'));
      gameSimulator.resetThrusterTransforms();
      if (newMode !== 'orbit') {
        orbitalSimulator.update3DTankFluidIndicator(1.0);
      }
    }

    if (newMode === 'build') {
      if (isAllPartsInstalled() && !state.buildIgnited) {
        setAllComponentsInstalled(false, true);
        installPart('backplate', true, true);
      }
      const box = document.getElementById('build-validation-box');
      if (box) box.classList.add('hidden');
      renderBuildChecklist();
      animateCameraTo(new THREE.Vector3(6.8, 3.6, 6.6), new THREE.Vector3(0, 0, -0.3), 1.1);
    } else if (newMode === 'learn') {
      setAllComponentsInstalled(true, true);
      applyLearnStage(state.learnStage);
    } else if (newMode === 'sim') {
      setAllComponentsInstalled(true, true);
      ezFieldGroup.visible = state.showVectorFields;
      brFieldGroup.visible = state.showVectorFields;
      setChartMode('thruster', true);
      animateCameraTo(new THREE.Vector3(6.5, 3.2, 6.8), new THREE.Vector3(0, 0.0, 1.2), 1.1);
    } else if (newMode === 'orbit') {
      setAllComponentsInstalled(true, true);
      state.isCutaway = false;
      updateCutawayGeometryVisibility();
      setChartMode('mission', true);
      orbitalSimulator.updateUI();
      animateCameraTo(new THREE.Vector3(5.8, 3.6, 8.6), new THREE.Vector3(0.0, 0.05, 2.2), 1.15);
    } else if (newMode === 'game') {
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
      setAllComponentsInstalled(true, true);
      state.isCutaway = false;
      updateCutawayGeometryVisibility();
      setChartMode('thruster', true);
      gameSimulator.startMission(state.game.missionKey, false);
      gameSimulator.setCameraView(state.game.cameraView, false);
    }

    updatePhysicsAndTelemetryUI();
  }

  function updateAutoTourButtonUI() {
    const icon = document.getElementById('icon-auto-tour');
    const label = document.getElementById('label-auto-tour');
    if (!icon || !label) return;
    if (state.autoTourActive) {
      icon.className = 'fa-solid fa-pause text-[10px] text-amber-400';
      label.textContent = 'Pause Tour';
    } else {
      icon.className = 'fa-solid fa-play text-[10px]';
      label.textContent = 'Auto-Tour';
    }
  }

  // ========================================================================
  // 17. DOM EVENT LISTENERS BINDING
  // ========================================================================
  function bindUIEvents() {
    // Autoplay Policy Safe Unlock on First User Interaction
    const unlockAudioOnce = () => {
      plasmaAudio.ensureContext();
    };
    window.addEventListener('pointerdown', unlockAudioOnce, { once: true });
    window.addEventListener('keydown', unlockAudioOnce, { once: true });

    // Top Navbar Procedural Web Audio Controls
    const btnToggleAudio = document.getElementById('btn-toggle-audio');
    if (btnToggleAudio) {
      btnToggleAudio.addEventListener('click', () => {
        plasmaAudio.toggleMute();
      });
    }

    const sliderMasterVolume = document.getElementById('slider-master-volume');
    if (sliderMasterVolume) {
      sliderMasterVolume.addEventListener('input', (e) => {
        plasmaAudio.setMasterVolume(e.target.value);
      });
    }

    // Top Mode Tabs (Modes A, B, C, D, E)
    document.querySelectorAll('.mode-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        switchApplicationMode(btn.getAttribute('data-mode'));
      });
    });

    // Cutaway View Toggle
    document.getElementById('btn-toggle-cutaway').addEventListener('click', () => {
      state.isCutaway = !state.isCutaway;
      plasmaAudio.playUIChirp('nav');
      updateCutawayGeometryVisibility();
    });

    // Vector Fields Toggle
    const btnFields = document.getElementById('btn-toggle-fields');
    btnFields.addEventListener('click', () => {
      state.showVectorFields = !state.showVectorFields;
      plasmaAudio.playUIChirp('nav');
      btnFields.classList.toggle('active', state.showVectorFields);
      vectorFieldsGroup.visible = state.showVectorFields;
      if (state.showVectorFields) {
        ezFieldGroup.visible = true;
        brFieldGroup.visible = !(state.mode === 'learn' && state.learnStage === 1);
      }
    });

    // Reset Camera
    document.getElementById('btn-reset-camera').addEventListener('click', () => {
      plasmaAudio.playUIChirp('nav');
      if (state.mode === 'orbit') {
        animateCameraTo(new THREE.Vector3(5.8, 3.6, 8.6), new THREE.Vector3(0.0, 0.05, 2.2), 0.95);
      } else if (state.mode === 'game') {
        gameSimulator.setCameraView(state.game.cameraView, true);
      } else {
        animateCameraTo(new THREE.Vector3(6.5, 3.2, 6.8), new THREE.Vector3(0, 0.0, 0.8), 0.95);
      }
    });

    // Right Panel Telemetry Chart Mode Switcher (Thruster Curve vs. Mission Delta-V)
    document.querySelectorAll('.chart-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setChartMode(btn.getAttribute('data-chart-mode'));
      });
    });

    // Mode A: Build Actions
    document.getElementById('btn-explode-all').addEventListener('click', () => {
      setAllComponentsInstalled(false);
      const box = document.getElementById('build-validation-box');
      if (box) box.classList.add('hidden');
    });

    document.getElementById('btn-assemble-all').addEventListener('click', () => {
      setAllComponentsInstalled(true);
      validateAndIgniteThruster();
    });

    document.getElementById('btn-ignite-thruster').addEventListener('click', () => {
      validateAndIgniteThruster();
    });

    // Mode B: Learn Stage Controls
    document.querySelectorAll('.stage-pill').forEach((pill) => {
      pill.addEventListener('click', () => {
        state.autoTourActive = false;
        updateAutoTourButtonUI();
        applyLearnStage(Number(pill.getAttribute('data-stage')));
      });
    });

    document.getElementById('btn-stage-prev').addEventListener('click', () => {
      state.autoTourActive = false;
      updateAutoTourButtonUI();
      const prev = state.learnStage <= 1 ? 4 : state.learnStage - 1;
      applyLearnStage(prev);
    });

    document.getElementById('btn-stage-next').addEventListener('click', () => {
      state.autoTourActive = false;
      updateAutoTourButtonUI();
      const next = state.learnStage >= 4 ? 1 : state.learnStage + 1;
      applyLearnStage(next);
    });

    document.getElementById('btn-auto-tour').addEventListener('click', () => {
      state.autoTourActive = !state.autoTourActive;
      state.autoTourTimer = 0;
      plasmaAudio.playUIChirp('nav');
      updateAutoTourButtonUI();
    });

    // Mode C: Propellant Selector Cards
    document.querySelectorAll('.propellant-card').forEach((card) => {
      card.addEventListener('click', () => {
        setActivePropellant(card.getAttribute('data-propellant'));
      });
    });

    // Mode C: Physics Sliders
    const sliderVoltage = document.getElementById('slider-voltage');
    const sliderMassFlow = document.getElementById('slider-massflow');
    const sliderMagField = document.getElementById('slider-magfield');

    sliderVoltage.addEventListener('input', (e) => {
      state.voltage = Number(e.target.value);
      updatePhysicsAndTelemetryUI();
    });

    sliderMassFlow.addEventListener('input', (e) => {
      state.massFlow = Number(e.target.value);
      updatePhysicsAndTelemetryUI();
    });

    sliderMagField.addEventListener('input', (e) => {
      state.magField = Number(e.target.value);
      updatePhysicsAndTelemetryUI();
    });

    // Mode C: Spacecraft Presets
    const presets = {
      spt100: { propellant: 'Xe', voltage: 300, massFlow: 5.0, magField: 180 },
      starlink: { propellant: 'Kr', voltage: 450, massFlow: 6.2, magField: 225 },
      deepspace: { propellant: 'Xe', voltage: 750, massFlow: 8.5, magField: 295 },
      sputter: { propellant: 'Ar', voltage: 650, massFlow: 7.0, magField: 65 },
    };

    document.querySelectorAll('.preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = presets[btn.getAttribute('data-preset')];
        if (!p) return;
        state.voltage = p.voltage;
        state.massFlow = p.massFlow;
        state.magField = p.magField;

        sliderVoltage.value = p.voltage;
        sliderMassFlow.value = p.massFlow;
        sliderMagField.value = p.magField;

        setActivePropellant(p.propellant, true);
      });
    });

    // --------------------------------------------------------------------
    // Mode D: Orbital Maneuver & Delta-V Mission Simulator Controls
    // --------------------------------------------------------------------
    document.querySelectorAll('.orbit-prop-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        setActivePropellant(btn.getAttribute('data-orbit-prop'), true);
      });
    });

    document.querySelectorAll('.mission-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-mission');
        plasmaAudio.playUIChirp('preset');
        orbitalSimulator.applyMissionPreset(key);
      });
    });

    const sliderOrbitDry = document.getElementById('slider-orbit-drymass');
    const sliderOrbitProp = document.getElementById('slider-orbit-propmass');
    const sliderOrbitH1 = document.getElementById('slider-orbit-h1');
    const sliderOrbitH2 = document.getElementById('slider-orbit-h2');
    const sliderOrbitCluster = document.getElementById('slider-orbit-cluster');

    if (sliderOrbitDry) {
      sliderOrbitDry.addEventListener('input', (e) => {
        state.orbit.dryMass = Number(e.target.value);
        state.orbit.burnProgress = 0.0;
        state.orbit.isBurning = false;
        orbitalSimulator.updateUI();
        updateTelemetryChart();
      });
    }

    if (sliderOrbitProp) {
      sliderOrbitProp.addEventListener('input', (e) => {
        state.orbit.propMass = Number(e.target.value);
        state.orbit.burnProgress = 0.0;
        state.orbit.isBurning = false;
        orbitalSimulator.updateUI();
        updateTelemetryChart();
      });
    }

    if (sliderOrbitH1) {
      sliderOrbitH1.addEventListener('input', (e) => {
        state.orbit.h1 = Number(e.target.value);
        state.orbit.dvReqOverride = null;
        state.orbit.burnProgress = 0.0;
        state.orbit.isBurning = false;
        orbitalSimulator.updateUI();
        updateTelemetryChart();
      });
    }

    if (sliderOrbitH2) {
      sliderOrbitH2.addEventListener('input', (e) => {
        state.orbit.h2 = Number(e.target.value);
        state.orbit.dvReqOverride = null;
        state.orbit.burnProgress = 0.0;
        state.orbit.isBurning = false;
        orbitalSimulator.updateUI();
        updateTelemetryChart();
      });
    }

    if (sliderOrbitCluster) {
      sliderOrbitCluster.addEventListener('input', (e) => {
        state.orbit.clusterCount = Number(e.target.value);
        orbitalSimulator.updateUI();
      });
    }

    const btnOrbitBurnToggle = document.getElementById('btn-orbit-burn-toggle');
    if (btnOrbitBurnToggle) {
      btnOrbitBurnToggle.addEventListener('click', () => {
        orbitalSimulator.toggleBurn();
      });
    }

    const btnOrbitReset = document.getElementById('btn-orbit-reset');
    if (btnOrbitReset) {
      btnOrbitReset.addEventListener('click', () => {
        orbitalSimulator.resetOrbit();
      });
    }

    document.querySelectorAll('.warp-speed-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.orbit.warpSpeed = Number(btn.getAttribute('data-warp'));
        document.querySelectorAll('.warp-speed-btn').forEach((b) => {
          b.classList.toggle('active', b === btn);
        });
        plasmaAudio.playUIChirp('stage');
      });
    });

    // --------------------------------------------------------------------
    // Mode E: Pilot & Gimbal Game Controls (Left Panel, HUD & Keyboard)
    // --------------------------------------------------------------------
    const btnGameCamCycle = document.getElementById('btn-game-cam-cycle');
    if (btnGameCamCycle) {
      btnGameCamCycle.addEventListener('click', () => {
        gameSimulator.cycleCameraView();
      });
    }

    const btnHudCam = document.getElementById('btn-hud-cam');
    if (btnHudCam) {
      btnHudCam.addEventListener('click', () => {
        gameSimulator.cycleCameraView();
      });
    }

    document.querySelectorAll('.game-cam-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        gameSimulator.setCameraView(btn.getAttribute('data-game-cam'), true);
      });
    });

    document.querySelectorAll('.game-mission-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        gameSimulator.startMission(btn.getAttribute('data-game-mission'), true);
      });
    });

    const btnGameRestart = document.getElementById('btn-game-restart');
    if (btnGameRestart) {
      btnGameRestart.addEventListener('click', () => {
        gameSimulator.startMission(state.game.missionKey, true);
      });
    }

    const btnGameAutoMag = document.getElementById('btn-game-automag');
    if (btnGameAutoMag) {
      btnGameAutoMag.addEventListener('click', () => {
        gameSimulator.toggleAutoMagSync();
      });
    }

    const btnHudAutoMag = document.getElementById('btn-hud-automag');
    if (btnHudAutoMag) {
      btnHudAutoMag.addEventListener('click', () => {
        gameSimulator.toggleAutoMagSync();
      });
    }

    const btnGameRepair = document.getElementById('btn-game-repair');
    if (btnGameRepair) {
      btnGameRepair.addEventListener('click', () => {
        gameSimulator.repairChannelIntegrity();
      });
    }

    const btnHudPulse = document.getElementById('btn-hud-pulse');
    if (btnHudPulse) {
      btnHudPulse.addEventListener('click', () => {
        gameSimulator.triggerCapacitorPulse();
      });
    }

    document.querySelectorAll('.game-prop-pill').forEach((btn) => {
      btn.addEventListener('click', () => {
        setActivePropellant(btn.getAttribute('data-game-prop'), true);
      });
    });

    // Virtual On-Screen Flight Controls Deck (Mouse & Touch Hold Support)
    document.querySelectorAll('.vkey-btn').forEach((btn) => {
      const code = btn.getAttribute('data-vkey');
      const releaseKey = () => {
        gameSimulator.keys[code] = false;
        btn.classList.remove('pressed');
      };

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        gameSimulator.keys[code] = true;
        btn.classList.add('pressed');
      });

      btn.addEventListener('pointerup', releaseKey);
      btn.addEventListener('pointerleave', releaseKey);
      btn.addEventListener('pointercancel', releaseKey);
    });

    // Real-Time 60 FPS Keyboard Flight Controller (Active ONLY in Mode 5)
    window.addEventListener('keydown', (e) => {
      if (state.mode !== 'game') return;
      const tag = e.target && e.target.tagName ? e.target.tagName.toUpperCase() : '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const code = e.code;

      // Prevent browser scrolling or button activation on flight control keys
      if (
        code === 'Space' ||
        code === 'KeyW' ||
        code === 'KeyA' ||
        code === 'KeyS' ||
        code === 'KeyD' ||
        code === 'ArrowUp' ||
        code === 'ArrowDown' ||
        code === 'ArrowLeft' ||
        code === 'ArrowRight'
      ) {
        e.preventDefault();
      }

      gameSimulator.keys[code] = true;

      // Highlight matching virtual HUD key button
      const vBtn = document.querySelector(`.vkey-btn[data-vkey="${code}"]`);
      if (vBtn) vBtn.classList.add('pressed');

      if (e.repeat) return;

      if (code === 'Space') {
        gameSimulator.triggerCapacitorPulse();
      } else if (code === 'Digit1' || code === 'Numpad1') {
        setActivePropellant('Xe', true);
      } else if (code === 'Digit2' || code === 'Numpad2') {
        setActivePropellant('Kr', true);
      } else if (code === 'Digit3' || code === 'Numpad3') {
        setActivePropellant('Ar', true);
      } else if (code === 'KeyC') {
        gameSimulator.cycleCameraView();
      } else if (code === 'KeyF') {
        gameSimulator.toggleAutoMagSync();
      } else if (code === 'KeyR') {
        gameSimulator.repairChannelIntegrity();
      }
    });

    window.addEventListener('keyup', (e) => {
      const code = e.code;
      if (gameSimulator.keys[code]) {
        gameSimulator.keys[code] = false;
      }
      const vBtn = document.querySelector(`.vkey-btn[data-vkey="${code}"]`);
      if (vBtn) vBtn.classList.remove('pressed');
    });

    window.addEventListener('blur', () => {
      Object.keys(gameSimulator.keys).forEach((k) => {
        gameSimulator.keys[k] = false;
      });
      document.querySelectorAll('.vkey-btn').forEach((b) => b.classList.remove('pressed'));
    });

    // Window Resize Handler (updates PerspectiveCamera, WebGLRenderer, and EffectComposer)
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      composer.setSize(w, h);
      bloomPass.resolution.set(w, h);
    });
  }

  // ========================================================================
  // 18. REAL-TIME ANIMATION LOOP (PARTICLE PHYSICS, FIELDS, LERP & BLOOM)
  // ========================================================================
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const dt = Math.min(clock.getDelta(), 0.05);
    const elapsed = clock.getElapsedTime();
    const tel = state.telemetry;
    const prop = PROPELLANTS[state.propellant];

    // 1. Smooth Camera Transition Interpolation
    if (cameraTransition.active) {
      cameraTransition.progress += dt / cameraTransition.duration;
      if (cameraTransition.progress >= 1.0) {
        cameraTransition.progress = 1.0;
        cameraTransition.active = false;
      }
      // Cubic ease-in-out
      const t = cameraTransition.progress;
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      camera.position.lerpVectors(cameraTransition.startPos, cameraTransition.endPos, ease);
      controls.target.lerpVectors(cameraTransition.startTarget, cameraTransition.endTarget, ease);
      if (!controls.enabled) {
        camera.lookAt(controls.target);
      }
    }
    if (controls.enabled) {
      controls.update();
    }

    // 2. Auto-Tour Stage Progression in Mode B
    if (state.mode === 'learn' && state.autoTourActive) {
      state.autoTourTimer += dt;
      if (state.autoTourTimer > 7.5) {
        state.autoTourTimer = 0;
        const nextStage = state.learnStage >= 4 ? 1 : state.learnStage + 1;
        applyLearnStage(nextStage);
      }
    }

    // 2B. Step Mode D Orbital Mission Simulator
    if (state.mode === 'orbit') {
      orbitalSimulator.update(dt, elapsed);
    }

    // 2C. Step Mode E Pilot & Gimbal Game Simulator
    if (state.mode === 'game') {
      gameSimulator.update(dt, elapsed);
    }

    // 3. Smooth Component Assembly / Exploded Lerp Animation
    Object.values(componentObjects).forEach((obj) => {
      obj.group.position.lerp(obj.targetPos, Math.min(1.0, dt * 8.5));
      if (obj.ghostGroup.visible) {
        obj.ghostGroup.children.forEach((m) => {
          m.material.opacity = 0.12 + 0.08 * Math.sin(elapsed * 4.0);
        });
      }
    });

    // 4. Determine Active Plasma State based on Mode & Build Validation
    const allAssembled = isAllPartsInstalled();
    const isBuildFailureActive = state.mode === 'build' && state.activeFailureMode && state.failureTimer > 0;
    if (isBuildFailureActive) {
      state.failureTimer -= dt;
      if (state.failureTimer <= 0) {
        shortCircuitArcGroup.visible = false;
      }
    }

    const orbitTankExhausted =
      state.mode === 'orbit' &&
      state.orbit.remainingPropKg <= 0.01 &&
      state.orbit.burnProgress > 0.01;

    const isGamePlasmaActive =
      state.mode === 'game' &&
      state.game.throttlePct > 0.5 &&
      state.game.channelShutdownTimer <= 0 &&
      state.game.propTankKg > 0.005;

    const isPlasmaNominal =
      state.mode === 'sim' ||
      state.mode === 'learn' ||
      (state.mode === 'orbit' && !orbitTankExhausted) ||
      isGamePlasmaActive ||
      (state.mode === 'build' && allAssembled && state.buildIgnited);

    // Update Continuous Physics-Driven Web Audio Synthesizer
    plasmaAudio.updateContinuousSound(dt, elapsed, state, isPlasmaNominal);

    // Stage-Specific Isolation in Mode B ("How It Works") — Stationary Lab Thruster hidden in Mode 5 ('game')
    const showNeutrals =
      state.mode !== 'game' &&
      ((isPlasmaNominal && (state.mode !== 'learn' || state.learnStage >= 3)) ||
        (isBuildFailureActive && state.activeFailureMode === 'no_cathode'));

    const showElectrons =
      state.mode !== 'game' &&
      (isPlasmaNominal ||
        (isBuildFailureActive && state.activeFailureMode === 'no_magnetic_lock'));

    const showIonPlume =
      state.mode !== 'game' &&
      isPlasmaNominal &&
      (state.mode !== 'learn' || state.learnStage >= 3);

    neutralPoints.visible = showNeutrals;
    electronPoints.visible = showElectrons;
    ionPoints.visible = showIonPlume;
    volumetricPlumeGroup.visible = showIonPlume;

    // 5. Update Neutral Propellant Particles (Species 1)
    if (showNeutrals) {
      const nPos = neutralGeo.attributes.position.array;
      const flowSpeedMult = 0.6 + (state.massFlow / 20.0) * 1.4;
      neutralMat.opacity = Math.min(0.9, 0.38 + (state.massFlow / 20.0) * 0.52);

      for (let i = 0; i < NEUTRAL_COUNT; i++) {
        const d = neutralData[i];
        d.z += d.speedZ * flowSpeedMult * dt;
        d.angle += 0.35 * dt;

        // In nominal ionization, neutrals get ionized near z = +0.15; if no cathode, they drift further out
        const maxZ = state.activeFailureMode === 'no_cathode' ? 2.4 : 0.18;
        if (d.z > maxZ) {
          d.z = -1.12;
          d.angle = Math.random() * Math.PI * 2;
          d.radius = 1.24 + Math.random() * 0.52;
        }

        const rWobble = d.radius + Math.sin(elapsed * d.wobbleFreq + d.wobblePhase) * 0.03;
        nPos[i * 3] = Math.cos(d.angle) * rWobble;
        nPos[i * 3 + 1] = Math.sin(d.angle) * rWobble;
        nPos[i * 3 + 2] = d.z;
      }
      neutralGeo.attributes.position.needsUpdate = true;
    }

    // 6. Update Hall Drift & Cathode Electrons (Species 2)
    if (showElectrons) {
      const ePos = electronGeo.attributes.position.array;
      const hallDriftSpeed = 0.8 + (state.magField / 180.0) * 1.65;
      const isNoMagnetFailure =
        isBuildFailureActive && state.activeFailureMode === 'no_magnetic_lock';

      for (let i = 0; i < ELECTRON_COUNT; i++) {
        const d = electronData[i];

        if (isNoMagnetFailure) {
          // Failure Simulation: Without magnetic coils, electrons rush axially straight from cathode (z=+0.6) to anode (z=-1.1) without orbiting!
          d.z -= 4.8 * dt;
          if (d.z < -1.10) {
            d.z = 0.60;
            d.angle = Math.random() * Math.PI * 2;
          }
          ePos[i * 3] = Math.cos(d.angle) * d.radius;
          ePos[i * 3 + 1] = Math.sin(d.angle) * d.radius;
          ePos[i * 3 + 2] = d.z;
          continue;
        }

        if (d.role === 'hall_ring') {
          // Stage 1 only shows primary cathode electrons entering channel; Stage 2-4 & Sim show full E×B Hall drift ring
          if (state.mode === 'learn' && state.learnStage === 1) {
            d.z -= 1.8 * dt;
            if (d.z < -1.05) d.z = 0.52;
            d.angle += 0.8 * dt;
          } else {
            // Fast azimuthal E×B Hall drift around the channel exit!
            d.angle += d.angularVel * hallDriftSpeed * dt;
            // Tighter axial confinement when etaMag is high
            const axialSpread = 0.14 + (1.0 - tel.etaMag) * 0.45;
            d.z = 0.25 + Math.sin(d.angle * 3.0 + i) * axialSpread;
          }
          ePos[i * 3] = Math.cos(d.angle) * d.radius;
          ePos[i * 3 + 1] = Math.sin(d.angle) * d.radius;
          ePos[i * 3 + 2] = d.z;
        } else if (d.role === 'cathode_to_channel') {
          // Primary electrons streaming from External Hollow Cathode orifice (0, 2.38, 0.68) into the annular channel exit
          d.t += dt * 1.45;
          if (d.t > 1.0) d.t -= 1.0;
          const targetX = Math.cos(d.targetAngle) * 1.50;
          const targetY = Math.sin(d.targetAngle) * 1.50;
          const targetZ = 0.28;

          ePos[i * 3] = THREE.MathUtils.lerp(0, targetX, d.t);
          ePos[i * 3 + 1] = THREE.MathUtils.lerp(2.38, targetY, d.t) + Math.sin(d.t * Math.PI) * 0.22;
          ePos[i * 3 + 2] = THREE.MathUtils.lerp(0.68, targetZ, d.t);
        } else {
          // Neutralizing electrons streaming from External Hollow Cathode into the exhaust ion beam
          if (state.mode === 'learn' && state.learnStage < 4) {
            ePos[i * 3] = 0;
            ePos[i * 3 + 1] = 2.38;
            ePos[i * 3 + 2] = 0.68;
          } else {
            d.t += dt * 1.65;
            if (d.t > 1.0) d.t -= 1.0;
            const maxBeamZ = state.mode === 'orbit' ? 1.5 : 5.8;
            const beamZ = 0.68 + d.t * maxBeamZ;
            const beamR = (1.0 - d.t * 0.5) * 1.15;
            ePos[i * 3] = Math.cos(d.angle + elapsed * 2.0) * beamR * d.t;
            ePos[i * 3 + 1] = THREE.MathUtils.lerp(2.38, Math.sin(d.angle) * beamR * 0.6, Math.min(1, d.t * 1.6));
            ePos[i * 3 + 2] = beamZ;
          }
        }
      }
      electronGeo.attributes.position.needsUpdate = true;
    }

    // 7. Update Accelerated Plasma Ions & Volumetric Exhaust Plume (Species 3)
    if (showIonPlume) {
      const iPos = ionGeo.attributes.position.array;
      const iCol = ionGeo.attributes.color.array;

      // Plume length & particle velocity scale directly with Exhaust Velocity (v_e) and Mode 5 Throttle / Pulse Boost
      const veNorm = Math.max(0.4, Math.min(2.4, tel.exhaustVelocityKms / 18.0));
      const gameThrottleFactor =
        state.mode === 'game'
          ? (0.25 + (state.game.throttlePct / 100.0) * 0.95) *
            (state.game.pulseBoostTimer > 0 ? 1.45 : 1.0)
          : 1.0;

      const plumeLength =
        state.mode === 'learn' && state.learnStage === 3
          ? 2.2 // Stage 3 focuses on nascent ion creation inside the channel
          : state.mode === 'orbit'
          ? 1.55 // Keep main thruster plume compact in Mode D so the 3D Holographic Orbit is unobstructed
          : (6.5 + veNorm * 5.2) * gameThrottleFactor;

      // Plume divergence scales inversely with Magnetic Confinement (etaMag)
      const divTan = Math.tan(THREE.MathUtils.degToRad(tel.divergenceDeg));

      // Plume opacity & particle size scale with Mass Flow Rate (m_dot)
      const massNorm = Math.max(0.15, Math.min(1.0, state.massFlow / 16.0));
      ionMat.opacity = 0.42 + massNorm * 0.52;
      ionMat.size = 0.13 + massNorm * 0.08 + (state.mode === 'game' && state.game.pulseBoostTimer > 0 ? 0.05 : 0);

      // In Mode 5, add downstream beam deflection whip when gimballing
      const gimbalWhipX =
        state.mode === 'game' ? -THREE.MathUtils.degToRad(state.game.gimbalYawDeg) * 2.2 : 0;
      const gimbalWhipY =
        state.mode === 'game' ? THREE.MathUtils.degToRad(state.game.gimbalPitchDeg) * 2.2 : 0;

      const cPrimary = prop.primaryColor;
      const cSecondary = prop.secondaryColor;
      const cCore = prop.coreColor;

      for (let i = 0; i < ION_COUNT; i++) {
        const d = ionData[i];
        d.life += dt * (0.55 + veNorm * 0.85) * d.speedFactor;
        if (d.life >= 1.0) {
          d.life %= 1.0;
          d.angle = Math.random() * Math.PI * 2;
        }

        const z = -0.15 + d.life * plumeLength;

        // High magnetic confinement focuses the annular beam toward a tight central jet;
        // low magnetic confinement causes wide radial divergence
        const focusPinch = tel.etaMag > 0.82 ? Math.sin(Math.min(1, d.life * 2.2) * Math.PI) * 0.45 : 0;
        const radialExpansion = Math.max(0, z - 0.35) * divTan * (0.45 + 0.55 * Math.abs(d.radialSpreadSeed));
        const currentR = Math.max(
          0.08,
          d.baseRadius * (1.0 - focusPinch * 0.65) + radialExpansion * d.radialSpreadSeed
        );

        const swirlAngle = d.angle + d.swirlSeed * d.life;
        const whipCurve = d.life * d.life;
        iPos[i * 3] = Math.cos(swirlAngle) * currentR + gimbalWhipX * whipCurve;
        iPos[i * 3 + 1] = Math.sin(swirlAngle) * currentR + gimbalWhipY * whipCurve;
        iPos[i * 3 + 2] = z;

        // Color gradient: bright white-core near channel exit -> primary propellant color -> secondary tail color
        const fade = Math.pow(1.0 - d.life, 0.75);
        if (d.life < 0.18) {
          iCol[i * 3] = THREE.MathUtils.lerp(cCore.r, cPrimary.r, d.life / 0.18);
          iCol[i * 3 + 1] = THREE.MathUtils.lerp(cCore.g, cPrimary.g, d.life / 0.18);
          iCol[i * 3 + 2] = THREE.MathUtils.lerp(cCore.b, cPrimary.b, d.life / 0.18);
        } else {
          const tailT = (d.life - 0.18) / 0.82;
          iCol[i * 3] = THREE.MathUtils.lerp(cPrimary.r, cSecondary.r, tailT) * fade;
          iCol[i * 3 + 1] = THREE.MathUtils.lerp(cPrimary.g, cSecondary.g, tailT) * fade;
          iCol[i * 3 + 2] = THREE.MathUtils.lerp(cPrimary.b, cSecondary.b, tailT) * fade;
        }
      }
      ionGeo.attributes.position.needsUpdate = true;
      ionGeo.attributes.color.needsUpdate = true;

      // Update Volumetric Plume Meshes to match physics & propellant color
      hallRingGlowMat.color.copy(cCore);
      hallRingGlowMat.opacity = (0.28 + massNorm * 0.32) * tel.etaMag;

      outerPlumeConeMat.color.copy(cPrimary);
      outerPlumeConeMat.opacity = state.mode === 'learn' && state.learnStage === 3
        ? 0.04
        : 0.08 + massNorm * 0.15;
      const coneLen = plumeLength * 0.85;
      outerPlumeCone.scale.set(1.0 + divTan * 1.4, 1.0 + divTan * 1.4, coneLen / 9.5);
      outerPlumeCone.position.z = 0.45 + coneLen * 0.5;

      coreSpikeMat.color.copy(cCore);
      // Central shock diamond / collimated core is bright only when magnetic confinement is high
      coreSpikeMat.opacity =
        state.mode === 'learn' && state.learnStage === 3
          ? 0.0
          : Math.max(0.02, (tel.etaMag - 0.65) * 0.75 * (0.4 + massNorm * 0.6));
      coreSpikeMesh.scale.set(1, 1, (plumeLength * 0.72) / 7.5);
      coreSpikeMesh.position.z = 0.5 + plumeLength * 0.36;
    }

    // 8. Update Wall Sputtering Glow & Sparks for Stationary Lab Thruster (When Br is too low relative to Vd)
    const activeErosion = state.mode !== 'game' && isPlasmaNominal ? tel.erosionSeverity : 0.0;
    if (sputterRimGlowMesh) {
      sputterRimGlowMesh.opacity =
        activeErosion > 0.02
          ? activeErosion * (0.55 + 0.25 * Math.sin(elapsed * 12.0))
          : 0.0;
    }

    if (activeErosion > 0.05) {
      sputterPoints.visible = true;
      sputterPointsMat.opacity = Math.min(0.95, activeErosion * 1.15);
      const sPos = sputterGeo.attributes.position.array;
      for (let i = 0; i < SPUTTER_COUNT; i++) {
        const d = sputterData[i];
        d.life += dt * 1.8;
        if (d.life > 1.0) {
          d.life = 0;
          d.angle = Math.random() * Math.PI * 2;
        }
        const currR = d.baseR + d.vr * d.life;
        sPos[i * 3] = Math.cos(d.angle) * currR;
        sPos[i * 3 + 1] = Math.sin(d.angle) * currR;
        sPos[i * 3 + 2] = 0.50 + d.vz * d.life;
      }
      sputterGeo.attributes.position.needsUpdate = true;
    } else {
      sputterPoints.visible = false;
    }

    // 9. Animate Short-Circuit Lightning Arcs (if triggered in Build Mode)
    if (shortCircuitArcGroup.visible) {
      arcLines.forEach((arcObj, idx) => {
        const posArr = arcObj.line.geometry.attributes.position.array;
        const baseA = arcObj.baseAngle + Math.sin(elapsed * 8 + idx) * 0.25;
        for (let s = 0; s <= 10; s++) {
          const frac = s / 10;
          const r = THREE.MathUtils.lerp(1.50, s % 2 === 0 ? 1.05 : 2.45, frac);
          const z = THREE.MathUtils.lerp(-1.15, 0.35, frac);
          const jitter = s === 0 || s === 10 ? 0 : (Math.random() - 0.5) * 0.22;
          posArr[s * 3] = Math.cos(baseA + jitter) * r;
          posArr[s * 3 + 1] = Math.sin(baseA + jitter) * r;
          posArr[s * 3 + 2] = z + jitter * 0.5;
        }
        arcObj.line.geometry.attributes.position.needsUpdate = true;
      });
    }

    // 10. Animate Vector Field Arrows (Axial Ez & Radial Br)
    if (vectorFieldsGroup.visible) {
      const vScale = 0.75 + (state.voltage / 800.0) * 0.55;
      ezArrowMeshes.forEach((item) => {
        const pulse = (elapsed * 2.2 + item.phase) % 1.0;
        item.head.position.z = 0.25 + pulse * 0.98;
        item.group.scale.set(1, 1, vScale);
      });
    }

    // 11. Dynamic Lighting & Post-Processing UnrealBloomPass Intensity Linked to Power (P)
    if (isPlasmaNominal) {
      channelPlasmaLight.color.copy(prop.primaryColor);
      plumeCoreLight.color.copy(prop.secondaryColor);
      const pulseBoostBonus = state.mode === 'game' && state.game.pulseBoostTimer > 0 ? 1.8 : 0.0;
      const powerFactor = Math.min(2.4, Math.max(0.45, tel.powerW / 1500.0)) + pulseBoostBonus;
      channelPlasmaLight.intensity = 1.8 + powerFactor * 1.6;
      plumeCoreLight.intensity = 1.4 + powerFactor * 1.5;
      cathodeGlowLight.intensity = 1.1 + 0.25 * Math.sin(elapsed * 6.0);
      bloomPass.strength =
        0.85 +
        Math.min(1.15, (tel.powerW / 4500.0) * 0.95) +
        (state.mode === 'game' && state.game.pulseBoostTimer > 0 ? 0.65 : 0.0);
    } else {
      channelPlasmaLight.intensity = shortCircuitArcGroup.visible ? 4.0 * Math.random() : 0.15;
      plumeCoreLight.intensity = 0.0;
      cathodeGlowLight.intensity = 0.25;
      bloomPass.strength = shortCircuitArcGroup.visible ? 1.8 : 0.55;
    }

    composer.render();
  }

  // ========================================================================
  // 19. BOOTSTRAP APPLICATION
  // ========================================================================
  initTelemetryChart();
  bindUIEvents();
  plasmaAudio.syncNavbarAudioUI();
  renderBuildChecklist();
  updateCutawayGeometryVisibility();
  updatePhysicsAndTelemetryUI();
  animate();
})();

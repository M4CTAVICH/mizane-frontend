// ─────────────────────────────────────────────────────────────────────────
// OBSIDIAN DARK — iOS 26 "Liquid Glass" theme
//
// Two material layers (Apple HIG):
//  · FUNCTIONAL layer  → Liquid Glass (blur + specular border). Tokens: glass*.
//  · CONTENT layer     → deep matte, low-blur surfaces.          Tokens: surface*.
//
// Text uses Apple vibrancy: pure white primary, translucent-white secondary/muted
// so the glyphs absorb the refracted color passing through the glass.
// ─────────────────────────────────────────────────────────────────────────
export const colors = {
  // Root canvas — true pitch black
  black: "#000000",

  // Brand
  inkBlue: "#0D1B2A", // retained: dark text sitting on gold actions
  parchment: "#F5F0E8",
  justiceGold: "#C9992A",
  goldLight: "#E8BE6A",
  gold: "#E8BE6A", // vibrant accent tuned for black canvas

  // Liquid Glass material (functional layer) — render over a BlurView
  glassFill: "rgba(255,255,255,0.04)", // base translucent body
  glassFillStrong: "rgba(255,255,255,0.08)", // pressed / prominent
  glassBorder: "rgba(255,255,255,0.15)", // specular hairline edge
  glassHighlight: "rgba(255,255,255,0.25)", // top specular light catch

  // Underlying fluid mesh — colored light for the glass to refract
  meshIndigo: "rgba(99,102,241,0.06)", // deep royal indigo
  meshCyan: "rgba(20,184,166,0.04)", // dark emerald / cyan

  // Semantic — brightened for legibility on black
  safe: "#2DD4A7",
  safeLight: "rgba(45,212,167,0.14)",
  caution: "#FB923C",
  cautionLight: "rgba(251,146,60,0.14)",
  danger: "#F87171",
  dangerLight: "rgba(248,113,113,0.14)",

  // Neutral scale — inverted to translucent whites (borders, dividers, fills)
  ink100: "rgba(255,255,255,0.92)",
  ink200: "rgba(255,255,255,0.10)", // hairline borders / dividers
  ink300: "rgba(255,255,255,0.18)",
  ink400: "rgba(255,255,255,0.40)", // = textMuted
  ink500: "rgba(255,255,255,0.55)",
  ink600: "rgba(255,255,255,0.70)",
  ink700: "rgba(255,255,255,0.85)",
  ink800: "#0D1B2A",

  // Surface levels — content layer (deep absorbent, minimal blur)
  surface0: "#000000", // root canvas
  surface1: "#0B0B0D", // raised content base
  surface2: "#141417", // raised content / inset fields

  // Text — Apple vibrancy
  textPrimary: "#FFFFFF", // pure high-gloss white
  textSecondary: "rgba(255,255,255,0.60)", // vibrant secondary
  textMuted: "rgba(255,255,255,0.40)", // tertiary / labels
};

export const typography = {
  fontArabic: "IBMPlexArabic-Regular",
  fontArabicMedium: "IBMPlexArabic-Medium",
  fontArabicSemiBold: "IBMPlexArabic-SemiBold",
  fontLatin: "IBMPlexSans-Regular",
  fontLatinMedium: "IBMPlexSans-Medium",
  fontLatinSemiBold: "IBMPlexSans-SemiBold",
  fontMono: "IBMPlexMono-Regular",
  // System geometric sans — SF Pro on iOS, Roboto/system on Android.
  // Used for Latin labels and large numeric "super-metrics".
  fontSystem: "System",
};

// Modern typography scales (Latin / numerals). Spread into a Text style.
export const textScale = {
  // Large numbers / balances
  superMetric: {
    fontFamily: typography.fontSystem,
    fontWeight: "300" as const,
    fontSize: 48,
    lineHeight: 52,
    letterSpacing: -1.5,
    color: colors.textPrimary,
  },
  // Primary action titles
  actionTitle: {
    fontFamily: typography.fontSystem,
    fontWeight: "500" as const,
    fontSize: 16,
    letterSpacing: -0.3,
    color: colors.textPrimary,
  },
  // Uppercase tracking tokens — labels / category tags
  label: {
    fontFamily: typography.fontSystem,
    fontWeight: "700" as const,
    fontSize: 10,
    letterSpacing: 2, // ≈ tracking-[0.2em] at 10px
    textTransform: "uppercase" as const,
    color: colors.textMuted,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28, // Liquid Glass containers
  full: 999,
};

export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  // Deep drop for floating glass on a black canvas
  glass: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 12,
  },
  // Gold glow for primary actions
  gold: {
    shadowColor: "#E8BE6A",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 10,
  },
};

export const DocumentType = {
  acte_naissance_12s: { label: "عقد الميلاد", icon: "document-text-outline" },
  fiche_familiale: { label: "الوثيقة العائلية", icon: "people-outline" },
  certificat_residence: { label: "شهادة الإقامة", icon: "home-outline" },
  certificat_nationalite: { label: "شهادة الجنسية", icon: "flag-outline" },
  carte_nationale: { label: "بطاقة وطنية", icon: "card-outline" },
  passport: { label: "جواز السفر", icon: "airplane-outline" },
  contrat_travail: { label: "عقد العمل", icon: "briefcase-outline" },
  contrat_bail: { label: "عقد الإيجار", icon: "key-outline" },
  other: { label: "وثيقة أخرى", icon: "document-outline" },
} as const;

export type DocumentTypeKey = keyof typeof DocumentType;

export const PROCEDURES = [
  {
    id: "labor_complaint",
    label: "شكوى عمالية",
    labelFr: "Plainte de travail",
    icon: "briefcase-outline",
    category: "labor",
    duration: "30–90 يومًا",
    steps: [
      "تجميع الوثائق",
      "تقديم الشكوى لمفتشية العمل",
      "انتظار الاستجابة",
      "التقاضي إن لزم",
    ],
    requiredDocs: ["contrat_travail", "certificat_residence"],
    deadlines: [{ name: "تقديم الشكوى", days: 30, fromEvent: "dismissal_date" }],
  },
  {
    id: "passport_renewal",
    label: "تجديد جواز السفر",
    labelFr: "Renouvellement de passeport",
    icon: "airplane-outline",
    category: "documents",
    duration: "2–4 أسابيع",
    steps: ["حجز موعد", "تحضير الوثائق", "المراجعة", "الاستلام"],
    requiredDocs: ["acte_naissance_12s", "carte_nationale", "fiche_familiale"],
    deadlines: [],
  },
  {
    id: "inheritance",
    label: "ملف الإرث",
    labelFr: "Dossier d'héritage",
    icon: "people-outline",
    category: "family",
    duration: "3–6 أشهر",
    steps: ["شهادة الوفاة", "حصر الورثة", "تعيين الموثق", "توزيع التركة"],
    requiredDocs: ["acte_naissance_12s", "fiche_familiale"],
    deadlines: [],
  },
  {
    id: "eviction_response",
    label: "الرد على إشعار إخلاء",
    labelFr: "Réponse à un avis d'expulsion",
    icon: "home-outline",
    category: "housing",
    duration: "15–30 يومًا",
    steps: ["فحص الإشعار", "استشارة قانونية", "تقديم الرد الكتابي", "المتابعة"],
    requiredDocs: ["contrat_bail", "certificat_residence"],
    deadlines: [{ name: "الرد على الإشعار", days: 15, fromEvent: "notice_date" }],
  },
];

export const TEMPLATES = [
  { id: "labor_complaint", label: "شكوى عمالية", labelFr: "Plainte de travail", icon: "briefcase" },
  { id: "eviction_response", label: "رد على إشعار إخلاء", labelFr: "Réponse expulsion", icon: "home" },
  { id: "inheritance_req", label: "طلب إجراء الإرث", labelFr: "Demande d'héritage", icon: "people" },
  { id: "consumer_complaint", label: "شكوى استهلاكية", labelFr: "Plainte consommateur", icon: "cart" },
];

export const SEED_LEGAL_CHUNKS = [
  {
    source: "qanun_amal_90_11",
    article_ref: "المادة 73",
    text: "لا يجوز فصل العامل دون إخطار مسبق مدته 30 يومًا على الأقل وفق ما تنص عليه أحكام القانون رقم 90-11 المتعلق بعلاقات العمل.",
    language: "ar",
  },
  {
    source: "qanun_iqar_90_25",
    article_ref: "المادة 507",
    text: "لا يجوز للمؤجر إخلاء المستأجر قبل انتهاء العقد إلا لأسباب محددة ومنصوص عليها في القانون رقم 90-25 المتعلق بالتوجيه العقاري.",
    language: "ar",
  },
  {
    source: "qanun_madani_1975",
    article_ref: "المادة 106",
    text: "العقد شريعة المتعاقدين ولا يجوز نقضه ولا تعديله إلا باتفاق الطرفين أو للأسباب التي يقررها القانون.",
    language: "ar",
  },
];

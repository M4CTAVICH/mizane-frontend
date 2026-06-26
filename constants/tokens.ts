// ─────────────────────────────────────────────────────────────────────────
// JUSTICE DARK — a calm, trustworthy dark theme for a legal companion.
//
// Principles (Apple HIG):
//  · Depth comes from NEUTRAL elevation + contrast, never colored glows.
//  · Gold is a precious accent — used sparingly for intent, never for decoration.
//  · One soft material (glass) reserved for 1–2 floating chrome surfaces;
//    everything else is flat matte content with a hairline edge.
//  · The canvas is neutral near-black — no off-brand ambient color.
//
// Token layers:
//  · CONTENT layer  → flat matte surfaces.            Tokens: surface*.
//  · CHROME layer   → soft glass (floating bars only). Tokens: glass*.
// ─────────────────────────────────────────────────────────────────────────
export const colors = {
  // Root canvas
  black: "#000000",

  // Brand
  inkBlue: "#1A1408", // warm near-black ink that sits on gold actions
  parchment: "#F5F0E8",
  justiceGold: "#C9992A", // deep seal gold
  goldLight: "#E8BE6A",
  gold: "#E0B64D", // primary gold accent (Figma)
  goldDeep: "#C79A3A", // quieter gold — eyebrows, Latin subtitles
  goldGradTop: "#E9C156", // gold action gradient — top stop
  goldGradBottom: "#CDA23C", // gold action gradient — bottom stop

  // Figma card material — a matte translucent body that lets the colored
  // ambient glow read faintly through, over the FluidMesh backdrop.
  cardFill: "rgba(28,28,30,0.55)",
  cardBorder: "rgba(255,255,255,0.10)",
  cardHighlight: "rgba(255,255,255,0.06)", // inset top light catch

  // Glass material (chrome layer only) — render over a BlurView.
  // Calmed from the old values so the glass reads as a quiet surface,
  // not a shiny showpiece.
  glassFill: "rgba(255,255,255,0.05)", // base translucent body
  glassFillStrong: "rgba(255,255,255,0.09)", // pressed / prominent
  glassBorder: "rgba(255,255,255,0.10)", // hairline edge (was 0.15)
  glassHighlight: "rgba(255,255,255,0.14)", // top light catch (was 0.25)

  // Retained for token compatibility — ambient mesh is now neutral (see FluidMesh).
  meshIndigo: "rgba(255,255,255,0.02)",
  meshCyan: "rgba(255,255,255,0.015)",

  // Semantic — legible on dark, not candy-bright
  safe: "#34D399",
  safeLight: "rgba(52,211,153,0.12)",
  caution: "#F59E0B",
  cautionLight: "rgba(245,158,11,0.12)",
  danger: "#F87171",
  dangerLight: "rgba(248,113,113,0.12)",

  // Neutral scale — translucent whites (borders, dividers, fills)
  ink100: "rgba(255,255,255,0.92)",
  ink200: "rgba(255,255,255,0.08)", // hairline borders / dividers
  ink300: "rgba(255,255,255,0.14)",
  ink400: "rgba(255,255,255,0.40)", // = textMuted
  ink500: "rgba(255,255,255,0.55)",
  ink600: "rgba(255,255,255,0.70)",
  ink700: "rgba(255,255,255,0.85)",
  ink800: "#0D1B2A",

  // Surface levels — neutral elevation steps (clear, visible hierarchy on black)
  surface0: "#000000", // root canvas
  surface1: "#121214", // raised content base
  surface2: "#1B1B1F", // raised card / inset field
  surface3: "#26262B", // active / pressed inset

  // Text
  textPrimary: "#F5F5F7",
  textSecondary: "rgba(245,245,247,0.62)",
  textMuted: "#8E8E93",
};

export const typography = {
  fontArabic: "IBMPlexArabic-Regular",
  fontArabicMedium: "IBMPlexArabic-Medium",
  fontArabicSemiBold: "IBMPlexArabic-SemiBold",
  fontLatin: "IBMPlexSans-Regular",
  fontLatinMedium: "IBMPlexSans-Medium",
  fontLatinSemiBold: "IBMPlexSans-SemiBold",
  fontMono: "IBMPlexMono-Regular",
  // Brand display face — calligraphic Aref Ruqaa. Used for the wordmark and
  // large Arabic page headings (welcome, language, OTP).
  fontDisplay: "ArefRuqaa-Bold",
  fontDisplayRegular: "ArefRuqaa-Regular",
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
  // Quiet eyebrow label — Latin captions / category tags.
  // No uppercase transform (meaningless in Arabic) and only a whisper of
  // tracking, so it reads as a calm label rather than decoration.
  label: {
    fontFamily: typography.fontLatinMedium,
    fontWeight: "500" as const,
    fontSize: 11,
    letterSpacing: 0.4,
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
  lg: 16, // cards / content surfaces (was 20)
  xl: 24, // floating glass chrome (was 28)
  full: 999,
};

// Neutral elevation only — depth comes from soft black drop shadows, never
// colored glows. `gold` and `glass` keys are retained for compatibility but
// now resolve to calm neutral elevations.
export const shadow = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 4,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.34,
    shadowRadius: 18,
    elevation: 8,
  },
  // Floating chrome (tab bar, header pills) — a soft neutral drop, not a halo.
  glass: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  // Compatibility alias — primary actions now use neutral elevation, no glow.
  gold: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
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

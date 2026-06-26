export const colors = {
  // Brand
  inkBlue: "#0D1B2A",
  parchment: "#F5F0E8",
  justiceGold: "#C9992A",
  goldLight: "#E8BE6A",

  // Semantic
  safe: "#1A6B4A",
  safeLight: "#E8F5EE",
  caution: "#B85C00",
  cautionLight: "#FEF3E8",
  danger: "#991B1B",
  dangerLight: "#FEF2F2",

  // Neutral scale
  ink100: "#F5F0E8",
  ink200: "#E8E0D0",
  ink300: "#C5B99A",
  ink400: "#8A7A65",
  ink500: "#5C4F3A",
  ink600: "#3A2E22",
  ink700: "#1F1710",
  ink800: "#0D1B2A",

  // Surface levels (light mode)
  surface0: "#FAF7F2",
  surface1: "#FFFFFF",
  surface2: "#F0EBE0",

  // Text (light mode)
  textPrimary: "#1A1208",
  textSecondary: "#5C4F3A",
  textMuted: "#8A7A65",
};

export const typography = {
  fontArabic: "IBMPlexArabic-Regular",
  fontArabicMedium: "IBMPlexArabic-Medium",
  fontArabicSemiBold: "IBMPlexArabic-SemiBold",
  fontLatin: "IBMPlexSans-Regular",
  fontLatinMedium: "IBMPlexSans-Medium",
  fontLatinSemiBold: "IBMPlexSans-SemiBold",
  fontMono: "IBMPlexMono-Regular",
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

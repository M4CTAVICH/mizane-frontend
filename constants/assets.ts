// Central registry for bundled Figma imagery. Keeping the require() calls in one
// place lets screens reference artwork by a stable key instead of threading
// relative paths through the component tree.
import type { ImageSourcePropType } from "react-native";
import type { DocumentTypeKey } from "./tokens";

// Assistant hero orb.
export const ORB_IMAGE: ImageSourcePropType = require("../assets/images/figma/orb.jpg");

// Vault hero backdrop (marble texture behind the summary metric).
export const VAULT_HERO_IMAGE: ImageSourcePropType = require("../assets/images/figma/vault-hero.jpg");

// Welcome screen backdrop (mosque interior).
export const WELCOME_BG_IMAGE: ImageSourcePropType = require("../assets/images/figma/welcome-bg.jpg");

// Document thumbnails, keyed by document type. Falls back to the family photo.
export const DOC_THUMBNAILS: Partial<Record<DocumentTypeKey, ImageSourcePropType>> = {
  acte_naissance_12s: require("../assets/images/figma/doc-naissance.jpg"),
  certificat_residence: require("../assets/images/figma/doc-residence.jpg"),
  carte_nationale: require("../assets/images/figma/doc-nationale.jpg"),
  fiche_familiale: require("../assets/images/figma/doc-familiale.jpg"),
};

export const DOC_THUMBNAIL_FALLBACK: ImageSourcePropType = require("../assets/images/figma/doc-familiale.jpg");

// Procedure cover art, keyed by procedure id.
export const PROCEDURE_IMAGES: Record<string, ImageSourcePropType> = {
  labor_complaint: require("../assets/images/figma/proc-labor.jpg"),
  passport_renewal: require("../assets/images/figma/proc-passport.jpg"),
  inheritance: require("../assets/images/figma/proc-inheritance.jpg"),
  eviction_response: require("../assets/images/figma/proc-eviction.jpg"),
};

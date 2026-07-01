import { SAMPLE_CONTRACT, SAMPLE_CONTRACT_TITLE } from "./sample-contract";

/**
 * Catalog of loadable contracts for the workspace picker. The first entry is the
 * hand-crafted NDA bundled in code so it loads instantly (and is tuned to make
 * every workflow produce visible output). The rest are real contracts sourced
 * from CUAD (Contract Understanding Atticus Dataset, CC BY 4.0), served as static
 * text files from `public/samples/` and fetched on demand — see `public/samples/SOURCE.md`.
 */
export interface ContractSample {
  id: string;
  label: string;
  /** Short note shown under the picker, e.g. agreement type + source. */
  description: string;
  /** Inline text for the bundled default; undefined for fetched files. */
  text?: string;
  /** Public path for CUAD files; undefined for the bundled default. */
  path?: string;
}

export const CONTRACT_SAMPLES: ContractSample[] = [
  {
    id: "sample-nda",
    label: `${SAMPLE_CONTRACT_TITLE} (demo)`,
    description: "Bundled demo NDA — salted with flaggable terms.",
    text: SAMPLE_CONTRACT,
  },
  // Real contracts from CUAD (CC BY 4.0). See public/samples/SOURCE.md.
  {
    id: "cuad-consulting",
    label: "Consulting Agreement — Aduro Biotech",
    description: "Real EX-10.7 consulting agreement (CUAD).",
    path: "/samples/consulting-agreement.txt",
  },
  {
    id: "cuad-hosting",
    label: "Web Hosting Agreement — YourNetPlus",
    description: "Real EX-2.1 website build & hosting agreement (CUAD).",
    path: "/samples/hosting-agreement.txt",
  },
  {
    id: "cuad-maintenance",
    label: "Software Maintenance Agreement — HerImports",
    description: "Real EX-10.14 software maintenance agreement (CUAD).",
    path: "/samples/software-maintenance-agreement.txt",
  },
  {
    id: "cuad-promotion",
    label: "Promotion Agreement — Vnue Inc.",
    description: "Real EX-10.1 promotion agreement (CUAD).",
    path: "/samples/promotion-agreement.txt",
  },
  {
    id: "cuad-endorsement",
    label: "Endorsement Agreement — Holiday RV / Good Sam",
    description: "Real EX-10.13 endorsement agreement (CUAD).",
    path: "/samples/endorsement-agreement.txt",
  },
];

/** Resolve a sample's full text: inline for the bundled default, otherwise fetched. */
export async function loadSampleText(sample: ContractSample): Promise<string> {
  if (sample.text !== undefined) return sample.text;
  if (!sample.path) throw new Error(`Sample "${sample.id}" has no text or path.`);
  const response = await fetch(sample.path);
  if (!response.ok) throw new Error(`Could not load "${sample.label}".`);
  return response.text();
}

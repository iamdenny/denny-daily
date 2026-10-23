import { practiceCountries } from "./logic.js";
export const packs = [
  {
    id: "world",
    name: "World",
    codes: null,
  },
  {
    id: "europe",
    name: "Europe",
    codes: [
      "GB",
      "FR",
      "DE",
      "IT",
      "ES",
      "PT",
      "SE",
      "NO",
      "FI",
      "DK",
      "CH",
      "GR",
      "TR",
      "UA",
      "PL",
    ],
  },
  {
    id: "asia",
    name: "Asia",
    codes: ["JP", "KR", "IN", "CN", "TH", "VN", "ID", "PH", "SG", "MY"],
  },
  {
    id: "americas",
    name: "Americas",
    codes: ["US", "CA", "BR", "AR", "MX", "CL", "CO", "PE"],
  },
  {
    id: "africa",
    name: "Africa",
    codes: ["ZA", "KE", "NG", "EG", "MA"],
  },
  {
    id: "northern-europe",
    name: "Northern Europe",
    codes: ["GB", "SE", "NO", "FI", "DK"],
  },
  {
    id: "mediterranean",
    name: "Mediterranean",
    codes: ["FR", "IT", "ES", "GR", "TR", "EG", "MA"],
  },
  {
    id: "asia-pacific",
    name: "Asia Pacific",
    codes: ["JP", "KR", "CN", "TH", "VN", "ID", "PH", "SG", "MY", "AU", "NZ"],
  },
];

// Country-specific practice always includes its focus flag. The original daily pool is unchanged.
export const focusPacks = practiceCountries.map(([code, name]) => {
  const regional = packs.find(pack => pack.codes?.includes(code));
  const codes = [...new Set([code, ...(regional?.codes || ["JP", "KR", "CN", "IN", "TH"])])];
  return { id: "focus-" + code.toLowerCase(), name, focusCode: code, codes };
});
packs.push(...focusPacks);

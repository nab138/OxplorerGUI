// Taken from https://github.com/mechanical-advantage/AdvantageScope/
export const CRESCENDO_2024 = {
  topLeft: [513, 78],
  bottomRight: [3327, 1475],
  widthInches: 651.25,
  heightInches: 323.25,
};

export const OXPLORER_VERSION = "0.9.11";

export const REPOSITORY = "nab138/OxplorerGUI";
export const GITHUB_BASE_URL = "https://github.com/" + REPOSITORY;

export const defaultTemplates = [
  {
    type: "group",
    id: "deadline",
  },
  {
    type: "group",
    id: "race",
  },
  {
    type: "group",
    id: "parallel",
  },
  {
    type: "group",
    id: "sequence",
  },
  {
    type: "conditional",
    id: "not",
    parameters: {},
    maxChildren: 1,
  },
  {
    type: "conditional",
    id: "and",
    parameters: {},
    maxChildren: -1,
  },
  {
    type: "conditional",
    id: "or",
    parameters: {},
    maxChildren: -1,
  },
];

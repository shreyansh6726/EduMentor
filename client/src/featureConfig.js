const yesNoOptions = [
  ["1", "Yes"],
  ["0", "No"]
];

const codeOptions = (values) =>
  values.map((value) => [String(value), `Option ${value}`]);

const maritalStatusOptions = [
  ["1", "Single"],
  ["2", "Married"],
  ["3", "Widower"],
  ["4", "Divorced"],
  ["5", "Facto union"],
  ["6", "Legally separated"]
];

const genderOptions = [
  ["1", "Male"],
  ["0", "Female"]
];

const qualificationOptions = [
  ["1", "Secondary education"],
  ["2", "Higher education - bachelor's degree"],
  ["3", "Higher education - degree"],
  ["4", "Higher education - master's degree"],
  ["5", "Higher education - doctorate"],
  ["6", "Frequency of higher education"],
  ["9", "12th year - not completed"],
  ["10", "11th year - not completed"],
  ["12", "Other - 11th year"],
  ["14", "10th year"],
  ["15", "10th year - not completed"],
  ["19", "Basic education - 3rd cycle"],
  ["26", "7th year"],
  ["27", "2nd cycle of general high school"],
  ["29", "9th year - not completed"],
  ["30", "8th year"],
  ["31", "7th year"],
  ["33", "6th year"],
  ["34", "5th year"],
  ["35", "4th year"],
  ["36", "3rd year"],
  ["37", "2nd year"],
  ["38", "1st year"],
  ["39", "Other - basic education"],
  ["40", "Technical course"],
  ["41", "Professional course"],
  ["42", "Technological specialization course"],
  ["43", "Higher education - unknown level"]
];

const nationalityOptions = [
  ["1", "Portuguese"],
  ["2", "German"],
  ["6", "Spanish"],
  ["11", "Italian"],
  ["13", "Dutch"],
  ["14", "English"],
  ["17", "Lithuanian"],
  ["21", "Angolan"],
  ["22", "Cape Verdean"],
  ["24", "Guinean"],
  ["25", "Mozambican"],
  ["26", "Santomean"],
  ["32", "Turkish"],
  ["41", "Brazilian"],
  ["62", "Romanian"],
  ["100", "Moldovan"],
  ["101", "Mexican"],
  ["103", "Ukrainian"],
  ["105", "Russian"],
  ["106", "Cuban"],
  ["108", "Colombian"],
  ["109", "Venezuelan"]
];

const occupationOptions = [
  ["0", "Student"],
  ["1", "Legislative, executive and management professional"],
  ["2", "Intellectual and scientific professional"],
  ["3", "Technician and associate professional"],
  ["4", "Administrative staff"],
  ["5", "Personal services, security and sales worker"],
  ["6", "Agriculture, forestry and fishery worker"],
  ["9", "Unskilled worker"],
  ["10", "Armed forces professional"],
  ["90", "Other situation"],
  ["99", "Unknown or not specified"],
  ["101", "Armed forces officer"],
  ["102", "Armed forces sergeant"],
  ["103", "Armed forces corporal"],
  ["112", "Administrative and commercial services director"],
  ["114", "Hospitality, retail and other services director"],
  ["121", "Science and engineering specialist"],
  ["122", "Health professional"],
  ["123", "Teacher"],
  ["124", "Business and administration specialist"],
  ["125", "Information and communications technology specialist"],
  ["131", "Science and engineering technician"],
  ["132", "Health associate professional"],
  ["134", "Legal, social and cultural associate professional"],
  ["141", "Office and administrative associate professional"],
  ["142", "Customer services associate professional"],
  ["143", "Business services associate professional"],
  ["144", "Administrative and specialized services worker"],
  ["151", "Personal services worker"],
  ["152", "Sales worker"],
  ["153", "Personal care worker"],
  ["154", "Protective services worker"],
  ["161", "Agricultural worker"],
  ["163", "Forestry and fishery worker"],
  ["171", "Building and related trades worker"],
  ["172", "Metal, machinery and related trades worker"],
  ["173", "Electrical and electronic trades worker"],
  ["174", "Food, wood and garment trades worker"],
  ["175", "Other craft and related trades worker"],
  ["181", "Stationary plant and machine operator"],
  ["182", "Mobile plant operator"],
  ["183", "Driver and mobile equipment operator"],
  ["192", "Food preparation assistant"],
  ["193", "Street vendor and related worker"],
  ["194", "Other elementary occupation"]
];

export const groups = [
  {
    title: "Student profile",
    fields: [
      { name: "Marital Status", label: "Marital status", type: "select", options: maritalStatusOptions },
      {
        name: "Application mode",
        label: "Application mode",
        type: "select",
        options: [
          ["1", "1st phase - general contingent"],
          ["2", "Ordinance 612/93"],
          ["5", "1st phase - special contingent"],
          ["7", "Holders of other higher courses"],
          ["10", "Ordinance 854-B/99"],
          ["15", "International student"],
          ["16", "1st phase - special contingent"],
          ["17", "2nd phase - general contingent"],
          ["18", "3rd phase - general contingent"],
          ["26", "1st phase - general contingent"],
          ["27", "2nd phase - general contingent"],
          ["39", "Over 23 years old"],
          ["42", "Transfer"],
          ["43", "Change of course"],
          ["44", "Diploma holders"],
          ["51", "Change of institution/course"],
          ["53", "Short-cycle higher education"],
          ["57", "Technological specialization diploma holder"]
        ]
      },
      {
        name: "Course",
        label: "Course",
        type: "select",
        options: [
          ["33", "Biofuel Production Technologies"],
          ["171", "Animation and Multimedia Design"],
          ["801", "Social Service (evening)"],
          ["900", "Agronomy"],
          ["907", "Communication Design"],
          ["908", "Veterinary Nursing"],
          ["911", "Informatics Engineering"],
          ["913", "Equinculture"],
          ["914", "Management"],
          ["923", "Social Service"],
          ["925", "Tourism"],
          ["950", "Nursing"],
          ["955", "Oral Hygiene"],
          ["977", "Advertising and Marketing Management"],
          ["985", "Basic Education"],
          ["999", "Journalism and Communication"]
        ]
      },
      { name: "Daytime/evening attendance", label: "Daytime / evening attendance", type: "select", options: [["1", "Daytime"], ["0", "Evening"]] },
      { name: "Previous qualification", label: "Previous qualification", type: "select", options: qualificationOptions },
      { name: "Nacionality", label: "Nationality", type: "select", options: nationalityOptions },
      { name: "Mother's qualification", label: "Mother's qualification", type: "select", options: qualificationOptions },
      { name: "Father's qualification", label: "Father's qualification", type: "select", options: qualificationOptions },
      { name: "Mother's occupation", label: "Mother's occupation", type: "select", options: occupationOptions },
      { name: "Father's occupation", label: "Father's occupation", type: "select", options: occupationOptions },
      { name: "Gender", label: "Gender", type: "select", options: genderOptions },
      { name: "Displaced", label: "Displaced", type: "select", options: yesNoOptions },
      { name: "Educational special needs", label: "Educational special needs", type: "select", options: yesNoOptions },
      { name: "Debtor", label: "Debtor", type: "select", options: yesNoOptions },
      { name: "Tuition fees up to date", label: "Tuition fees up to date", type: "select", options: yesNoOptions },
      { name: "Scholarship holder", label: "Scholarship holder", type: "select", options: yesNoOptions },
      { name: "International", label: "International", type: "select", options: yesNoOptions }
    ]
  },
  {
    title: "Admission and performance",
    fields: [
      { name: "Application order", label: "Application order", type: "number", min: 0, step: 1 },
      { name: "Previous qualification (grade)", label: "Previous qualification grade", type: "number", min: 0, step: 0.01 },
      { name: "Admission grade", label: "Admission grade", type: "number", min: 0, step: 0.01 },
      { name: "Age at enrollment", label: "Age at enrollment", type: "number", min: 16, step: 1 },
      { name: "Curricular units 1st sem (credited)", label: "1st semester: credited units", type: "number", min: 0, step: 1 },
      { name: "Curricular units 1st sem (enrolled)", label: "1st semester: enrolled units", type: "number", min: 0, step: 1 },
      { name: "Curricular units 1st sem (evaluations)", label: "1st semester: evaluations", type: "number", min: 0, step: 1 },
      { name: "Curricular units 1st sem (approved)", label: "1st semester: approved units", type: "number", min: 0, step: 1 },
      { name: "Curricular units 1st sem (grade)", label: "1st semester: grade", type: "number", min: 0, step: 0.01 },
      { name: "Curricular units 1st sem (without evaluations)", label: "1st semester: without evaluations", type: "number", min: 0, step: 1 }
    ]
  },
  {
    title: "Economic context",
    fields: [
      { name: "Unemployment rate", label: "Unemployment rate", type: "number", step: 0.01 },
      { name: "Inflation rate", label: "Inflation rate", type: "number", step: 0.01 },
      { name: "GDP", label: "GDP", type: "number", step: 0.01 }
    ]
  }
];

export const featureNames = groups.flatMap((group) =>
  group.fields.map((field) => field.name)
);

export function emptyFeatures() {
  return Object.fromEntries(featureNames.map((name) => [name, ""]));
}

export const groups = [
  {
    title: "Student profile",
    fields: [
      ["Marital Status", "Marital status"],
      ["Application mode", "Application mode"],
      ["Course", "Course"],
      ["Daytime/evening attendance", "Daytime / evening attendance"],
      ["Previous qualification", "Previous qualification"],
      ["Nacionality", "Nationality"],
      ["Mother's qualification", "Mother's qualification"],
      ["Father's qualification", "Father's qualification"],
      ["Mother's occupation", "Mother's occupation"],
      ["Father's occupation", "Father's occupation"],
      ["Gender", "Gender"],
      ["Displaced", "Displaced"],
      ["Educational special needs", "Educational special needs"],
      ["Debtor", "Debtor"],
      ["Tuition fees up to date", "Tuition fees up to date"],
      ["Scholarship holder", "Scholarship holder"],
      ["International", "International"]
    ]
  },
  {
    title: "Admission and performance",
    fields: [
      ["Application order", "Application order"],
      ["Previous qualification (grade)", "Previous qualification grade"],
      ["Admission grade", "Admission grade"],
      ["Age at enrollment", "Age at enrollment"],
      ["Curricular units 1st sem (credited)", "1st semester: credited units"],
      ["Curricular units 1st sem (enrolled)", "1st semester: enrolled units"],
      ["Curricular units 1st sem (evaluations)", "1st semester: evaluations"],
      ["Curricular units 1st sem (approved)", "1st semester: approved units"],
      ["Curricular units 1st sem (grade)", "1st semester: grade"],
      ["Curricular units 1st sem (without evaluations)", "1st semester: without evaluations"]
    ]
  },
  {
    title: "Economic context",
    fields: [
      ["Unemployment rate", "Unemployment rate"],
      ["Inflation rate", "Inflation rate"],
      ["GDP", "GDP"]
    ]
  }
];

export const featureNames = groups.flatMap((group) =>
  group.fields.map(([name]) => name)
);

export function emptyFeatures() {
  return Object.fromEntries(featureNames.map((name) => [name, ""]));
}

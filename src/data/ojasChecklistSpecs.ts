// ============================================================
// Official OJAS Document Specifications & Guidelines
// Extracted from Verified Gujarat Recruitment Intelligence (v2)
// ============================================================

export interface OjasDocumentSpec {
  id: string;
  nameEn: string;
  nameGu: string;
  specsEn: string;
  specsGu: string;
  applicableCategories: string[]; // e.g. ["ALL"], ["SEBC"], ["EWS"], ["SC", "ST"]
  isMandatoryAtOjasApply: boolean;
  ojasInstructionEn: string;
  ojasInstructionGu: string;
}

export const OJAS_STANDARD_DOCUMENTS: OjasDocumentSpec[] = [
  {
    id: 'photo',
    nameEn: 'Passport Size Photograph (Recent)',
    nameGu: 'પાસપોર્ટ સાઇઝનો તાજેતરનો ફોટોગ્રાફ',
    specsEn: 'JPG / JPEG format, Max 15 KB size, Dimensions 5 cm x 3.6 cm, White background preferred.',
    specsGu: 'JPG ફોર્મેટ, વધુમાં વધુ 15 KB સાઇઝ, 5 cm x 3.6 cm, સફેદ બેકગ્રાઉન્ડ જરૂરી.',
    applicableCategories: ['ALL'],
    isMandatoryAtOjasApply: true,
    ojasInstructionEn: 'OJAS will reject files exceeding 15KB. Use standard photo compressor before uploading.',
    ojasInstructionGu: '૧૫ KB થી મોટી ફાઇલ OJAS સ્વીકારશે નહીં. અપલોડ કરતાં પહેલાં સાઇઝ ચકાસો.',
  },
  {
    id: 'signature',
    nameEn: 'Candidate Signature Scan',
    nameGu: 'ઉમેદવારની સહીનું સ્કેન',
    specsEn: 'JPG / JPEG format, Max 15 KB size, Dimensions 2.5 cm x 7.5 cm, Black/Blue ball pen on white paper.',
    specsGu: 'JPG ફોર્મેટ, વધુમાં વધુ 15 KB સાઇઝ, 2.5 cm x 7.5 cm, સફેદ કાગળ પર કાળી/વાદળી પેનથી સહી.',
    applicableCategories: ['ALL'],
    isMandatoryAtOjasApply: true,
    ojasInstructionEn: 'Crop tightly around signature to prevent aspect ratio distortion on the admit card.',
    ojasInstructionGu: 'હોલ ટિકિટ પર સહી યોગ્ય દેખાય તે માટે સહી ફરતે વધારાની જગ્યા ક્રોપ કરો.',
  },
  {
    id: 'ncl_certificate',
    nameEn: 'Non-Creamy Layer Certificate (Parishisth-K)',
    nameGu: 'નોન-ક્રીમીલેયર પ્રમાણપત્ર (પરિશિષ્ટ-ક)',
    specsEn: 'Valid for 3 financial years as per Gujarat Govt rules. Check issue date on the certificate.',
    specsGu: 'ગુજરાત સરકારના ઠરાવ મુજબ ૩ નાણાકીય વર્ષ માટે માન્ય. પરિશિષ્ટ-ક (ગુજરાતી) હોવું ફરજિયાત.',
    applicableCategories: ['SEBC'],
    isMandatoryAtOjasApply: true,
    ojasInstructionEn: 'Enter exact certificate number and date of issue on OJAS application form.',
    ojasInstructionGu: 'OJAS ફોર્મમાં પ્રમાણપત્ર ક્રમાંક અને જારી કર્યાની તારીખ અચૂક દાખલ કરો.',
  },
  {
    id: 'ews_certificate',
    nameEn: 'EWS Eligibility Certificate (Parishisth-G)',
    nameGu: 'આર્થિક નબળા વર્ગ (EWS) પ્રમાણપત્ર (પરિશિષ્ટ-ગ)',
    specsEn: 'Valid for 3 years from date of issue as per Gujarat State Social Justice Dept.',
    specsGu: 'જારી થયા તારીખથી ૩ વર્ષની માન્યતા ધરાવતું પરિશિષ્ટ-ગ પ્રમાણપત્ર.',
    applicableCategories: ['EWS'],
    isMandatoryAtOjasApply: true,
    ojasInstructionEn: 'Certificate must be issued prior to the closing date of application.',
    ojasInstructionGu: 'અરજી કરવાની છેલ્લી તારીખ પહેલાં પ્રમાણપત્ર નીકળેલું હોવું જોઈએ.',
  },
  {
    id: 'caste_certificate',
    nameEn: 'SC / ST Caste Certificate',
    nameGu: 'અનુસૂચિત જાતિ / જનજાતિ જાતિ પ્રમાણપત્ર',
    specsEn: 'Issued by competent authority (Mamlatdar / TDO / Dy Collector) with valid Barcode.',
    specsGu: 'સક્ષમ અધિકારી દ્વારા અપાયેલ બારકોડ વાળું જાતિનું પ્રમાણપત્ર.',
    applicableCategories: ['SC', 'ST'],
    isMandatoryAtOjasApply: true,
    ojasInstructionEn: 'Keep digital copy ready for document verification stage.',
    ojasInstructionGu: 'ડોક્યુમેન્ટ વેરિફિકેશન સમયે અસલ પ્રમાણપત્ર રજૂ કરવાનું રહેશે.',
  },
  {
    id: 'ccc_certificate',
    nameEn: 'C.C.C. Computer Knowledge Certificate',
    nameGu: 'સી.સી.સી. (CCC) કોમ્પ્યુટર પ્રમાણપત્ર',
    specsEn: 'From recognized University / SPIPA / ITI / Gujarat University or 10th/12th Computer subject.',
    specsGu: 'માન્ય યુનિવર્સિટી, સ્પિપા (SPIPA) અથવા ધોરણ ૧૦/૧૨ માં કોમ્પ્યુટર વિષય પાસનું પ્રમાણપત્ર.',
    applicableCategories: ['ALL'],
    isMandatoryAtOjasApply: false,
    ojasInstructionEn: 'If selected, submission is mandatory before appointment/training probation.',
    ojasInstructionGu: "અરજી વખતે 'હા' દર્શાવવું અને નિમણૂક પહેલાં પ્રમાણપત્ર સબમિટ કરવું જરૂરી.",
  },
  {
    id: 'degree_certificate',
    nameEn: 'Graduation Degree & Final Semester Marksheet',
    nameGu: 'સ્નાતક ડિગ્રી પ્રમાણપત્ર અને છેલ્લા સેમેસ્ટર માર્કશીટ',
    specsEn: 'From UGC / AICTE recognized university. CGPA to Percentage conversion formula certificate if applicable.',
    specsGu: 'UGC માન્ય યુનિવર્સિટીનું સ્નાતક ડિગ્રી સર્ટિફિકેટ અને ટકાવારી ગણતરી પત્રક.',
    applicableCategories: ['ALL'],
    isMandatoryAtOjasApply: true,
    ojasInstructionEn: 'Enter total obtained marks, total marks, percentage, and trial count accurately.',
    ojasInstructionGu: 'કુલ ગુણ, મેળવેલ ગુણ, ટકાવારી અને ટ્રાયલ સંખ્યા ચોક્કસ ભરો.',
  },
  {
    id: 'domicile',
    nameEn: 'Gujarat Domicile / Birth Certificate',
    nameGu: 'ગુજરાત ડોમિસાઇલ / જન્મનું પ્રમાણપત્ર',
    specsEn: 'Proof of residence in Gujarat for category reservations & women reservation quota.',
    specsGu: 'ગુજરાતના રહેવાસી હોવાના પુરાવા તરીકે અનામત અને વયમર્યાદા છૂટછાટ માટે જરૂરી.',
    applicableCategories: ['ALL'],
    isMandatoryAtOjasApply: false,
    ojasInstructionEn: 'Required during Document Verification (DV) stage.',
    ojasInstructionGu: 'રૂબરૂ ચકાસણી સમયે સક્ષમ અધિકારી સમક્ષ રજૂ કરવું.',
  },
];

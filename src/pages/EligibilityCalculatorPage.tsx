// ============================================================
// Dedicated GAD Eligibility Calculator Page (Ported from JobDirect v2)
// Interactive Gujarat Civil Services Age & Eligibility Calculator
// Deterministic rule engine: exact age, relaxation breakdown & verdicts
// ============================================================

import { useState, useMemo } from 'react';
import {
  Calculator,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Calendar,
  GraduationCap,
  Shield,
  User,
  Info,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { DEMO_JOBS } from '../data/jobs';
import type { Job } from '../types/job';
import { useSavedJobs } from '../contexts/SavedJobsContext';
import { useLanguage } from '../contexts/LanguageContext';
import { JobDetailModal } from '../components/JobDetailModal';

type CategoryType = 'GENERAL' | 'EWS' | 'SEBC' | 'SC' | 'ST';
type GenderType = 'MALE' | 'FEMALE';
type EducationType = 'ANY' | 'SSC_10TH' | 'HSC_12TH' | 'GRADUATE' | 'ENGINEERING' | 'COMMERCE_CA' | 'MEDICAL_NURSING';

interface CalculatorProfile {
  birthYear: number;
  birthMonth: number; // 1-12
  birthDay: number;   // 1-31
  gender: GenderType;
  category: CategoryType;
  isGujaratDomicile: boolean;
  isDifferentlyAbled: boolean;
  isExServiceman: boolean;
  exServiceYears: number;
  hasCccCertificate: boolean;
  education: EducationType;
}

type VerdictStatus = 'ELIGIBLE' | 'AGE_OVER_LIMIT' | 'AGE_UNDER_LIMIT' | 'EDUCATION_MISMATCH';

interface JobVerdict {
  job: Job;
  status: VerdictStatus;
  calculatedYears: number;
  calculatedMonths: number;
  calculatedDays: number;
  totalRelaxation: number;
  permissibleMaxAge: number;
  appliedRelaxations: string[];
  appliedRelaxationsGu: string[];
  reasonEn: string;
  reasonGu: string;
}

export function EligibilityCalculatorPage() {
  const { isJobSaved, saveJob, unsaveJob } = useSavedJobs();
  const { isGujarati, t } = useLanguage();
  const [selectedJobModal, setSelectedJobModal] = useState<Job | null>(null);

  // Profile State (Defaults match v2)
  const [profile, setProfile] = useState<CalculatorProfile>({
    birthYear: 1999,
    birthMonth: 6,
    birthDay: 15,
    gender: 'MALE',
    category: 'SEBC',
    isGujaratDomicile: true,
    isDifferentlyAbled: false,
    isExServiceman: false,
    exServiceYears: 0,
    hasCccCertificate: true,
    education: 'GRADUATE',
  });

  const [filterTab, setFilterTab] = useState<'ALL' | 'ELIGIBLE' | 'AGE_OVER' | 'AGE_UNDER' | 'EDU_MISMATCH'>('ALL');

  // Education hierarchy for matching
  const eduRank: Record<EducationType, number> = {
    ANY: 0,
    SSC_10TH: 1,
    HSC_12TH: 2,
    GRADUATE: 3,
    COMMERCE_CA: 3,
    ENGINEERING: 3,
    MEDICAL_NURSING: 3,
  };

  // Evaluate all jobs dynamically against profile
  const verdicts: JobVerdict[] = useMemo(() => {
    return DEMO_JOBS.map((job) => {
      // 1. Cutoff date calculation
      const cutoffStr = job.ageReferenceDate || job.closingDate || '2026-11-15';
      const [cYear, cMonth, cDay] = cutoffStr.split('-').map((v) => parseInt(v, 10));

      let years = cYear - profile.birthYear;
      let months = cMonth - profile.birthMonth;
      let days = cDay - profile.birthDay;

      if (days < 0) {
        months -= 1;
        days += 30;
      }
      if (months < 0) {
        years -= 1;
        months += 12;
      }

      // 2. GAD Statutory Relaxation
      let relaxation = 0;
      const relEn: string[] = [];
      const relGu: string[] = [];

      if (!profile.isGujaratDomicile && profile.category !== 'GENERAL') {
        relEn.push('Non-Gujarat Domicile: Treated as Unreserved/General Category');
        relGu.push('ગુજરાતના વતની ન હોવાથી સામાન્ય (બિનઅનામત) કેટેગરી તરીકે ગણાશે');
      } else {
        if (profile.category === 'GENERAL') {
          if (profile.gender === 'FEMALE') {
            relaxation += 5;
            relEn.push('General Category Female: +5 Years (GAD Rule)');
            relGu.push('સામાન્ય વર્ગની મહિલા ઉમેદવાર: +૫ વર્ષ છૂટછાટ');
          }
        } else {
          // Reserved categories: SEBC, EWS, SC, ST
          if (profile.gender === 'MALE') {
            relaxation += 5;
            relEn.push(`${profile.category} Male: +5 Years statutory relaxation`);
            relGu.push(`${profile.category} પુરુષ: +૫ વર્ષ સરકારી છૂટછાટ`);
          } else {
            relaxation += 10;
            relEn.push(`${profile.category} Female: +10 Years (+5 reserved + 5 woman quota)`);
            relGu.push(`${profile.category} મહિલા: +૧૦ વર્ષ છૂટછાટ (+૫ અનામત + ૫ મહિલા)`);
          }
        }
      }

      if (profile.isDifferentlyAbled) {
        relaxation += 10;
        relEn.push('Differently Abled (PwD): +10 Years');
        relGu.push('દિવ્યાંગ ઉમેદવાર (PwD): +૧૦ વર્ષ છૂટછાટ');
      }

      if (profile.isExServiceman && profile.exServiceYears > 0) {
        const exRel = profile.exServiceYears + 3;
        relaxation += exRel;
        relEn.push(`Ex-Servicemen: Service (${profile.exServiceYears} yrs) + 3 Years = +${exRel} Years`);
        relGu.push(`માજી સૈનિક: નોકરી (${profile.exServiceYears} વર્ષ) + ૩ વર્ષ = +${exRel} વર્ષ છૂટછાટ`);
      }

      const minAge = job.minAge ?? (job.ageLimit?.min) ?? 18;
      const baseMax = job.maxAgeBase ?? (job.ageLimit?.max) ?? 35;
      const permissibleMax = Math.min(45, baseMax + relaxation);

      // 3. Status determination
      let status: VerdictStatus = 'ELIGIBLE';
      let reasonEn = `Eligible: Candidate is ${years} yrs, ${months} mos (Permissible max: ${permissibleMax} yrs)`;
      let reasonGu = `લાયક: ઉમેદવારની ઉંમર ${years} વર્ષ, ${months} મહિના (માન્ય લઘુત્તમ: ${minAge}, મહત્તમ: ${permissibleMax} વર્ષ)`;

      // Age checks
      if (years < minAge) {
        status = 'AGE_UNDER_LIMIT';
        reasonEn = `Under Minimum Age: Candidate is ${years} yrs (${minAge} yrs required on ${cutoffStr})`;
        reasonGu = `લઘુત્તમ વયમર્યાદા કરતાં નાની ઉંમર: કટ-ઓફ તારીખે ${years} વર્ષ (${minAge} વર્ષ લઘુત્તમ જરૂરી)`;
      } else if (years > permissibleMax) {
        status = 'AGE_OVER_LIMIT';
        reasonEn = `Over Age Limit: Candidate is ${years} yrs (Exceeds maximum ${permissibleMax} yrs with +${relaxation} yr relaxation)`;
        reasonGu = `મહત્તમ વયમર્યાદા વટાવી ગયેલ: ઉમેદવારની ઉંમર ${years} વર્ષ (+${relaxation} વર્ષ છૂટછાટ સાથે મહત્તમ ${permissibleMax} વર્ષ)`;
      } else {
        // Education checks
        const reqEdu = (job.requiredEdu || []).map((e) => e.toUpperCase());
        const userEduRank = eduRank[profile.education];
        let eduMatch = true;

        if (reqEdu.includes('GRADUATE') && userEduRank < 3) {
          eduMatch = false;
        } else if (reqEdu.includes('HSC') && userEduRank < 2) {
          eduMatch = false;
        }

        if (!eduMatch) {
          status = 'EDUCATION_MISMATCH';
          reasonEn = `Educational Requirement Not Met: Post requires ${reqEdu.join('/') || 'higher qualification'}`;
          reasonGu = `શૈક્ષણિક લાયકાત અપૂરતી: આ જગ્યા માટે ${reqEdu.join(' અથવા ') || 'ઉચ્ચ લાયકાત'} જરૂરી છે`;
        }
      }

      return {
        job,
        status,
        calculatedYears: years,
        calculatedMonths: months,
        calculatedDays: days,
        totalRelaxation: relaxation,
        permissibleMaxAge: permissibleMax,
        appliedRelaxations: relEn,
        appliedRelaxationsGu: relGu,
        reasonEn,
        reasonGu,
      };
    });
  }, [profile]);

  // Counts
  const counts = useMemo(() => {
    return {
      all: verdicts.length,
      eligible: verdicts.filter((v) => v.status === 'ELIGIBLE').length,
      ageOver: verdicts.filter((v) => v.status === 'AGE_OVER_LIMIT').length,
      ageUnder: verdicts.filter((v) => v.status === 'AGE_UNDER_LIMIT').length,
      eduMismatch: verdicts.filter((v) => v.status === 'EDUCATION_MISMATCH').length,
    };
  }, [verdicts]);

  // Filtered list
  const filteredVerdicts = useMemo(() => {
    switch (filterTab) {
      case 'ELIGIBLE':
        return verdicts.filter((v) => v.status === 'ELIGIBLE');
      case 'AGE_OVER':
        return verdicts.filter((v) => v.status === 'AGE_OVER_LIMIT');
      case 'AGE_UNDER':
        return verdicts.filter((v) => v.status === 'AGE_UNDER_LIMIT');
      case 'EDU_MISMATCH':
        return verdicts.filter((v) => v.status === 'EDUCATION_MISMATCH');
      default:
        return verdicts;
    }
  }, [verdicts, filterTab]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <Calculator size={22} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {t('Gujarat GAD Eligibility Calculator', 'ગુજરાત વહીવટી સેવા પાત્રતા કેલ્ક્યુલેટર')}
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t(
              'Real-time age and criteria evaluation under General Administration Department (GAD) Gujarat statutory rules',
              'સામાન્ય વહીવટ વિભાગ (GAD) ના સત્તાવાર પરિપત્ર અને નિયમો અનુસાર સચોટ વયમર્યાદા અને પાત્રતા ચકાસણી'
            )}
          </p>
        </div>

        {/* Quick Result Pill */}
        <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-4 py-2.5 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {counts.eligible}
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
              {t('Opportunities You Match', 'તમે લાયક ધરાવતા પદો')}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
              {t(`Out of ${counts.all} verified Gujarat recruitments`, `કુલ ${counts.all} પ્રમાણિત ભરતીઓમાંથી`)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Profile Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
              <User size={18} className="text-blue-600 dark:text-blue-400" />
              <span>{t('Candidate Profile Attributes', 'ઉમેદવાર પ્રોફાઇલ વિગતો')}</span>
            </h2>

            <div className="space-y-4">
              {/* Date of Birth Inputs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Calendar size={14} className="text-blue-600" />
                  <span>{t('Date of Birth (DOB)', 'જન્મ તારીખ')}</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Day (દિવસ)</label>
                    <select
                      value={profile.birthDay}
                      onChange={(e) => setProfile({ ...profile, birthDay: parseInt(e.target.value, 10) })}
                      className="w-full mt-0.5 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Month (મહિનો)</label>
                    <select
                      value={profile.birthMonth}
                      onChange={(e) => setProfile({ ...profile, birthMonth: parseInt(e.target.value, 10) })}
                      className="w-full mt-0.5 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                    >
                      {[
                        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
                      ].map((m, idx) => (
                        <option key={m} value={idx + 1}>
                          {m} ({idx + 1})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-semibold">Year (વર્ષ)</label>
                    <select
                      value={profile.birthYear}
                      onChange={(e) => setProfile({ ...profile, birthYear: parseInt(e.target.value, 10) })}
                      className="w-full mt-0.5 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-white"
                    >
                      {Array.from({ length: 35 }, (_, i) => 2008 - i).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Gender & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('Gender', 'જાતિ / લિંગ')}
                  </label>
                  <div className="flex gap-1.5">
                    {(['MALE', 'FEMALE'] as GenderType[]).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setProfile({ ...profile, gender: g })}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                          profile.gender === g
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {g === 'MALE' ? t('Male', 'પુરુષ') : t('Female', 'મહિલા')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {t('Social Category', 'કેટેગરી / અનામત')}
                  </label>
                  <select
                    value={profile.category}
                    onChange={(e) => setProfile({ ...profile, category: e.target.value as CategoryType })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white"
                  >
                    <option value="GENERAL">{t('General (Open)', 'સામાન્ય (બિનઅનામત)')}</option>
                    <option value="SEBC">{t('SEBC / OBC (Parishisth-K)', 'સા.શૈ.પ.વર્ગ (SEBC/OBC)')}</option>
                    <option value="EWS">{t('EWS (Parishisth-G)', 'આર્થિક નબળા વર્ગ (EWS)')}</option>
                    <option value="SC">{t('SC (Scheduled Caste)', 'અનુસૂચિત જાતિ (SC)')}</option>
                    <option value="ST">{t('ST (Scheduled Tribe)', 'અનુસૂચિત જનજાતિ (ST)')}</option>
                  </select>
                </div>
              </div>

              {/* Education Level */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <GraduationCap size={15} className="text-blue-600" />
                  <span>{t('Highest Completed Qualification', 'સર્વોચ્ચ શૈક્ષણિક લાયકાત')}</span>
                </label>
                <select
                  value={profile.education}
                  onChange={(e) => setProfile({ ...profile, education: e.target.value as EducationType })}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-slate-900 dark:text-white"
                >
                  <option value="SSC_10TH">{t('10th Pass (SSC)', 'ધોરણ ૧૦ પાસ (SSC)')}</option>
                  <option value="HSC_12TH">{t('12th Pass (HSC General / Science)', 'ધોરણ ૧૨ પાસ (HSC)')}</option>
                  <option value="GRADUATE">{t("Bachelor's Degree (Any Stream - B.A./B.Sc./B.Com)", 'સ્નાતક પદવી (કોઈપણ શાખા)')}</option>
                  <option value="ENGINEERING">{t('Engineering (B.E. / B.Tech / Diploma)', 'ઇજનેરી (ડિગ્રી/ડિપ્લોમા)')}</option>
                  <option value="COMMERCE_CA">{t('Commerce / CA / M.Com', 'કોમર્સ / હિસાબી શાખા')}</option>
                  <option value="MEDICAL_NURSING">{t('Medical / Nursing / MBBS', 'તબીબી / નર્સિંગ')}</option>
                </select>
              </div>

              {/* Toggles & Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {t('Gujarat Domicile', 'ગુજરાતના વતની / Domicile')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t('Required for reservation quota & relaxation', 'અનામત છૂટછાટ માટે ગુજરાતનું વતન હોવું જરૂરી')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.isGujaratDomicile}
                    onChange={(e) => setProfile({ ...profile, isGujaratDomicile: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {t('Differently Abled (PwD) +10 Yrs', 'દિવ્યાંગ ઉમેદવાર (PwD) +૧૦ વર્ષ')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t('Permanent Disability Certificate ≥ 40%', '૪૦% કે તેથી વધુ દિવ્યાંગતા પ્રમાણપત્ર')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.isDifferentlyAbled}
                    onChange={(e) => setProfile({ ...profile, isDifferentlyAbled: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 cursor-pointer">
                  <div className="text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200">
                      {t('CCC Computer Certificate', 'સી.સી.સી. (CCC) પ્રમાણપત્ર')}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {t('Recognized university or 10th/12th computer', 'સરકાર માન્ય સંસ્થાનું કોમ્પ્યુટર સર્ટિ')}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={profile.hasCccCertificate}
                    onChange={(e) => setProfile({ ...profile, hasCccCertificate: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                </label>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="text-xs">
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {t('Ex-Serviceman (માજી સૈનિક)', 'માજી સૈનિક / Ex-Serviceman')}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {t('Armed forces service period + 3 years', 'સંરક્ષણ દળ સેવા + ૩ વર્ષ છૂટ')}
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.isExServiceman}
                      onChange={(e) => setProfile({ ...profile, isExServiceman: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </label>

                  {profile.isExServiceman && (
                    <div className="flex items-center gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        {t('Service Duration (Years):', 'સેવા કરેલ વર્ષો:')}
                      </span>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={profile.exServiceYears}
                        onChange={(e) => setProfile({ ...profile, exServiceYears: parseInt(e.target.value, 10) || 0 })}
                        className="w-16 px-2 py-1 text-xs border rounded bg-white dark:bg-slate-900 font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* GAD Statutory Rules Banner */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-blue-600 dark:text-blue-400" />
              <span>{t('Gujarat GAD Statutory Age Relaxation Matrix', 'ગુજરાત સામાન્ય વહીવટ વિભાગ વય છૂટછાટ નિયમો')}</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-blue-800 dark:text-blue-300">
              <li>{t('Reserved Male (SEBC/SC/ST/EWS): +5 Years', 'અનામત પુરુષ (SEBC/SC/ST/EWS): +૫ વર્ષ')}</li>
              <li>{t('General Female: +5 Years', 'સામાન્ય મહિલા ઉમેદવાર: +૫ વર્ષ')}</li>
              <li>{t('Reserved Female: +10 Years (+5 reserved + 5 woman)', 'અનામત મહિલા: +૧૦ વર્ષ (+૫ અનામત + ૫ મહિલા)')}</li>
              <li>{t('Differently Abled (PwD): +10 Years', 'દિવ્યાંગ ઉમેદવાર (PwD): +૧૦ વર્ષ')}</li>
              <li>{t('Maximum permissible age is strictly capped at 45 Years', 'મહત્તમ વયમર્યાદા ૪૫ વર્ષથી વધુ માન્ય નથી')}</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Live Recruiment Verdicts (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Verdict Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterTab === 'ALL'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t('All Notices', 'તમામ ભરતીઓ')} ({counts.all})
            </button>
            <button
              onClick={() => setFilterTab('ELIGIBLE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === 'ELIGIBLE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <CheckCircle size={13} />
              <span>{t('Eligible', 'પાત્ર ધરાવતા')} ({counts.eligible})</span>
            </button>
            <button
              onClick={() => setFilterTab('AGE_OVER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === 'AGE_OVER'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              }`}
            >
              <XCircle size={13} />
              <span>{t('Over Age', 'વય વટાવી ગયેલ')} ({counts.ageOver})</span>
            </button>
            <button
              onClick={() => setFilterTab('EDU_MISMATCH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                filterTab === 'EDU_MISMATCH'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
              }`}
            >
              <AlertTriangle size={13} />
              <span>{t('Qualification Needed', 'લાયકાત ખૂટે')} ({counts.eduMismatch})</span>
            </button>
          </div>

          {/* Verdict Cards List */}
          <div className="space-y-3">
            {filteredVerdicts.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <Info size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {t('No recruitment notices found in this filter category.', 'આ કેટેગરીમાં કોઈ ભરતી નોટિસ ઉપલબ્ધ નથી.')}
                </p>
              </div>
            ) : (
              filteredVerdicts.map((item) => {
                const { job, status, appliedRelaxations, appliedRelaxationsGu, reasonEn, reasonGu } = item;
                const isItemSaved = isJobSaved(job.id);

                return (
                  <div
                    key={job.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      status === 'ELIGIBLE'
                        ? 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-400 shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* Board & Status Badges */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {job.agency || 'GUJARAT'}
                          </span>

                          {status === 'ELIGIBLE' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1">
                              <CheckCircle size={11} />
                              <span>{t('Likely Eligible', 'સંપૂર્ણ પાત્ર')}</span>
                            </span>
                          )}

                          {status === 'AGE_OVER_LIMIT' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 flex items-center gap-1">
                              <XCircle size={11} />
                              <span>{t('Age Limit Exceeded', 'વયમર્યાદા સમાપ્ત')}</span>
                            </span>
                          )}

                          {status === 'AGE_UNDER_LIMIT' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300 flex items-center gap-1">
                              <AlertTriangle size={11} />
                              <span>{t('Under Minimum Age', 'લઘુત્તમ વય કરતાં નાની')}</span>
                            </span>
                          )}

                          {status === 'EDUCATION_MISMATCH' && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 flex items-center gap-1">
                              <AlertTriangle size={11} />
                              <span>{t('Education Mismatch', 'શૈક્ષણિક લાયકાત મેળ નથી')}</span>
                            </span>
                          )}

                          <span className="text-[11px] text-slate-400">
                            {job.totalVacancies.toLocaleString('en-IN')} {t('Vacancies', 'જગ્યા')}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                          {isGujarati && job.titleGuj ? job.titleGuj : job.title}
                        </h3>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-gujarati">
                          {job.department}
                        </div>
                      </div>

                      {/* Bookmark button */}
                      <button
                        onClick={() => (isItemSaved ? unsaveJob(job.id) : saveJob(job.id))}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700"
                        title={isItemSaved ? 'Remove from Saved' : 'Save to Vault'}
                      >
                        {isItemSaved ? (
                          <BookmarkCheck size={18} className="text-emerald-600" />
                        ) : (
                          <Bookmark size={18} />
                        )}
                      </button>
                    </div>

                    {/* Verdict Explanation Box */}
                    <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {t(reasonEn, reasonGu)}
                      </div>

                      {/* Applied Relaxation Pills */}
                      {appliedRelaxations.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {t('Relaxations Applied:', 'મંજૂર છૂટછાટો:')}
                          </span>
                          {(isGujarati ? appliedRelaxationsGu : appliedRelaxations).map((rel, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold"
                            >
                              {rel}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Action Bar */}
                    <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="text-[11px] text-slate-400">
                        {t('Closing Date:', 'છેલ્લી તારીખ:')} <span className="font-semibold text-slate-600 dark:text-slate-300">{job.closingDate || job.importantDates.applicationEnd}</span>
                      </div>

                      <button
                        onClick={() => setSelectedJobModal(job)}
                        className="flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <span>{t('View Full Notification', 'સંપૂર્ણ વિગત જુઓ')}</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedJobModal && (
        <JobDetailModal
          job={selectedJobModal}
          onClose={() => setSelectedJobModal(null)}
        />
      )}
    </div>
  );
}

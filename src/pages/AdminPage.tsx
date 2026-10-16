// ============================================================
// Admin & Publishing Studio Page
// Allows verified officers & editors to publish recruitment notices
// and corrigenda alerts directly to the backend REST API.
// ============================================================
import { useState } from 'react';
import { ShieldCheck, PlusCircle, AlertCircle, FileText, CheckCircle2, Key, RefreshCw } from 'lucide-react';
import { DEMO_JOBS } from '../data/jobs';

export function AdminPage() {
  const [apiKey, setApiKey] = useState('jobdirect-secret-key-2026');
  const [activeTab, setActiveTab] = useState<'recruitment' | 'corrigendum'>('recruitment');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Recruitment form state
  const [recForm, setRecForm] = useState(() => ({
    advtNo: '',
    agency: 'GSSSB',
    agencyFull: 'Gujarat Subordinate Service Selection Board',
    title: '',
    titleGuj: '',
    vacancies: 100,
    minAge: 18,
    maxAgeBase: 35,
    requiredEdu: 'GRADUATE',
    closingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    officialBoardUrl: 'https://ojas.gujarat.gov.in',
    officialApplyUrl: 'https://ojas.gujarat.gov.in',
    eduSummaryEn: '',
    eduSummaryGuj: '',
    feeSummary: '₹500 (General) / ₹400 (Reserved)',
    englishExplanation: '',
    gujaratiExplanation: '',
  }));

  // Corrigendum form state
  const [corrForm, setCorrForm] = useState({
    jobId: DEMO_JOBS[0]?.id || '',
    category: 'ELIGIBILITY',
    type: 'Qualification Clarification',
    sectionCitation: 'Notice #1, Clause 2.1',
    beforeText: '',
    afterText: '',
    summaryGuj: '',
    newClosingDate: '',
  });

  const agencies = [
    { code: 'GSSSB', name: 'Gujarat Subordinate Service Selection Board' },
    { code: 'GPSC', name: 'Gujarat Public Service Commission' },
    { code: 'GPRB', name: 'Gujarat Police Recruitment Board' },
    { code: 'GPSSB', name: 'Gujarat Panchayat Service Selection Board' },
    { code: 'GHC', name: 'High Court of Gujarat' },
    { code: 'GUVNL', name: 'Dakshin Gujarat Vij Company Ltd (DGVCL / PGVCL / GUVNL)' },
    { code: 'SMC', name: 'Surat Municipal Corporation' },
  ];

  async function handlePublishRecruitment(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    const payload = {
      ...recForm,
      vacancies: Number(recForm.vacancies),
      minAge: Number(recForm.minAge),
      maxAgeBase: Number(recForm.maxAgeBase),
      requiredEdu: [recForm.requiredEdu],
      publishedDate: new Date().toISOString().slice(0, 10),
      corrigenda: [],
      checklist: [
        'OJAS One Time Registration (OTR) profile active',
        'Relevant degree/diploma certificates & marksheets',
        'Valid category / Non-Creamy Layer certificate',
      ],
      timeline: [
        { step: 'Notification Published', date: new Date().toLocaleDateString('en-GB'), status: 'done', cite: recForm.advtNo },
        { step: 'Online Application Deadline', date: recForm.closingDate, status: 'current', cite: 'OJAS Portal' },
      ],
    };

    try {
      const res = await fetch('/api/recruitments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      setStatusMessage({
        type: 'success',
        text: `Successfully published recruitment "${data.record?.title || recForm.title}"! Server record created.`,
      });
      // Reset form
      setRecForm((prev) => ({
        ...prev,
        advtNo: '',
        title: '',
        titleGuj: '',
        eduSummaryEn: '',
        eduSummaryGuj: '',
        englishExplanation: '',
        gujaratiExplanation: '',
      }));
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Publish error: ${err.message}. If running purely client-side without API server, verify server is started at port 3000.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePublishCorrigendum(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/recruitments/${corrForm.jobId}/corrigenda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(corrForm),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(err.error || `HTTP error ${res.status}`);
      }

      await res.json();
      setStatusMessage({
        type: 'success',
        text: `Corrigendum "${corrForm.type}" successfully linked to recruitment ID "${corrForm.jobId}"!`,
      });
      setCorrForm((prev) => ({
        ...prev,
        beforeText: '',
        afterText: '',
        summaryGuj: '',
        newClosingDate: '',
      }));
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `Corrigendum publish error: ${err.message}.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Studio Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800 px-2.5 py-1 rounded-full mb-2">
              <ShieldCheck size={14} /> Official Verified Publisher Studio
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Recruitment &amp; Corrigendum CMS Studio
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Publish verified Gujarat recruitment notices and official Corrigenda (સુધારા જાહેરાત)
              with direct clause-level citations to the production REST API.
            </p>
          </div>

          {/* API Key setting */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3 flex flex-col gap-1 w-full sm:w-auto">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Key size={12} className="text-amber-400" /> Admin API Secret Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-48"
              placeholder="x-api-key"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => { setActiveTab('recruitment'); setStatusMessage(null); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'recruitment'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <PlusCircle size={15} /> Publish New Recruitment
        </button>
        <button
          onClick={() => { setActiveTab('corrigendum'); setStatusMessage(null); }}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'corrigendum'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <AlertCircle size={15} /> Publish Official Corrigendum
        </button>
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <div>{statusMessage.text}</div>
        </div>
      )}

      {/* Tab 1: New Recruitment */}
      {activeTab === 'recruitment' && (
        <form onSubmit={handlePublishRecruitment} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Recruiting Agency
              </label>
              <select
                value={recForm.agency}
                onChange={(e) => {
                  const ag = agencies.find((a) => a.code === e.target.value);
                  setRecForm((prev) => ({
                    ...prev,
                    agency: e.target.value,
                    agencyFull: ag ? ag.name : prev.agencyFull,
                  }));
                }}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-blue-500"
              >
                {agencies.map((a) => (
                  <option key={a.code} value={a.code}>{a.code} — {a.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Official Advertisement Number (Advt No.) *
              </label>
              <input
                type="text"
                required
                value={recForm.advtNo}
                onChange={(e) => setRecForm({ ...recForm, advtNo: e.target.value })}
                placeholder="e.g. GSSSB/202627/465"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Post Title (English) *
              </label>
              <input
                type="text"
                required
                value={recForm.title}
                onChange={(e) => setRecForm({ ...recForm, title: e.target.value })}
                placeholder="e.g. Assistant Conservator of Forests & Range Forest Officer"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Post Title (Gujarati)
              </label>
              <input
                type="text"
                value={recForm.titleGuj}
                onChange={(e) => setRecForm({ ...recForm, titleGuj: e.target.value })}
                placeholder="e.g. મદદનીશ વન સંરક્ષક અને રેન્જ ફોરેસ્ટ ઓફિસર (વર્ગ-૨)"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Total Vacancies *
              </label>
              <input
                type="number"
                required
                min={1}
                value={recForm.vacancies}
                onChange={(e) => setRecForm({ ...recForm, vacancies: Number(e.target.value) })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Application Deadline (Closing Date) *
              </label>
              <input
                type="date"
                required
                value={recForm.closingDate}
                onChange={(e) => setRecForm({ ...recForm, closingDate: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Age Range (Min – Base Max)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={recForm.minAge}
                  onChange={(e) => setRecForm({ ...recForm, minAge: Number(e.target.value) })}
                  className="w-20 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  placeholder="Min"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="number"
                  value={recForm.maxAgeBase}
                  onChange={(e) => setRecForm({ ...recForm, maxAgeBase: Number(e.target.value) })}
                  className="w-20 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                  placeholder="Max"
                />
                <span className="text-xs text-slate-400">yrs (GAD relaxations apply)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Primary Education Category
              </label>
              <select
                value={recForm.requiredEdu}
                onChange={(e) => setRecForm({ ...recForm, requiredEdu: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              >
                <option value="GRADUATE">Graduate (Any Stream)</option>
                <option value="HSC">12th Pass (HSC)</option>
                <option value="TECH_DIPLOMA">Technical Diploma / Engineering</option>
                <option value="NURSING">B.Sc. Nursing / Medical / Lab</option>
                <option value="COMMERCE_PG">Commerce / PG Degree</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Official Apply Portal URL
              </label>
              <input
                type="url"
                value={recForm.officialApplyUrl}
                onChange={(e) => setRecForm({ ...recForm, officialApplyUrl: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Fee Summary
              </label>
              <input
                type="text"
                value={recForm.feeSummary}
                onChange={(e) => setRecForm({ ...recForm, feeSummary: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Educational Requirement Note (English)
              </label>
              <textarea
                rows={2}
                value={recForm.eduSummaryEn}
                onChange={(e) => setRecForm({ ...recForm, eduSummaryEn: e.target.value })}
                placeholder="Bachelor's degree in Botany, Chemistry, Geology, Mathematics, Physics or Statistics."
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Candidate Guidance &amp; Verification Note (Gujarati)
              </label>
              <textarea
                rows={2}
                value={recForm.gujaratiExplanation}
                onChange={(e) => setRecForm({ ...recForm, gujaratiExplanation: e.target.value })}
                placeholder="સત્તાવાર જાહેરાત મુજબ લાયકાત ધરાવતા ઉમેદવારો OJAS પોર્ટલ પરથી ઓનલાઈન અરજી કરી શકશે."
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <PlusCircle size={16} />}
              Publish Verified Recruitment Notice
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: New Corrigendum */}
      {activeTab === 'corrigendum' && (
        <form onSubmit={handlePublishCorrigendum} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Select Existing Recruitment to Modify *
              </label>
              <select
                value={corrForm.jobId}
                onChange={(e) => setCorrForm({ ...corrForm, jobId: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-medium"
              >
                {DEMO_JOBS.map((j) => (
                  <option key={j.id} value={j.id}>
                    [{j.agency}] {j.advtNo} — {j.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Corrigendum Category
              </label>
              <select
                value={corrForm.category}
                onChange={(e) => setCorrForm({ ...corrForm, category: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              >
                <option value="ELIGIBILITY">Eligibility &amp; Qualification Rule</option>
                <option value="DEADLINE">Deadline Extension</option>
                <option value="VACANCY">Vacancy / Seat Breakdown Revision</option>
                <option value="REFUND_EXAM">Exam Schedule / Fee Refund Notice</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Section Citation / Reference Document *
              </label>
              <input
                type="text"
                required
                value={corrForm.sectionCitation}
                onChange={(e) => setCorrForm({ ...corrForm, sectionCitation: e.target.value })}
                placeholder="e.g. Corrigendum Notice #2, Clause 4.1"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Change Type / Headline *
              </label>
              <input
                type="text"
                required
                value={corrForm.type}
                onChange={(e) => setCorrForm({ ...corrForm, type: e.target.value })}
                placeholder="e.g. Last date for online application extended by 10 days"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Before Text (Original clause / Previous status)
              </label>
              <textarea
                rows={3}
                value={corrForm.beforeText}
                onChange={(e) => setCorrForm({ ...corrForm, beforeText: e.target.value })}
                placeholder="Original Notice: Closing date was 15 Oct 2026."
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                After Text (Updated clause / New status) *
              </label>
              <textarea
                rows={3}
                required
                value={corrForm.afterText}
                onChange={(e) => setCorrForm({ ...corrForm, afterText: e.target.value })}
                placeholder="Updated Notice: Extended closing date is 25 Oct 2026 (23:59 IST)."
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Gujarati Summary (ઉમેદવારો માટે સ્પષ્ટતા)
              </label>
              <input
                type="text"
                value={corrForm.summaryGuj}
                onChange={(e) => setCorrForm({ ...corrForm, summaryGuj: e.target.value })}
                placeholder="સુધારા જાહેરાત મુજબ અરજી કરવાની છેલ્લી તારીખ ૨૫ ઓક્ટોબર સુધી લંબાવવામાં આવી છે."
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Optional: New Closing Date
              </label>
              <input
                type="date"
                value={corrForm.newClosingDate}
                onChange={(e) => setCorrForm({ ...corrForm, newClosingDate: e.target.value })}
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? <RefreshCw className="animate-spin" size={16} /> : <FileText size={16} />}
              Publish Verified Corrigendum Alert
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

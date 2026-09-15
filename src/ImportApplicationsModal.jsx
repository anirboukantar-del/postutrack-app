import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Layers, 
  RefreshCw, 
  FileUp, 
  ArrowRight,
  Info,
  Building2,
  Briefcase
} from 'lucide-react';
import { parseApplicationFile } from './applicationDataImporter';

export default function ImportApplicationsModal({
  isOpen,
  onClose,
  onImportComplete,
  existingApplications = [],
  t,
  lang = 'fr'
}) {
  const [dragActive, setDragActive] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parsedResult, setParsedResult] = useState(null);
  const [importMode, setImportMode] = useState('merge'); // 'merge' or 'replace'
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    setIsParsing(true);
    setParseError(null);
    try {
      const result = await parseApplicationFile(file);
      if (!result.applications || result.applications.length === 0) {
        setParseError(t.importErrorNoApplications || "Aucune candidature valide n'a pu être extraite de ce fichier. Vérifiez les en-têtes de colonnes (Entreprise, Poste, Date...).");
        setParsedResult(null);
      } else {
        setParsedResult(result);
      }
    } catch (err) {
      setParseError(err.message || (t.importErrorInvalidFile || "Fichier invalide ou illisible."));
      setParsedResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedResult || !parsedResult.applications) return;
    onImportComplete({
      importedApps: parsedResult.applications,
      mode: importMode,
      fileName: parsedResult.fileName,
      count: parsedResult.applications.length
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setParsedResult(null);
    setParseError(null);
    setIsParsing(false);
    setImportMode('merge');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-left">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b dark:border-gray-700 flex justify-between items-center bg-gray-50/70 dark:bg-gray-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileUp size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                {t.importApplicationsModalTitle || "Importer des candidatures"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t.importApplicationsModalSubtitle || "Compatible avec Excel (.xlsx, .xls), CSV, TSV et JSON"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {!parsedResult ? (
            /* Upload Dropzone View */
            <div className="space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-4 ring-blue-500/10 scale-[0.99]' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50/50 dark:hover:bg-gray-750'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.tsv,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="w-14 h-14 mx-auto mb-3.5 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {isParsing ? (
                    <RefreshCw className="animate-spin" size={26} />
                  ) : (
                    <Upload size={26} />
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-200">
                  {isParsing 
                    ? (t.importParsing || "Analyse du fichier en cours...")
                    : (t.importDropzoneText || "Glissez-déposez votre fichier ici, ou cliquez pour parcourir")}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  {t.importSupportedFormats || "Excel (.xlsx, .xls), CSV (.csv), TSV (.tsv) ou JSON (.json)"}
                </p>

                {/* Format Badges */}
                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                  <span className="px-2.5 py-1 text-2xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                    <FileSpreadsheet size={12} /> Excel (.xlsx, .xls)
                  </span>
                  <span className="px-2.5 py-1 text-2xs font-semibold rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1">
                    <FileText size={12} /> CSV / TSV
                  </span>
                  <span className="px-2.5 py-1 text-2xs font-semibold rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 flex items-center gap-1">
                    <FileText size={12} /> JSON Backup
                  </span>
                </div>
              </div>

              {/* Parsing Error Box */}
              {parseError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div>
                    <p className="font-semibold">{isEn ? "Import Error" : "Erreur d'importation"}</p>
                    <p className="mt-0.5 text-xs opacity-90">{parseError}</p>
                  </div>
                </div>
              )}

              {/* Supported Columns Info Guide */}
              <div className="p-3.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-gray-700 dark:text-gray-300">
                  <Info size={14} className="text-blue-500" />
                  <span>{isEn ? "Supported Columns & Smart Defaults" : "Colonnes supportées & Détection automatique"}</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                  {isEn 
                    ? "Recognized columns: Company, Role, Status, Date, Contract, Platform/Source, URL, Location, Notes. Missing platform defaults to 'Unknown'. Missing status without rejection date is marked as 'Ghosted'."
                    : "Colonnes reconnues : Entreprise, Poste, Statut, Date, Contrat, Plateforme/Source, URL, Lieu, Notes. Plateforme absente = 'Inconnue'. Statut absent sans date de refus = 'Ghosted'."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-2xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700/60">
                  <div>• <strong className="text-gray-700 dark:text-gray-200">Entreprise</strong> (Company)</div>
                  <div>• <strong className="text-gray-700 dark:text-gray-200">Poste</strong> (Position, Role)</div>
                  <div>• <strong className="text-gray-700 dark:text-gray-200">Statut</strong> (Status, Stage)</div>
                  <div>• <strong className="text-gray-700 dark:text-gray-200">Date</strong> (YYYY-MM-DD, DD/MM/YYYY)</div>
                  <div>• <strong className="text-gray-700 dark:text-gray-200">Contrat</strong> (CDI, CDD, Stage...)</div>
                  <div>• <strong className="text-gray-700 dark:text-gray-200">Source</strong> (LinkedIn, WTTJ, Inconnue...)</div>
                </div>
              </div>
            </div>
          ) : (
            /* Parsed Preview and Confirmation View */
            <div className="space-y-4">
              {/* File summary pill */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-lg">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-emerald-900 dark:text-emerald-200">
                      {parsedResult.applications.length} {isEn ? "applications parsed successfully" : "candidatures détectées avec succès"}
                    </p>
                    <p className="text-2xs text-emerald-700 dark:text-emerald-400">
                      {parsedResult.fileName} • {parsedResult.format}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 underline cursor-pointer"
                >
                  {isEn ? "Choose another file" : "Changer de fichier"}
                </button>
              </div>

              {/* Import Mode Options */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                  {isEn ? "Import Strategy" : "Mode d'importation"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setImportMode('merge')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'merge'
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <Layers size={14} className="text-blue-600" />
                        {t.importModeMerge || "Fusionner (Recommandé)"}
                      </span>
                    </div>
                    <p className="text-2xs text-gray-500 dark:text-gray-400 mt-1 pl-5">
                      {t.importModeMergeDesc || "Ajoute les nouvelles candidatures à votre liste actuelle (" + existingApplications.length + " actuelles)."}
                    </p>
                  </div>

                  <div
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-2 ring-amber-500/20'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <RefreshCw size={13} className="text-amber-600" />
                        {t.importModeReplace || "Remplacer tout"}
                      </span>
                    </div>
                    <p className="text-2xs text-gray-500 dark:text-gray-400 mt-1 pl-5">
                      {t.importModeReplaceDesc || "Supprime les candidatures actuelles et applique uniquement le fichier importé."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                    {t.importPreviewColumns || "Aperçu des candidatures détectées :"}
                  </span>
                  <span className="text-2xs text-gray-500 dark:text-gray-400">
                    {Math.min(5, parsedResult.applications.length)} / {parsedResult.applications.length} {isEn ? "first rows" : "premières lignes"}
                  </span>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50/50 dark:bg-gray-900/40 max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-2xs uppercase tracking-wider">
                        <th className="px-3 py-2">{t.company || "Entreprise"}</th>
                        <th className="px-3 py-2">{t.role || "Poste"}</th>
                        <th className="px-2 py-2">{t.platformHeader || "Plateforme"}</th>
                        <th className="px-2 py-2">{t.date || "Date"}</th>
                        <th className="px-2 py-2">{t.status || "Statut"}</th>
                        <th className="px-2 py-2">{t.contract || "Contrat"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {parsedResult.applications.slice(0, 5).map((app, idx) => (
                        <tr key={idx} className="hover:bg-white dark:hover:bg-gray-800 transition-colors">
                          <td className="px-3 py-2 font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[120px]">
                            {app.company}
                          </td>
                          <td className="px-3 py-2 text-gray-700 dark:text-gray-300 truncate max-w-[140px]">
                            {app.role}
                          </td>
                          <td className="px-2 py-2 text-gray-600 dark:text-gray-300 text-2xs truncate max-w-[100px]">
                            <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-2xs font-medium">
                              {app.source || (lang === 'en' ? 'Unknown' : 'Inconnue')}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-gray-500 dark:text-gray-400 font-mono text-2xs">
                            {app.date}
                          </td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-2xs font-semibold ${
                              app.status === 'Ghosted' 
                                ? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                                : app.status === 'Refusé'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                                : app.status === 'Entretien'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                : app.status === 'Offre'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-gray-500 dark:text-gray-400 text-2xs">
                            {app.type}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50/70 dark:bg-gray-900/60 flex justify-end items-center gap-2.5">
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
          >
            {t.cancel || "Annuler"}
          </button>

          {parsedResult && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>
                {isEn 
                  ? `Import ${parsedResult.applications.length} Applications` 
                  : `Importer ${parsedResult.applications.length} candidatures`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

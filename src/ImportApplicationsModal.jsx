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
  Info,
} from './icons';
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-zinc-900 rounded-lg max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-left" role="dialog" aria-modal="true">
        {/* Header */}
        <div className="p-4 sm:p-5 flex justify-between items-center bg-zinc-100/70 dark:bg-zinc-950/60">
          <div>
            <h3 className="text-base sm:text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              {t.importApplicationsModalTitle || "Importer des candidatures"}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {t.importApplicationsModalSubtitle || "Compatible avec Excel (.xlsx, .xls), CSV, TSV et JSON"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition-colors duration-150"
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
                className={`rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors duration-150 ${
                  dragActive 
                    ? 'bg-blue-50/70 dark:bg-blue-950/40' 
                    : 'bg-zinc-100/70 dark:bg-zinc-950/60 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.tsv,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="mx-auto mb-3 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {isParsing ? (
                    <RefreshCw className="animate-spin" size={24} />
                  ) : (
                    <Upload size={24} />
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  {isParsing 
                    ? (t.importParsing || "Analyse du fichier en cours...")
                    : (t.importDropzoneText || "Glissez-déposez votre fichier ici, ou cliquez pour parcourir")}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {t.importSupportedFormats || "Excel (.xlsx, .xls), CSV (.csv), TSV (.tsv) ou JSON (.json)"}
                </p>

                {/* Format Badges */}
                <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
                  <span className="px-2.5 py-1 text-2xs font-medium rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <FileSpreadsheet size={12} className="text-emerald-600 dark:text-emerald-400" /> Excel (.xlsx, .xls)
                  </span>
                  <span className="px-2.5 py-1 text-2xs font-medium rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <FileText size={12} className="text-blue-600 dark:text-blue-400" /> CSV / TSV
                  </span>
                  <span className="px-2.5 py-1 text-2xs font-medium rounded-md bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                    <FileText size={12} className="text-zinc-500" /> JSON Backup
                  </span>
                </div>
              </div>

              {/* Parsing Error Box */}
              {parseError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-md text-xs sm:text-sm flex items-start gap-2.5">
                  <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                  <div>
                    <p className="font-semibold">{isEn ? "Import Error" : "Erreur d'importation"}</p>
                    <p className="mt-0.5 text-xs opacity-90">{parseError}</p>
                  </div>
                </div>
              )}

              {/* Supported Columns Info Guide */}
              <div className="p-3.5 bg-zinc-50 dark:bg-zinc-950/50 rounded-md text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200">
                  <Info size={14} className="text-blue-600 dark:text-blue-400" />
                  <span>{isEn ? "Supported Columns & Smart Defaults" : "Colonnes supportées & Détection automatique"}</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  {isEn 
                    ? "Recognized columns: Company, Role, Status, Date, Contract, Platform/Source, URL, Location, Notes. Missing platform defaults to 'Unknown'. Missing status without rejection date is marked as 'Ghosted'."
                    : "Colonnes reconnues : Entreprise, Poste, Statut, Date, Contrat, Plateforme/Source, URL, Lieu, Notes. Plateforme absente = 'Inconnue'. Statut absent sans date de refus = 'Ghosted'."}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-2xs text-zinc-600 dark:text-zinc-400 pt-1">
                  <div>• <strong className="text-zinc-800 dark:text-zinc-200">Entreprise</strong> (Company)</div>
                  <div>• <strong className="text-zinc-800 dark:text-zinc-200">Poste</strong> (Position, Role)</div>
                  <div>• <strong className="text-zinc-800 dark:text-zinc-200">Statut</strong> (Status, Stage)</div>
                  <div>• <strong className="text-zinc-800 dark:text-zinc-200">Date</strong> (YYYY-MM-DD, DD/MM/YYYY)</div>
                  <div>• <strong className="text-zinc-800 dark:text-zinc-200">Contrat</strong> (CDI, CDD, Stage...)</div>
                  <div>• <strong className="text-zinc-800 dark:text-zinc-200">Source</strong> (LinkedIn, WTTJ, Inconnue...)</div>
                </div>
              </div>
            </div>
          ) : (
            /* Parsed Preview and Confirmation View */
            <div className="space-y-4">
              {/* File summary */}
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-md flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 rounded-md">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-semibold tabular-nums text-emerald-900 dark:text-emerald-200">
                      {parsedResult.applications.length} {isEn ? "applications parsed successfully" : "candidatures détectées avec succès"}
                    </p>
                    <p className="text-2xs text-emerald-700 dark:text-emerald-400 font-mono">
                      {parsedResult.fileName} · {parsedResult.format}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 underline cursor-pointer"
                >
                  {isEn ? "Choose another file" : "Changer de fichier"}
                </button>
              </div>

              {/* Import Mode Options */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  {isEn ? "Import Strategy" : "Mode d'importation"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setImportMode('merge')}
                    className={`p-3 rounded-md cursor-pointer transition-colors duration-150 ${
                      importMode === 'merge'
                        ? 'bg-blue-50/80 dark:bg-blue-950/50'
                        : 'bg-zinc-100/70 dark:bg-zinc-950/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
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
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <Layers size={14} className="text-blue-600" />
                        {t.importModeMerge || "Fusionner (Recommandé)"}
                      </span>
                    </div>
                    <p className="text-2xs text-zinc-500 dark:text-zinc-400 mt-1 pl-5">
                      {t.importModeMergeDesc || "Ajoute les nouvelles candidatures à votre liste actuelle (" + existingApplications.length + " actuelles)."}
                    </p>
                  </div>

                  <div
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-md cursor-pointer transition-colors duration-150 ${
                      importMode === 'replace'
                        ? 'bg-amber-50/80 dark:bg-amber-950/50'
                        : 'bg-zinc-100/70 dark:bg-zinc-950/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
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
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        <RefreshCw size={13} className="text-amber-600" />
                        {t.importModeReplace || "Remplacer tout"}
                      </span>
                    </div>
                    <p className="text-2xs text-zinc-500 dark:text-zinc-400 mt-1 pl-5">
                      {t.importModeReplaceDesc || "Supprime les candidatures actuelles et applique uniquement le fichier importé."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {t.importPreviewColumns || "Aperçu des candidatures détectées :"}
                  </span>
                  <span className="text-2xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400">
                    {Math.min(5, parsedResult.applications.length)} / {parsedResult.applications.length} {isEn ? "first rows" : "premières lignes"}
                  </span>
                </div>
                
                <div className="rounded-md overflow-hidden bg-zinc-50 dark:bg-zinc-950/50 max-h-52 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-100/80 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-2xs uppercase tracking-wider">
                        <th className="px-3 py-2 font-medium">{t.company || "Entreprise"}</th>
                        <th className="px-3 py-2 font-medium">{t.role || "Poste"}</th>
                        <th className="px-2 py-2 font-medium">{t.platformHeader || "Plateforme"}</th>
                        <th className="px-2 py-2 font-medium">{t.date || "Date"}</th>
                        <th className="px-2 py-2 font-medium">{t.status || "Statut"}</th>
                        <th className="px-2 py-2 font-medium">{t.contract || "Contrat"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedResult.applications.slice(0, 5).map((app, idx) => (
                        <tr key={idx} className="hover:bg-white dark:hover:bg-zinc-900/60 transition-colors duration-150">
                          <td className="px-3 py-2 font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">
                            {app.company}
                          </td>
                          <td className="px-3 py-2 text-zinc-700 dark:text-zinc-300 truncate max-w-[140px]">
                            {app.role}
                          </td>
                          <td className="px-2 py-2 text-zinc-600 dark:text-zinc-300 text-2xs truncate max-w-[100px]">
                            <span className="px-1.5 py-0.5 rounded-sm bg-zinc-200/70 dark:bg-zinc-800 text-2xs font-medium">
                              {app.source || (lang === 'en' ? 'Unknown' : 'Inconnue')}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-zinc-500 dark:text-zinc-400 font-mono tabular-nums text-2xs">
                            {app.date}
                          </td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.5 rounded-sm text-2xs font-semibold ${
                              app.status === 'Ghosted' 
                                ? 'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                                : app.status === 'Refusé'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                                : app.status === 'Entretien'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                : app.status === 'Offre'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                            }`}>
                              {app.status}
                            </span>
                          </td>
                          <td className="px-2 py-2 text-zinc-500 dark:text-zinc-400 text-2xs">
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
        <div className="p-4 bg-zinc-100/70 dark:bg-zinc-950/60 flex justify-end items-center gap-2.5">
          <button
            type="button"
            onClick={() => { handleReset(); onClose(); }}
            className="px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 transition-colors duration-150 cursor-pointer"
          >
            {t.cancel || "Annuler"}
          </button>

          {parsedResult && (
            <button
              type="button"
              onClick={handleConfirmImport}
              className="px-4 py-2 rounded-md text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-150 flex items-center gap-2 cursor-pointer"
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

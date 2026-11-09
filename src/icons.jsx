import React from 'react';
import {
  IoPulseOutline,
  IoAlertCircleOutline,
  IoWarningOutline,
  IoReorderThreeOutline,
  IoArrowDownOutline,
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoArrowUpOutline,
  IoSwapVerticalOutline,
  IoRibbonOutline,
  IoStatsChartOutline,
  IoBookOutline,
  IoBriefcaseOutline,
  IoBusinessOutline,
  IoCalculatorOutline,
  IoCalendarOutline,
  IoCameraOutline,
  IoCheckmarkOutline,
  IoCheckmarkDoneOutline,
  IoCheckmarkCircleOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoTimeOutline,
  IoCodeOutline,
  IoCodeSlashOutline,
  IoCompassOutline,
  IoCopyOutline,
  IoHardwareChipOutline,
  IoDownloadOutline,
  IoOpenOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoDocumentAttachOutline,
  IoDocumentTextOutline,
  IoDocumentsOutline,
  IoCloudUploadOutline,
  IoFilterOutline,
  IoFlaskOutline,
  IoArchiveOutline,
  IoSkullOutline,
  IoLogoGithub,
  IoGlobeOutline,
  IoSchoolOutline,
  IoHelpCircleOutline,
  IoImageOutline,
  IoInformationCircleOutline,
  IoLogoInstagram,
  IoKeyOutline,
  IoLanguageOutline,
  IoLayersOutline,
  IoGridOutline,
  IoAlbumsOutline,
  IoLibraryOutline,
  IoLinkOutline,
  IoLogoLinkedin,
  IoListOutline,
  IoSyncOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoLocationOutline,
  IoChatbubbleEllipsesOutline,
  IoMoonOutline,
  IoColorPaletteOutline,
  IoPencilOutline,
  IoPricetagOutline,
  IoCallOutline,
  IoAddOutline,
  IoPrintOutline,
  IoRadioOutline,
  IoRefreshOutline,
  IoRocketOutline,
  IoRefreshCircleOutline,
  IoSaveOutline,
  IoSearchOutline,
  IoServerOutline,
  IoSettingsOutline,
  IoShareSocialOutline,
  IoShieldOutline,
  IoShieldCheckmarkOutline,
  IoOptionsOutline,
  IoSparklesOutline,
  IoSunnyOutline,
  IoPricetagsOutline,
  IoTerminalOutline,
  IoTimerOutline,
  IoTrashOutline,
  IoTrendingDownOutline,
  IoTrendingUpOutline,
  IoUnlinkOutline,
  IoPersonOutline,
  IoIdCardOutline,
  IoColorWandOutline,
  IoCloseOutline,
  IoCloseCircleOutline,
  IoFlashOutline,
  IoPaperPlaneOutline,
  IoExtensionPuzzleOutline,
  IoConstructOutline,
  IoCheckmarkCircle,
  IoSparkles,
  IoFlash,
} from 'react-icons/io5';

/**
 * Wraps an Ionicons v5 (ionicons.designerpack) SVG icon component
 * so it accepts `size`, `className`, `style`, and standard SVG props seamlessly.
 */
function createIonicon(IonComponent) {
  const WrappedIonicon = React.forwardRef(({ size = 18, className = '', style, strokeWidth, ...rest }, ref) => (
    <IonComponent
      ref={ref}
      size={size}
      className={`inline-block shrink-0 ${className}`}
      style={style}
      {...rest}
    />
  ));
  WrappedIonicon.displayName = `Ionicon(${IonComponent.displayName || IonComponent.name || 'Icon'})`;
  return WrappedIonicon;
}

export const Activity = createIonicon(IoPulseOutline);
export const AlertCircle = createIonicon(IoAlertCircleOutline);
export const AlertOctagon = createIonicon(IoAlertCircleOutline);
export const AlertTriangle = createIonicon(IoWarningOutline);
export const AlignLeft = createIonicon(IoReorderThreeOutline);
export const ArrowDown = createIonicon(IoArrowDownOutline);
export const ArrowLeft = createIonicon(IoArrowBackOutline);
export const ArrowRight = createIonicon(IoArrowForwardOutline);
export const ArrowUp = createIonicon(IoArrowUpOutline);
export const ArrowUpDown = createIonicon(IoSwapVerticalOutline);
export const Award = createIonicon(IoRibbonOutline);
export const BarChart2 = createIonicon(IoStatsChartOutline);
export const BookOpen = createIonicon(IoBookOutline);
export const Briefcase = createIonicon(IoBriefcaseOutline);
export const Building2 = createIonicon(IoBusinessOutline);
export const Calculator = createIonicon(IoCalculatorOutline);
export const Calendar = createIonicon(IoCalendarOutline);
export const Camera = createIonicon(IoCameraOutline);
export const Check = createIonicon(IoCheckmarkOutline);
export const CheckCheck = createIonicon(IoCheckmarkDoneOutline);
export const CheckCircle = createIonicon(IoCheckmarkCircleOutline);
export const CheckCircle2 = createIonicon(IoCheckmarkCircleOutline);
export const ChevronDown = createIonicon(IoChevronDownOutline);
export const ChevronUp = createIonicon(IoChevronUpOutline);
export const Clock = createIonicon(IoTimeOutline);
export const Code = createIonicon(IoCodeOutline);
export const Code2 = createIonicon(IoCodeSlashOutline);
export const Compass = createIonicon(IoCompassOutline);
export const Copy = createIonicon(IoCopyOutline);
export const Cpu = createIonicon(IoHardwareChipOutline);
export const Download = createIonicon(IoDownloadOutline);
export const ExternalLink = createIonicon(IoOpenOutline);
export const Eye = createIonicon(IoEyeOutline);
export const EyeOff = createIonicon(IoEyeOffOutline);
export const FileCheck = createIonicon(IoDocumentAttachOutline);
export const FileCode = createIonicon(IoCodeSlashOutline);
export const FileCode2 = createIonicon(IoCodeSlashOutline);
export const FileSpreadsheet = createIonicon(IoGridOutline);
export const FileText = createIonicon(IoDocumentTextOutline);
export const FileUp = createIonicon(IoCloudUploadOutline);
export const Files = createIonicon(IoDocumentsOutline);
export const Filter = createIonicon(IoFilterOutline);
export const FlaskConical = createIonicon(IoFlaskOutline);
export const FolderArchive = createIonicon(IoArchiveOutline);
export const Ghost = createIonicon(IoSkullOutline);
export const Github = createIonicon(IoLogoGithub);
export const Globe = createIonicon(IoGlobeOutline);
export const GraduationCap = createIonicon(IoSchoolOutline);
export const HelpCircle = createIonicon(IoHelpCircleOutline);
export const Image = createIonicon(IoImageOutline);
export const ImageIcon = createIonicon(IoImageOutline);
export const Info = createIonicon(IoInformationCircleOutline);
export const Instagram = createIonicon(IoLogoInstagram);
export const Key = createIonicon(IoKeyOutline);
export const Languages = createIonicon(IoLanguageOutline);
export const Layers = createIonicon(IoLayersOutline);
export const Layout = createIonicon(IoAlbumsOutline);
export const LayoutDashboard = createIonicon(IoGridOutline);
export const LayoutTemplate = createIonicon(IoAlbumsOutline);
export const Library = createIonicon(IoLibraryOutline);
export const Link = createIonicon(IoLinkOutline);
export const Link2 = createIonicon(IoLinkOutline);
export const Linkedin = createIonicon(IoLogoLinkedin);
export const ListTodo = createIonicon(IoListOutline);
export const Loader2 = createIonicon(IoSyncOutline);
export const Lock = createIonicon(IoLockClosedOutline);
export const Mail = createIonicon(IoMailOutline);
export const MapPin = createIonicon(IoLocationOutline);
export const MessageSquare = createIonicon(IoChatbubbleEllipsesOutline);
export const Moon = createIonicon(IoMoonOutline);
export const Palette = createIonicon(IoColorPaletteOutline);
export const Pencil = createIonicon(IoPencilOutline);
export const Percent = createIonicon(IoPricetagOutline);
export const Phone = createIonicon(IoCallOutline);
export const Plus = createIonicon(IoAddOutline);
export const Printer = createIonicon(IoPrintOutline);
export const Radio = createIonicon(IoRadioOutline);
export const RefreshCw = createIonicon(IoRefreshOutline);
export const Rocket = createIonicon(IoRocketOutline);
export const RotateCcw = createIonicon(IoRefreshCircleOutline);
export const Save = createIonicon(IoSaveOutline);
export const Search = createIonicon(IoSearchOutline);
export const Server = createIonicon(IoServerOutline);
export const Settings = createIonicon(IoSettingsOutline);
export const Share2 = createIonicon(IoShareSocialOutline);
export const ShieldAlert = createIonicon(IoShieldOutline);
export const ShieldCheck = createIonicon(IoShieldCheckmarkOutline);
export const SlidersHorizontal = createIonicon(IoOptionsOutline);
export const Sparkles = createIonicon(IoSparklesOutline);
export const Sun = createIonicon(IoSunnyOutline);
export const Tag = createIonicon(IoPricetagsOutline);
export const Terminal = createIonicon(IoTerminalOutline);
export const Timer = createIonicon(IoTimerOutline);
export const Trash2 = createIonicon(IoTrashOutline);
export const TrendingDown = createIonicon(IoTrendingDownOutline);
export const TrendingUp = createIonicon(IoTrendingUpOutline);
export const Unlink = createIonicon(IoUnlinkOutline);
export const Upload = createIonicon(IoCloudUploadOutline);
export const User = createIonicon(IoPersonOutline);
export const UserCheck = createIonicon(IoIdCardOutline);
export const Wand2 = createIonicon(IoColorWandOutline);
export const X = createIonicon(IoCloseOutline);
export const XCircle = createIonicon(IoCloseCircleOutline);
export const Zap = createIonicon(IoFlashOutline);

// Extra Ionicons exports for Prompt-Kit & Beautiful UI components
export const SendIon = createIonicon(IoPaperPlaneOutline);
export const PuzzleIon = createIonicon(IoExtensionPuzzleOutline);
export const ConstructIon = createIonicon(IoConstructOutline);
export const CheckCircleFilledIon = createIonicon(IoCheckmarkCircle);
export const SparklesFilledIon = createIonicon(IoSparkles);
export const FlashFilledIon = createIonicon(IoFlash);

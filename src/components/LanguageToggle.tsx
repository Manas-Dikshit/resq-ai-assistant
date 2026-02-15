import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'हि' },
  { code: 'or', label: 'ଓ' },
];

const LanguageToggle = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
      <Globe className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 rounded text-xs font-display transition-colors ${
            i18n.language === lang.code
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageToggle;

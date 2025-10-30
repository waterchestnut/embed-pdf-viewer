import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';

import { useTranslation } from "react-i18next";

interface TruncatedTextProps {
  text: string;
  maxWords?: number;
  className?: string;
}

export const TruncatedText = ({ text, maxWords = 16, className = '' }: TruncatedTextProps) => {
  const [isExpanded, setExpanded] = useState(false);

  const { t } = useTranslation();

  const words = text.split(' ');
  const shouldTruncate = words.length > maxWords;

  if (!shouldTruncate) {
    return <div className={className}>{text}</div>;
  }

  const displayText = isExpanded ? text : words.slice(0, maxWords).join(' ') + '...';

  return (
    <div className={className}>
      {displayText}{' '}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!isExpanded);
        }}
        className="text-sm font-medium text-blue-500 hover:text-blue-600 focus:outline-none"
      >
        {isExpanded ? t('Comment.Less') : t('Comment.More')}
      </button>
    </div>
  );
};

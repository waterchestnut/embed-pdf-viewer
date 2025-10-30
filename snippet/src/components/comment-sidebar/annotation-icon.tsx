import { h } from 'preact';
import { TrackedAnnotation } from '@embedpdf/plugin-annotation';
import { Icon } from '../ui/icon';
import { AnnotationConfig } from './config';

import { useTranslation } from "react-i18next";

export const AnnotationIcon = ({
  annotation,
  config,
  className = '',
}: {
  annotation: TrackedAnnotation;
  config: AnnotationConfig;
  className?: string;
}) => {
  const iconProps = config.iconProps(annotation.object);

  const { t } = useTranslation();

  return (
    <div
      className={`flex items-center justify-center rounded-full bg-gray-100 ${className}`}
      title={t(config.label)}
    >
      <Icon icon={config.icon} {...iconProps} />
    </div>
  );
};

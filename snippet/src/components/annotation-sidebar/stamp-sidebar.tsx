import { h } from 'preact';
import { PdfStampAnnoObject } from '@embedpdf/models';
import { SidebarPropsBase } from './common';

import { useTranslation } from "react-i18next";

export const StampSidebar = (_props: SidebarPropsBase<PdfStampAnnoObject>) => {
  const { t } = useTranslation();

  return <div className="text-sm text-gray-500">{t('Annotation.StampNoStyle')}</div>;
};

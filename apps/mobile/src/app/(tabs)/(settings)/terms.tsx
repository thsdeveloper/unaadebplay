import React from 'react';
import { LegalScreen } from '@/components/legal/LegalScreen';
import { LEGAL_UPDATED_AT, TERMS_INTRO, TERMS_SECTIONS } from '@/components/legal/legalContent';

export default function SettingsTermsScreen() {
  return <LegalScreen title="Termos de Uso" updatedAt={LEGAL_UPDATED_AT} intro={TERMS_INTRO} sections={TERMS_SECTIONS} />;
}

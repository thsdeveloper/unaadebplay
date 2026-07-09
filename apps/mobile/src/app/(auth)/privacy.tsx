import React from 'react';
import { LegalScreen } from '@/components/legal/LegalScreen';
import { LEGAL_UPDATED_AT, PRIVACY_INTRO, PRIVACY_SECTIONS } from '@/components/legal/legalContent';

export default function PrivacyScreen() {
  return <LegalScreen title="Política de Privacidade" updatedAt={LEGAL_UPDATED_AT} intro={PRIVACY_INTRO} sections={PRIVACY_SECTIONS} />;
}

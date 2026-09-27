// Sources checked 27 September 2026:
// https://www.gov.uk/foreign-travel-advice/niger/getting-help
// https://travel.state.gov/en/international-travel/travel-advisories/niger.html
export const NIGER_EMERGENCY_CONTACTS = [
  { label: 'Police secours', number: '17' },
  { label: 'Sapeurs-pompiers', number: '18' },
  { label: 'SAMU — urgences médicales', number: '15' },
  { label: 'Police — autre numéro', number: '8383' },
];

export function whatsappLink(value: string) {
  const number = value.replace(/[\s().-]/g, '').replace(/^\+/, '');
  return /^227\d{8}$/.test(number) ? `https://wa.me/${number}` : null;
}

export function phoneLink(value: string) {
  return /^\+?[\d\s().-]+$/.test(value) ? `tel:${value.replace(/[^\d+]/g, '')}` : null;
}

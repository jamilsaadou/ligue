export type DiagnosticSex = 'female' | 'male';

export function isDiagnosticSex(value: unknown): value is DiagnosticSex {
  return value === 'female' || value === 'male';
}

// Only agreements referring to the person answering are changed. The sex of
// a partner or another person cannot be inferred from that person's sex.
export function adaptDiagnosticText(text: string, sex: DiagnosticSex | null): string {
  if (!sex) return text;
  const feminine = sex === 'female';
  return text
    .replace(/fou\/folle|folle\/fou/g, feminine ? 'folle' : 'fou')
    .replace(/(épanoui|poussé|tiré|bousculé|giflé|secoué|frappé|étranglé|empêché|menacé|intimidé|coupé|isolé|harcelé|agressé|protégé|aidé|écouté|respecté)\(e\)/g,
      (_, word: string) => word + (feminine ? 'e' : ''))
    .replace(/(je (?:veux être|suis|me sens)|vous (?:êtes|sentez)|tu (?:es|te sens)) seul(?:\(e\)|e)?(?=\W|$)/gi,
      (_, prefix: string) => `${prefix} ${feminine ? 'seule' : 'seul'}`)
    .replace(/(contraint|dévêtu)(?:\(e\)|·e)(?!·s)/g, (_, word: string) => word + (feminine ? 'e' : ''))
    .replace(/(te photographie )nu·e/g, `$1${feminine ? 'nue' : 'nu'}`)
    .replace(/pas sûr\(e\)/g, feminine ? 'pas sûre' : 'pas sûr')
    .replace(/Vous n’êtes pas seule?/g, feminine ? 'Vous n’êtes pas seule' : 'Vous n’êtes pas seul');
}

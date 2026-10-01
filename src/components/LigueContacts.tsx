import { Phone } from 'lucide-react';

const contacts = [
  { label: 'La clinique juridique', number: '90 44 40 55', href: 'tel:+22790444055' },
  { label: 'La responsable de la SR', number: '89 14 42 42', href: 'tel:+22789144242' },
  { label: 'La responsable du suivi psychologique', number: '96 84 93 93', href: 'tel:+22796849393' },
];

export default function LigueContacts() {
  return (
    <ul className="grid gap-4 md:grid-cols-3">
      {contacts.map(({ label, number, href }) => (
        <li key={href}>
          <a href={href} className="flex h-full flex-col rounded-2xl border border-orange-200 bg-orange-50/50 p-5 transition-colors hover:bg-orange-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange-600">
            <span className="text-sm font-medium text-slate-700">{label}</span>
            <span className="mt-4 inline-flex items-center gap-2 text-xl font-bold text-orange-800">
              <Phone className="h-5 w-5 shrink-0" aria-hidden="true" />
              {number}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

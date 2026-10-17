// User explicitly selected Nuri (both divisions) and Putri, 17 October 2026.
// Do not infer a character from names for other contacts.
const femaleContactIds=new Set(["retail-tambun-nuri","retail-cibitung-nuri","trading-proyek-putri"]);
export function contactIllustration(contact:{id:string;illustration?:"male"|"female"}) {
  return contact.illustration || (femaleContactIds.has(contact.id)?"female":"male");
}

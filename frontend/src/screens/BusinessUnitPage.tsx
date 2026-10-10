import HomePage from "./HomePage";
import type { Division } from "../data/divisionContent";
import type { TeamContact, SiteContent } from "../data/siteContent";

export default function BusinessUnitPage({ division, contacts, content }: { division: Division; contacts: TeamContact[]; content: SiteContent }) {
  return <HomePage division={division} content={{ ...content, contacts }} />;
}

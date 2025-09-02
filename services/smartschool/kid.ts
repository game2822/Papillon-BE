
import { Kid } from "../shared/kid";
import { SmartSchool } from "smartschooljs";

export function fetchSkolengoKids(session: SmartSchool, accountId: string): Kid[] {
  return (session.kids ?? []).map(kid => ({
    id: kid.userId,
    firstName: kid.firstName,
    lastName: kid.lastName,
    class: kid.className,
    dateOfBirth: kid.dateOfBirth,
    createdByAccount: accountId,
  }))
}
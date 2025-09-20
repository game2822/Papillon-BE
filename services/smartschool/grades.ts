import { Grade as SkolengoGrade, Kind,SmartSchool, Subject as SkolengoSubjects } from "smartschooljs";

import { error } from "@/utils/logger/logger";

import { Grade, Period, PeriodGrades, Subject } from "../shared/grade";

export async function fetchSkolengoGradesForPeriod(session: SmartSchool, accountId: string, period: string, kid?: SmartSchool): Promise<PeriodGrades> {
  const getGrades = async (sessionToUse: SmartSchool, kidName?: string): Promise<PeriodGrades> => {
    const subjects = await sessionToUse.GetGradesForPeriod(period)
 

    return {
      createdByAccount: accountId,
      classAverage: { value: 16.66, disabled: true },
      studentOverall: { value: 16.66, disabled: true },
      subjects: mapSkolengoSubjects(subjects, accountId, kidName).filter(subject => subject.grades.length > 0)
    }
  }
  if (session.kind === Kind.STUDENT) {
    return getGrades(session)
  } 
  if (kid) {
    return getGrades(kid, `${kid.firstName} ${kid.lastName}`)
  }
  error("Kid is not valid")
  
}

export async function fetchSkolengoGradePeriods(session: SmartSchool, accountId: string): Promise<Period[]> {
  const result: Period[] = []
  
  if (session.kind === Kind.STUDENT) {
    const periods = (await session.GetGradesSettings()).periods
    for (const period of periods) {
      result.push({
        name: period.label,
        id: period.id,
        start: period.startDate,
        end: period.endDate,
        createdByAccount: accountId
      })
    }
  } else {
    for (const kid of session.kids ?? []) {
      const periods = (await kid.GetGradesSettings()).periods
      for (const period of periods) {
        result.push({
          name: period.label,
          id: period.id,
          start: period.startDate,
          end: period.endDate,
          createdByAccount: accountId,
          kidName: `${kid.firstName} ${kid.lastName}`
        })
      }		
    }
  }
  return result
}

function mapSkolengoGrades(grades: SkolengoGrade[], accountId: string, kidName?: string): Grade[] {
  return grades.map(grade => ({
    id: grade.id,
    subjectId: grade.subject?.id ?? "",
    subjectName: grade.subject?.label ?? "",
    description: grade.topic ?? "",
    givenAt: grade.date,
    outOf: { value: grade.outOf },
    coefficient: grade.coefficient,
    studentScore: { value: grade.value, disabled: grade.isGraded, status: grade.notGradedReason },
    createdByAccount: accountId,
    kidName: kidName
  }))
}

function mapSkolengoSubjects(subjects: SkolengoSubjects[], accountId: string, kidName?: string): Subject[] {
  return subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    classAverage: { value: subject.average, disabled: true },
    studentAverage: { value: subject.value, disabled: true },
    outOf: { value: subject.outOf, disabled: true },
    grades: mapSkolengoGrades(subject.grades, accountId, kidName)
  }))
}

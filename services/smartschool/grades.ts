import { Grade as SmartSchoolGrade, Kind,SmartSchool, Subject as SmartSchoolSubjects } from "smartschooljs";

import { error, log } from "@/utils/logger/logger";

import { Grade, GradeScore, Period, PeriodGrades, Subject } from "../shared/grade";

export async function fetchSkolengoGradesForPeriod(session: SmartSchool, accountId: string, period: string, kid?: SmartSchool): Promise<PeriodGrades> {
  const getGrades = async (sessionToUse: SmartSchool, kidName?: string): Promise<PeriodGrades> => {
    const subjects = await sessionToUse.GetGradesForPeriod(period)
    log("Fetched subjects: " + JSON.stringify(subjects))
    const studentOverall: GradeScore = {
      value: subjects.reduce((sum, subject) => sum + subject.value, 0) / subjects.length,
      disabled: false
    }
    log("Calculated student overall: " + JSON.stringify(studentOverall))
    const classAverage: GradeScore = {
      value: subjects.reduce((sum, subject) => sum + subject.average, 0) / subjects.length,
      disabled: false
    }
    log("Calculated class average: " + JSON.stringify(classAverage))

    return {
      createdByAccount: accountId,
      studentOverall,
      classAverage,
      subjects: mapSkolengoSubjects(subjects, accountId, kidName)
    }
  }
  if (session.kind === Kind.STUDENT) {
    log("Fetching grades for student session")
    return getGrades(session)
  }
  if (kid) {
    log("Fetching grades for kid: " + kid.firstName + " " + kid.lastName)
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

function mapSkolengoGrades(grades: SmartSchoolGrades[], accountId: string, kidName?: string): Grade[] {
  return grades.map(grade => ({
    id: grade.id,
    subjectId: grade.subject?.id ?? "",
    subjectName: grade.subject?.label ?? "",
    description: grade.title ?? "",
    givenAt: grade.date,
    outOf: { value: grade.outOf },
    coefficient: grade.coefficient,
    studentScore: { value: 11, disabled: !grade.isGraded, status: grade.notGradedReason },
    createdByAccount: accountId,
    kidName: kidName
  }))
}

function mapSkolengoSubjects(subjects: SmartSchoolSubjects[], accountId: string, kidName?: string): Subject[] {
  return subjects.map(subject => ({
    id: subject.id,
    name: subject.name,
    classAverage: { value: subject.average },
    studentAverage: { value: subject.value },
    outOf: { value: subject.outOf },
    grades: mapSkolengoGrades(subject.grades ?? [], accountId, kidName)
  }))
}

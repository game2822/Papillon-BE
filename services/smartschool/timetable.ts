import { Kind, Lesson, SmartSchool } from "smartschooljs";

import { getDateRangeOfWeek } from "@/database/useHomework";

import { Course, CourseDay, CourseStatus, CourseType } from "../shared/timetable";

export async function fetchSkolengoTimetable(session: SmartSchool, accountId: string, weekNumber: number): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber)
  const result: CourseDay[] = []

  const getTimetable = async (sessionToUse: SmartSchool, kidName?: string) => {
    const timetable = await sessionToUse.GetTimetable(start, end)
    result.push(...timetable.map(day => ({
      date: day.date,
      courses: mapSkolengoCourse(day.lessons, accountId, kidName)
    })))
  }

  if (session.kind === Kind.STUDENT) {
    await getTimetable(session)
  } else {
    for (const kid of (session.kids ?? [])) {
      await getTimetable(kid, `${kid.firstName} ${kid.firstName}`)
    }
  }
  return result;
}

function mapSkolengoCourse(data: Lesson[], accountId: string, kidName?: string): Course[] {
  return data.map(lesson => ({
    subject: lesson.subject.label,
    id: lesson.id,
    type: CourseType.LESSON,
    from: lesson.startDateTime,
    to: lesson.endDateTime,
    room: lesson.room,
    teacher: lesson.teacher.map(t => t.name).join(", "),
    backgroundColor: lesson.subject.color,
    status: lesson.canceled ? CourseStatus.CANCELED : undefined,
    createdByAccount: accountId,
    kidName: kidName
  }))
}
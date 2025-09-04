import { Kind, Lesson, SmartSchool } from "smartschooljs";

import { getDateRangeOfWeek } from "@/database/useHomework";
import { info } from "@/utils/logger/logger";

import { Course, CourseDay, CourseStatus, CourseType } from "../shared/timetable";

export async function fetchSkolengoTimetable(session: SmartSchool, accountId: string, weekNumber: number): Promise<CourseDay[]> {
  const { start, end } = getDateRangeOfWeek(weekNumber)
  const result: CourseDay[] = []

  const getTimetable = async (sessionToUse: SmartSchool) => {
    const timetable = await sessionToUse.GetTimetable(start, end)
    for (const day of timetable) {
      const courses = mapSkolengoCourse(day.lessons, accountId);
      const normalizedDate = new Date(day.date).toISOString().split("T")[0];

      const existing = result.find(d => d.date === normalizedDate);
      if (existing) {
        existing.courses.push(...courses);
      } else {
        result.push({ date: normalizedDate, courses });
      }
    }
  }

  if (session.kind === Kind.STUDENT) {
    await getTimetable(session)
  } else {
    for (const kid of (session.kids ?? [])) {
      await getTimetable(kid)
    }
  }
  for (const day of result) {
    day.courses.sort((a, b) => new Date(a.from).getTime() - new Date(b.from).getTime());
  }
  return result;
}

function mapSkolengoCourse(data: Lesson[], accountId: string): Course[] {
  info("Mapping courses: " + JSON.stringify(data))
  return data.map(lesson => ({
    subject: lesson.subject.label,
    id: lesson.id,
    type: CourseType.LESSON,
    from: lesson.startDateTime,
    to: lesson.endDateTime,
    room: lesson.room,
    teacher: lesson.teacher.map(t => `${t.name}`).join(", "),
    backgroundColor: lesson.subject.color,
    status: lesson.canceled ? CourseStatus.CANCELED : undefined,
    createdByAccount: accountId
  }))
}
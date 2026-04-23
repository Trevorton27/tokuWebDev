/**
 * Client for calling LMS internal API endpoints from the assessment app.
 * All calls are server-side only — never expose INTERNAL_API_SECRET to the browser.
 */

const LMS_API_URL = process.env.LMS_API_URL || '';
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET || '';

function getHeaders() {
  return {
    Authorization: `Bearer ${INTERNAL_API_SECRET}`,
    'Content-Type': 'application/json',
  };
}

export interface LessonSummary {
  id: string;
  title: string;
  order: number;
  type: string;
}

export interface CourseSummary {
  id: string;
  title: string;
  description: string | null;
  lessons: LessonSummary[];
}

export interface CurriculumData {
  enrollments: Array<{
    courseId: string;
    enrolledAt: string;
    status: string;
    course: CourseSummary;
  }>;
}

/**
 * Fetch the recommended curriculum/next steps for a user from the LMS.
 * Used post-assessment to show the student what to work on next.
 */
export async function getUserCurriculum(userId: string): Promise<CurriculumData | null> {
  if (!LMS_API_URL) {
    console.warn('[lmsClient] LMS_API_URL is not set — skipping curriculum fetch');
    return null;
  }

  try {
    const res = await fetch(`${LMS_API_URL}/api/internal/curriculum/${userId}`, {
      headers: getHeaders(),
      next: { revalidate: 60 }, // cache for 60s
    });

    if (!res.ok) {
      console.error(`[lmsClient] curriculum fetch failed: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    return data.success ? (data.data as CurriculumData) : null;
  } catch (err) {
    console.error('[lmsClient] curriculum fetch error:', err);
    return null;
  }
}

import { api } from "./api";

export interface Course {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  teacherName: string;
}

export interface Activity {
  id: number;
  courseModuleId: number;
  name: string;
  modname: string;
  type: string;
  dueDate: number | null;
  status: string;
}

export interface ForumDiscussion {
  id: number;
  forumId: number;
  name: string;
  subject: string;
  userFullname: string;
  created: number;
}

export interface ForumPost {
  id: number;
  subject: string;
  message: string;
  userFullname: string;
  created: number;
}

export interface UserStats {
  usuarioId: number;
  nombreCompleto: string;
  totalEntregas: number;
  totalParticipacionesForo: number;
  ultimaEntrega: string;
}

export const CourseService = {
  listMyCourses: () => api.get<Course[]>("/api/courses").then((r) => r.data),
  listActivities: (courseId: number) =>
    api.get<Activity[]>(`/api/courses/${courseId}/activities`).then((r) => r.data),
};

export const AssignmentService = {
  submitText: (assignId: number, onlineText: string) =>
    api
      .post<{ status: string; message: string }>(`/api/assignments/${assignId}/submit`, { onlineText })
      .then((r) => r.data),
};

export const ForumService = {
  listDiscussions: (forumId: number) =>
    api.get<ForumDiscussion[]>(`/api/forums/${forumId}/discussions`).then((r) => r.data),
  listPosts: (discussionId: number) =>
    api.get<ForumPost[]>(`/api/forums/discussions/${discussionId}/posts`).then((r) => r.data),
  createPost: (discussionId: number, subject: string, message: string) =>
    api
      .post<{ status: string; message: string }>(`/api/forums/discussions/${discussionId}/posts`, {
        subject,
        message,
      })
      .then((r) => r.data),
};

export const StatsService = {
  myStats: () =>
    api
      .get<UserStats | { mensaje: string }>("/api/usuarios/me/estadisticas")
      .then((r) => r.data),
};

export interface AppUser {
  id: number;
  username: string;
  email: string;
  nombreCompleto: string;
  rol: string;
}

export interface AdminCourse {
  id: number;
  fullname: string;
  shortname: string;
  summary: string;
  teacherName: string;
  totalEstudiantes: number;
}

export const AdminService = {
  listUsers: (rol: "student" | "teacher") =>
    api.get<AppUser[]>(`/api/admin/users?rol=${rol}`).then((r) => r.data),
  createUser: (payload: {
    username: string;
    email: string;
    nombreCompleto: string;
    password: string;
    rol: "student" | "teacher";
  }) => api.post<{ status: string; message: string }>("/api/admin/users", payload).then((r) => r.data),
  listCourses: () => api.get<AdminCourse[]>("/api/admin/courses").then((r) => r.data),
  createCourse: (payload: {
    nombre: string;
    shortname: string;
    descripcion?: string;
    docenteId: number;
    estudianteIds: number[];
  }) =>
    api
      .post<{ status: string; message: string; courseId: number; estudiantesInscritos: number }>(
        "/api/admin/courses",
        payload
      )
      .then((r) => r.data),
};

export const TeacherService = {
  createActivity: (
    courseId: number,
    payload: { nombre: string; tipo: "tarea" | "foro"; descripcion?: string; dueDate?: number }
  ) =>
    api
      .post<{ status: string; message: string; activityId: number; tipo: string }>(
        `/api/teacher/courses/${courseId}/activities`,
        payload
      )
      .then((r) => r.data),
  createDiscussion: (forumId: number, payload: { subject: string; message?: string }) =>
    api
      .post<{ status: string; message: string; discussionId: number }>(
        `/api/teacher/forums/${forumId}/discussions`,
        payload
      )
      .then((r) => r.data),
};

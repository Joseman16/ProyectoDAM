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

// Assignment 1: User and Project Management System

// 1. Enum Role
export enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
}

// 2. Type alias Status
export type Status = 'ACTIVE' | 'INACTIVE';

// 3. Interface User
environment
export interface User {
  readonly id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
}

// describeUser: returns a descriptive string for a User
export function describeUser(user: User): string {
  return `User ${user.name} (ID: ${user.id}) is ${user.status} with role ${user.role}.`;
}

// 4. Interface Project
export interface Project {
  id: number;
  name: string;
  description?: string;
  members: User[];
}

// 6. Generic findById<T>
export function findById<T extends { id: number }>(items: T[], id: number): T | undefined {
  return items.find(item => item.id === id);
}

// 7. Type guard isAdmin
export function isAdmin(user: User): user is User & { role: Role.ADMIN } {
  return user.role === Role.ADMIN;
}

// Advanced: NotificationService interface & console-based implementation
export interface NotificationService {
  send(message: string): void;
}

export class ConsoleNotificationService implements NotificationService {
  send(message: string): void {
    console.log(`Notification: ${message}`);
  }
}

// 5. Class ProjectManager
export class ProjectManager {
  private projects: Project[] = [];
  private notifier: NotificationService;

  constructor(notifier: NotificationService) {
    this.notifier = notifier;
  }

  addProject(project: Project): void {
    if (findById(this.projects, project.id)) {
      throw new Error(`Project with ID ${project.id} already exists.`);
    }
    this.projects.push(project);
    this.notifier.send(`Project added: ${project.name}`);
  }

  removeProject(id: number): void {
    const index = this.projects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Project with ID ${id} not found.`);
    }
    const [removed] = this.projects.splice(index, 1);
    this.notifier.send(`Project removed: ${removed.name}`);
  }

  addUserToProject(projectId: number, user: User): void {
    const project = findById(this.projects, projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found.`);
    }
    if (project.members.some(m => m.id === user.id)) {
      throw new Error(`User with ID ${user.id} already in project ${project.name}.`);
    }
    project.members.push(user);
    this.notifier.send(`User ${user.name} added to project ${project.name}`);
  }

  listProjects(): Project[] {
    return this.projects;
  }
}

// 8. Example usage
const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@example.com', role: Role.ADMIN, status: 'ACTIVE' },
  { id: 2, name: 'Bob', email: 'bob@example.com', role: Role.DEVELOPER, status: 'INACTIVE' },
  { id: 3, name: 'Carol', email: 'carol@example.com', role: Role.MANAGER, status: 'ACTIVE' },
];

const notifier = new ConsoleNotificationService();
const pm = new ProjectManager(notifier);

const projectA: Project = { id: 101, name: 'Project A', members: [] };
const projectB: Project = { id: 102, name: 'Project B', description: 'Second project', members: [] };

pm.addProject(projectA);
pm.addProject(projectB);

pm.addUserToProject(101, users[0]);
pm.addUserToProject(101, users[1]);

console.log(
  pm.listProjects().map(p => ({
    ...p,
    members: p.members.map(m => describeUser(m))
  }))
);

console.log(isAdmin(users[0])); // true
console.log(isAdmin(users[1])); // false

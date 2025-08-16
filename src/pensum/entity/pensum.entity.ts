import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

export interface Course {
  name: string;
  type: 'B' | 'E'; // B = Basic, E = Elective
  // credits?: number;
  // code?: string;
}

export interface Semester {
  semesterNumber: number;
  courses: Course[];
}

@Entity('pensums')
export class Pensum {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  name: string;

  // @Column()
  // totalCredits?: number;

  @Column()
  semesters: Semester[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  constructor() {
    this.createdAt = new Date();
    this.updatedAt = new Date();
    // Initialize 9 empty semesters
    this.semesters = Array.from({ length: 9 }, (_, index) => ({
      semesterNumber: index + 1,
      courses: [],
    }));
  }
}

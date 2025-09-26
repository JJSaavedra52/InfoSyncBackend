import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

export interface Course {
  name: string;
  type: 'B' | 'E'; // B = Basic, E = Elective
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

  @Column()
  totalSemesters: number;

  @Column()
  semesters: Semester[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  description?: string;
}

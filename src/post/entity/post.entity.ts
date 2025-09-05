import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

@Entity('post')
export class Post {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  type: 'Q' | 'S'; // Q = Question, S= Suggestion

  @Column()
  title: string;

  @Column()
  subject: string;

  @Column()
  description: string;

  @Column()
  pensumId: string;

  @Column()
  course: string;

  @Column({ type: 'array', default: [] })
  images: string[];

  @Column({ type: 'array', default: [] })
  files: string[];

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

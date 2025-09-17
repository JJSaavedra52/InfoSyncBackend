import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

class SubComment {
  @Column()
  userId: string;

  @Column()
  commentary: string;

  @Column()
  createdAt: Date;
}

@Entity('comment')
export class Comment {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  postId: string;

  @Column()
  commentary: string;

  @Column({ type: 'array', default: [] }) // <-- Ensure it's always an array
  subComments: SubComment[];

  @Column({ default: 0 })
  helpedCount: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

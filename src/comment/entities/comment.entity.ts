import { Entity, ObjectIdColumn, ObjectId, Column } from 'typeorm';

class SubComment {
  @ObjectIdColumn()
  _id: ObjectId; // Unique ID for each subcomment

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

  @Column({ type: 'array', default: [] })
  subComments: SubComment[];

  @Column({ default: 0 })
  helpedCount: number;

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;
}

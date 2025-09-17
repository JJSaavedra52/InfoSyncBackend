import { Column, ObjectId, ObjectIdColumn } from 'typeorm';

export class Report {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  postId: string;

  @Column()
  userId: string;

  @Column()
  reason: string;

  @Column()
  createdAt: Date;
}

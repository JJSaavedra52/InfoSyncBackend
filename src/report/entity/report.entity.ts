import { Entity, Column, ObjectId, ObjectIdColumn } from 'typeorm';

@Entity('report')
export class Report {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  targetType: 'post' | 'comment' | 'subcomment'; // What is being reported

  @Column()
  targetId: string; // The ID of the post, comment, or subcomment

  @Column()
  state: 'Pending' | 'Resolved' | 'Dismissed';

  @Column()
  reason:
    | 'Inappropriate'
    | 'Harassment'
    | 'Offensive'
    | 'Spam'
    | 'Misleading'
    | 'Copyright'
    | 'Impersonation'
    | 'Privacy';

  @Column()
  createdAt: Date;

  @Column()
  updatedAt: Date;

  @Column()
  reviewedBy?: string;

  @Column()
  reviewDescription?: string; // Optional admin review details

  @Column()
  resolvedAt?: Date;
}

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

  @Column({ default: 'Pending' })
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

  @Column({ nullable: true })
  reviewDescription?: string; // optional text from reporter or reviewer

  @Column({ nullable: true })
  reviewedBy?: string; // store reviewer display name (admin)

  @Column({ nullable: true })
  reviewedAt?: Date;
}

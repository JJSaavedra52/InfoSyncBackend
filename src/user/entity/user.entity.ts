import { Column, Entity, ObjectIdColumn, ObjectId } from 'typeorm';

@Entity('user')
export class User {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userEmail: string;

  @Column()
  userName: string;

  @Column()
  passwordHash: string;

  @Column()
  role: 'student' | 'admin';

  @Column()
  status: 'active' | 'banned';

  @Column({ default: 0 })
  postsCount: number;

  @Column({ default: 0 })
  commentsCount: number;

  @Column({ default: 0 })
  likesCount: number;

  @Column({ default: 0 })
  reportsCount: number;

  @Column({ type: 'array', default: [] })
  savedPosts: string[];

  @Column()
  createdAt: Date;
}

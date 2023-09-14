import * as Knex from 'knex';
import { PG_CONFIG } from "../config";
import { User, UserVote } from "../types";
import { v4 as uuidv4 } from 'uuid';

class UserModel {
  private readonly knex: Knex.Knex;

  constructor(knex: Knex.Knex) {
    this.knex = knex;
  }

  async init() {
    const userTableExists = await this.knex.schema.hasTable('user');
    const userVoteTableExists = await this.knex.schema.hasTable('user_vote');

    if (!userTableExists) {
      await this.knex.schema.createTable('user', (table: any) => {
        table.uuid('id').primary().defaultTo(uuidv4());
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
      });
    }

    if (!userVoteTableExists) {
      await this.knex.schema.createTable('user_vote', (table: any) => {
        table.increments('id').primary();
        table.uuid('user_id').references('id').inTable('user').notNullable();
        table.uuid('article_id').references('id').inTable('news_article').notNullable();
        table.enu('vote', ['left', 'right']).notNullable();
      });
    }
  }

  async createUser(user: User): Promise<User | null> {
    try {
      const [createdUser] = await this.knex('user').insert(user).returning('*');
      return createdUser || null;
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.knex('user').where('email', email).first();
      return user || null;
    } catch (error) {
      return null;
    }
  }

    async createUserVote(userVote: UserVote): Promise<UserVote | null> {
        try {
            const [createdUserVote] = await this.knex('user_vote').insert(userVote).returning('*');
            return createdUserVote || null;
        } catch (error) {
            return null;
        }
    }
  

  async deleteUserByEmail(email: string): Promise<User | null> {
    try {
      const deletedUser = await this.knex('user').where('email', email).del().returning('*');
      return deletedUser[0] || null;
    } catch (error) {
      return null;
    }
  }

  async close() {
    this.knex.destroy();
  }
}

const knexConfig = {
  client: 'pg',
  connection: {
    host: PG_CONFIG.host as string,
    user: PG_CONFIG.user as string,
    password: PG_CONFIG.password as string,
    database: PG_CONFIG.database as string,
    port: PG_CONFIG.port as number,
  },
};

const knex = Knex.default(knexConfig);
const userModel = new UserModel(knex);

export default userModel;

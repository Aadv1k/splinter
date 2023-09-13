import * as Knex from 'knex';
import { PG_CONFIG } from "../config";
import { News } from "../services/newsService";
import { User } from "../types";
import { v4 as uuidv4 } from 'uuid';

class UserModel {
  private readonly knex: Knex.Knex;

  constructor(knex: Knex.Knex) {
    this.knex = knex;
  }

  async init() {
    const tableExists = await this.knex.schema.hasTable('users');
    if (!tableExists) {
      await this.knex.schema.createTable('users', (table: any) => {
        table.uuid('id').primary().defaultTo(uuidv4());
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
      });
    }
  }

  async createUser(user: User): Promise<User | null> {
    try {
      const [createdUser] = await this.knex('users').insert(user).returning('*');
      return createdUser || null;
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await this.knex('users').where('email', email).first();
      return user || null;
    } catch (error) {
      return null;
    }
  }

  async deleteUserByEmail(email: string): Promise<User | null> {
    try {
      const deletedUser = await this.knex('users').where('email', email).del().returning('*');
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

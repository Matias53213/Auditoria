import { error } from "console";
import { AppDataSource } from "../dbconfig/db";
import { User } from "../entities/usuario";

const UserRepository = AppDataSource.getRepository(User).extend({
  findById: async function (id: number): Promise<User>{
    const user = await this.findOneBy({id})
    if(user)
    return user;
  else throw error;
  },

  findAllUser: async function (): Promise <User[]>{
    const users = await this.find()
    if(!users)throw Error
    else return users;
  },

  async createUser(data: Partial<User>): Promise<User>{
    const existing = await this.findOneBy({email: data.email})
    if(existing) throw new Error ("Email alredy exist")
      const user = this.create(data)
  return await this.save(user)
  }
})
export default UserRepository;
import "reflect-metadata";
import app from './app';
import { AppDataSource } from './dbconfig/db';

async function main() {
  try {
    await AppDataSource.initialize();
    console.log('Database Connected');

    app.listen(4000, () => {
      console.log('Server listening on port 4000');
    });
  } catch (error) {
    console.error(error);
  }
}

main();
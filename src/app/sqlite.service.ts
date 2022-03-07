import { Injectable } from '@angular/core';
// import * as sqlite3 from 'sqlite3';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  constructor() {
  }

  public onInit(){
    // const db = new sqlite3.Database("./assets/data/disg.db");
    // console.log(db);
  }
}

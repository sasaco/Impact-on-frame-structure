import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import * as sqlite3 from 'sqlite3';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private BL: number[][] = new Array(); // 縦桁
  private BC: number[][] = new Array(); // 横桁
  private SL: number[][] = new Array(); // 縦スラブ
  private SC: number[][] = new Array(); // 横スラブ

  private dz: number[][] = new Array(); // z方向の変位量
  private ry: number[][] = new Array(); // y軸周りの回転角

  constructor(private http: HttpClient){
    this.initBeam();
    this.get_csv();
  }

  private get_csv(){
    this.http.get('assets/data/dz.csv',{
      responseType: 'text'}).subscribe(
      (response) => {
        const str: string = response.toString();

        // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
        for(let r of str.split("\n")){
          const d: number[] = new Array()
          for(let col of r.split(',')){
            d.push(Number(col));
          }
          this.dz.push(d);
        }
      },
      (error) => {
        console.log('エラー',error)
      }
    );

    this.http.get('assets/data/ry.csv',{
      responseType: 'text'}).subscribe(
      (response) => {
        const str: string = response.toString();

        // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
        for(let r of str.split("\n")){
          const d: number[] = new Array()
          for(let col of r.split(',')){
            d.push(Number(col));
          }
          this.ry.push(d);
        }
      },
      (error) => {
        console.log('エラー',error)
      }
    );

  }

  private initBeam(){
    const c = 505*2;
    const r = 5*2;
    const cc= [0, 30, 70, 100];
    const rr= [0, 3030, 7070, 10100];

    // 縦桁
    for(const j of cc){
      const L2: number[] = new Array();
      for(let i=0; i<=10100; i+=c){
        L2.push(i+j)
      }
      this.BL.push(L2)
    }

    // 横桁
    for(const j of rr){
      const C2: number[] = new Array();
      for(let i=0; i<=100; i+=r){
        C2.push(i+j)
      }
      this.BC.push(C2)
    }

    // 縦スラブ
    for(const i of this.BC[0]){
      // 縦桁と同じ列はスキップ
      let a = false;
      for(const b of this.BL){
        if(i===b[0]){
          a=true;
          break
        }
      }
      if(a===true){
        continue
      }
      // スラブ部材
      const S2: number[] = new Array();
      for(let j=0; j<=10100; j+=c){
        S2.push(i+j)
      }
      this.SL.push(S2)
    }

    // 横スラブ
    for(const i of this.BL[0]){
      // 縦桁と同じ列はスキップ
      let a = false;
      for(const b of this.BL){
        if(i===b[0]){
          a=true;
          break
        }
      }
      if(a===true){
        continue
      }
      // スラブ部材
      const S2: number[] = new Array();
      for(let j=0; j<=100; j+=r){
        S2.push(i+j)
      }
      this.SC.push(S2)
    }

  }
}

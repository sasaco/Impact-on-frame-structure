import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vector3 } from 'three';
import { ThreeDisplacementService } from './components/three/geometry/three-displacement.service';
// import * as sqlite3 from 'sqlite3';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private BL: number[][] = new Array(); // 縦桁
  private BC: number[][] = new Array(); // 横桁
  private SL: number[][] = new Array(); // 縦スラブ
  private SC: number[][] = new Array(); // 横スラブ
  private nodeData = {};
  private mamberData = {};

  private dz: number[][] = new Array(); // z方向の変位量
  private ry: number[][] = new Array(); // y軸周りの回転角

  constructor(
    private http: HttpClient,
    private disg: ThreeDisplacementService){
    this.initBeam();
    this.get_csv();
  }

  public onInit(){

    this.disg.onInit(this.nodeData, this.mamberData);
  }

  // 荷重の変更を反映する
  private no1 = 0;
  private no3 = 0;
  private no2 = 0;
  private no4 = 0;
  setLoad(p1: Vector3, p2: Vector3, p3: Vector3, p4: Vector3) {
    if(this.dz.length===0){
      return;
    }
    // 荷重が載荷された場所を特定する
    this.no1 = (10-p1.y) * 10 + p1.x * 1010; // 左上の節点番号
    this.no3 = (10-p3.y) * 10 + p3.x * 1010; // 左下の節点番号
    this.no2 = (10-p2.y) * 10 + p2.x * 1010; // 右上の節点番号
    this.no4 = (10-p4.y) * 10 + p4.x * 1010; // 右下の節点番号

    // 縦桁の変位量dz
    for(const b1 of this.BL){
      let di: Number = Number.NaN;
      let ri: Number = Number.NaN;
      let dj: Number = Number.NaN;
      let rj: Number = Number.NaN;
      for(const b2 of b1){
        const d = this.get_dz(b2);
        if(di === Number.NaN){
          di = d[0];
          ri = d[1];
          continue;
        }
        dj = d[0];
        rj = d[1];
        // 変位図を描いて

        // 次にそなえる
        di = dj;
        ri = rj;
      }
    }


  }

  private get_dz(taiget: number){
    const colmns = this.no2 - this.no1;
    const height = this.no4 - this.no1;

    let dz = 0;
    let ry = 0;
    for(let i=this.no1; i<=this.no4;i++){
      for(let j=i; j<=i+colmns; j+=101){
        const a = Math.floor(j/101);
        const b = a*51+1;
        const c = a*101;
        const d = j-c;
        const index = Math.round(b+d);
        const col1 = this.dz[index];
        dz += col1[taiget+1];
        const col2 = this.ry[index];
        ry += col2[taiget+1];
      }
    }
    return [dz, ry];
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

            this.setLoad(
              new Vector3(0,10,1),
              new Vector3(5,10,1),
              new Vector3(5,5,1),
              new Vector3(0,5,1)
            )

          },
          (error) => {
            console.log('エラー',error)
          }
        );
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
    let no = 0;
    for(const j of cc){
      const L2: number[] = new Array();
      let ni: string = '';
      let nj: string = '';
      for(let i=0; i<=10100; i+=c){
        L2.push(i+j)

        if(nj===''){
          nj = (i+j).toString();
          continue;
        }
        ni = (i+j).toString();
        this.mamberData['BL' + no] = {
          ni, nj, 'cg': 0,
          'e': (j===0 || j=== 100) ? '1' : '2'
        }
        no++;
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

    // 節点データ
    for(const i of this.BC[0]){
      for(let j=0; j<=10100; j+=c){
        const no = (i+j).toString();
        this.nodeData[no] ={
          x: j / c,
          y: (100-i)/10,
          z: 0
        }
      }
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

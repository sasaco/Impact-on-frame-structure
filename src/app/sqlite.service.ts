import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Vector3 } from 'three';
import { ThreeDisplacementService } from './components/three/geometry/three-displacement.service';
// import * as sqlite3 from 'sqlite3';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private nodeData = {};
  private mamberData = {};
  private disgData = [];
  private nodeNo = {};

  private dz: number[][] = new Array(); // z方向の変位量
  private ry: number[][] = new Array(); // y軸周りの回転角
  private rx: number[][] = new Array(); // y軸周りの回転角

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
  setLoad(p1: Vector3, p2: Vector3, p3: Vector3, p4: Vector3) {
    if(this.dz.length===0){
      return;
    }
    // 荷重が載荷された場所を特定する
    const no1 = Math.round((10-p1.y) * 10 + p1.x * 1010); // 左上の節点番号
    const no3 = Math.round((10-p3.y) * 10 + p3.x * 1010); // 右下の節点番号
    const no2 = Math.round((10-p2.y) * 10 + p2.x * 1010); // 右上の節点番号
    const no4 = Math.round((10-p4.y) * 10 + p4.x * 1010); // 左下の節点番号

    // 変位を集計し表示する
    this.disgData = new Array();
    for(const id of Object.keys(this.nodeData)){
      const d = this.get_dz(Number(id), no1, no2, no3, no4);
      this.disgData.push({
        id,
        dx: 0,
        dy: 0,
        dz: -d[0],
        rx: -d[1],
        ry: -d[2],
        rz: 0
      })
    }

    this.disg.changeData(1, this.disgData);

  }
  // target: 着目している（変位量を出したい）節点番号 例)7100
  private get_dz(target: number, no1: number, no2: number, no3: number, no4: number){

    // 変位算出点の変換
    const target2 = this.setNodeNo(target);

    const colmns = no2 - no1;

    let _dz = 0;
    let _ry = 0;
    let _rx = 0;
    for(let i=no1; i<=no4;i++){ //0～50
      const io = 50 - Math.abs(50 - i);
      const row = i - Math.floor(i/101)*101;
      for(let j=i; j<=i+colmns; j+=101){ // i=0: 0～5050 step 101
        // j: 荷重載荷点番号
        // jo: 左右対称上の荷重載荷点番号(j = 51のときjo = 49)
        const jo = 101*50 - Math.abs(101*(50 - Math.floor(j/101))) + io;

        let col = target2[0];
        const cc = Math.floor(j/101);
        if (row >50 && cc>50 ){
          // 右下の領域の場合 target を転置
          col = target2[3];
        } else if(row>50){
          // 左下の領域の場合 target を上下反転
          col = target2[1];
        } else if(cc>50){
          // 右上の領域の場合 target を左右反転
          col = target2[2];
        }

        // 荷重載荷点
        const a = Math.floor(jo/101);
        const b = a*51+1;
        const c = a*101;
        const d = jo-c;
        const index = Math.round(b+d);

        const col1 = this.dz[index];
        _dz += col1[col];
        const col2 = this.rx[index];
        _rx += col2[col];
        const col3 = this.ry[index];
        _ry += col3[col];

      }
    }

    return [_dz, _rx, _ry];
  }


  private setNodeNo(target: number): number[]{

    const key = target.toString();
    if(key in this.nodeNo){
      return this.nodeNo[key];
    }
    // 
    const title = this.dz[0];

    // 左上の場合
    const e0 = target; // 左上の場合
    
    // 左下の領域の場合 target を上下反転
    const a1 = Math.floor(target/101);
    const b1 = 101 * a1;
    const c1 = target - b1; 
    const d1 = b1 + 100;
    const e1 = d1 - c1;
    
    // 右上の領域の場合 target を左右反転
    const b2 = target - b1;
    const c2 = b2 + 10100;
    const e2 = c2 - b1;
    
    // 右下の領域の場合 target を転置
    const e3 = 10200 - target;

    // 
    const result = [0,0,0,0];
    let i = 0;
    for(let col=1; col<title.length; col++){
      if(title[col] === e0){
        result[0] = col;
        i++;
      }
      if(title[col] === e1){
        result[1] = col;
        i++;
      }
      if(title[col] === e2){
        result[2] = col;
        i++;
      }
      if(title[col] === e3){
        result[3] = col;
        i++;
      }
      if(i>3){
        break;
      }
    }
    
    // 登録
    this.nodeNo[key] = result;

    return result;
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

            this.http.get('assets/data/rx.csv',{
              responseType: 'text'}).subscribe(
              (response) => {
                const str: string = response.toString();
    
                // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
                for(let r of str.split("\n")){
                  const d: number[] = new Array()
                  for(let col of r.split(',')){
                    d.push(Number(col));
                  }
                  this.rx.push(d);
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
    const BL: number[][] = new Array();
    for(const j of cc){
      const L2: number[] = new Array();
      let ni: string = '';
      let nj: string = '';
      for(let i=0; i<=10100; i+=c){
        L2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': (j===0 || j=== 100) ? '1' : '2'
        }
        ni = nj;
      }
      BL.push(L2)
    }

    // 横桁
    const BC: number[][] = new Array();
    for(const j of rr){
      const C2: number[] = new Array();
      let ni: string = '';
      let nj: string = '';
      for(let i=0; i<=100; i+=r){
        C2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': (j===0 || j=== 100) ? '1' : '2'
        }
        ni = nj;
      }
      BC.push(C2)
    }

    // 節点データ
    for(const i of BC[0]){
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
    for(const i of BC[0]){
      // 縦桁と同じ列はスキップ
      let a = false;
      for(const b of BL){
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
      let ni: string = '';
      let nj: string = '';
      for(let j=0; j<=10100; j+=c){
        S2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': '3'
        }
        ni = nj;
      }
      // this.SL.push(S2)
    }

    // 横スラブ
    for(const i of BL[0]){
      // 縦桁と同じ列はスキップ
      let a = false;
      for(const b of BL){
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
      let ni: string = '';
      let nj: string = '';

      for(let j=0; j<=100; j+=r){
        S2.push(i+j)

        if(ni===''){
          ni = (i+j).toString();
          continue;
        }
        nj = (i+j).toString();
        this.mamberData[ni+'-'+nj] = {
          ni, nj, 'cg': 0,
          'e': '3'
        }
        ni = nj;
      }
      // this.SC.push(S2)
    }

  }
}
